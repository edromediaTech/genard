<template>
  <v-container>
  
    <!-- Liste des produits -->
    <v-data-table
      id="printable-table"
      :headers="headers"
      :items="produits"
      item-key="_id"
      :search="search"    
      class="elevation-1"
       :loading="loading"
       loading-text="Chargement en cours..."      
    >
    <template #top>
      <v-row class="mx-4 my-4">
          <v-progress-circular
              v-show="visible"
              :size="50"
              :width="3"
              color="info"
              indeterminate                    
              /> 
            <v-col cols="12"
                sm="6"        
                md="3">
              <v-text-field
                  v-if="produits.length > 0"  
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
               ></v-text-field>
             </v-col>    
              <v-spacer />
      
          <!-- Bouton et composant pour exporter en PDF -->
            <v-btn
              v-if="produits.length > 0"             
              class="mx-2 mt-4 "              
              small
              color="success"
              @click="generateReport"
            ><v-icon left>mdi-printer</v-icon>
              PDF
              <client-only>
                <vue-html2pdf
                  ref="html2Pdf"
                  :show-layout="false"
                  :float-layout="true"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1000"
                  filename="Approvisionnement"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="portrait"
                  pdf-content-width="800px"
                >
                  <template slot="pdf-content">
                    <appro-printer
                      :produits="produits"                     
                    />
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
      </v-row>
 </template>
      <template v-if="isAdmin" #[`item.actions`]="{ item }">
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
    <v-dialog v-if="isAdmin" v-model="editModal" max-width="800px">
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
import { mapGetters, mapActions } from "vuex";
import { role } from "../role";
export default {
  middleware: "superviseur",
  data() {
    return {
      
      search:'',
      loading:false,
      valid: false,
      visible: false,
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
        { text: '', align: 'end', value: 'actions' },
      ],
      produits: [],
      categoriesOptions: ['Plat', 'Boisson', 'Dessert'],
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    isAdmin() {
      return this.user && parseInt(this.user.user_level) === role.supadmin;
    },
  },
  async created() {
    await this.fetchProduits();
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
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
      this.loading = true
      try {
        const response = await this.$axios.get('/produits/appro');
        this.produits = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
      this.loading = false
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
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken');
      this.loading = true
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
      this.loading = false
    },
    async deleteProduit(id) {
      this.loading = true
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken');
      try {
        await this.$axios.delete(`/produits/${id}`);
        this.fetchProduits();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
      this.loading = false
    },
    async beforeDownload({ html2pdf, options, pdfContent }) {
      await html2pdf()
        .set(options)
        .from(pdfContent)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              "Page " + i + " sur " + totalPages,
              pdf.internal.pageSize.getWidth() * 0.88,
              pdf.internal.pageSize.getHeight() - 0.3
            );
          }
        })
        .save();
    },
   
    generateReport() {      
      this.$refs.html2Pdf.generatePdf();
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques à l'impression */
@media print {
  .v-btn, .v-dialog {
    display: none; /* Masquer les boutons et le modal */
  }
}
</style>