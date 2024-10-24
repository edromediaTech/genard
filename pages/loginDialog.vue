<template>
  <v-container class="image">
    <!-- <v-dialog v-model="loginDialog" max-width="400px"> -->

    <v-card-text>
      <div class="text-center">
        <img src="images/logo.jpeg" alt="" width="150" />
      </div>
      <v-form ref="loginForm">
        <v-row>
          <v-col cols="12" md="3" sm="6"></v-col>
          <v-col cols="12" md="6" sm="6">
            <v-text-field
              v-model="code"
              label="Saisir votre code"
              prepend-icon="mdi-lock"
              type="password"
              maxlength="6"
              color="#FFD700"
              required
              @keydown.enter="login"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3" sm="6"></v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <!-- <v-card-actions>
          <v-btn color="#FFD700" @click="login">Se connecter</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Fermer</v-btn>
        </v-card-actions> -->

    <!-- Lien pour rediriger vers l'enregistrement -->
    <!-- <v-card-subtitle class="text-center">
      Pas encore inscrit ?
      <v-btn text @click="redirectToRegister"
        ><v-icon color="#FFD700">mdi-arrow-right</v-icon></v-btn
      >
    </v-card-subtitle> -->

    <!--  </v-dialog> -->
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { role } from "../role";
export default {
  data() {
    return {
      loginDialog: true,
      code: "",
      password: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    // ...mapGetters(['errors']),
  },
  methods: {
    openLoginDialog() {
      this.loginDialog = true; // Ouvrir le modal
    },
    closeDialog() {
      this.loginDialog = false; // Fermer le modal
    },
    ...mapActions("auth", ["sendLoginRequest"]),
    login() {
      this.loading = true;
      // if (!this.$refs.form.validate()) { this.loading = false; return false }

      this.sendLoginRequest({ code: this.code })
        .then(() => {
          console.log("user", this.user);

          if (this.user) {
            this.$notifier.showMessage({ content: "Succes!", color: "success" });
            this.loading = false;

            //  console.log("level "+this.user.user_level +' operateur'+ role.operateur)
            if (this.user.user_level === role.utilisateur) {
              this.$router.push({ path: "/" });
            }
            if (this.user.user_level >= role.admin) {
              this.$router.push({ name: "dashAdmin" });
            }
            if (this.user.user_level === role.operateur) {
              this.$router.push({ path: "/school" });
            }
            if (this.user.user_level === role.inspecteurZ) {
              if (this.ip === false) this.$router.push({ path: "/saisieInspecteur" });
              else this.$router.push({ name: "dashIp" });
            }
          } else this.$router.push({ path: "/" });
        })
        .catch(() => {
          this.$notifier.showMessage({
            content: "Code incorrect!",
            color: "error",
          });

          // this.$store.dispatch('set_snackbar', { showing: true, text: 'Email ou Password incorrect!', color: 'error' })
          this.loading = false;
        });
    },

    redirectToRegister() {
      this.$router.push("/userInscription"); // Redirection vers la page d'enregistrement
    },
  },
};
</script>
<style scoped>
.image {
  background: url("/images/logo.jpeg") no-repeat;
  background-size: cover;
  height: 100vh;
  background-color: rgb(0, 0, 0);
}
</style>
