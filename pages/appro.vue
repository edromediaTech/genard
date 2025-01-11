<template>
    <v-container>
      <!-- Ajouter un nouveau produit -->
      <!-- <v-btn color="primary" class="mt-4" @click="isEditing = false; clearForm()">Ajouter un produit</v-btn> -->
  
      <!-- Formulaire de produit -->
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-card class="px-4">
        <v-row  class="mt-4">
          <!-- Nom du produit -->
          <v-col cols="12" sm="6"  md="4">
            <v-text-field
              v-model="produit.nom"
              label="Nom du produit"
              required
            ></v-text-field>
          </v-col>
  
          <!-- Catégorie du produit -->
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="produit.categorie"
              :items="categoriesOptions"
              label="Catégorie"
              required
            ></v-select>
          </v-col>
  
          <!-- Prix du produit -->
          <v-col cols="12" sm="6"  md="2">
            <v-text-field
              v-model="produit.quantite"
              label="Quanité"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <!-- Prix du produit -->
          <v-col cols="12" sm="6"  md="2">
            <v-text-field
              v-model="produit.prix"
              label="Prix"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6"  md="3">
            <v-text-field
              v-model="produit.ramplacement"
              label="Remplacés"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6"  md="3">
            <v-text-field
              v-model="produit.defectue"
              label="Defectueux"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6"  md="3">
            <v-text-field
              v-model="produit.critique"
              label="Critique"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6"  md="3">
            <v-text-field
              v-model="produit.alerte"
              label="Alerte"
              type="number"
              required
            ></v-text-field>
          </v-col>
  
          <!-- Disponibilité -->
          <!-- <v-col cols="12" sm="6" class="d-flex align-center">
            <v-switch
              v-model="produit.disponibilite"
              label="Disponibilité"
              :value="true"
              :false-value="false"
            ></v-switch>
          </v-col> -->
  
          <!-- Bouton de soumission -->
          <v-col cols="12">
            <v-btn  color="primary" @click="submitForm">
              {{ isEditing ? 'Modifier' : 'Ajouter' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
      </v-form>
  
      <!-- Liste des produits -->
      <v-divider class="my-4"></v-divider>
      <v-data-table
        :headers="headers"
        :items="produits"
        item-key="id"
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon @click="editProduit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="deleteProduit(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </template>
  
  
  <script>
  export default {
    middleware : 'admin',
    data() {
      return {
        valid: false,
        isEditing: false, // Mode édition
        produit: {
          nom: null,         
          categorie: '',
          prix: 0,
          quantite: 12,
          ramplacement:0,
          defectue:0,
          alerte:5,
          critique:2
        },
        headers: [        
          { text: 'Nom', value: 'nom' },
          { text: 'Catégorie', value: 'categorie' },
          { text: 'Prix (HTG)', value: 'prix' },
          { text: 'Qté', value: 'quantite' },
          { text: 'Remplacés', value: 'ramplacement' },
          { text: 'Defectueux', value: 'defectue' },
          { text: 'Critiques', value: 'critique' },
          { text: 'Alertes', value: 'alerte' },
          { text: 'Actions', align: 'end', value: 'actions' },
        ],
        produits: [], // Liste des produits
        categoriesOptions: ['Plat', 'Boisson', 'Dessert'], // Options pour la catégorie
      };
    },
    // Charger les données lors du montage
    async created() {
      await this.fetchProduits();
    },

    methods: {
      // Soumettre le formulaire
      async submitForm() {
        try {
          if (this.isEditing) {
            // Modifier un produit
            await this.$axios.put(`/produits/${this.produit._id}`, this.produit);
          } else {
            // Ajouter un nouveau produit
            await this.$axios.post('/produits', this.produit);
          }
          this.clearForm();
          this.fetchProduits();
        } catch (error) {
          console.error('Erreur lors de la soumission du produit:', error);
        }
      },
      // Récupérer tous les produits
      async fetchProduits() {
        try {
          const response = await this.$axios.get('/produits/appro');
          console.log(response)
          this.produits = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des produits:', error);
        }
      },
      // Réinitialiser le formulaire
      clearForm() {
        this.produit = {
          id: null,
          nom: '',
          categorie: '',
          prix: 0,
          disponibilite: true,
        };
        this.valid = false;
        this.isEditing = false;
      },
      // Activer le mode édition
      editProduit(item) {
        this.produit = { ...item };
        this.isEditing = true;
      },
      // Supprimer un produit
      async deleteProduit(id) {
        try {
          await this.$axios.delete(`/produits/${id}`);
          this.fetchProduits();
        } catch (error) {
          console.error('Erreur lors de la suppression du produit:', error);
        }
      },
    },
  };
  </script>
  