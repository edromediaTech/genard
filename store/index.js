import axios from 'axios'
 import auth from './auth'
 import dataUtil from './dataUtil'
 
axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
export default {
  namespaced: true,

  state: {
    users: [],
    
  },

  getters: {
    // user: state => state.userData,
  },

  mutations: {
    AddUsers(state, users){
          state.users.push({ ... users})
           },
       
          
  },

  actions: {
    async getUsers({ commit }){
                const users = await axios.get(process.env.baseURl + 'get-all-users')
                commit('addUsers', users)
                return users
            },
           
     
            
},

modules: {
    auth,
      dataUtil  
      },
    }
