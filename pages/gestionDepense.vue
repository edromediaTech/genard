<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-cash-register</v-icon>
        <span class="text-h6 font-weight-bold">Gestion des Dépenses</span>
        <v-spacer></v-spacer>
        <v-btn color="primary" class="elevation-2" @click="openDialog()">
          <v-icon left>mdi-plus</v-icon> Nouvelle Dépense
        </v-btn>
      </v-card-title>

      <v-divider class="my-3"></v-divider>

      <!-- Filtres -->
      <v-sheet class="pa-3 rounded-lg">
        <v-row align="center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field v-model="startDate" label="Date de début" type="date" outlined dense></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-text-field v-model="endDate" label="Date de fin" type="date" outlined dense></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-btn color="primary" class="mr-2 elevation-2" @click="applyDateFilter">
              <v-icon left>mdi-filter</v-icon> Appliquer
            </v-btn>
            <v-btn color="grey" outlined @click="resetDateFilter">
              <v-icon left>mdi-refresh</v-icon> Réinitialiser
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>

      <v-divider class="my-3"></v-divider>

      <!-- Tableau des Dépenses -->
      <v-data-table
        :headers="headers"
        :items="filteredExpenses"
        :loading="loading"
        loading-text="Chargement en cours..."
        class="elevation-2"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon color="primary" @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="deleteExpense(item._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template #[`item.date`]="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template #[`item.amount`]="{ item }">
          <strong class="text-green-darken-2">{{ formatAmount(item.amount) }}</strong>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogue pour ajouter/modifier une dépense -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ form._id ? 'Modifier Dépense' : 'Ajouter Dépense' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="form.amount" label="Montant" type="number" outlined dense></v-text-field>
            <v-text-field v-model="form.description" label="Description" outlined dense></v-text-field>           
            <v-select v-model="form.paymentMethod" :items="['cash', 'bank', 'credit']" label="Méthode de paiement" outlined dense></v-select>
            <v-select v-model="form.devise" :items="['gourde', 'dollar', 'peso']" label="Devise" outlined dense></v-select>
            <v-autocomplete v-model="form.budgetLine" :items="budgetLines" label="Ligne Budgétaire" item-text="name" item-value="_id" outlined dense></v-autocomplete>
            <v-text-field v-model="form.date" label="Date de dépense" type="date" outlined dense></v-text-field>
            <v-autocomplete v-model="form.supplier" label="Fournisseur" :items="suppliers"  item-text="name" item-value="_id" outlined dense></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text @click="dialog = false">Annuler</v-btn>
          <v-btn color="green" @click="saveExpense">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogue de confirmation de suppression -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cette dépense ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text @click="confirmDelete">Oui</v-btn>
          <v-btn color="green" text @click="confirmDeleteDialog = false">Non</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      expenses: [],
      budgetLines: [],
      suppliers: [],
      dialog: false,
      confirmDeleteDialog: false,
      expenseToDelete: null,
      search: '',
      form: {},
      headers: [
        { text: 'Montant', value: 'amount' },
        { text: 'Description', value: 'description' },
        { text: 'Méthode de paiement', value: 'paymentMethod' },
        { text: 'Ligne Budgétaire', value: 'budgetLine.name' },
        { text: 'Date', value: 'date' },
        { text: 'Fournisseur', value: 'supplier.name' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      startDate: null,
      endDate: null,
      filteredExpenses: [],
    };
  },
  computed: {
    formattedDate: {
      get() {
        if (!this.form.date) return '';
        return new Date(this.form.date).toISOString().split('T')[0];
      },
      set(value) {
        this.form.date = value ? new Date(value).toISOString() : null;
      },
    },
  },
  mounted() {
    const today = new Date().toLocaleDateString('fr-CA');
    this.startDate = today;
    this.endDate = today;
   
    this.fetchExpenses();
    this.fetchBudgetLines();
    this.fetchSuppliers()
  },
  methods: {
    async fetchExpenses() {
      this.loading = true;
      try {
        const response = await this.$axios.get('finance/expenses');
        this.expenses = response.data.expenses || [];
        this.applyDateFilter();
      } catch (error) {
        console.error('Erreur lors de la récupération des dépenses:', error);
      }
      this.loading = false;
    },

    async fetchBudgetLines() {
        this.loading = true
  try {
    const response = await this.$axios.get('finance/budget-lines');

    this.budgetLines = response.data.budgetLines || [];

    // this.budgetLines = Array.isArray(response.data[0]) ? response.data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des lignes budgétaires:', error);
  }
  this.loading = false
},
    async fetchSuppliers() {
        this.loading = true
  try {
    const response = await this.$axios.get('supplier');

    this.suppliers = response.data || [];

    // this.budgetLines = Array.isArray(response.data[0]) ? response.data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
  }
  this.loading = false
},
    formatDate(isoDate) {
      const date = new Date(isoDate);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    formatAmount(amount) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG' }).format(amount);
    },
    openDialog(expense = {}) {
      this.form = { ...expense };
      this.dialog = true;
    },
    async saveExpense() {
      console.log(this.form)
      if (this.form._id) {
        await this.$axios.put('finance/expenses/' + this.form._id, this.form);
      } else {
        await this.$axios.post('finance/expenses', this.form);
      }
      this.dialog = false;
      this.fetchExpenses();
    },
    deleteExpense(id) {
      this.expenseToDelete = id;
      this.confirmDeleteDialog = true;
    },
    async confirmDelete() {
      if (this.expenseToDelete) {
        await this.$axios.delete('finance/expenses/' + this.expenseToDelete);
        this.fetchExpenses();
      }
      this.confirmDeleteDialog = false;
    },
    applyDateFilter() {
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

        this.filteredExpenses = this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          const expenseUTC = Date.UTC(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate(), 0, 0, 0, 0);
          return expenseUTC >= startUTC && expenseUTC <= endUTC;
        });
      } else {
        this.filteredExpenses = this.expenses;
      }
    },
    resetDateFilter() {
      const today = new Date().toISOString().split('T')[0];
      this.startDate = today;
      this.endDate = today;
      this.applyDateFilter();
    },
  },
};
</script>