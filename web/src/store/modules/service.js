import * as types from '../types';
import router from '../../router';
import request from '../../utils/request';

const state = {
    service: []
};

const getters = {
    serviceList(state) {
        return state.service;
    }
};

const actions = {};

const mutations = {
    [types.SET_SERVICE](state, data) {
        state.service = data;
        state.service_loading = false;
    },
    [types.SET_SERVICE_LOADING](state, data) {
        state.service_loading = data;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};