<template>
  <v-container>
    <v-row justify="space-between">
      <v-col>
        <h1>Gestion des Investissements</h1>
      </v-col>
      <v-col>
        <v-btn color="primary" @click="openAddDialog">Ajouter un Investissement</v-btn>
      </v-col>
    </v-row>

    <!-- Table des investissements -->
    <v-data-table :headers="headers" :items="investissements" class="elevation-1">
      <template #top>
        <v-text-field v-model="search" label="Rechercher" class="mx-4" />
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn color="primary" @click="openEditDialog(item)">Modifier</v-btn>
        <v-btn color="red" @click="deleteInvestissement(item.id)">Supprimer</v-btn>
      </template>
      <template #[`item.nomPrenom`]="{ item }">
      {{ item.investisseur.user.nom }} {{ item.investisseur.user.prenom}}
    </template>
    </v-data-table>

    <!-- Dialog pour ajouter / modifier un investissement -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span v-if="editedIndex === -1">Ajouter un Investissement</span>
          <span v-else>Modifier l'Investissement</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-select
              v-model="editedItem.investisseur"
              label="Investisseur"
              :items="investisseursList"
              :value="editedItem.investisseur"
              required
            ></v-select>
            <v-select
              v-model="editedItem.projet"
              label="Projet"
              :items="projetsList"
              item-text="nomProjet"
              item-value="_id"
              required
            ></v-select>
            <v-text-field
              v-model="editedItem.montantInvesti"
              label="Montant Investi"
              prefix="HTG"
              type="number"
              :rules="[isNumber]"
            required 
             
            ></v-text-field>
            <v-text-field
              v-model="editedItem.dateInvestissement"
              label="Date investissement"
              type="date"
            ></v-text-field>
           
            <v-select
              v-model="editedItem.statut"
              label="Statut"
              :items="['en cours', 'terminé', 'annulé']"
            ></v-select>
           
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveInvestissement"
            >Sauvegarder</v-btn
          >
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
      amount:'',
      headers: [
        { text: "Investisseur", value: "nomPrenom" },
        { text: "Projet", value: "projet.nomProjet" },
        { text: "Montant Investi", value: "montantInvesti" },
        { text: "Date d'Investissement", value: "dateInvestissement" },
        { text: "Statut", value: "statut" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      investissements: [],
      investisseursList: [], // Liste des investisseurs disponibles
      projetsList: [], // Liste des projets disponibles
      editedIndex: -1,
      editedItem: {
        investisseur: null,
        projet: null,
        montantInvesti: "",
        dateInvestissement: "",       
        statut: "en cours",        
      },
      defaultItem: {
        investisseur: null,
        projet: null,
        montantInvesti: "",
        dateEcheance: "",
        tauxRendement: "",
        statut: "en cours",
        retourSurInvestissement: "",
      },
      rules: {
        required: (v) => !!v || "Ce champ est requis",
        number: (v) => !isNaN(v) || "Doit être un nombre valide",
      },
    };
  },

  async mounted() {
    // Charger la liste des investissements et des dépendances au montage du composant
    await this.fetchInvestissements();
    await this.fetchDependencies();
  },

  methods: {
    formatNumber(value) {
      // Format le montant avec des séparateurs de milliers et deux décimales
      const number = parseFloat(value);
      if (isNaN(number)) return ''; // Si ce n'est pas un nombre valide, ne rien afficher
      return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    },
    onInput(value) {
      // Supprime les caractères non numériques (garde seulement les chiffres et les points)
      const rawValue = value.replace(/[^\d.]/g, ''); 
      // Mets à jour la valeur brute
      this.rawAmount = rawValue; 

      // Formate et affiche la valeur avec séparateurs et décimales
      this.editedItem.montantInvesti = this.formatNumber(rawValue);
    },

    isNumber(value) {
      const pattern = /^\d+(\.\d{1,2})?$/; // Permet jusqu'à 2 décimales
      return pattern.test(value) || "Veuillez entrer un montant valide";
    },
    // Ouvrir le dialogue pour ajouter un investissement
    openAddDialog() {
      this.editedIndex = -1;
      this.editedItem = { ...this.defaultItem };
      this.dialog = true;
    },

    // Ouvrir le dialogue pour modifier un investissement existant
    openEditDialog(item) {
      this.editedIndex = this.investissements.indexOf(item);
      this.editedItem = { ...item };
      this.dialog = true;
    },

    // Fermer le dialogue
    closeDialog() {
      this.dialog = false;
      this.$refs.form.reset();
    },

    // Sauvegarder (ajouter ou modifier) un investissement
    async saveInvestissement() {
      if (!this.$refs.form.validate()) return;

      if (this.editedIndex === -1) {
        // Ajouter un nouvel investissement
        try {
          const response = await this.$axios.post("investissement", this.editedItem);
          this.investissements.push(response.data);
        } catch (error) {
          console.error(error);
        }
      } else {
        // Mettre à jour un investissement existant
        try {
          const response = await this.$axios.put(
            "investissement/" + this.editedItem._id,
            this.editedItem
          );
          Object.assign(this.investissements[this.editedIndex], response.data);
        } catch (error) {
          console.error(error);
        }
      }
      this.closeDialog();
    },

    // Supprimer un investissement
    async deleteInvestissement(id) {
      const confirm = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet investissement ?"
      );
      if (confirm) {
        try {
          await this.$axios.delete("investissement/" + id);
          const index = this.investissements.findIndex(
            (investissement) => investissement._id === id
          );
          this.investissements.splice(index, 1);
        } catch (error) {
          console.error(error);
        }
      }
    },

    // Charger les investissements
    async fetchInvestissements() {
      try {
        const response = await this.$axios.get("investissement");
        this.investissements = response.data;
        console.log(this.investissements)
      } catch (error) {
        console.error(error);
      }
    },

    // Charger les investisseurs et les projets
    async fetchDependencies() {
      try {
        const [investisseursResponse, projetsResponse] = await Promise.all([
          this.$axios.get("investisseur"),
          this.$axios.get("projet"),
        ]);
       const d = investisseursResponse.data;
     
       for (let i = 0; i < d.length; i++) {
         this.investisseursList.push({ text: d[i].user.nom + " " + d[i].user.prenom, value: d[i]._id })
       }
        this.projetsList = projetsResponse.data;
       
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
