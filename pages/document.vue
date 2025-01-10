<template>
  <v-container>
    <!-- Bouton pour créer une commande -->
    <v-btn color="primary" class="mb-4" @click="openAddCommandeDialog">Créer une Commande</v-btn>

    <!-- Liste des commandes -->
    <v-card>
      <v-card-title>Liste des Commandes</v-card-title>
      <v-data-table
        :headers="headers"
        :items="commandes"
        item-value="id"
        dense
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon small @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal pour ajouter une nouvelle commande -->
    <v-dialog v-model="addCommandeModal" max-width="800px">
      <v-card>
        <v-card-title>Créer une Commande</v-card-title>
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
          <!-- <v-text-field v-model="newCommande.client" label="Nom du Client" outlined></v-text-field>
          <v-select
            v-model="newCommande.statut"
            :items="statuts"
            label="Choisir le Statut"
            outlined
          ></v-select>
          <v-select
            v-model="newProduit.produit"
            :items="produits"
            label="Choisir un produit"
            outlined
          ></v-select>
          <v-text-field
            v-model="newProduit.quantite"
            label="Quantité"
            type="number"
            outlined
          ></v-text-field> -->
        </v-card-text>
        <v-card-actions>
          <!-- <v-btn color="primary" @click="addProduit">Ajouter le Produit</v-btn> -->
          <v-btn color="success" @click="sendArticle">Créer la Commande</v-btn>
          <v-btn text @click="closeAddCommandeDialog">Annuler</v-btn>
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
          <v-btn color="primary" @click="openAddProductDialog">Ajouter un Produit</v-btn>
          <v-btn color="success" @click="printInvoice">Imprimer</v-btn>
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
          <v-btn color="primary" @click="addProductToCommande">Ajouter</v-btn>
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
      produitsOptions: [],
      tablesOptions: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7'], // Options des tables
      statutOptions: ['En attente', 'En cours', 'Terminée'],
      commandes: [], // Liste des commandes
      headers: [        
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur" },
        { text: "Statut", value: "statut" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      productHeaders: [
        { text: "Produit", value: "produit.nom" },
        { text: "Quantité", value: "quantite" },
        { text: "Prix Unitaire (HTG)", value: "produit.prix" },
        { text: "Total (HTG)", value: "total" },
      ],
      statuts: ['En attente', 'En cours', 'Terminée'], // Liste des serveurs disponibles
      produits: [], // Liste des produits disponibles
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
    };
  },
  computed: {
    ...mapGetters("auth", ["user"])
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

    // Récupérer les commandes existantes
    async fetchCommandes() {
      try {
        const { data } = await this.$axios.get('/commandes');
        console.log(data);
        this.commandes = data.map((commande) => ({
          ...commande,
          serveur: commande.serveur.prenom, // Assurez-vous d'avoir accès à `prenom` dans serveur
          client: commande.client, // Le nom de la table ou du client
          statut: commande.statut, // Statut de la commande
          total: commande.total, // Total de la commande
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
      }
    },

    // Ouvrir le modal pour créer une nouvelle commande
    openAddCommandeDialog() {
      this.newCommande = { client: "", serveur: "", statut: "En cours", articles: [] }; // Réinitialiser la commande
      this.newProduit = { produit: "", quantite: 1, prix: 0 }; // Réinitialiser les produits
      this.addCommandeModal = true; // Ouvrir le modal
    },
    // Fermer le modal sans ajouter
    closeAddCommandeDialog() {
      this.addCommandeModal = false; // Fermer le modal
    },
    // Ajouter un produit à la commande initiale
    addProduit() {
      const totalProduit = this.newProduit.quantite * this.newProduit.prix;
      const newProduct = { ...this.newProduit, total: totalProduit };

      // Ajouter le produit à la commande en cours
      this.newCommande.articles.push(newProduct);

      // Réinitialiser les informations du produit
      this.newProduit = { produit: "", quantite: 1, prix: 0 };
      this.$notifier.showMessage({
        content: "Produit ajouté à la commande.",
        color: "success",
      });
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
      
      console.log(this.commande)
      try {
        const response = await this.$axios.post('commandes', this.commande);
        this.commandes.push({
          ...response.data,
          tableId: this.selectedTableId,
        });
        this.$notifier.showMessage({
          content: "Article ajouté avec succès.",
          color: "success",
        });
       // this.closeAddModal();
      } catch (error) {
        console.error('Erreur lors de l’ajout de l’article :', error);
        this.$notifier.showMessage({
          content: "Impossible d’ajouter l’article.",
          color: "error",
        });
      }
    },
    // Ajouter la commande à la liste des commandes
    addCommande() {
      if (this.newCommande.client && this.newCommande.serveur) {
        this.commandes.push({
          ...this.newCommande,
          id: this.commandes.length + 1, // Générer un ID pour la commande
        });
        this.addCommandeModal = false; // Fermer le modal après ajout
        this.$notifier.showMessage({
          content: "Commande créée avec succès.",
          color: "success",
        });
      } else {
        this.$notifier.showMessage({
          content: "Veuillez compléter tous les champs.",
          color: "error",
        });
      }
    },
    // Voir les détails d'une commande
    viewDetails(commande) {
      this.selectedCommande = { ...commande };
      this.detailsModal = true;
    },
    // Ouvrir le modal pour ajouter un produit à la commande
    openAddProductDialog() {
      this.newProduct = { produit: "", quantite: 1, prix: 0 }; // Réinitialiser les valeurs
      this.addProductModal = true; // Ouvrir le modal
    },
    // Ajouter un produit supplémentaire à la commande
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
    // Fermer le modal d'ajout de produit
    closeAddProductDialog() {
      this.addProductModal = false; // Fermer le modal
    },

    addProductToOrder() {
      if (!this.selectedCommande || !this.newProduct.nom || !this.newProduct.quantite) {
        return; // Valider que tous les champs sont remplis
      }

      const newArticle = {
        articles: {
          produit: this.newProduct.nom,
          quantite: this.newProduct.quantite,
        },
      
      };

      // Ajouter l'article à la commande sélectionnée
      this.selectedCommande.articles.push(newArticle);

      // Calculer le nouveau total de la commande
      const total = this.selectedCommande.articles.reduce((sum, article) => sum + article.produit.prix * article.quantite, 0);
      this.selectedCommande.total = total;

      // Réinitialiser les champs du modal et fermer le modal
      this.newProduct = { nom: '', prix: 0, quantite: 1 };
      this.dialog = false;

      // Si vous souhaitez sauvegarder côté serveur, vous pouvez envoyer la mise à jour de la commande ici
      // this.$axios.put(`/commandes/${this.selectedCommande._id}`, this.selectedCommande);
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
        <p>Téléphone: +509 3779-6764 | +509 3596-7838 | WhatsApp : +509 4195-8817</p>
        <p> Email: info@benediction.com</p>
        <hr />
      </div>
      <h2 style="text-align: center;">Facture</h2>
      <p><strong>Client:</strong> ${this.selectedCommande.client}</p>
      <p><strong>Serveur:</strong> ${this.selectedCommande.serveur}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Nom</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Qté</th>
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
/* Styles supplémentaires si nécessaire */
</style>
