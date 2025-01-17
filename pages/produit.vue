<template>
  <v-container>
    <!-- Formulaire de produit -->
    <v-form v-model="valid" @submit.prevent="submitForm">
      <v-card v-if="isAdmin" class="px-4">
        <v-row class="mt-4">
          <!-- ... (votre formulaire existant) ... -->
        </v-row>
      </v-card>
    </v-form>

    <!-- Liste des produits -->
    <v-divider class="my-4"></v-divider>
   

    <v-data-table
      :headers="headers"
      :items="produits"
     
      class="elevation-1"
      item-key="_id"
      :search="search" 
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
             
              class="mx-2 mt-2 theme--light no-dark-theme"
              fab
              x-small
              color="primary"
              @click="generateReport"
            >
              PDF
              <client-only>
                <vue-html2pdf
                  ref="html2Pdf"
                  :show-layout="false"
                  :float-layout="true"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1300"
                  filename="Produits"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="landscape"
                  pdf-content-width="1000px"
                >
                  <template slot="pdf-content">
                    <ExportPDF
                      :produits="produits"
                     
                    />
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
 </v-row>
 </template>
      <template #[`item.actions`]="{ item }">
        <v-btn v-if="isAdmin" icon @click="editProduit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="isAdmin" icon @click="deleteProduit(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { role } from "../role";
import ExportPDF from "@/components/produitPrinter.vue"; // Importez le composant ExportPDF



export default {
  components: {
    ExportPDF, // Enregistrez le composant
  },
  middleware: "superviseur",
  data() {
    return {
      search:'',
      valid: false,
      visible: false,
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
        critique: 2,
      },
      headers: [
        { text: "Nom", value: "nom" },
        { text: "Catégorie", value: "categorie" },
        { text: "Prix (HTG)", value: "prix" },
        { text: "Quantité", value: "quantite" },
        { text: "Remplacés", value: "ramplacement" },
        { text: "Défectueux", value: "defectue" },
        { text: "Critiques", value: "critique" },
        { text: "Alertes", value: "alerte" },
        { text: "Actions", align: "end", value: "actions" },
      ],
      produits: [],
      categoriesOptions: ["Plat", "Boisson", "Dessert", "Jus naturel", "Jus emboité", "Boisson Alcoolisé", "Apéritif", "Patisserie"],
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
          await this.$axios.post("/produits", this.produit);
          this.$notifier.showMessage({
            content: "Enregistrement réussi !",
            color: "success",
          });
        }
        this.clearForm();
        this.fetchProduits();
      } catch (error) {
        console.error("Erreur lors de la soumission du produit:", error);
      }
    },
    async fetchProduits() {
      try {
        const response = await this.$axios.get("/produits");
        this.produits = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
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
        critique: 2,
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
        console.error("Erreur lors de la suppression du produit:", error);
      }
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
.no-dark-theme {
  background-color: white !important;
  color: black !important;
}

.no-dark-theme * {
  background-color: white !important;
  color: black !important;
  box-shadow: none !important;
}

</style>