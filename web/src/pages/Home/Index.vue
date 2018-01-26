<template>
	<div class="main">
		<el-menu :default-active="currentIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
			<el-menu-item index="/">本地脚本</el-menu-item>
			<el-menu-item index="/create">创建脚本</el-menu-item>
		</el-menu>
		<router-view></router-view>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
const { ipcRenderer } = require("electron");

export default {
	name: "Home",
	computed: {
		currentIndex() {
			return this.$route.path || "/"
		}
	},
	methods: {
		handleSelect(name) {
			this.$router.push(name)
		}
	}
};
</script>

<style lang="less" scoped>
.main {
  padding: 7px 15px;
}
</style>

