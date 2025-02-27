<template>
  <v-container>
    <v-btn color="primary" class="mb-4" @click="openAddModal">Créer une Commande</v-btn>
    <v-card>
      <v-card-title>Liste des Commandes</v-card-title>
      <v-card class="mb-4">   
     
    </v-card>
      <v-data-table
        :headers="headers"
        :items="commandes"
        item-value="id"
        dense
        item-key="_id"
        class="elevation-1"
         :loading="loading"
       loading-text="Chargement en cours..."
      >
      <template #top>
       
      </template>
        <template #[`item.actions`]="{ item }">
          <v-btn icon small title="Details de la Commande" @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          
              <!-- Bouton pour modifier le statut -->
              <v-btn
                v-if="item.statutReg !== 'Complet'"
                icon
                small
                color="primary"
                @click="openEditStatutModal(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
          <!-- <v-btn icon small color="error" @click="deleteArticle(item._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn> -->
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template #[`item.code`]="{ item }">
        {{ getLastThreeDigits(item.code) }}
      </template>
      </v-data-table>
    </v-card>

    <!-- Modal pour ajouter un article -->
    <v-dialog v-model="addModal" max-width="800px">
      <v-card>
        <v-card-title>Ajouter un article</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6" sm="6">
              <v-combobox
                v-model="selectedTableId"
                :items="clients"
                label="Choisir un Client"
                item-text="nom"
                item-value="nom"
                outlined
                dense
              ></v-combobox>
            </v-col>
            <!-- Statut -->
             
            <!-- <v-col cols="12" sm="6" md="4">
              <v-combobox
                v-model="commande.statutReg"
                :items="statutReg"
                label="Statut Règlement"
                required
                dense
                outlined
              ></v-combobox>
            </v-col> -->
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
                required
                @change="onProductChange"
              ></v-autocomplete>
               <!-- Afficher les détails du produit -->
        <v-card v-if="selectedProductDetails" class="mt-4">
          <v-card-text>
            <strong>Prix :</strong>  {{ selectedProductDetails.prix }} HTG
          </v-card-text>
        </v-card>
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
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendArticle">
            <v-progress-circular
                    v-if="loading"
                    :disabled="loading"
                    :size="30"
                    color="white"
                    indeterminate
                  />                      
            Ajouter</v-btn>
          <v-btn text @click="closeAddModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal des détails de la commande -->
    <v-dialog v-model="detailsModal" max-width="800px">
      <v-card>
        <v-card-title>Détails de la Commande {{ totalCommande }} HTG</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>Date:</strong> {{ formatDate(selectedCommande.createdAt) }}</v-list-item-title>
                <v-list-item-title><strong>Client:</strong> {{ selectedCommande.client }}</v-list-item-title>
                <v-list-item-title><strong>Serveur:</strong> {{ selectedCommande.serveur }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- Liste des produits -->
            <v-data-table
              :headers="productHeaders"
              :items="selectedCommande.articles"
              dense
               :loading="loading"
               loading-text="Chargement en cours..."
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
            @change="onProductChange"
          ></v-autocomplete>
          <v-card v-if="selectedProductDetails" class="mt-4">
          <v-card-text>
            <strong>Prix :</strong>  {{ selectedProductDetails.prix }} HTG
          </v-card-text>
        </v-card>
          <v-text-field
            v-model="newProduct.quantite"
            label="Quantité"
            type="number"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!newProduct.produit" color="primary" @click="addProduits">Ajouter</v-btn>
          <v-btn text @click="closeAddProductDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour modifier le statut -->
    <v-dialog v-model="editStatutModal" max-width="500px">
  <v-card>
    <v-card-title>Modifier le statut de règlement</v-card-title>
    <v-card-text>
      <!-- Sélecteur de statut -->
     
      <!-- Champ pour saisir le montant payé -->
      <v-text-field
        v-model="montantPaye"
        label="Montant payé"
        type="number"
        outlined
        :rules="[rules.positive]"
        @input="calculateMontantRestant"        
      ></v-text-field>

      <!-- Affichage du montant restant -->
      <v-alert v-if="montantRestant !== null" :type="montantRestant >= 0 ? 'info' : 'error'">
        Montant restant : {{ montantRestant }} HTG
      </v-alert>

      <!-- Affichage de la monnaie si le montant payé est supérieur au total -->
      <v-alert v-if="monnaie > 0" type="success">
        Monnaie à rendre : {{ monnaie }} HTG
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="updateStatut">Enregistrer</v-btn>
      <v-btn text @click="closeEditStatutModal">Annuler</v-btn>
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

export default {
  middleware: "serveur",
  data() {
    return {
      loading : false,
      totalventes : 0,
      selectedTableId: null, // ID de la table sélectionnée
      tablesOptions: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7'], // Options des tables
      statutOptions: ['En attente', 'En préparation', 'Servie', 'Terminée'],
      statutReg: ['Non paiement', 'Partiel', 'Complet'],
      dialogConfirm: false,  // État du dialogue de confirmation
      currentDeleteId: null,
      selectedProductDetails: null,
      editStatutModal: false, // Contrôle l'ouverture du modal
    editedStatut: '', // Statut sélectionné dans le modal
    selectedCommandeId: null, // ID de la commande sélectionnée
   
    selectedCommandeTotal: 0, // Total de la commande sélectionnée
    montantPaye: 0, // Montant payé par le client
    montantRestant: null, // Montant restant à payer
    monnaie: 0, // Monnaie à rendre si le montant payé est supérieur au total
    rules: {
      positive: value => value >= 0 || 'Le montant doit être positif',
    },
      articles: [], // Articles récupérés
      commande: {
        client: null,
        serveur: '',
        statut: 'En attente',
        articles: [{ produit: null, quantite: 1 }], // Initialiser un article avec produit et quantité par défaut
        total: 0,
        reglement: 0, // Montant payé jusqu'à présent
       statutReg: 'Non paiement',
      },
      produitsOptions: [], // Produits disponibles
      commandes: [], // Liste des commandes
      headers: [
        { text: "Code", value: "code" },
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur" },
        { text: "Statut", value: "statut" },
        { text: "Total (HTG)", value: "total" },
        { text: "Reglement (HTG)", value: "reglement" },
        { text: "Date", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      productHeaders: [
        { text: "Produit", value: "produit.nom" },
        { text: "Quantité", value: "quantite" },
        { text: "Prix Unitaire (HTG)", value: "produit.prix"},
      ],
      newCommande: {
        client: "",
        serveur: "",
        statut: "En cours",
        articles: [],
      },
      newProduit: {
        produit: null,
        quantite: 1,
        prix: 0,
      },
      newProduct: {
        produit: null,
        quantite: 1,
        prix: 0,
      },
      total: 0,
      addCommandeModal: false, // Contrôle du modal pour ajouter la commande
      detailsModal: false, // Contrôle du modal pour afficher les détails de la commande
      addProductModal: false, // Contrôle du modal pour ajouter un produit à la commande
      clients:[],
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
      errors: {
        client: "",
        statut: "",
        articles: [],
      },
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    
       // Propriété calculée pour le total de la commande
    totalCommande() {
      if (!this.selectedCommande.articles) return 0;
      return this.selectedCommande.articles.reduce((sum, article) => {
        if (article.produit && article.produit.prix && article.quantite) {
          return sum + (article.produit.prix * article.quantite);
        }
        return sum;
      }, 0);
    },
  },
  async mounted() {
    await this.fetchCommandes();
    await this.fetchProduits();
   await this.fetchClients()
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),

    getLastThreeDigits(code) {
        if (code && code.length >= 3) {
          return code.slice(-3); // Extrait les 3 derniers caractères
        }
        return code; // Retourne le code complet si sa longueur est inférieure à 3
      },

      async fetchClients() {
        try {
          const response = await this.$axios.get('/clients');
          console.log(response)
          this.clients = response.data;
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs', error);
        }
      },
   
    totalVentes() {
    const userId = this.user.userId;
    const today = new Date().toLocaleDateString('fr-CA');

     this.totalventes = this.commandes
      .filter(commande => {
        const commandeDate = new Date(commande.date).toLocaleDateString('fr-CA');
        return (
          commande.serveur._id === userId && // Si serveur est une chaîne (ID)
          commandeDate === today
        );
      })
      
      .reduce((sum, commande) => sum + commande.total, 0);
    
      return this.totalventes
  },

    onProductChange(selectedValue) {
      const selectedProduct = this.produitsOptions.find(
        (produit) => produit.value === selectedValue
      );
      this.selectedProductDetails = selectedProduct || null;
    },

    // Récupérer les produits disponibles
    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produitsOptions = response.data.map((produits) => ({
          text: produits.nom,
          value: produits._id,
          prix:produits.prix
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
        const { data } = await this.$axios.get('/commandes');
        console.log(data)
        const userId = this.user.userId;
        const today = new Date().toLocaleDateString('fr-CA');
   

        this.commandes = data
          .filter(commande => {
            const commandeDate = new Date(commande.date).toLocaleDateString('fr-CA');
            return commande.serveur._id === userId && commandeDate === today;
          })
          .map(commande => {
            // Si le total est égal à 0, le recalculer en fonction des articles
            if (commande.total === 0) {
              commande.total = commande.articles.reduce((sum, article) => {
                return sum + (article.produit.prix * article.quantite);
              }, 0);
            }

            return {
              ...commande,
              serveur: commande.serveur.prenom,
              client: commande.client,
              statut: commande.statut,
              code: commande.code,
              total: commande.total, // Utiliser le total calculé ou existant
              createdAt: commande.createdAt,
              reglement : commande.reglement,
              statutReg : commande.statutReg,
              date: new Date(commande.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              }),
            };
          });

      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
      }
    },

    validateForm() {
      let isValid = true;

      // Réinitialiser les erreurs
      this.errors.client = "";
      this.errors.statut = "";
      this.errors.articles = [];

      // Validation du champ "Client"
      if (!this.commande.client) {
        this.errors.client = "Le champ Client est requis.";
        isValid = false;
      }

      // Validation du champ "Statut"
      if (!this.commande.statut) {
        this.errors.statut = "Le champ Statut est requis.";
        isValid = false;
      }

      // Validation des articles
      this.commande.articles.forEach((article, index) => {
        this.errors.articles[index] = {};
        if (!article.produit) {
          this.errors.articles[index].produit = "Le champ Produit est requis.";
          isValid = false;
        }
        if (!article.quantite || article.quantite <= 0) {
          this.errors.articles[index].quantite = "La quantité doit être supérieure à 0.";
          isValid = false;
        }
      });

      return isValid;
    },

    async sendArticle() {
      this.loading = true
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken');
      this.commande.client = this.selectedTableId;
      this.commande.serveur = this.user.userId;
      this.commande.total = this.selectedProductDetails.prix
      console.log("total",this.commande.total)

      if (this.commande.client === null || this.commande.statut === null) {
        this.$notifier.showMessage({ content: "Il y a un champ vide", color: "error", });
        return false;
      }
      // Validation des articles
      this.commande.articles.forEach((article, index) => {
        if (article.produit === null) {
          this.$notifier.showMessage({ content: "Le champ produit est requis", color: "error", });
          return false;
        }
        if (article.quantite <= 0) {
          this.$notifier.showMessage({
            content: "La quantité doit être supérieure à 0",
            color: "error",
          });
          return false;
        }
      });

      try {
        const response = await this.$axios.post('commandes', this.commande);
        this.fetchCommandes();
        this.articles.push({
          ...response.data,
          tableId: this.selectedTableId,
        });
        this.$notifier.showMessage({
          content: "Article ajouté avec succès.",
          color: "success",
        });
        this.selectedTableId = null
        this.commande.statut = null
        this.closeAddModal();
      } catch (error) {
        console.error('Erreur lors de l’ajout de l’article :', error);
        this.$notifier.showMessage({
          content: "Impossible d’ajouter l’article.",
          color: "error",
        });
      }
      this.loading = false
    },

    openAddModal() {
      this.addModal = true;
    },

    closeAddModal() {
      this.addModal = false;
    },

    viewDetails(commande) {
      this.selectedCommande = { ...commande };
      this.detailsModal = true;
    },

    openAddProductDialog() {
      this.newProduct = { produit: "", quantite: 1, prix: 0 }; // Réinitialiser les valeurs
      this.addProductModal = true; // Ouvrir le modal
    },

    closeAddProductDialog() {
      this.addProductModal = false; // Fermer le modal
    },

    async addProduits() {
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken');

      try {
        if (this.newProduct.produit === null) {
          this.$notifier.showMessage({
            content: "Veuillez choisir un produit",
            color: "error",
          });
          return false;
        }
        const response = await this.$axios.post('commandes/add', {
          commandeId: this.selectedCommande._id,
          produitId: this.newProduct.produit,
          quantite: this.newProduct.quantite,
        });
        if (response.status === 200) {
          // Mettre à jour selectedCommande
          this.selectedCommande.articles = response.data.commande.articles;
          this.selectedCommande.total = this.totalCommande;

          // Mettre à jour la commande dans la liste commandes
          const index = this.commandes.findIndex(c => c._id === this.selectedCommande._id);
          if (index !== -1) {
            this.commandes[index].articles = response.data.commande.articles;
            this.commandes[index].total = this.totalCommande;
          }

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
        if (error.response && (error.response.status === 500 || error.response.data.message === "Stock insuffisant")) {
          this.$notifier.showMessage({
            content: "Stock insuffisant pour ce produit.",
            color: "warning",
          });
        } else {
          this.$notifier.showMessage({
            content: "Une erreur s'est produite. Veuillez réessayer.",
            color: "error",
          });
        }
      }
    },

     // Ouvrir le modal pour modifier le statut
  openEditStatutModal(item) {
    this.selectedCommandeId = item._id; // Stocker l'ID de la commande
    this.selectedCommandeTotal = item.total; // Stocker le total de la commande
    this.editedStatut = item.statutReg; // Pré-remplir le statut actuel
    this.montantPaye = item.reglement || 0; // Pré-remplir le montant payé
    this.calculateMontantRestant(); // Calculer le montant restant
    this.editStatutModal = true; // Ouvrir le modal
  },

  // Fermer le modal
  closeEditStatutModal() {
    this.editStatutModal = false;
    this.selectedCommandeId = null;
    this.editedStatut = '';
    this.montantPaye = 0;
    this.montantRestant = null;
    this.monnaie = 0;
  },

  // Calculer le montant restant et la monnaie
  calculateMontantRestant() {
    if (this.montantPaye !== null && this.selectedCommandeTotal !== null) {
      this.montantRestant = this.selectedCommandeTotal - this.montantPaye;
      this.monnaie = this.montantPaye > this.selectedCommandeTotal ? this.montantPaye - this.selectedCommandeTotal : 0;
    }
    this.onStatutChange()
  },

  // Mettre à jour le statut et le montant payé
  

  // Gérer le changement de statut
  onStatutChange() {
    if (this.commande.reglement=== 'Complet') {
      this.montantPaye = this.selectedCommandeTotal; // Si le statut est "Complet", le montant payé est égal au total
      this.calculateMontantRestant();
    }
  },

    // Ouvrir le modal pour modifier le statut
  

  // Mettre à jour le statut
  // async updateStatut() {
  //   if (!this.selectedCommandeId || !this.commande.reglement) return;
  //   console.log(this.selectedCommandeId, this.commande.reglement)
  //   try {
  //     const response = await this.$axios.put('commandes/paiement', {commandeId : this.selectedCommandeId,
  //      montant:this.commande.reglement,
  //     });
  //       console.log(response)
  //     // Rafraîchir la liste des commandes
  //     await this.fetchCommandes();

  //     // Fermer le modal
  //     this.closeEditStatutModal();

  //     // Afficher un message de succès
  //     this.$notifier.showMessage({
  //       content: 'Statut mis à jour avec succès !',
  //       color: 'success',
  //     });
  //   } catch (error) {
  //     console.error('Erreur lors de la mise à jour du statut :', error);
  //     this.$notifier.showMessage({
  //       content: 'Erreur lors de la mise à jour du statut.',
  //       color: 'error',
  //     });
  //   }
  // },

  async updateStatut() {
  if (!this.selectedCommandeId || !this.montantPaye) {
    this.$notifier.showMessage({
      content: 'Veuillez sélectionner une commande et un montant valide.',
      color: 'error',
    });
    return;
  }

  // Vérifier que le montant est un nombre valide
  if (isNaN(this.montantPaye)) {
    this.$notifier.showMessage({
      content: 'Le montant doit être un nombre valide.',
      color: 'error',
    });
    return;
  }
  this.commande.reglement = this.montantPaye
  // Convertir le montant en nombre
  // const montant = Number(this.commande.reglement);

  console.log('Données envoyées :', {
    commandeId: this.selectedCommandeId,
    montant : this.commande.reglement ,
  });

  try {
    const response = await this.$axios.post('commandes/paiement', {
      commandeId: this.selectedCommandeId,
      montant : this.commande.reglement,
    });
    console.log('Réponse du serveur :', response.data);
 
    // Rafraîchir la liste des commandes
    await this.fetchCommandes();

    // Fermer le modal
    this.closeEditStatutModal();

    // Afficher un message de succès
    this.$notifier.showMessage({
      content: 'Statut mis à jour avec succès !',
      color: 'success',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut :', error);
    this.$notifier.showMessage({
      content: 'Erreur lors de la mise à jour du statut.',
      color: 'error',
    });
  }
},

    deleteArticle(id) {
      this.currentDeleteId = id;
      this.dialogConfirm = true;
    },

    async confirmDelete() {
      this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken');
      try {
        await this.$axios.delete(`/commandes/${this.currentDeleteId}`);
        this.fetchCommandes();
        this.dialogConfirm = false;
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
      }
    },

    cancelDelete() {
      this.dialogConfirm = false;
    },

printInvoicepiti() {
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
          margin-top: 10px;
          border: none; /* Supprime les bordures du tableau */
        }
        table th, table td {
          text-align: left;
          border: none; /* Supprime les bordures des cellules */
          padding: 3px; /* Ajoute un peu d'espace pour la lisibilité */
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
          <h5>Bénédictions de l'Éternel</h5>             
          <p>               
            Tél: +509 3779-6764 / +509 3596-7838<br />        
          </p>
          <hr style="border: 1px dashed black; margin: 10px 0;" />
        </div>        
        <h5 style="text-align: center; margin: 0;">FACTURE</h5>
        <p style="font-size: 12px;"><strong>Client:</strong> ${this.selectedCommande.client}</p>
        <p style="font-size: 12px;"><strong>Client:</strong> ${this.selectedCommande.date}</p>
       
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

  const newWindow = window.open("", "_blank", "width=600, height=600");      
  newWindow.document.write(printableContent);
  newWindow.document.close();

  setTimeout(() => {
    newWindow.print();
    newWindow.close();
  }, 1000);
},



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
              <h5>Bénédictions de l'Éternel</h5>             
              <p>               
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

      const newWindow = window.open("", "_blank", "width=600, height=600");      
      newWindow.document.write(printableContent);
      // newWindow.document.write();
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 1000);
    },


    printInvoice1() {
  // Calculer le total de la commande
  const total = this.selectedCommande.articles.reduce(
    (sum, article) => sum + article.produit.prix * article.quantite,
    0
  );

  // Préparer les données de la facture à envoyer au backend
  const invoiceData = {
    client: this.selectedCommande.client,
    articles: this.selectedCommande.articles.map((article) => ({
      name: article.produit.nom,
      quantity: article.quantite,
      price: article.produit.prix,
    })),
    total,
  };

  // Envoyer les données au backend pour impression
  fetch('http://localhost:3000/print', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData), // Envoyer les données au backend
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erreur lors de l\'impression');
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.message); // Afficher un message de succès
      alert('Facture imprimée avec succès !');
    })
    .catch((error) => {
      console.error('Erreur :', error);
      alert('Erreur lors de l\'impression. Veuillez réessayer.');
    });
}
  },
};
</script>

<style scoped>
.table {
  width: 100%;
}
</style>