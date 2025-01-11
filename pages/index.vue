<template>
  <v-app>
   
    <v-container class="fill-height d-flex flex-column justify-center align-center image">
      <v-card v-if="!user" class="pa-8" width="400">
        <div v-if="!connecte" class="text-center">
          <!-- <img src="images/logo.jpeg" alt="" width="100" /> -->
        </div>
        <v-form ref="form" v-model="valid" lazy-validation>
      
  <v-row >
    <v-col cols="12" md="2" sm="6"></v-col>
    <v-col cols="12" md="8" sm="6">
          <v-text-field
            v-if="!connecte"
            v-model="code"
            label="Entrer votre Code"
            :type="showPassword ? 'number' : 'password'"
            placeholder="###-##"
            mask="###-##"
            :rules="codeRules"                    
            append-icon="mdi-eye"
            class="mb-4"
            maxlength="6"
            @click:append="togglePasswordVisibility"
            @input="checkCode"
          ></v-text-field>
          </v-col>
          <v-col cols="12" md="2" sm="6"></v-col>
        </v-row>
         
          <div class="d-flex justify-center">
            <img :color="lockColor" size="48" :src="lockIcon" />
          </div>

          <!-- <v-btn :disabled="!valid" color="primary" @click="login">Login</v-btn> -->
        </v-form>
      </v-card>

      <v-card  v-if="connecte"  class="pa-8" width="400">
        <span> {{ salutationEtEncouragement(user.prenom) }}</span>
      </v-card>
    </v-container>
      
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { role } from "../role";

export default {
  data() {
    return {
      connecte: false,
      code: "",
      valid: false,
      lockIcon: require("@/static/images/padlockClose.png"),
      lockColor: "red", // Lock color (closed = red)
      inputValue: '', // Valeur du champ
      showPassword: false, // Contrôle l'affichage du texte
      codeRules: [
        (v) => !!v || "Code is required",
        (v) => v.length === 6 || " Code invalide",
      ],
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    // ...mapGetters(['errors']),
  },
  mounted() {},
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    checkCode() {
      if (this.code.length === 6) this.login();
    },

    salutationEtEncouragement(prenom) {
      const encouragements = [
        "Continue à croire en tes rêves, tu es sur la bonne voie !",
        "Ton ambition te mènera loin, ne lâche rien !",
        "Les défis sont faits pour être relevés, garde confiance en toi !",
        "Le succès est proche, continue à avancer avec détermination !",
        "Chaque effort compte, tu construis ton avenir avec force et courage !",
        "Ton travail acharné paiera, garde la tête haute et fonce !",
        "La persévérance ouvre les portes du succès, continue à y croire !",
      ];

      // Sélectionner un encouragement aléatoire
      const messageEncouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];

      return "Salut " + prenom + " ! 🌟" + messageEncouragement;
    },
    async login() {
      this.loading = true;
      await this.sendLoginRequest({ code: this.code })
        .then(() => {
         
          if (this.user) {          
            this.connecte = true;
            this.lockIcon = require("@/static/images/padlockOpen.png");
            this.lockColor = "green";
            // this.$notifier.showMessage({ content: "Succes!", color: "success" });

            setTimeout(() => {
              if (this.user.user_level === role.utilisateur) {
                this.$router.push({ path: "/inspire" });
              }
              if (this.user.user_level === role.admin) {
                this.$router.push({ path: "/inspire" });
              }
              if (this.user.user_level === role.serveur) {
                this.$router.push({ path: "/commande" });
              } else {
                this.$router.push({ path: "/inspire" });
              }
            }, 7000);
          } else {
            this.$router.push({ path: "/inspire" });
          }
        })
        .catch(() => {
          this.lockIcon = require("@/static/images/padlockX.png");
          setTimeout(() => {
            this.code = "";
            this.lockIcon = require("@/static/images/padlockClose.png");
          }, 3000);
          this.$notifier.showMessage({
            content: "Code incorrect!",
            color: "error",
          });

          // this.$store.dispatch('set_snackbar', { showing: true, text: 'Email ou Password incorrect!', color: 'error' })
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped>
.v-application {
  background: url("/images/resto1.jpg") no-repeat;
  background-size: cover;
  height: 100vh;
  background-color: rgb(0, 0, 0);
  /* background: linear-gradient(to bottom, #000, #333); */
}
.image {
  background: url("/images/resto1.jpg") no-repeat;
  background-size: cover;
  height: 100vh;
  background-color: rgb(0, 0, 0);
}
</style>
