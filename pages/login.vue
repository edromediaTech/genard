<template>
  <v-container fluid fill-height class="loginOverlay">
    <v-layout flex align-center justify-center>
      <v-flex xs12 sm4 elevation-6>
        <v-toolbar class="pt-5 blue darken-4">
          <v-toolbar-title class="white--text"
            ><h4 class="mb-4">Connexion</h4></v-toolbar-title
          >
        </v-toolbar>
        <v-card>
          <v-card-text class="pt-4">
            <div class="text-center">
              <img src="images/logodde.jpg" alt="" width="150" />
            </div>
            <div>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="email"
                  prepend-icon="mdi-account"
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
                  <v-btn
                    :class="{ 'blue darken-4 white--text': valid, disabled: !valid }"
                    @click="login"
                  >
                    <v-progress-circular
                      v-if="loading"
                      :disabled="loading"
                      :size="30"
                      color="white"
                      indeterminate
                    />
                    Connecter</v-btn
                  >
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
import { mapActions, mapGetters } from "vuex";
import { role } from "../role";
export default {
  data() {
    return {
      valid: false,
      loading: false,
      ip: true,
      e1: false,
      password: "",
      infos: [],
      passwordRules: [(v) => !!v || "Password obligatoire"],
      email: "",
      emailRules: [
        (v) => !!v || "E-mail obligatoire",
        (v) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail doit être valide",
      ],
    };
  },

  computed: {
    ...mapGetters("auth", ["user"]),
    // ...mapGetters(['errors']),
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),

    login() {
      this.loading = true;
      // if (!this.$refs.form.validate()) { this.loading = false; return false }

      this.sendLoginRequest({ email: this.email, password: this.password })
        .then(() => {
          console.log("user", this.user);

          if (this.user) {
            this.$notifier.showMessage({ content: "Succes!", color: "success" });
            this.loading = false;

            //  console.log("level "+this.user.user_level +' operateur'+ role.operateur)
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
            content: "Email ou Password incorrect!",
            color: "error",
          });

          // this.$store.dispatch('set_snackbar', { showing: true, text: 'Email ou Password incorrect!', color: 'error' })
          this.loading = false;
        });
    },

    submit() {
      if (this.$refs.form.validate()) {
        this.$refs.form.$el.submit();
      }
    },
    clear() {
      this.$refs.form.reset();
    },
  },
};
</script>
