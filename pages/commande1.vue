<template>
  <v-container>
    <!-- Sélection de la table -->
    <!-- <v-row>
      <v-col cols="12" md="6" sm="6">
        <v-btn color="secondary" class="mb-4" @click="openAddModal">
          Ajouter un article
        </v-btn>
      </v-col>
    </v-row> -->
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
      </v-data-table>
    </v-card>
    <!-- Tableau des articles -->
    <!-- <v-card v-if="articles.length > 0">
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
          <v-btn icon small @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon> Détails
          </v-btn>
        </template>
      </v-data-table>
    </v-card> -->
    

    <!-- Modal pour afficher les détails -->
    <v-dialog v-model="detailModal" max-width="800px">
      <v-card>
        <v-card-title>
          Détails de la commande
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field label="Client" :value="selectedOrder.client" readonly outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field label="Serveur" :value="selectedOrder.serveur" readonly outlined dense></v-text-field>
            </v-col>
            <v-col cols="12" sm="12">
              <v-select
                v-model="selectedOrder.statut"
                label="Statut"
                :items="statutOptions"
                disabled
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>

          <!-- Détails des articles -->
          <v-divider class="my-3"></v-divider>
          <v-row>
            <v-col v-for="(article, index) in selectedOrder.articles" :key="index" cols="12" sm="4">
              <v-card outlined>
                <v-card-title>{{ article.produit.nom }}</v-card-title>
                <v-card-subtitle>Quantité: {{ article.quantite }}</v-card-subtitle>
                <v-card-text>Prix: {{ article.produit.prix }} X {{ article.quantite }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDetailModal">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
     <!-- Modal des détails de la commande -->
     <v-dialog v-model="detailsModal" max-width="800px">
      <v-card>
        <v-card-title>Détails de la Commande</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
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
          <v-btn color="primary" @click="openAddProductDialog"><v-icon>mdi-plus</v-icon>Produit</v-btn>
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
          <v-select
            v-model="newProduct.produit"
            :items="produitsOptions"
            label="Choisir un produit"
            outlined
          ></v-select>
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
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      selectedTableId: null, // ID de la table sélectionnée
      tablesOptions: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7'], // Options des tables
      statutOptions: ['En attente', 'En cours', 'Terminée'],
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
    
    // Récupérer les produits disponibles
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

    // Récupérer les commandes existantes
async fetchCommandes() {
  try {
    const { data } = await this.$axios.get('/commandes');
    console.log(data);

    const userId = this.user.userId; // Récupérer l'ID de l'utilisateur connecté
    const today = new Date().toISOString().split("T")[0]; // Récupérer la date d'aujourd'hui au format YYYY-MM-DD
    // Filtrer les commandes en fonction du serveur connecté et de la date du jour
    this.commandes = data
      .filter(commande => {
        const commandeDate = new Date(commande.createdAt).toISOString().split("T")[0]; // Date de la commande
        return commande.serveur._id === userId && commandeDate === today;
      })
      .map(commande => ({
        ...commande,
        serveur: commande.serveur.prenom, // Accéder au prénom du serveur
        client: commande.client, // Le nom de la table ou du client
        statut: commande.statut, // Statut de la commande
        total: commande.total, // Total de la commande
      }));
    
    console.log(this.commandes);
  } catch (error) {
    console.error('Erreur lors du chargement des commandes :', error);
  }
},

async addProduits() {      
      await this.$axios
        .patch('commandes/add', {commandeId:this.selectedCommande._id, produitId:this.newProduct.produit, quantite:this.newProduct.quantite})
        .then((res) => {
          if (res.status === 200) {
            this.fetchCommandes()
            this.$notifier.showMessage({
              content: "Produit ajouté à la commande.",
              color: "success",
            });
            this.addProductModal = false;
          } else {
            this.$notifier.showMessage({ content: "Opération échouée!", color: "echec" });
          }
        });
    },

// async addProduites() {
//       try {
//        console.log(this.newProduct.produit) 
//        const response =  await this.$axios.post('commandes/add', {commandeId:this.selectedCommande._id, produitId:this.newProduct.produit, quantite:this.newProduct.quantite});
//        console.log(response)

//        this.$notifier.showMessage({
//         content: "Produit ajouté à la commande.",
//         color: "success",
//       });
//         this.fetchCommandes()
        
//       } catch (error) {
//         console.error('Erreur lors de la récupération des produits:', error);
//       }
//     },

addProductToCommande() {
      const totalProduit = this.newProduct.quantite * this.newProduct.prix;
      const newProduct = { ...this.newProduct, total: totalProduit };

      // Ajouter le produit à la commande sélectionnée
      this.selectedCommande.articles.push(newProduct);

      // Fermer le modal après ajout
      this.addProductModal = false;
      this.$notifier.showMessage({
        content: "Produit ajouté à la commande.",
        color: "success",
      });
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
      this.commande.client = this.selectedTableId;
      this.commande.serveur = this.user.userId;
      this.commande.statut = "En attente";

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

    // Fonction pour supprimer un article
    async deleteArticle(id) {     
        try {
          await this.$axios.delete(`/commandes/${id}`);
          this.fetchCommandes();
        } catch (error) {
          console.error('Erreur lors de la suppression de la commande:', error);
        }
      },
    

    // Fonction pour ajouter un produit à une commande et mettre à jour la commande sur le serveur
async ajouterProduitCommande(commandeId, produit, quantite) {
  try {
    // Trouver la commande dans le tableau local
    const commande = this.commandes.find(cmd => cmd._id === commandeId);    
    if (commande) {
      // Ajouter un nouvel article à la liste des articles de la commande
      commande.articles.push({
         produit,  // Le produit à ajouter
         quantite, // La quantité du produit
      });      

      // Effectuer une requête PUT pour mettre à jour la commande sur le serveur
      const response = await this.$axios.put(`/commandes/add`, commande);      
      // Afficher la réponse du serveur
      console.log('Commande mise à jour:', response.data);

      // Optionnel : Vous pouvez mettre à jour localement les données après la mise à jour sur le serveur
      this.commandes = this.commandes.map(cmd => 
        cmd._id === commandeId ? response.data : cmd
      );
    } else {
      console.error("Commande non trouvée !");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
  }
},
  

    
   // Imprimer la facture
printInvoice() {
  // Calcul du total de la commande
  const total = this.selectedCommande.articles.reduce(
    (sum, article) => sum + (article.produit.prix * article.quantite),
    0
  );

  // Génération du contenu imprimable
  const printableContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1>Benedictions de l'Eternel</h1>
        <p>Angle des Rues Bry & St-Charles, Fort-Liberté, Haiti</p>
        <p>Tél: +509 3779-6764 | +509 3596-7838 | WhatsApp : +509 4195-8817</p>
        <p> Email: info@benediction.com</p>
        <hr />
      </div>
      <h2 style="text-align: center;">Facture</h2>
      <p><strong>Client:</strong> ${this.selectedCommande.client}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Nom</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantité</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Prix Unitaire</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${this.selectedCommande.articles
            .map(
              (article) => ` 
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.produit.nom}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.quantite}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.produit.prix}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.produit.prix * article.quantite}</td>
              </tr>`
            )
            .join("")}
          <tr>
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${total}</td>
          </tr>
        </tbody>
      </table>
      <p>Une hospitalité gracieuse au coeur de la ville</p>
    </div>
  `;

  // Ouvrir une nouvelle fenêtre et afficher la facture
  const newWindow = window.open("", "_blank", "width=600,height=600");
  newWindow.document.write(printableContent);
  newWindow.document.close(); // Fermer le document après l'écriture
  newWindow.print(); // Lancer l'impression
},

  },
};
</script>

<style scoped>
.table {
  width: 100%;
}
</style>
