<template>
	<el-card :body-style="{ padding: '0px',position: 'relative' }">
		<el-card :body-style="{ padding: '0px',position: 'relative' }">
			<div slot="header" class="clearfix">
				<span class="p" @click="click">{{cmd.title||cmd.appid}}</span>
				<!-- <el-button style="float: right; padding: 3px 0" type="text">返台运行</el-button> -->
			</div>
			<div class="body" @click="click">
				<img :src="head" class="image">
			</div>
		</el-card>
	</el-card>
</template>

<script>
export default {
	props: ["cmd"],
	data() {
		return {
			idx: 0
		}
	},
	methods: {
		click() {
			this.$emit("show", this.cmd)
		}
	},
	computed: {
		head() {
			return this.cmd.scripts[this.idx % this.cmd.scripts.length].demo
		}
	},
	mounted() {
		this.timer = setInterval(() => this.idx++, 1e3)
	},
	distroyed() {
		clearInterval(this.timer)
	}
}
</script>

<style lang="less" scoped>
.el-card {
  .body {
    margin: 14px;
    height: 240px;
    overflow-x: hidden;
    overflow-y: scroll;
    cursor: pointer;
  }
  img {
    width: 100%;
  }
}
</style>
