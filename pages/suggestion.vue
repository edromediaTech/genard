<template>
     <v-container fluid fill-height class="loginOverlay">
          <v-layout flex align-center justify-center>
            <v-flex xs12 sm6 elevation-6>
              <v-toolbar class="pt-5 info">
                <v-toolbar-title class="white--text"><h4 class="mb-4">Suggestions</h4></v-toolbar-title>                
              </v-toolbar>
              <v-card>
                <v-card-text class="pt-4 input.input-box">
                   <v-form ref="form" v-model="valid">
                       <v-row>
                           <v-col cols="12"
                              sm="6"
                             md="12">
                        <v-textarea
                       
                          v-model="suggestion"
                           append-icon="mdi-pencil"
                          label="Entrer votre suggestion"
                           filled
                          :maxlength ="lng" 
                           :counter="lng"
                            :rules = "rules"                       
                          required
                        ></v-textarea>
                           </v-col>
                         <v-col  
                           cols="12"
                              sm="6"
                             md="12">
                            <v-btn :class=" { 'info white--text' : valid, disabled: !valid }" 
                             @click="submit"
                             >
                              <v-progress-circular
                                v-if="loading"
                                :disabled="loading"
                                :size="30"                               
                                color="white"
                                indeterminate
                              />
                             Envoyer
                             </v-btn>
                             </v-col>
                          </v-row>  
                   </v-form>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
       </v-container> 
</template>
<script>

export default {

  data () {
          return { 
              suggestion:'',
              loading:false,
              valid:false,
              lng :500,
              rules: [v => v.length <= this.lng || 'Max 25 characters'],
        wordsRules: [v => v.trim().split(' ').length <= this.lng || 'Max 5 words'],
          }
  },
   
  methods:{
      submit (){
         this.loading = true
          this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
    
          this.$axios.post('store-suggestion', {message:this.suggestion,responsable_id:localStorage.responsable}).then(res=>{
                   
              if(res.data.status === 1)              
              this.$router.push({ name: 'sugmerci' })  
                 this.loading = false
          })
      }
  }
}
</script>
<style scoped>
 textarea { background: rgb(188, 228, 228); }
</style>

