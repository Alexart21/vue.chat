import { createStore } from "vuex";

const store = {
  state: {
    csrf: '',
  },
  getters: {
    csrf: (state) => state.csrf,
  },
  mutations: {
    setCsrf(state, response) {
      state.csrf = response.csrf;
    },
  },
  actions: {
    async loadCsrf({ commit }){
      let url = "/csrf";
      let response = await fetch(url);
      response = await response.json();
      commit("setCsrf", response);
    },
  },
  strict: process.env.NODE_ENV !== "production",
};
export default createStore(store);
