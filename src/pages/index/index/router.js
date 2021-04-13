/**
 *  2019/7/22  lize
 */
import Vue from 'vue';

import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  
  routes:[
    
    {
      
      path:'/',
      
      name:'',
  
      component:() =>import('./views/index.vue')
      
    },
    {
    
      path:'/about',
    
      name:'',
    
      component:() =>import('./views/about.vue')
    
    }
    
  ]
  
})
