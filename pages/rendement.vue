<template>
  <v-container>
    <h1>Gestion des Rendements</h1>

    <!-- Formulaire pour créer ou mettre à jour un rendement -->
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-select
        v-model="rendementForm.investissement"
        :items="investissements"
        item-text="nom"
        item-value="_id"
        label="Investissement"
        required
      ></v-select>

      <v-text-field
        v-model="rendementForm.tauxRendementActuel"
        label="Taux de rendement actuel"
        :rules="rendementRules"
        required
      ></v-text-field>

      <v-text-field
        v-model="rendementForm.montantRetour"
        label="Montant de retour"
        :rules="montantRules"
        required
      ></v-text-field>

      <v-btn :disabled="!valid" @click="submitForm">Enregistrer</v-btn>
    </v-form>

    <!-- Liste des rendements -->
    <v-data-table
      :headers="headers"
      :items="rendements"
      class="elevation-1"
      item-key="id"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon small @click="editRendement(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteRendement(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      rendementForm: {
        investissement: "",
        tauxRendementActuel: "",
        montantRetour: "",
      },
      rendements: [],
      investissements: [], // Pour stocker les investissements disponibles
      headers: [
        { text: "ID", value: "id" },
        { text: "Investissement", value: "investissement.nom" },
        { text: "Taux de rendement actuel", value: "tauxRendementActuel" },
        { text: "Montant de retour", value: "montantRetour" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      rendementRules: [(v) => !!v || "Le taux de rendement est requis"],
      montantRules: [(v) => !!v || "Le montant de retour est requis"],
    };
  },
  mounted() {
    this.getRendements();
    this.getInvestissements();
  },
  methods: {
    async getRendements() {
      try {
        const response = await axios.get("/api/rendements");
        this.rendements = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async getInvestissements() {
      try {
        const response = await axios.get("/api/investissements");
        this.investissements = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async submitForm() {
      if (this.rendementForm.id) {
        // Mettre à jour un rendement
        await this.updateRendement();
      } else {
        // Créer un nouveau rendement
        await this.createRendement();
      }
    },
    async createRendement() {
      try {
        const response = await axios.post("/api/rendements", this.rendementForm);
        this.rendements.push(response.data);
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    async updateRendement() {
      try {
        await axios.put("rendements/" + this.rendementForm.id, this.rendementForm);
        this.getRendements();
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    editRendement(rendement) {
      this.rendementForm = { ...rendement };
    },
    async deleteRendement(id) {
      try {
        await axios.delete("rendements/" + id);
        this.getRendements();
      } catch (error) {
        console.error(error);
      }
    },
    resetForm() {
      this.rendementForm = {
        investissement: "",
        tauxRendementActuel: "",
        montantRetour: "",
      };
    },
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
