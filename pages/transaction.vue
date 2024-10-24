<template>
  <v-container>
    <h1>Gestion des Transactions</h1>

    <!-- Formulaire pour créer ou mettre à jour une transaction -->
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="transactionForm.montant"
        label="Montant"
        :rules="montantRules"
        required
      ></v-text-field>

      <v-select
        v-model="transactionForm.typeTransaction"
        :items="typesTransactions"
        label="Type de transaction"
        required
      ></v-select>

      <v-select
        v-model="transactionForm.statut"
        :items="statuts"
        label="Statut de la transaction"
        required
      ></v-select>

      <v-text-field
        v-model="transactionForm.moyenPaiement"
        label="Moyen de paiement"
      ></v-text-field>

      <v-btn :disabled="!valid" @click="submitForm">Enregistrer</v-btn>
    </v-form>

    <!-- Liste des transactions -->
    <v-data-table
      :headers="headers"
      :items="transactions"
      class="elevation-1"
      item-key="id"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon small @click="editTransaction(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteTransaction(item.id)">mdi-delete</v-icon>
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
      transactionForm: {
        montant: "",
        typeTransaction: "",
        statut: "",
        moyenPaiement: "",
      },
      transactions: [],
      headers: [
        { text: "ID", value: "id" },
        { text: "Montant", value: "montant" },
        { text: "Type de Transaction", value: "typeTransaction" },
        { text: "Statut", value: "statut" },
        { text: "Moyen de Paiement", value: "moyenPaiement" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      typesTransactions: ["dépôt", "retrait", "réinvestissement"],
      statuts: ["en attente", "confirmée", "échouée"],
      montantRules: [(v) => !!v || "Le montant est requis"],
    };
  },
  mounted() {
    this.getTransactions();
  },
  methods: {
    async getTransactions() {
      try {
        const response = await axios.get("/api/transactions");
        this.transactions = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async submitForm() {
      if (this.transactionForm.id) {
        // Mettre à jour une transaction
        await this.updateTransaction();
      } else {
        // Créer une nouvelle transaction
        await this.createTransaction();
      }
    },
    async createTransaction() {
      try {
        const response = await axios.post("/api/transactions", this.transactionForm);
        this.transactions.push(response.data);
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    async updateTransaction() {
      try {
        await axios.put("transactions/" + this.transactionForm.id, this.transactionForm);
        this.getTransactions();
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    editTransaction(transaction) {
      this.transactionForm = { ...transaction };
    },
    async deleteTransaction(id) {
      try {
        await axios.delete("transactions/" + id);
        this.getTransactions();
      } catch (error) {
        console.error(error);
      }
    },
    resetForm() {
      this.transactionForm = {
        montant: "",
        typeTransaction: "",
        statut: "",
        moyenPaiement: "",
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
