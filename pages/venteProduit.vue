<template>
  <v-container>
    <!-- Sélection de la table -->
   <v-row>    
    <v-col cols="12" md="6" sm="6">
      <v-btn
     
      color="secondary"
      class="mb-4"
      @click="openAddModal"
    >
      Ajouter un article
    </v-btn>
    </v-col>
   </v-row>
    

    <!-- Tableau des articles -->
    <v-card v-if="articles.length > 0">
      <v-card-title>
        <span class="text-h6">Articles</span>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="articles"
        item-value="produit"
        class="elevation-1"
        dense
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon small @click="editArticle(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteArticle(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-card v-else>
      <v-card-text>
        Aucune commande trouvée pour cette table.
      </v-card-text>
    </v-card>

    <!-- Bouton d'impression -->
    <v-btn 
      v-if="articles.length > 0"
      color="secondary"
      class="mb-4"
      @click="printInvoice"
    >
      Imprimer la facture
    </v-btn>

    <!-- Modal pour ajouter un article -->
    <v-dialog v-model="addModal" max-width="800px">
      <v-card>
        <v-card-title>
          Ajouter un article
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="6">
                <v-combobox
                v-model="selectedTableId"
                :items="tablesOptions"     
                label="Client"
                outlined
                dense
              ></v-combobox>
              </v-col>
             <!-- Statut -->
             <v-col cols="12" sm="6">
                  <v-select
                    v-model="commande.statut"
                    :items="statutOptions"
                    label="Statut"
                    required
                    outlined
                  ></v-select>
                </v-col>
               
            </v-row>
          <v-row v-for="(article, index) in commande.articles" :key="index" class="mb-3">
            <v-col cols="12" md="6" sm="6">
          <v-select
            v-model="article.produit"
            :items="produitsOptions"
            item-text="text"
            item-value="value"
            label="Choisir un produit"
            outlined
            dense
          ></v-select>
          </v-col>
          <v-col cols="12" md="4" sm="6">
          <v-text-field
            v-model="article.quantite"
            type="number"
            label="Quantité"
            outlined
            dense
            min="1"
          ></v-text-field>
          </v-col>
          <v-col cols="2">
                      <v-btn icon color="red" @click="removeArticle(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                   
          </v-row>
          <v-btn color="blue" @click="addArticle()"><v-icon>mdi-order</v-icon>Ajouter un article</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendArticle">Ajouter</v-btn>
          <v-btn text @click="closeAddModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      selectedTableId: null, // ID de la table sélectionnée
      tablesOptions: ['Table 1', 'Table 2', 'Table 3', 'Table 4','Table 5','Table 6', 'Table 7'], // Options des tables
      statutOptions: ['En attente', 'En cours', 'Terminée'],
      articles: [], // Articles récupérés
      commande: {
        client: null,       
        serveur: '',
        statut: null,
        articles: [{ 
          produit: null, 
          quantite: 1 }],
        total: 0,
      },
      produitsOptions: [], // Produits disponibles
      headers: [
        { text: 'Produit', value: 'produit.nom' },
        { text: 'Quantité', value: 'quantite' },
        { text: 'Prix', value: 'produit.prix' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      addModal: false, // État du modal pour ajouter un article
      commandeId: '', // ID de la commande actuelle
      tableNumero: '',
    };
  },
  computed: {
    
      ...mapGetters("auth", ["user"]),
    selectedTableNumero() {
      const table = this.tablesOptions.find((table) => table.value === this.selectedTableId);
      return table ? table.text : '';
    },
    filteredArticles() {
      return this.articles.filter((article) => article.tableId === this.selectedTableId);
    },
  },
  async mounted() {  
    await this.fetchCommandes();
    await this.fetchProduits();
  },

  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produitsOptions = response.data.map((produits) => ({
          text: produits.nom,
          value: produits._id,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },
    async fetchCommandes() {
  try {
    // Requête pour obtenir les commandes depuis l'API
    const { data } = await this.$axios.get('/commandes');
    
    // Afficher les données dans la console pour vérification
    console.log(data);

    // Combiner les articles de toutes les commandes
    this.articles = data.flatMap((commande) =>
      commande.articles.map((article) => ({
        ...article,
        commandeId: commande._id, // Ajoute l'ID de la commande à chaque article
      }))
    );

  } catch (error) {
    // Gérer et afficher les erreurs
    console.error('Erreur lors du chargement des commandes :', error);
  }
},


    openAddModal() {
      this.addModal = true;
    },
    closeAddModal() {
      this.addModal = false;
      // this.commande.articles = { produit: null, quantite: 1 };
    },
    addArticle() {
        this.commande.articles.push({ produit: '', quantite: 0 });
      },
      removeArticle(index) {
        this.commande.articles.splice(index, 1);
      },

    async sendArticle() {  

        this.commande.client = this.selectedTableId;
        this.commande.serveur = this.user.userId
        this.commande.statut = "En attente"
        // Vérifiez que produit et quantité sont valides
        try {
          console.log('Données envoyées à l\'API:', this.commande);

          // Exemple : Vous pouvez adapter selon votre logique de backend
          const response = await this.$axios.post('commandes', this.commande);
          this.articles.push({
            ...response.data,
            tableId: this.selectedTableId,
          });
          this.$notifier.showMessage({
            content: "Article ajouté avec succès.",
            color: "success",
          });
   
            this.closeAddModal();
          } catch (error) {
            console.error('Erreur lors de l’ajout de l’article :', error);
            this.$notifier.showMessage({
                    content: "Impossible d’ajouter l’article..",
                    color: "error",
                  });            
          }
        },

    async editArticle(article) {
      // Logique pour modifier un article existant
    },
    async deleteArticle(article) {
      // Logique pour supprimer un article
    },

    // Fonction d'impression de la facture
    printInvoice() {
      const invoiceContent = `
        <div style="text-align: center; font-size: 20px; margin-bottom: 20px;">
          <h2>Facture pour la Table ${this.selectedTableNumero}</h2>
          <p>ID Commande: ${this.commandeId}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Produit</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantité</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Prix</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.articles
              .map(
                (article) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.nom}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.quantite}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.prix}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.prix * article.quantite}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div style="text-align: right; font-size: 16px; margin-top: 20px;">
          <strong>Total: ${this.commande.total}</strong>
        </div>
      `;

      const printWindow = window.open('', '', 'height=800,width=600');
      printWindow.document.write('<html><head><title>Facture</title></head><body>');
      printWindow.document.write(invoiceContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
}
</style>
