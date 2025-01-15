<template>
    <v-container>
      <!-- Bouton pour créer une commande -->
      <v-btn color="primary" class="mb-4" @click="openAddModal">Créer une Commande</v-btn>
  
      <!-- Tableau des commandes -->
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
            <v-btn icon small title="Détails de la Commande" @click="viewDetails(item)">
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
  
      <!-- Modal pour afficher les détails de la commande -->
      <v-dialog v-model="detailsModal" max-width="800px" persistent>
        <v-card ref="printableContent" width="80mm">
          <v-card-title>Détails de la Commande {{ selectedCommande.total }}</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><strong>Client:</strong> {{ selectedCommande.client }}</v-list-item-title>
                  <v-list-item-title><strong>Serveur:</strong> {{ selectedCommande.serveur }}</v-list-item-title>
                  <v-list-item-title><strong>Date:</strong> {{ formatDate(selectedCommande.createdAt) }}</v-list-item-title>
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
            <v-btn color="success" @click="printInvoice">
              <v-icon>mdi-printer</v-icon> Imprimer
            </v-btn>
            <v-btn text @click="detailsModal = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import { mapGetters } from "vuex";
  import html2canvas from 'html2canvas';
  
  export default {
    middleware: "serveur",
    data() {
      return {
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
        selectedCommande: {
          id: "",
          client: "",
          serveur: "",
          statut: "",
          articles: [],
        },
        detailsModal: false, // Contrôle du modal pour afficher les détails de la commande
      };
    },
    computed: {
      ...mapGetters("auth", ["user"]),
    },
    async mounted() {
      await this.fetchCommandes();
    },
    methods: {
      // Récupérer les commandes depuis l'API
      async fetchCommandes() {
        try {
          const { data } = await this.$axios.get('/commandes');
          this.commandes = data.map(commande => ({
            ...commande,
            serveur: commande.serveur.prenom,
            client: commande.client,
            statut: commande.statut,
            total: commande.total,
            createdAt: commande.createdAt,
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des commandes :', error);
        }
      },
  
      // Formater la date
      formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', options).replace(',', '');
      },
  
      // Afficher les détails de la commande
      viewDetails(commande) {
        this.selectedCommande = { ...commande };
        this.detailsModal = true;
      },
  
      // Imprimer la facture
      async printInvoice() {
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
            useCORS: true, // Activer CORS pour les images externes
            logging: true, // Activer les logs pour le débogage
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
    },
  };
  </script>
  
  <style scoped>
  .printable-content {
    width: 80mm;
    padding: 10px;
    box-sizing: border-box;
    background-color: white;
    color: black;
  }
  </style>