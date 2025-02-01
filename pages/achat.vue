<template>
    <v-container>
      <!-- Bouton pour ouvrir le modal -->
      <v-btn v-if="isAdmin" color="primary" @click="openModal">Ajouter une transaction</v-btn>
  
      <!-- Modal pour le formulaire -->
      <v-dialog v-model="modalOpen" max-width="800px" persistent>
        <v-card>
          <v-card-title>Ajouter une transaction</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitForm">
                <v-row>
              <!-- Fournisseur -->
              <v-col cols="12" md="6" sm="6">
              <v-text-field
                v-model="form.fournisseur"
                label="Fournisseur"
                required
                outlined
              ></v-text-field>
                </v-col>
              <!-- Produit -->
              <v-col cols="12" md="6" sm="6">
              <v-autocomplete
                v-model="form.produitId"
                :items="produits"
                item-text="nom"
                item-value="_id"
                label="Produit"
                required
                outlined
              ></v-autocomplete>
            </v-col>
              <!-- Quantité -->
              <v-col cols="12" md="6" sm="6">
              <v-text-field
                v-model="form.quantite"
                label="Quantité"
                type="number"
                min="0"
                required
                outlined
              ></v-text-field>
                </v-col>
              <!-- Prix -->
              <v-col cols="12" md="6" sm="6">
              <v-text-field
                v-model="form.prix"
                label="Prix"
                type="number"
                min="0"
                required
                outlined
              ></v-text-field>
                </v-col>
              <!-- Date -->
              <v-col cols="12" md="6" sm="6">
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="form.date"
                    label="Date"
                    readonly
                    v-bind="attrs"
                    outlined
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.date"
                  @input="dateMenu = false"
                ></v-date-picker>
              </v-menu>
              </v-col>
  
              <!-- Versement -->
              <v-col cols="12" md="6" sm="6">
              <v-text-field
                v-model="form.versement"
                label="Versement"
                type="number"
                min="0"
                required
                outlined
              ></v-text-field>
              </v-col>
  
              <!-- Règlement -->
              <v-col cols="12" md="6" sm="6">
              <v-select
                v-model="form.reglement"
                :items="reglementOptions"
                label="Règlement"
                required
                outlined
              ></v-select>
              </v-col>
  
              <!-- Livraison -->
              <v-col cols="12" md="6" sm="6">
              <v-select
                v-model="form.livraison"
                :items="livraisonOptions"
                label="Livraison"
                required
                outlined
              ></v-select>
              </v-col>
            </v-row>
              <!-- Boutons du modal -->
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closeModal">Annuler</v-btn>
                <v-btn type="submit" color="primary"> 
                   <v-progress-circular
                    v-if="loading"
                    :disabled="loading"
                    :size="30"
                    color="white"
                    indeterminate
                  />
                      Enregistrer</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
  
      <!-- Tableau pour afficher les données -->
      <v-data-table
        :headers="headers"
        :items="transactions"
        :items-per-page="10"
        class="elevation-1"
        :search="search"
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
                  v-if="transactions.length > 0"  
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
              v-if="transactions.length > 0"
             
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
                  filename="Achats"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="landscape"
                  pdf-content-width="1000px"
                >
                  <template slot="pdf-content">
                    <AchatPrinter
                      :transactions="transactions"
                     
                    />
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
            </v-row>
      </template>
        <template v-if="isAdmin" #[`item.actions`]="{ item }">
          <v-btn icon small @click="editTransaction(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteTransaction(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </template>
  
  <script>
  import { mapGetters, mapActions } from "vuex";
  import { role } from "../role";
  import AchatPrinter from "~/components/achatPrinter.vue";
  export default {
    components:{AchatPrinter},
    middleware:'supadmin',
    data() {
      return {
        search:'',
        visible: false,
        modalOpen: false, // Contrôle l'ouverture du modal
        loading:false,
        form: {
          fournisseur: '', // Fournisseur
          produitId: null, // ID du produit
          quantite: 0, // Quantité
          prix: 0, // Prix
          date: new Date().toISOString().substr(0, 10), // Date par défaut
          versement: 0, // Versement
          reglement: 'total', // Règlement par défaut
          livraison: 'nonlivre', // Livraison par défaut
        },
        transactions: [], // Liste des transactions
        produits: [], // Liste des produits
        reglementOptions: ['total', 'partiel'], // Options de règlement
        livraisonOptions: ['partiel', 'nonlivre', 'total'], // Options de livraison
        dateMenu: false, // Contrôle du menu de sélection de date
        headers: [
          { text: 'Fournisseur', value: 'fournisseur' },
          { text: 'Produit', value: 'produitId.nom' },
          { text: 'Quantité', value: 'quantite' },
          { text: 'Prix', value: 'prix' },
          { text: 'Date', value: 'date' },
          { text: 'Versement', value: 'versement' },
          { text: 'Règlement', value: 'reglement' },
          { text: 'Livraison', value: 'livraison' },
          { text: '', value: 'actions', sortable: false },
        ],
      };
    },
    computed: {
    ...mapGetters("auth", ["user"]),
    isAdmin() {
      return this.user && parseInt(this.user.user_level) === role.supadmin;
    },
  
    formattedTransactions() {
      return this.transactions.map(transaction => {
        const produit = this.produits.find(p => p._id === transaction.produitId);
        return {
          ...transaction,
          produit: produit || { nom: 'Produit inconnu' },
        };
      });
    },
  },
    async mounted() {
      // Charger la liste des produits et des transactions
      await this.fetchProduits();
      await this.fetchTransactions();
    },
    methods: {
      ...mapActions("auth", ["sendLoginRequest"]),
      // Ouvrir le modal
      openModal() {
        this.modalOpen = true;
      },
  
      // Fermer le modal
      closeModal() {
        this.modalOpen = false;
        this.resetForm();
      },
  
      // Réinitialiser le formulaire
      resetForm() {
        this.form = {
          fournisseur: '',
          produitId: null,
          quantite: 0,
          prix: 0,
          date: new Date().toISOString().substr(0, 10),
          versement: 0,
          reglement: 'total',
          livraison: 'nonlivre',
        };
      },
  
      // Récupérer la liste des produits
      async fetchProduits() {
        this.loading = true
        try {
          const response = await this.$axios.get('/produits');
          this.produits = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des produits :', error);
        }
        this.loading = false
      },
  
      // Récupérer la liste des transactions
      async fetchTransactions() {
        this.loading = true
        try {
          const response = await this.$axios.get('achats');
          this.transactions = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des transactions :', error);
        }
        this.loading = false
      },
  
      // Soumettre le formulaire
      async submitForm() {
        this.loading = true
        this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')

        try {
          // Envoyer les données du formulaire à l'API
          const response = await this.$axios.post('achats', this.form);
          console.log('Transaction enregistrée :', response.data);
  
          // Rafraîchir la liste des transactions
          await this.fetchTransactions();
  
          // Fermer le modal et réinitialiser le formulaire
          this.closeModal();
  
          // Afficher un message de succès
          this.$notifier.showMessage({
            content: 'Transaction enregistrée avec succès !',
            color: 'success',
          });
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de la transaction :', error);
  
          // Afficher un message d'erreur
          this.$notifier.showMessage({
            content: 'Erreur lors de l\'enregistrement de la transaction.',
            color: 'error',
          });
        }
        this.loading = false
      },
  
      // Modifier une transaction
      editTransaction(transaction) {
        this.form = { ...transaction };
        this.modalOpen = true;
      },
  
      // Supprimer une transaction
      async deleteTransaction(transaction) {
        this.loading = true
        try {
          await this.$axios.delete(`achats/${transaction._id}`);
          await this.fetchTransactions(); // Rafraîchir la liste des transactions
          this.$notifier.showMessage({
            content: 'Transaction supprimée avec succès !',
            color: 'success',
          });
        } catch (error) {
          console.error('Erreur lors de la suppression de la transaction :', error);
          this.$notifier.showMessage({
            content: 'Erreur lors de la suppression de la transaction.',
            color: 'error',
          });
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
  /* Styles personnalisés */
  .v-card {
    max-width: 800px;
    margin: 0 auto;
  }
  </style>