<template>
  <v-container>
    <v-row justify="space-between">
      <v-col>
        <h1>Gestion des Investisseurs</h1>
      </v-col>
      <v-col>
        <v-btn color="primary" @click="openAddDialog"
          ><v-icon>mdi-plus</v-icon> Ajouter
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table des investisseurs -->
    <v-data-table :headers="headers" :items="investisseurs" class="elevation-1">
      <template #top>
        <v-text-field v-model="search" label="Rechercher" class="mx-4" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn color="primary" text @click="openEditDialog(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn color="red" text @click="deleteInvestisseur(item._id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <!-- Dialog pour ajouter / modifier un investisseur -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span v-if="editedIndex === -1">Ajouter un Investisseur</span>
          <span v-else>Modifier l'Investisseur</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.user"
                  label="Investisseur"
                  prepend-icon="mdi-woman"
                  :items="users"
                  required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.typeInvestisseur"
                  label="Type d'investisseur"
                  :items="['Particulier', 'Institutionnel']"
                  required
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="primary" text @click="saveInvestisseur">Sauvegarder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      dialog: false,
      valid: false,
      users: [],
      headers: [
        { text: "Nom", value: "user.nom" },
        { text: "Prenom", value: "user.prenom" },      
        { text: "Téléphone", value: "user.tel" },
        { text: "Type", value: "typeInvestisseur" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      investisseurs: [],
      editedIndex: -1,
      editedItem: {
        user: null,
        typeInvestisseur: "particulier",
      },
      defaultItem: {
        user: "",     
        typeInvestisseur: "particulier",
      },
      rules: {
        required: (v) => !!v || "Ce champ est requis",
        email: (v) => /.+@.+\..+/.test(v) || "E-mail invalide",
      },
    };
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Ajouter un Investisseur"
        : "Modifier l'Investisseur";
    },
  },

  async mounted() {
    // Charger la liste des investisseurs au montage du composant
    await this.fetchInvestisseurs();
    this.getUsers();
  },

  methods: {
    async getUsers() {
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");

      this.visible = true;
      await this.$axios.get("auth/all1").then((res) => {
        const d = res.data;
        for (let i = 0; i < d.length; i++) {
          this.users.push({ text: d[i].nom + " " + d[i].prenom, value: d[i]._id });
        }
        this.visible = false;
      });
    },
    // Ouvrir le dialogue pour ajouter un investisseur
    openAddDialog() {
      this.editedIndex = -1;
      this.editedItem = { ...this.defaultItem };
      this.dialog = true;
    },

    // Ouvrir le dialogue pour modifier un investisseur existant
    openEditDialog(item) {
      this.editedIndex = this.investisseurs.indexOf(item);
      this.editedItem = { ...item };
      this.dialog = true;
    },

    // Fermer le dialogue
    closeDialog() {
      this.dialog = false;
      this.$refs.form.reset();
    },

    // Sauvegarder (ajouter ou modifier) un investisseur
    async saveInvestisseur() {
    
      if (!this.$refs.form.validate()) return;

      if (this.editedIndex === -1) {
        // Ajouter un nouvel investisseur
        try {
          const response = await this.$axios.post("investisseur", this.editedItem);
          this.investisseurs.push(response.data);
        } catch (error) {
          console.error(error);
        }
      } else {
        // Mettre à jour un investisseur existant
        try {
          const response = await this.$axios.put(
            "investisseurs/" + this.editedItem._id,
            this.editedItem
          );
          Object.assign(this.investisseurs[this.editedIndex], response.data);
        } catch (error) {
          console.error(error);
        }
      }
      this.closeDialog();
    },

    // Supprimer un investisseur
    async deleteInvestisseur(id) {
      const confirm = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet investisseur ?"
      );
      if (confirm) {
        try {
          await this.$axios.delete("investisseur/" + id);
          const index = this.investisseurs.findIndex(
            (investisseur) => investisseur._id === id
          );
          this.investisseurs.splice(index, 1);
        } catch (error) {
          console.error(error);
        }
      }
    },

    // Charger les investisseurs
    async fetchInvestisseurs() {
      try {
        const response = await this.$axios.get("investisseur");
        this.investisseurs = response.data;
        console.log("invest",this.investisseurs)
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
/* Ajouter des styles personnalisés ici si nécessaire */
</style>
