<template>
	<div class="local">
		<el-row>
			<el-col :span="6" v-for="xcmd in serviceList" :key="xcmd.appid">
				<Service @show="show" :cmd="xcmd"></Service>
			</el-col>
		</el-row>
		<el-dialog fullscreen :title="cmd.title||cmd.appid" :visible.sync="open">
			<Edit :appid="cmd.appid" :scripts="cmd.scripts"></Edit>
		</el-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Service from './Service'
import Edit from './Edit'
const { ipcRenderer } = require("electron");

export default {
	name: "Local",
	data() {
		return {
			cmd: false,
			open: false
		}
	},
	methods: {
		show(cmd) {
			this.cmd = _.cloneDeep(cmd)
		},
		refresh() {
			console.log("refresh")
			ipcRenderer.send("serviceList")
		}
	},
	computed: {
		...mapGetters(["serviceList"]),
	},
	watch: {
		cmd(v) {
			this.open = Boolean(v)
		},
		open(v) {
			if (!v) {
				this.refresh()
			}
		}
	},
	mounted() {
		this.refresh()
	},
	components: {
		Service,
		Edit,
	}
};
</script>

<style lang="less" scoped>
.local {
  padding: 7px 15px;
  .image {
    width: 100%;
  }
}
</style>
