// import axios from 'axios'
 // axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
export default {
  namespaced: true,

  state: {
    userData: null,
  },

  getters: {
    user: state => state.userData,
  },

  mutations: {
    setUserData (state, user) {
      state.userData = user
    },
  },

actions: {      

  async getUserData ({ commit }) {
     await this.$axios
        .get( 'user')
        .then(response => {
          commit('setUserData', response.data)
        })
        .catch(() => {
          localStorage.removeItem('authToken')
        })
    },

  setUser ({ commit }, data) {   
      commit('setUserData', data)     
  },

 async sendLoginRequest ({ commit }, data) {     
      return await this.$axios
        .post( 'auth/login/', data)
        .then(response => {
          commit('setUserData', response.data)
         localStorage.setItem('authToken', response.data.token)
         localStorage.setItem('nom', response.data.nom)
         localStorage.setItem('userId', response.data.userId)
         localStorage.setItem('prenom', response.data.prenom)         
          localStorage.setItem('user_level', response.data.user_level)
    console.log("local",localStorage)         
          
          localStorage.setItem('anac', response.data.anac)
          
         
         })
       },
         
 async sendRegisterRequest ({ commit }, data) {
       // commit('setErrors', {}, { root: true })
      // axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
      return await this.$axios
        .post( 'auth/signup/', data)
        .then(response => {
          commit('setUserData', response.data.user)         
          localStorage.setItem('authToken', response.data.token)
        })
    },
   

    async sendLogoutRequest ({ commit }) {      
      // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
        await this.$axios.delete( 'auth/logout/').then((res) => {
         
          commit('setUserData', null)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user_level')  
          localStorage.removeItem('userId')  
          localStorage.removeItem('nom')  
          localStorage.removeItem('prenom')  
                
        //  localStorage.removeItem('anac')     
        })
      },

      async checkInspect() {
        this.$axios.defaults.headers.common.Authorization =
          "Bearer " + localStorage.getItem("authToken");
        await this.$axios
          .get("inspecteur/checkinspecteur/" + this.user.userId)
          .then((res) => {
            console.log("ip", res.status);
            if (res.status === 400) {
              this.ip = false;
              this.infos = res.data;
              console.log("ip", this.ip, res.status);
            } else this.ip = true;
          });
      },
  //  async sendLogoutRequest ({ commit }) {
  //   commit('setUserData', null)
  //   // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
  //     await this.$axios.delete( 'auth/logout').then((res) => {
  //      alert("ok")
  //       commit('setUserData', null)
       
  //        localStorage.removeItem('authToken')
  //        localStorage.removeItem('user_level')
  //       // localStorage.removeItem('responsable')
  //       // localStorage.removeItem('anac')
  //       // localStorage.removeItem('ecole')
  //       // localStorage.removeItem('ecole_id')
  //       // localStorage.removeItem('niveau')
        
  //     })
  //   },


   

  sendVerifyResendRequest () {
      return this.$axios.get( 'email/resend')
    },

  sendVerifyRequest ({ dispatch }, hash) {
      return this.$axios
        .get( 'email/verify/' + hash)
        .then(() => {
          dispatch('getUserData')
        })
    },
  },
}
