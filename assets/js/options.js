import Vue from 'vue';

import Options from './components/Options.vue';
const app = new Vue({
    el: '#app',
    render: createElement => createElement(Options)
});
