<template>
  <v-container>     
    <!-- Formulaire de produit -->
    <v-form v-model="valid" @submit.prevent="submitForm">
      <v-card  v-if="isAdmin"  class="px-4">
        <v-row class="mt-4">
          <!-- Nom du produit -->
          <v-col cols="12" sm="6" md="4">
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
  
          <!-- Quantité du produit -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="produit.quantite"
              label="Quantité"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <!-- Prix du produit -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="produit.prix"
              label="Prix"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <!-- Champs supplémentaires -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="produit.ramplacement"
              label="Remplacés"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="produit.defectue"
              label="Défectueux"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="produit.critique"
              label="Critique"
              type="number"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="produit.alerte"
              label="Alerte"
              type="number"
              required
            ></v-text-field>
          </v-col>

          <!-- Boutons d'action -->
          <v-col cols="12" class="d-flex justify-end">
            <v-btn 
              :disabled="!produit.nom || !produit.categorie" 
              color="primary" 
              class="mr-2"
              @click="submitForm"
            >
              {{ isEditing ? 'Modifier' : 'Ajouter' }}
            </v-btn>
            <v-btn 
              v-if="isEditing" 
              color="secondary" 
              @click="clearForm"
            >
              Annuler
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
        <v-btn  v-if="isAdmin"  icon @click="editProduit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn  v-if="isAdmin"  icon @click="deleteProduit(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

import { mapGetters, mapActions } from "vuex";
import { role } from "../role";
export default {
  middleware:"superviseur",
  data() {
    return {
      valid: false,
      isEditing: false,
      produit: {
        id: null,
        nom: null,
        categorie: null,
        prix: 0,
        quantite: 12,
        ramplacement: 0,
        defectue: 0,
        alerte: 5,
        critique: 2
      },
      headers: [
        { text: 'Nom', value: 'nom' },
        { text: 'Catégorie', value: 'categorie' },
        { text: 'Prix (HTG)', value: 'prix' },
        { text: 'Quantité', value: 'quantite' },
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
  computed: {
    ...mapGetters("auth", ["user"]),
    isAdmin() {
      return this.user && parseInt(this.user.user_level) === role.admin;
    },
  },
  async created() {
    await this.fetchProduits();
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    async submitForm() {
      this.$axios.defaults.headers.common.Authorization =
      "Bearer " + localStorage.getItem("authToken");
      try {
        if (this.isEditing) {
          await this.$axios.put(`/produits/${this.produit._id}`, this.produit);
          this.$notifier.showMessage({
            content: "Produit modifié",
            color: "success",
          });
        } else {
          await this.$axios.post('/produits', this.produit);
          this.$notifier.showMessage({
            content: "Enregistrement réussi !",
            color: "success",
          });
        }
        this.clearForm();
        this.fetchProduits();
      } catch (error) {
        console.error('Erreur lors de la soumission du produit:', error);
      }
    },

    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produits = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },
    clearForm() {
      this.produit = {
        id: null,
        nom: null,
        categorie: null,
        prix: 0,
        quantite: 12,
        ramplacement: 0,
        defectue: 0,
        alerte: 5,
        critique: 2
      };
      this.valid = false;
      this.isEditing = false;
    },
    editProduit(item) {
      this.produit = { ...item };
      this.isEditing = true;
    },
    async deleteProduit(id) {
      this.$axios.defaults.headers.common.Authorization =
      "Bearer " + localStorage.getItem("authToken");
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
