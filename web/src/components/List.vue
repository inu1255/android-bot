<template>
	<ul class="ivu-list">
		<li v-for="(x,index) in list" :key="index" @click="click(x,index)" @drop="drop($event,index)" @dragover="dragover($event)" @dragstart="drag($event,index)" :draggable="itemDraggable" class="ivu-list-item" :class="{'active':idx==index}">
			<slot :index="index" :item="x"></slot>
		</li>
	</ul>
</template>

<script>
export default {
	props: {
		data: Array,
		active: Number,
		itemDraggable: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		list() {
			return this.data || []
		},
		idx() {
			return this.active
		}
	},
	methods: {
		click(cmd, index) {
			this.$emit("item-click", cmd, index)
			this.$emit("update:active", index)
		},
		drag(ev, index) {
			ev.dataTransfer.setData("index", index);
		},
		dragover(ev) {
			ev.preventDefault()
		},
		drop(ev, to) {
			ev.preventDefault();
			var from = +ev.dataTransfer.getData("index");
			this.$emit("item-move", from, to)
		}
	}
}
</script>

<style lang="less">
.ivu-list {
  > li {
    list-style-type: none;
  }
}
</style>
