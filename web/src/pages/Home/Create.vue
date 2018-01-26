<template>
	<div class="create">
		<Edit :scripts="scripts"></Edit>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import picker from '../../utils/picker'
const paint = require('../../utils/paint').paint
import ipc from "../../utils/electron";
import Actions from '../../actions'
import Edit from './Edit'

export default {
	name: "Create",
	data() {
		let runner = new Actions()
		return {
			appid: "somename",
			scripts: [{
				type: "点击",
			}]
		}
	},
	components: {
		Edit,
	}
};
</script>

<style lang="less" scoped>
.create {
  padding: 7px 15px;
}
</style>
