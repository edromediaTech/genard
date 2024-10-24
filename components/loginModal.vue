<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>MBE</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="openLoginDialog">Connexion</v-btn>
    </v-app-bar>

    <v-dialog v-model="loginDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5"> Connexion </v-card-title>

        <v-card-text>
          <v-form ref="loginForm">
            <v-text-field
              v-model="email"
              label="Email"
              prepend-icon="mdi-email"
              type="email"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              label="Mot de passe"
              prepend-icon="mdi-lock"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="login">Se connecter</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Fermer</v-btn>
        </v-card-actions>

        <!-- Lien pour rediriger vers l'enregistrement -->
        <v-card-subtitle class="text-center">
          Pas encore inscrit ?
          <v-btn text @click="redirectToRegister">Enregistrer</v-btn>
        </v-card-subtitle>
      </v-card>
    </v-dialog>

    <v-main>
      <v-container>
        <slot></slot>
        <!-- Contenu de la page -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      loginDialog: false,
      email: "",
      password: "",
    };
  },
  methods: {
    openLoginDialog() {
      this.loginDialog = true; // Ouvrir le modal
    },
    closeDialog() {
      this.loginDialog = false; // Fermer le modal
    },
    login() {
      // Logique de connexion ici
      if (this.email && this.password) {
        console.log("Email:", this.email, "Password:", this.password);
        this.loginDialog = false; // Fermer le modal après la connexion
      }
    },
    redirectToRegister() {
      this.$router.push("/register"); // Redirection vers la page d'enregistrement
    },
  },
};
</script>
