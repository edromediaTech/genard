<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Achats
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openDialog(null)">Nouvel Achat</v-btn>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="achats"
            @click:row="openDialog"
          >
            <template #top>
              <v-row class="mx-4 my-4">
                <v-progress-circular v-show="visible" :size="50" :width="3" color="info" indeterminate />
                <v-col cols="12" sm="6" md="3">
                  <v-text-field v-if="achats.length > 0" v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                </v-col>
                <v-spacer />
                <v-btn v-if="achats.length > 0" class="mx-2 mt-2 theme--light no-dark-theme" fab x-small color="primary" @click="generateReport">
                  PDF
                  <client-only>
                    <vue-html2pdf ref="html2Pdf" :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="false" :paginate-elements-by-height="1300" filename="Achats" :pdf-quality="2" :manual-pagination="false" pdf-format="letter" pdf-orientation="landscape" pdf-content-width="1000px">
                      <template slot="pdf-content">
                        <AchatPrinter :achats="achats" />
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
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
      <template #[`item.date`]="{ item }">
          {{ formatDate(item.date) }}
        </template>
          </v-data-table>
         
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.supplier"
                  :items="suppliers"
                  item-text="name"
                  item-value="_id"
                  label="Fournisseur"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-data-table
                  :headers="articleHeaders"
                  :items="editedItem.articles"
                >
                  <template #top>
                    <v-btn color="primary" @click="addArticle">Ajouter un Article</v-btn>
                  </template>
                  <template #[`item.produit`]="{ item }">
                    <v-select
                      v-model="item.produit"
                      :items="produits"
                      item-text="nom"
                      item-value="_id"
                      label="Produit"
                      required
                    ></v-select>
                  </template>
                  <template #[`item.quantite`]="{ item }">
                    <v-text-field
                      v-model="item.quantite"
                      type="number"
                      label="Quantité"
                      required
                    ></v-text-field>
                  </template>
                  <template #[`item.unitPrice`]="{ item }">
                    <v-text-field
                      v-model="item.unitPrice"
                      type="number"
                      label="Prix Unitaire"
                      required
                    ></v-text-field>
                  </template>
                  <template #[`item.subtotal`]="{ item }">
                    <v-text-field
                      v-model="item.subtotal"
                      type="number"
                      label="Sous-total"
                      readonly
                    ></v-text-field>
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <v-icon small @click="removeArticle(item)">mdi-delete</v-icon>
                  </template>
                </v-data-table>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.versement" label="Versement" type="number"></v-text-field>
              </v-col>
             
              <v-col cols="12">
                <v-select
                  v-model="editedItem.livraison"
                  :items="['partiel', 'nonlivre', 'total']"
                  label="Livraison"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveAchat">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import { role } from "../role";
import AchatPrinter from "~/components/achatPrinter.vue";

export default {
  components: { AchatPrinter },
  middleware: 'supadmin',
  data() {
    return {
      dialog: false,
      visible:false,
      search:'',
      headers: [
        // { text: 'Fournisseur', value: 'supplier.name' },
        // { text: 'Total', value: 'totalAmount' },
        // { text: 'Date', value: 'date' },
        // { text: 'Règlement', value: 'reglement' },
        // { text: 'Livraison', value: 'livraison' },
        { text: 'Fournisseur', value: 'fournisseur' },
        { text: 'Produit', value: 'produit.nom' },
        { text: 'Quantité', value: 'quantite' },
        { text: 'Prix', value: 'prix' },
        { text: 'Date', value: 'date' },
        { text: 'Versement', value: 'versement' },
        { text: 'Règlement', value: 'reglement' },
        { text: 'Livraison', value: 'livraison' },
        { text: 'Actions', value: 'actions' },
      ],
      articleHeaders: [
        { text: 'Produit', value: 'produit' },
        { text: 'Quantité', value: 'quantite' },
        { text: 'Prix Unitaire', value: 'unitPrice' },
        { text: 'Sous-total', value: 'subtotal' },
        { text: 'Actions', value: 'actions' },
      ],
      achats: [],
      suppliers: [],
      produits: [],
      editedIndex: -1,
      editedItem: {
        supplier: null,
        articles: [],
        totalAmount: 0,
        versement: 0,
        reglement: 'partiel',
        livraison: 'total',
      },
      defaultItem: {
        supplier: null,
        articles: [],
        totalAmount: 0,
        versement: 0,
        reglement: 'total',
        livraison: 'total',
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nouvel Achat' : 'Modifier Achat';
    },
    ...mapGetters("auth", ["user"]),
    isAdmin() {
      return this.user && parseInt(this.user.user_level) === role.supadmin;
    }
  },
  watch: {
    dialog(val) {
      val || this.closeDialog();
    },
    'editedItem.articles': {
      handler() {
        this.updateTotalAmount();
      },
      deep: true,
    },
  },
  async created() {
    await this.fetchAchats();
    await this.fetchSuppliers();
    await this.fetchProduits();
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    async fetchAchats() {
      this.achats = await this.$axios.$get('achats');
      console.log(this.achats)
    },
    async fetchSuppliers() {
      this.suppliers = await this.$axios.$get('supplier');
    },
    async fetchProduits() {
      this.produits = await this.$axios.$get('produits');
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    openDialog(item) {
      this.editedIndex = this.achats.indexOf(item);
      this.editedItem = Object.assign({}, item || this.defaultItem);
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    addArticle() {
      this.editedItem.articles.push({
        produit: null,
        quantite: 1,
        unitPrice: 0,
        subtotal: 0,
      });
    },
    removeArticle(item) {
      this.editedItem.articles.splice(this.editedItem.articles.indexOf(item), 1);
    },
    updateSubtotal(article) {
      article.subtotal = article.quantite * article.unitPrice;
    },
    updateTotalAmount() {
      this.editedItem.articles.forEach(article => this.updateSubtotal(article));
      this.editedItem.totalAmount = this.editedItem.articles.reduce((total, article) => total + article.subtotal, 0);
    },
    async updateTransaction() {
      this.loading = true;
      try {
        await this.$axios.put(`achats/${this.form._id}`, this.form);
        
        await this.fetchTransactions();
        this.closeModal();
        this.$notifier.showMessage({
          content: 'Transaction mise à jour avec succès !',
          color: 'success',
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la transaction :', error);
        this.$notifier.showMessage({
          content: 'Erreur lors de la mise à jour de la transaction.',
          color: 'error',
        });
      }
      this.loading = false;
    },
    
    editTransaction(transaction) {
      this.form = { ...transaction };
      this.modalOpen = true;
    },
    async deleteTransaction(transaction) {
      const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer cet achat ?');
      if (confirmDelete) {
        this.loading = true;
        try {
          await this.$axios.delete(`achats/${transaction._id}`);
          await this.fetchTransactions();
          this.$notifier.showMessage({
            content: 'Achat supprimé avec succès !',
            color: 'success',
          });
        } catch (error) {
          console.error('Erreur lors de la suppression  :', error);
          this.$notifier.showMessage({
            content: 'Erreur lors de la suppression.',
            color: 'error',
          });
        }
        this.loading = false;
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
    async saveAchat() {
      if (this.editedIndex > -1) {
        await this.$axios.$put('achats', this.editedItem);
      } else {
        await this.$axios.$post('achats', this.editedItem);
      }
      await this.fetchAchats();
      this.closeDialog();
    },
  },
};
</script>