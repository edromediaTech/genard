<template>
  <v-container>
    <v-card>
      <v-card-title>
        Gestion des Dépenses
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openDialog()">Nouvelle Dépense</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="expenses"  :loading="loading"
       loading-text="Chargement en cours..." class="elevation-1">
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteExpense(item._id)">mdi-delete</v-icon>
        </template>
        <template #top>
        <v-row>
          <v-col cols="12"
                sm="6"        
                md="3">
              <v-text-field
                  v-if="expenses.length > 0"  
                  v-model="search"
                  class="ml-4 "
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
               ></v-text-field>
             </v-col>     
             </v-row>
             </template>
               <template #[`item.date`]="{ item }">
          {{ formatDate(item.date) }}
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ form._id ? 'Modifier Dépense' : 'Ajouter Dépense' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="form.amount" label="Montant" type="number"></v-text-field>
            <v-text-field v-model="form.description" label="Description"></v-text-field>
            <v-select v-model="form.paymentMethod" :items="['cash', 'bank', 'credit']" label="Méthode de paiement"></v-select>
            <v-autocomplete v-model="form.budgetLine" :items="budgetLines" label="Ligne Budgetaire" item-text="name" item-value="_id"></v-autocomplete>
            <v-text-field v-model="form.date"  label="Date depense" type="date"></v-text-field>
            <v-text-field v-model="form.supplier" label="Fournisseur"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="form.montant=== 0 || form.description === '' || form.budgetLine === null" color="red" text @click="dialog = false">Annuler</v-btn>
          <v-btn  color="green"  @click="saveExpense">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
        loading : false,
      expenses: [],
      budgetLines:[],
      dialog: false,
      search:'',
      form: {},
      headers: [
        { text: 'Montant', value: 'amount' },
        { text: 'Description', value: 'description' },
        { text: 'Méthode de paiement', value: 'paymentMethod' },
         { text: 'Ligne Budgetaire', value: 'budgetLine.name' },
        { text: 'Date', value: 'date' },
        { text: 'Fournisseur', value: 'supplier' },
       
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  mounted() {
    this.fetchExpenses();
    this.fetchBudgetLines()
  },

  methods: {
     async fetchBudgetLines() {
        this.loading = true
  try {
    const response = await this.$axios.get('finance/budget-lines');
    console.log('Réponse API:', response.data);
    this.budgetLines = response.data.budgetLines || [];

    // this.budgetLines = Array.isArray(response.data[0]) ? response.data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des lignes budgétaires:', error);
  }
  this.loading = false
},

   async fetchExpenses() {
    this.loading = true;
    try {
        const response = await this.$axios.get('finance/expenses');
        console.log('Réponse API:', response.data);

        // Extraire les dépenses correctement
        if (Array.isArray(response.data.expenses)) {
            this.expenses = response.data.expenses;
        } else {
            console.error('Format inattendu des dépenses:', response.data);
            this.expenses = [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des dépenses:', error);
        this.expenses = [];
    }
    this.loading = false;
},
 formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
},

    openDialog(expense = {}) {
      this.form = { ...expense };
      this.dialog = true;
    },
    async saveExpense() {
      if (this.form._id) {
        await this.$axios.put('finance/expenses/'+this.form._id, this.form);
      } else {
        await this.$axios.post('finance/expenses', this.form);
      }
      this.dialog = false;
      this.fetchExpenses();
    },
    async deleteExpense(id) {
      await this.$axios.delete('finance/expenses/'+id);
      this.fetchExpenses();
    }
  }
};
</script>