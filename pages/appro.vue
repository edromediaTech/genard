<template>
    <v-container>
      <!-- Liste des produits -->
      <v-data-table
        :headers="headers"
        :items="produits"
        item-key="id"
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <!-- Bouton pour éditer -->
          <v-btn icon @click="openEditModal(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <!-- Bouton pour supprimer -->
          <v-btn icon @click="deleteProduit(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
  
      <!-- Modal d'édition -->
      <v-dialog v-model="editModal" max-width="800px">
        <v-card>
          <v-card-title class="headline">
            {{ isEditing ? 'Modifier Produit' : 'Ajouter Produit' }}
          </v-card-title>
          <v-card-text>
            <v-form v-model="valid" @submit.prevent="submitForm">
              <v-row class="mt-4">
                <!-- Nom du produit -->
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="produit.nom"
                    label="Nom du produit"
                    required
                  ></v-text-field>
                </v-col>
  
                <!-- Catégorie -->
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="produit.categorie"
                    :items="categoriesOptions"
                    label="Catégorie"
                    required
                  ></v-select>
                </v-col>
  
                <!-- Quantité -->
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="produit.quantite"
                    label="Quantité"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
  
                <!-- Prix -->
                <v-col cols="12" sm="6" md="2">
                  <v-text-field
                    v-model="produit.prix"
                    label="Prix"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>
  
                <!-- Autres champs -->
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="produit.ramplacement"
                    label="Remplacés"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="produit.defectue"
                    label="Défectueux"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="produit.critique"
                    label="Critique"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="produit.alerte"
                    label="Alerte"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="red" @click="closeModal">Annuler</v-btn>
            <v-btn :disabled="produit.nom === null || produit.categorie === null" color="primary" @click="submitForm">
              {{ isEditing ? 'Modifier' : 'Ajouter' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        valid: false,
        editModal: false, // Contrôle l'affichage du modal
        isEditing: false, // Mode édition ou ajout
        produit: {
          nom: null,
          categorie: null,
          prix: 0,
          quantite: 12,
          ramplacement: 0,
          defectue: 0,
          alerte: 5,
          critique: 2,
        },
        headers: [
          { text: 'Nom', value: 'nom' },
          { text: 'Catégorie', value: 'categorie' },
          { text: 'Prix (HTG)', value: 'prix' },
          { text: 'Qté', value: 'quantite' },
          { text: 'Remplacés', value: 'ramplacement' },
          { text: 'Défectueux', value: 'defectue' },
          { text: 'Critiques', value: 'critique' },
          { text: 'Alertes', value: 'alerte' },
          { text: 'Actions', align: 'end', value: 'actions' },
        ],
        produits: [],
        categoriesOptions: ['Plat', 'Boisson', 'Dessert'],
      };
    },
    async created() {
      await this.fetchProduits();
    },
    methods: {
      openEditModal(item) {
        this.isEditing = true;
        this.produit = { ...item };
        this.editModal = true;
      },
      closeModal() {
        this.clearForm();
        this.editModal = false;
      },
      async fetchProduits() {
        try {
          const response = await this.$axios.get('/produits/appro');
          this.produits = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des produits:', error);
        }
      },
      clearForm() {
        this.produit = {
          nom: null,
          categorie: null,
          prix: 0,
          quantite: 12,
          ramplacement: 0,
          defectue: 0,
          alerte: 5,
          critique: 2,
        };
        this.valid = false;
        this.isEditing = false;
      },
      async submitForm() {
        try {
          if (this.isEditing) {
            await this.$axios.put(`/produits/${this.produit.id}`, this.produit);
          } else {
            await this.$axios.post('/produits', this.produit);
          }
          this.closeModal();
          this.fetchProduits();
        } catch (error) {
          console.error('Erreur lors de la soumission:', error);
        }
      },
      async deleteProduit(id) {
        try {
          await this.$axios.delete(`/produits/${id}`);
          this.fetchProduits();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
        }
      },
    },
  };
  </script>
  