<template>
    <v-container>
      <v-card>
        <v-card-title>Stockage des Produits</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- Sélecteur pour produit_id -->
            <v-select
              v-model="formData.produitId"
              :items="produits"
                item-text="text"
                item-value="value"
                label="Choisir un produit"
                outlined
                dense
             
              :loading="loading"
              :rules="[rules.required]"
            >
              <template #append-outer>
                <v-btn icon :disabled="loading" @click="fetchProduits">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
            </v-select>
  
            <!-- Champ pour quantité -->
            <v-text-field
              v-model="formData.valeurAjoutee"
              label="Quantité"
              type="number"
              required
              outlined
              dense
              :rules="[rules.required, rules.positiveNumber]"
              @keyup.enter="submitForm"
            ></v-text-field>
  
            <!-- Bouton soumettre -->
            <v-btn
              :disabled="!valid"
              color="primary"
              class="mt-3"
              @click="submitForm"
            >
              Enregistrer
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
<script>
export default {
  middleware:"admin",
  data() {
    return {
      valid: false,
      loading: false,
      formData: {
        produitId: null,
        valeurAjoutee: null,
      },
      produits: [], // Liste des produits
      rules: {
        required: (value) => !!value || "Ce champ est requis.",
        positiveNumber: (value) => value > 0 || "La quantité doit être positive.",
      },
    };
  },
  mounted() {
    this.fetchProduits(); // Charger les produits au montage du composant
  },
  methods: {
    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produits = response.data.map((produits) => ({
          text: produits.nom,
          value: produits._id,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },
    async submitForm() {
      if (this.$refs.form.validate()) {
        console.log(this.formData)
        try {
          // Appel API pour sauvegarder les données
          const response = await this.$axios.put("produits/quantite", this.formData);
          console.log("Données sauvegardées :", response.data);
          this.$notifier.showMessage({
            content: "Produit ajouté avec succès !",
            color: "success",
          }); 
       
          this.resetForm();
        } catch (error) {
            this.$notifier.showMessage({
            content: "Erreur lors de l'enregistrement!",
            color: "error",
          });
          console.error("Erreur lors de l'enregistrement :", error);          
        }
      }
    },

    resetForm() {
      this.formData.produitId = null;
      this.formData.valeurAjoutee = null;
    },
  },
};
</script>
  