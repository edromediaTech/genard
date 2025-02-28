<template>
  <v-container>
    <v-card>
      <v-card-title>
        Lignes Budgétaires
        <v-spacer />
        <v-btn color="primary" @click="openDialog()">Ajouter</v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="budgetLines" dense  :loading="loading"
       loading-text="Chargement en cours..." >
          <template #[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
            <v-icon small color="red" @click="deleteItem(item._id)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editMode ? 'Modifier' : 'Ajouter' }} une Ligne Budgétaire
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="editedItem.name" label="Nom" required></v-text-field>
          <v-text-field v-model="editedItem.description" label="Description"></v-text-field>
          <v-select v-model="editedItem.category" :items="['expense', 'revenue']" label="Catégorie"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="primary" @click="saveItem">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      editMode: false,
      loading:false,
      budgetLines: [],
      editedItem: { name: '', description: '', category: '' },
      headers: [
        { text: 'Nom', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Catégorie', value: 'category' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  async mounted() {
    await this.fetchBudgetLines();
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

    openDialog(item = null) {
      this.editedItem = item ? { ...item } : { name: '', description: '', category: '' };
      this.editMode = !!item;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    async saveItem() {
      try {
        if (this.editMode) {
          await this.$axios.put('finance/budget-lines/'+this.editedItem._id, this.editedItem);
        } else {
          await this.$axios.post('finance/budget-lines', this.editedItem);
        }
        await this.fetchBudgetLines();
        this.closeDialog();
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    },
    async deleteItem(id) {
      try {
        await this.$axios.delete('finance/budget-lines/'+id);
        await this.fetchBudgetLines();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }
};
</script>
