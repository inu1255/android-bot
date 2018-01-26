import Vue from 'vue';
import App from './pages/app.vue';
import router from './router.js';
import plugin from './components';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './pages/app.less';
import store from './store';
import * as types from './store/types';
const { ipcRenderer } = require("electron");

ipcRenderer.on("serviceList", function(event, data) {
    store.commit(types.SET_SERVICE, data);
});

Vue.use(ElementUI);
Vue.use(plugin);

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});