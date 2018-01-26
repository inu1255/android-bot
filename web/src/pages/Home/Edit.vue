<template>
	<div class="edit">
		<div v-loading="refresh_loading" class="screen">
			<img :src="current.demo" alt="">
		</div>
		<div class="scripts">
			<el-button @click="refresh" type="primary" size="mini">刷新</el-button>
			<el-button @click="save" type="primary" size="mini">保存</el-button>
			<el-button @click="add" type="primary" size="mini">添加</el-button>
			<el-button @click="runall" type="primary" size="mini">执行</el-button>
			<div v-if="!appid" class="title">
				<el-input v-model="title" placeholder="请输入" size="small">
					<template slot="prepend">脚本名</template>
				</el-input>
			</div>
			<List :data="scripts" :active.sync="idx" @item-move="move">
				<template slot-scope="{item}">
					<el-select v-model="item.type" style="width:10em" placeholder="操作" size="mini">
						<el-option v-for="k in types" :key="k" :label="k" :value="k" />
					</el-select>
					<div v-if="item.data" class="data">
						<img v-if="/^data:image\/\w+;base64,/.test(item.data)" :src="item.data">
						<img v-else-if="/\.jpg$/.test(item.data)" :src="item.data">
						<el-input-number v-else-if="typeof item.data==='number'" v-model="item.data" :min="1" size="mini"></el-input-number>
						<span v-else>{{item.data}}</span>
					</div>
					<div v-if="item.jump" class="data">
						<span>跳转到第</span>
						<el-input-number v-model="item.jump" :min="1" size="mini"></el-input-number>
						<span>步</span>
					</div>
					<div class="fr">
						<el-button @click="run(item)" size="mini" round>执行</el-button>
						<el-button @click="del(item)" size="mini" round>删除</el-button>
						<el-button class="el-icon-rank" size="mini" round></el-button>
					</div>
				</template>
			</List>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import picker from '../../utils/picker'
const paint = require('../../utils/paint').paint
import ipc from "../../utils/electron";
import Actions from '../../actions'

export default {
	name: "Edit",
	props: {
		appid: {
			type: String,
			default: ""
		},
		scripts: Array
	},
	data() {
		let runner = new Actions()
		return {
			t: "",
			refresh_loading: false,
			idx: 0,
			runner,
			actions: runner.actions,
			title: ""
		}
	},
	watch: {
		"current.type"(type) {
			let pen = this.action.pen
			if (pen) {
				this.drawer.setPen(pen)
				this.drawer.enable()
			} else {
				this.drawer.disable()
			}
			if (this.action.init) {
				this.action.init(this)
			}
			this.setHistory(this.current.history)
		},
		"idx"() {
			let pen = this.action.pen
			if (pen) {
				this.drawer.setPen(pen)
				this.drawer.enable()
			} else {
				this.drawer.disable()
			}
			if (this.action.init) {
				this.action.init(this)
			}
			this.setHistory(this.current.history)
		}
	},
	computed: {
		current() {
			return this.scripts[this.idx] || {}
		},
		action() {
			return this.actions[this.current.type] || this.actions["点击"]
		},
		types() {
			return Object.keys(this.actions)
		}
	},
	methods: {
		setHistory(data) {
			this.drawer.config.history = data ? [{ key: this.action.pen, data: data }] : []
			this.drawer.update()
		},
		async refresh() {
			this.refresh_loading = true
			this.current.demo = await ipc.screenshot()
			this.refresh_loading = false
		},
		async save() {
			var appid = this.appid || this.title
			if (!appid) {
				this.$message.error("需要填写脚本名")
				return
			}
			const loading = this.$loading({
				lock: true,
				text: '保存中',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			});
			await ipc.call("save", {
				appid,
				scripts: this.scripts,
			})
			this.$message({ message: '保存成功', center: true })
			loading.close()
		},
		async pick() {
			let file = await picker.pick()
			console.log(file)
		},
		async runall() {
			const loading = this.$loading({
				lock: true,
				text: '执行中',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			});
			this.idx = 0
			await this.runner.run(this)
			this.$message({ message: '执行成功', center: true })
			setTimeout(() => {
				loading.close()
			}, 500);
		},
		async run(x) {
			const loading = this.$loading({
				lock: true,
				text: '执行中',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.7)'
			});
			await this.action.run(x)
			loading.close()
		},
		del(x) {
			var index = this.scripts.indexOf(x)
			if (index >= 0) {
				this.scripts.splice(index, 1)
				if (index <= this.idx) this.idx = this.idx - 1
			}
		},
		add() {
			this.idx = this.scripts.length
			this.scripts.push({ type: "点击" })
			this.setHistory()
			this.drawer.setPen("pointPen")
			this.refresh()
		},
		move(from, to) {
			if (from != to) {
				var node = this.scripts.splice(from, 1)
				this.scripts.splice(to, 0, node[0])
			}
		}
	},
	mounted() {
		if (!this.current.demo) {
			this.refresh()
		}
		// this.timer = setInterval(() => this.t = new Date().getTime(), 3000);
		this.drawer = new paint.Drawer(this.$el.querySelector(".screen"))
		this.drawer.setPen(this.action.pen)
		/** @type {HTMLImageElement} */
		var img = this.$el.querySelector("img")
		img.addEventListener("load", () => {
			this.drawer.resize()
		})
		this.drawer.addEventListener('success', async (data) => {
			this.setHistory()
			this.current.history = data
			if (this.action.onSuccess) {
				this.action.onSuccess(this, data)
			}
		});
	},
	destroyed() {
		// clearInterval(this.timer)
	}
};
</script>

<style lang="less">
.edit {
  padding: 7px 15px;
  > .screen {
    float: left;
    overflow: hidden;
    img {
      width: 360px;
      min-height: 640px;
    }
  }
  > .scripts {
    float: left;
    padding: 7px 15px;
    min-width: 320px;
    .title {
      margin-top: 16px;
    }
    .ivu-list-item {
      padding: 5px 7px;
      list-style-type: decimal;
      border-bottom: 1px solid #fff;
      img {
        vertical-align: middle;
        width: 33px;
      }
      &.active {
        // background: #46a0fc;
        border-bottom: 1px solid #46a0fc;
      }
      .data {
        position: relative;
        display: inline-block;
        .demo {
          display: none;
          position: absolute;
          top: 0;
          left: 100%;
        }
        &:hover {
          .demo {
            display: block;
          }
        }
      }
    }
  }
}
</style>
