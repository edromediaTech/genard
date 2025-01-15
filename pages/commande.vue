<template>
  <v-container>   
    <v-btn color="primary" class="mb-4" @click="openAddModal">Créer une Commande</v-btn>
    <v-card>
      <v-card-title>Liste des Commandes</v-card-title>
      <v-data-table
        :headers="headers"
        :items="commandes"
        item-value="id"
        dense
        item-key="_id"
        class="elevation-1"
      >
        
        <template #[`item.actions`]="{ item }">
          <v-btn icon small title="Details de la Commande" @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteArticle(item._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>       
      </v-data-table>      
    </v-card>   

   
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
              <v-autocomplete
                v-model="article.produit"
                :items="produitsOptions"
                item-text="text"
                item-value="value"
                label="Choisir un produit"
                outlined
                dense
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6" sm="6">
              <v-text-field
                v-model="article.quantite"
                type="number"
                label="Quantité"
                outlined
                dense
                min="1"
              ></v-text-field>
            </v-col>
          
          </v-row>
          <!-- <v-btn color="blue" @click="addArticle()"><v-icon>mdi-order</v-icon>Ajouter un article</v-btn> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendArticle">Ajouter</v-btn>
          <v-btn text @click="closeAddModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
     <!-- Modal des détails de la commande -->
     <v-dialog v-model="detailsModal" max-width="800px">
      <v-card>
        <v-card-title>Détails de la Commande {{ selectedCommande.total }}</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>Client:</strong> {{  formatDate(selectedCommande.createdAt) }}</v-list-item-title>
                <v-list-item-title><strong>Client:</strong> {{ selectedCommande.client }}</v-list-item-title>
                <v-list-item-title><strong>Serveur:</strong> {{ selectedCommande.serveur }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- Liste des produits -->
            <v-data-table
              :headers="productHeaders"
              :items="selectedCommande.articles"
              dense
            ></v-data-table>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <!-- Bouton pour ouvrir le modal d'ajout de produit -->
          <v-btn color="blue" @click="openAddProductDialog"><v-icon>mdi-plus</v-icon>Produit</v-btn>
          <v-btn color="success" @click="printInvoice"><v-icon>mdi-printer</v-icon></v-btn>
          <v-btn text @click="detailsModal = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour ajouter un produit à la commande -->
    <v-dialog v-model="addProductModal" max-width="500px">
      <v-card>
        <v-card-title>Ajouter un Produit</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="newProduct.produit"
            :items="produitsOptions"
            label="Choisir un produit"
            outlined
          ></v-autocomplete>
          <v-text-field
            v-model="newProduct.quantite"
            label="Quantité"
            type="number"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="addProduits()">Ajouter</v-btn>
          <v-btn text @click="closeAddProductDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogConfirm" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirmation</v-card-title>
      <v-card-text>
        Êtes-vous sûr de vouloir supprimer cet article ?
      </v-card-text>
      <v-card-actions>
        <v-btn color="green" text @click="confirmDelete">Oui</v-btn>
        <v-btn color="red" text @click="cancelDelete">Non</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import html2canvas from 'html2canvas';
  
export default {
  middleware: "serveur",
  data() {
    return {
      selectedTableId: null, // ID de la table sélectionnée
      tablesOptions: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7'], // Options des tables
      statutOptions: ['En attente', 'En cours', 'Terminée'],
      dialogConfirm: false,  // État du dialogue de confirmation
      currentDeleteId: null,
      articles: [], // Articles récupérés
      commande: {
        client: null,       
        serveur: '',
        statut: null,
        articles: [{ 
          produit: null, 
          quantite: 1 }], // Initialiser un article avec produit et quantité par défaut
        total: 0,
      },
      produitsOptions: [], // Produits disponibles

      commandes: [], // Liste des commandes
      headers: [
        
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur" },
        { text: "Statut", value: "statut" },
        { text: "Total (HTG)", value: "total" },
      
        { text: "Date", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      productHeaders: [
        { text: "Produit", value: "produit.nom" },
        { text: "Quantité", value: "quantite" },
        { text: "Prix Unitaire (HTG)", value: "produit.prix" },       
      ],
      newCommande: {
        client: "",
        serveur: "",
        statut: "En cours",
        articles: [],
      },
      newProduit: {
        produit: "",
        quantite: 1,
        prix: 0,
      },
      newProduct: {
        produit: "",
        quantite: 1,
        prix: 0,
      },
      addCommandeModal: false, // Contrôle du modal pour ajouter la commande
      detailsModal: false, // Contrôle du modal pour afficher les détails de la commande
      addProductModal: false, // Contrôle du modal pour ajouter un produit à la commande
      selectedCommande: {
        id: "",
        client: "",
        serveur: "",
        statut: "",
        articles: [],
      },
      addModal: false, // État du modal pour ajouter un article
      detailModal: false, // État du modal pour afficher les détails
      selectedOrder: {}, // Commande sélectionnée pour afficher les détails
      commandeId: '', // ID de la commande actuelle
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    // selectedTableNumero() {
    //   const table = this.tablesOptions.find((table) => table.value === this.selectedTableId);
    //   return table ? table.text : '';
    // },
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
    
    // Récupérer les produits disponibles
    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produitsOptions = response.data.map((produits) => ({
          text: produits.nom +'   --- '+produits.prix  +' HTG',
          value: produits._id,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', options).replace(',', '');
  },
  
  async fetchCommandes() {
  try {
    // Récupérer les commandes depuis l'API
    const { data } = await this.$axios.get('/commandes');
    console.log(data)
    // Récupérer l'ID de l'utilisateur connecté
    const userId = this.user.userId;

    // Récupérer la date locale d'aujourd'hui au format YYYY-MM-DD
    const today = new Date().toLocaleDateString('fr-CA'); // Format "YYYY-MM-DD" dans le fuseau horaire local

    // Filtrer et formater les commandes
    this.commandes = data
      .filter(commande => {
        // Convertir la date de la commande au format local "YYYY-MM-DD"
        const commandeDate = new Date(commande.date).toLocaleDateString('fr-CA');
        // Filtrer par ID de serveur et date du jour
        return commande.serveur._id === userId && commandeDate === today;
      })
      .map(commande => ({
        ...commande,
        serveur: commande.serveur.prenom, // Prénom du serveur
        client: commande.client,         // Nom de la table ou du client
        statut: commande.statut,         // Statut de la commande
        total: commande.total,
        createdAt : commande.createdAt,           // Total de la commande
        // Formater la date au format dd mm yy
        date: new Date(commande.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }),
      }));

  } catch (error) {
    console.error('Erreur lors du chargement des commandes :', error);
  }
},    

async addProduits() {
  this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
  try {
    const response = await this.$axios.post('commandes/add', {
      commandeId: this.selectedCommande._id,
      produitId: this.newProduct.produit,
      quantite: this.newProduct.quantite,
    });
    console.log(response)
    if (response.status === 200) {
      this.selectedCommande.articles = response.data.commande.articles;
      this.$notifier.showMessage({
        content: "Produit ajouté à la commande.",
        color: "success",
      });
      this.addProductModal = false;
    } else {
      this.$notifier.showMessage({
        content: "Opération échouée!",
        color: "error",
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 500 || error.response.data.message === "Stock insuffisant") {
      // Gestion spécifique du stock insuffisant
      this.$notifier.showMessage({
        content: "Stock insuffisant pour ce produit.",
        color: "warning",
      });
    } else {
      // Gestion des autres erreurs
      this.$notifier.showMessage({
        content: "Une erreur s'est produite. Veuillez réessayer.",
        color: "error",
      });
    }
  }
},



    openAddProductDialog() {
      this.newProduct = { produit: "", quantite: 1, prix: 0 }; // Réinitialiser les valeurs
      this.addProductModal = true; // Ouvrir le modal
    },
    // Ouvrir le modal pour créer une nouvelle commande
    openAddCommandeDialog() {
      this.newCommande = { client: "", serveur: "", statut: "En cours", articles: [] }; // Réinitialiser la commande
      this.newProduit = { produit: "", quantite: 1, prix: 0 }; // Réinitialiser les produits
      this.addCommandeModal = true; // Ouvrir le modal
    },
    closeAddProductDialog() {
      this.addProductModal = false; // Fermer le modal
    },
    // Fermer le modal sans ajouter
    closeAddCommandeDialog() {
      this.addCommandeModal = false; // Fermer le modal
    },
    viewDetails(commande) {
      this.selectedCommande = { ...commande };
      this.detailsModal = true;
    },
    openAddModal() {
      this.addModal = true;
    },
    closeAddModal() {
      this.addModal = false;
    },
    openDetailModal(order) {
      this.selectedOrder = order; // Affecter la commande sélectionnée
      this.detailModal = true;
    },
    closeDetailModal() {
      this.detailModal = false;
    },

    // Ajouter un article
    addArticle() {
      this.commande.articles.push({ produit: '', quantite: 0 });
    },
    removeArticle(index) {
      this.commande.articles.splice(index, 1);
    },

    // Fonction pour envoyer un nouvel article
    async sendArticle() {
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      this.commande.client = this.selectedTableId;
      this.commande.serveur = this.user.userId;
      this.commande.statut = this.selectedOrder.statut;
      console.log(this.commande)
      try {
        const response = await this.$axios.post('commandes', this.commande);
        this.fetchCommandes()
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
          content: "Impossible d’ajouter l’article.",
          color: "error",
        });
      }
    },

    // Fonction d'édition d'un article (non implémentée)
    async editArticle(article) {
      // Logique pour modifier un article existant
    },
   
    
      // Fonction qui s'appelle avant de supprimer un article
   deleteArticle(id) {
      // Ouvre le dialogue de confirmation avant de supprimer
      this.currentDeleteId = id;
      this.dialogConfirm = true;
    },
    
    // Fonction qui confirme la suppression
    async confirmDelete() {
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      try {
        await this.$axios.delete(`/commandes/${this.currentDeleteId}`);
        this.fetchCommandes();
        this.dialogConfirm = false;  // Ferme le dialogue après confirmation
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
      }
    },

    // Fonction pour annuler la suppression
    cancelDelete() {
      this.dialogConfirm = false;  // Ferme simplement le dialogue sans action
    },

    


// Imprimer la facture
async printInvoice1() {
        try {
          // Attendre que le DOM soit mis à jour
          await this.$nextTick();
  
          // Récupérer l'élément à capturer
          const printableElement = this.$refs.printableContent;
  
          // Vérifier si l'élément existe
          if (!printableElement) {
            throw new Error("L'élément à capturer n'existe pas dans le DOM.");
          }
  
          // Utiliser html2canvas pour capturer l'élément
          const canvas = await html2canvas(printableElement, {
            width: 80, // Largeur en mm
            height: printableElement.clientHeight,
            scale: 1,
          });
  
          // Convertir le canvas en image
          const imgData = canvas.toDataURL('image/png');
  
          // Ouvrir une nouvelle fenêtre avec l'image
          const windowContent = '<!DOCTYPE html>';
          const printWindow = window.open('', '', 'width=80mm,height=200mm');
          printWindow.document.write(windowContent);
          printWindow.document.write('<img src="' + imgData + '" />');
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        } catch (error) {
          console.error('Erreur lors de la capture de la facture :', error);
        }
      },
    
//  Imprimer la facture
 printInvoice() {
  const total = this.selectedCommande.articles.reduce(
    (sum, article) => sum + article.produit.prix * article.quantite,
    0
  );

  const printableContent = `
    <html>
    <head>
      <style>
        @page {
          margin: 10mm;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .container {
          font-family: 'Courier New', monospace;
          width: 100mm;
          padding: 5mm;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }

        .header h2, .header p {
          margin: 0;
          font-size: 10px;
        }

        table {
          width: 100%;
          font-size: 10px;
          border-collapse: collapse;
          margin-top: 10px;
        }
        table th, table td {
          text-align: right;
        }
        table th:first-child, table td:first-child {
          text-align: left;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h4>Bénédictions de l'Éternel</h4>
          <h5>Hotel - Bar - Restaurant</h5>
          <p>
            Angle des Rues Bry & St-Charles<br />
            Fort-Liberté, Haïti<br />
            Tél: +509 3779-6764 / +509 3596-7838<br />        
          </p>
          <hr style="border: 1px dashed black; margin: 10px 0;" />
        </div>        
        <h5 style="text-align: center; margin: 0;">FACTURE</h5>
        <p style="font-size: 12px;"><strong>Client:</strong> ${this.selectedCommande.client}</p>
        
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Qté</th>
              <th>PU</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.selectedCommande.articles
              .map(
                (article) => `
                <tr>
                  <td>${article.produit.nom}</td>
                  <td>${article.quantite}</td>
                  <td>${article.produit.prix.toFixed(2)}</td>
                  <td>${(article.produit.prix * article.quantite).toFixed(2)}</td>
                </tr>`
              )
              .join("")}
            <tr>
              <td colspan="3" style="text-align: right; font-weight: bold;">Total</td>
              <td style="font-weight: bold;">${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <br>
        
        <div class="footer">
          <i>Une hospitalité gracieuse au cœur de la ville</i>
          <hr style="border: 1px dashed black; margin: 10px 0;" />
          Merci pour votre confiance !
        </div>
      </div>
    </body>
    </html>
  `;

  const newWindow = window.open("", "_blank", "width=600,height=600");
  newWindow.document.write(printableContent);
  newWindow.document.close();
  
  
  // Delay to allow the content to render before printing
  setTimeout(() => {
    newWindow.print();
    newWindow.close();
  }, 1000);
}

  },
};
</script>

<style scoped>
.table {
  width: 100%;
}
</style>
