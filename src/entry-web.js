/**
 * Created by ebi on 2017/2/7.
 */


import VueRouter from 'vue-router'
//import "weex-vue-render"//导入weex
import routes from './router-web'
import VueResource from 'vue-resource';
// Don't forget to call this
Vue.use(VueResource);
Vue.use(VueRouter);

const router = new VueRouter({
    //mode: 'hash',
    routes
});

new Vue({el:'#root',router});
