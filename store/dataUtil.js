// import axios from 'axios'
// axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
export default {
  namespaced: true,

  state: {
    anacData: '',
    ecolenameData:'',
    zonenameData:'',
    districtnameData:'',
    
  },

  getters: {
    anac: state => state.anacData,
    ecolename: state => state.ecolenameData,
    zonename: state => state.zonenameData,
    districtname: state => state.districtnameData
  },

  mutations: {
    setAnacData (state, anac) {
      state.anacData = anac
    },
   
    setEcolenameData (state, ecolename) {
      state.ecolenameData = ecolename
    },

    setZonenameData (state, zonename) {
      state.zonenameData = zonename
    },

    setDistrictnameData (state, districtname) {
      state.districtnameData = districtname
    },
  },

  actions: {
  async getAnacData ({ commit }) {
     await this.$axios
        .get('get-anac')
        .then(response => {
          commit('setAnacData', response.data)
      })       
    },
   getAnacDataP({ commit }, annee) {     
          commit('setAnacData', annee)
           
    },

    getEcolenameData({commit}, ecolename){
        commit('setEcolenameData', ecolename)
    },

    getZonenameData({commit}, zonename){
        commit('setZonenameData', zonename)
    },

    getDistrictnameData({commit}, districtname){
        commit('setDistrictnameData', districtname)
    }
   
  },
}
