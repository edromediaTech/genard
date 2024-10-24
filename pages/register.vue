<template>
  <v-container fluid fill-height class="loginOverlay">
          <v-layout flex align-center justify-center>
            <v-flex xs12 sm4 elevation-6>
              <v-toolbar class="pt-5 blue darken-4">
                <v-toolbar-title class="white--text"><h4 class="mb-4">Enregistrement</h4></v-toolbar-title>                
              </v-toolbar>
              <v-card>
                <v-card-text class="pt-4">
                  <div>
                      <v-form ref="form" v-model="valid">
                        <v-text-field
                            v-model="name"
                            :counter="10"
                            prepend-icon="mdi-account"
                            label="Nom / Prenom"
                            required
                          ></v-text-field>
       
                        <v-text-field
                          v-model="email"
                           prepend-icon="mdi-mail"
                          label="Entrer votre e-mail"
                          :rules="emailRules"
                          required
                        ></v-text-field>
                        <v-text-field
                          v-model="password"
                          prepend-icon="mdi-lock"
                          label="Entrer le mot de passe"
                          min="8"
                          :append-icon="e1 ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="e1 ? 'text' : 'password'"
                          :rules="passwordRules"
                          counter
                          required
                          @click:append="() => (e1 = !e1)"
                        ></v-text-field>

                        <v-layout justify-space-between>
                            <v-btn :class=" { 'blue darken-4 white--text' : valid, disabled: !valid }"
                             @click="register">
                             <v-progress-circular
                    v-if="loading"
                    :disabled="loading"
                    :size="30"
                    color="white"
                    indeterminate
                  />
                             Inscrire</v-btn>
                            
                        </v-layout>
                      </v-form>
                  </div>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
       </v-container>  

</template>
<script>
 import {  mapActions } from 'vuex'
export default {
  data () {
          return {
            valid: false,
              loading: false,
            name: '',
            e1: false,
            password: '',
            passwordRules: [
              (v) => !!v || 'Password obligatoire',
            ],
            email: '',
            emailRules: [
              (v) => !!v || 'E-mail obligatoire',
              (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail doit être valide'
            ],
          }
        },
        methods: {
          ...mapActions('auth', ['sendRegisterRequest']),
          async register () {
       
       this.loading = true
       // console.log(this.name)
        await this.$axios.post( 'auth/signup', 
        {name: this.name, email:this.email, password:this.password})           
          // .then(response => response.json())
        .then(jsonResponse => {
           this.$notifier.showMessage({ content: 'Enregistrement réussi!', color: 'success' })
           this.$router.push("/login")
          this.loading = false
        })
    .catch(error => console.log('Error: ', error));
    },

     // register () {
        // this.$notifier.showMessage({ content: 'Cette fonctionnalité n\'est pas disponible pour le moment!', color: 'info' })
        // if (!this.$refs.form.validate()) { return false }
      //    this.loading = true
      //   this.sendRegisterRequest({name: this.name, email:this.email, password:this.password}).then(() => {
      //      this.$notifier.showMessage({ content: 'Enregistrement réalisé avec succès!', color: 'success' })
      //      this.loading = false
      //    // this.$refs.form.reset()
      //       this.$router.push({ name: 'login' })
      //   })
      // },
          submit () {
            if (this.$refs.form.validate()) {
              this.$refs.form.$el.submit()
            }
          },
          clear () {
            this.$refs.form.reset()
          }
        },

}
</script>