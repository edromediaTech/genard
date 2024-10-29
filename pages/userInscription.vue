<template>
  <v-container>
    <!-- <v-dialog v-model="loginDialog" persistent max-width="800px"> -->
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="#FFD700">mdi-account-multiple</v-icon>
          Fiche d'Enregistrement MBE
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="user.nom"
                label="Nom*"
                maxlength="75"
                :rules="[(v) => !!v || msgrules]"
                prepend-icon="mdi-account"
                required
                @input="user.nom = toUpperCase(user.nom)"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="user.prenom"
                label="Prénom*"
                maxlength="75"
                :rules="[(v) => !!v || msgrules]"
                prepend-icon="mdi-account"
                required
                @input="user.prenom = capitalize(user.prenom)"
              />
            </v-col>

            <v-col cols="12" md="4" sm="6">
              <v-text-field
                v-model="user.naissance"
                label="Date de Naissance"
                prepend-icon="mdi-calendar"
                type="date"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-text-field
                v-model="user.email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-text-field
                v-model="user.tel"
                label="Télehone"
                prepend-icon="mdi-phone"
                type="tel"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-autocomplete
                v-model="user.relation"
                :items="['Fils', 'Fille', 'Epoux', 'Epouse']"
                label="Relation"
                prepend-icon="mdi-link"
                required
              ></v-autocomplete>
            </v-col>
            <v-col  cols="12" md="12" sm="6">
              <v-autocomplete
              v-model="user.intermediaire"
                :disabled="user.relation === null"
                label="Intermediaire"
                prepend-icon="mdi-woman"
                :items="users"
                required
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-btn
            :disabled="
              user.nom === null ||
              user.prenom === null ||
              user.tel === null ||
              user.naissance === null ||
              user.intermediaire === null
            "
            color="#FFD700"
            type="button"
            @click="register"
          >
            Soumettre
          </v-btn>
        </v-card-text>
      </v-card>
    <!-- </v-dialog> -->
    <v-dialog v-model="showCode" max-width="800px">
      <v-card>
        <v-card-title class="headline">Code MBE</v-card-title>
        <v-card-text>
          <p>
            Voici votre code MBE : <strong>{{ codeMembre }}</strong>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showCode = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      loginDialog: true,
      showCode: false,
      codeMembre: null,
      step: 1,
      users: [],
      user: {
        nom: null,
        prenom: null,
        naissance: null,
        email: "",
        tel: null,
        intermediaire: null,
        relation: null,
      },
      msgrules: "Champ obligatoire",
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    ...mapActions("auth", ["sendRegisterRequest"]),
    async register() {
      this.loading = true;

      await this.$axios
        .post("auth/signup", this.user)
        // .then(response => response.json())
        .then((jsonResponse) => {
          console.log(jsonResponse);
          this.loginDialog = false;
          this.codeMembre = jsonResponse.data.user.code;
          this.showCode = true
          this.user.nom = null
          this.user.prenom= null
          this.user. naissance= null
          this.user.email= ""
         this.user. tel= ""
         this.user.intermediaire= null
          this.user.relation= null
          this.$notifier.showMessage({
            content: "Enregistrement réussi!",
            color: "success",
          });

          //  this.$router.push("/loginDialog");
          this.loading = false;
        })
        .catch((error) => console.log("Error: ", error));
    },

    prevStep() {
      if (this.step > 1) this.step--;
    },

    toUpperCase(value) {
      if (!value) return "";
      return value.toUpperCase();
    },

    capitalize(str) {
      return str
        .split(" ")
        .map((word) =>
          word
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("-")
        )
        .join(" ");
    },
    nextStep() {
      // Passer à l étape suivante
      if (this.step < 2) {
        this.step++;
      }
    },

    async getUsers() {
      //  this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')

      this.visible = true;
      await this.$axios.get("auth/all").then((res) => {
        console.log("user", res.data);
        const d = res.data;
        for (let i = 0; i < d.length; i++) {
          this.users.push({ text: d[i].nom + " " + d[i].prenom, value: d[i]._id });
        }
        this.visible = false;
      });
    },
    openLoginDialog() {
      this.loginDialog = true; // Ouvrir le modal
    },
    closeDialog() {
      this.loginDialog = false; // Fermer le modal
    },

    redirectToRegister() {
      this.$router.push("/register"); // Redirection vers la page d'enregistrement
    },
  },
};
</script>
