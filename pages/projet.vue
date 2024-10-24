<template>
  <v-container>
    <v-row justify="space-between">
      <v-col>
        <h1>Gestion des Projets</h1>
      </v-col>
      <v-col>
        <v-btn color="primary" @click="openAddDialog">Ajouter un Projet</v-btn>
      </v-col>
    </v-row>

    <!-- Table des projets -->
    <v-data-table :headers="headers" :items="projets" class="elevation-1">
      <template #top>
        <v-text-field v-model="search" label="Rechercher" class="mx-4" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn color="primary" text @click="openEditDialog(item)"
          ><v-icon small>mdi-pencil</v-icon></v-btn
        >
        <v-btn color="red" text @click="deleteProjet(item._id)"
          ><v-icon small>mdi-delete</v-icon></v-btn
        >
      </template>
    </v-data-table>

    <!-- Dialog pour ajouter / modifier un projet -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span v-if="editedIndex === -1">Ajouter un Projet</span>
          <span v-else>Modifier le Projet</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.nomProjet"
                  label="Nom du Projet"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.description"
                  label="Description"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.montantNecessaire"
                  label="Montant Nécessaire"
                  type="number"
                  :rules="[rules.required, rules.number]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.montantCollecte"
                  label="Montant Collecté"
                  type="number"
                  :rules="[rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.dateDebut"
                  label="Date de Début"
                  type="date"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.dateFin"
                  label="Date de Fin"
                  type="date"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedItem.tauxRendement"
                  label="Taux de Rendement"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.risque"
                  label="Risque"
                  :items="['faible', 'modéré', 'élevé']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="editedItem.statut"
                  label="Statut"
                  :items="['ouvert', 'fermé', 'financé']"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="closeDialog">Annuler</v-btn>
          <v-btn color="primary" @click="saveProjet">Sauvegarder</v-btn>
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
      headers: [
        { text: "Nom du Projet", value: "nomProjet" },
        { text: "Montant Nécessaire", value: "montantNecessaire" },
        { text: "Montant Collecté", value: "montantCollecte" },
        { text: "Date de Début", value: "dateDebut" },
        { text: "Statut", value: "statut" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      projets: [],
      editedIndex: -1,
      editedItem: {
        nomProjet: null,
        description: null,
        montantNecessaire: null,
        montantCollecte: null,
        dateDebut: null,
        dateFin: null,
        tauxRendement: 0,
        risque: "modéré",
        statut: "ouvert",
      },
      defaultItem: {
        nomProjet: null,
        description: null,
        montantNecessaire: "",
        montantCollecte: 0,
        dateDebut: "",
        dateFin: "",
        tauxRendement: "",
        risque: "modéré",
        statut: "ouvert",
      },
      rules: {
        required: (v) => !!v || "Ce champ est requis",
        number: (v) => !isNaN(v) || "Doit être un nombre valide",
      },
    };
  },

  async mounted() {
    // Charger la liste des projets au montage du composant
    await this.fetchProjets();
  },

  methods: {
    // Ouvrir le dialogue pour ajouter un projet
    openAddDialog() {
      this.editedIndex = -1;
      this.editedItem = { ...this.defaultItem };
      this.dialog = true;
    },

    // Ouvrir le dialogue pour modifier un projet existant
    openEditDialog(item) {
      this.editedIndex = this.projets.indexOf(item);
      this.editedItem = { ...item };
      this.dialog = true;
    },

    // Fermer le dialogue
    closeDialog() {
      this.dialog = false;
      this.$refs.form.reset();
    },

    // Sauvegarder (ajouter ou modifier) un projet
    async saveProjet() {
      if (!this.$refs.form.validate()) return;

      if (this.editedIndex === -1) {
        // Ajouter un nouveau projet
        try {
          const response = await this.$axios.post("projet", this.editedItem);
          this.projets.push(response.data);
        } catch (error) {
          console.error(error);
        }
      } else {
        // Mettre à jour un projet existant
        try {
          const response = await this.$axios.put(
            "projet/" + this.editedItem._id,
            this.editedItem
          );
          Object.assign(this.projets[this.editedIndex], response.data);
        } catch (error) {
          console.error(error);
        }
      }
      this.closeDialog();
    },

    // Supprimer un projet
    async deleteProjet(id) {
      const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
      if (confirm) {
        try {
          await this.$axios.delete("projet/" + id);
          const index = this.projets.findIndex((projet) => projet._id === id);
          this.projets.splice(index, 1);
        } catch (error) {
          console.error(error);
        }
      }
    },

    // Charger les projets
    async fetchProjets() {
      try {
        const response = await this.$axios.get("projet");
        this.projets = response.data;
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
