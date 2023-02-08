import {createApp} from "vue";

import App from '@/App';
import store from '@/store';

import mdiVue from 'mdi-vue/v3'
import { mdiSend } from "@mdi/js";

createApp(App)
    .use(store)
    .use(mdiVue, {
        icons: { mdiSend }
    })
    .mount('#app');

store.dispatch('loadCsrf');

import './assets/css/bootstrap.min.css';
