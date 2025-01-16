<template>
  <v-container>
  
    <!-- <v-btn color="blue" class="mb-4" @click="openAddModal">
    <v-icon left>mdi-plus</v-icon>Commande
    </v-btn> -->

    <!-- Bouton pour afficher toutes les commandes -->
    <v-btn color="primary" class="mb-4" @click="toggleShowAllCommands">
      {{ showAllCommands ? "Commandes du jour" : "Toutes les commandes" }}
    </v-btn><v-spacer></v-spacer>
    <!-- Bouton d'export global -->
   
    <!-- Filtres supplémentaires -->
    <!-- <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedStatut"
          :items="statutOptions"
          label="Filtrer par statut"
          outlined
          dense
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-menu
          v-model="datePickerMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="selectedDate"
              label="Filtrer par date"
              readonly
              outlined
              dense
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="selectedDate"
            @input="datePickerMenu = false"
          ></v-date-picker>
        </v-menu>
      </v-col> 
    </v-row>-->

    <!-- Affichage des totaux généraux -->
    <v-card class="mb-4">
      <v-card-title>
        Total des ventes : {{ totalVentes }} HTG
      </v-card-title>  <!-- Bouton pour créer une commande -->
      <download-excel
      :data="filteredCommandes"
      :name="`commandes_${new Date().toISOString().substr(0, 10)}.xls`"
      :fields="excelFields"
      worksheet="Commandes"
    >
      <v-btn color="success" class="mt-4">
        <v-icon>mdi-file-export</v-icon>
       
      </v-btn>
    </download-excel>
    </v-card>

    <!-- Table des commandes -->
    <v-card>
      <v-card-title>Liste des Commandes</v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredCommandes"
        item-value="id"
        dense
        item-key="_id"
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon x-small title="Details de la Commande" @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <download-excel
            :data="formatCommandeForExcel(item)"
            :name="`facture_${item._id}.xls`"
            :fields="excelFields"
            worksheet="Facture"
          >
            <v-btn icon x-small color="success">
              <v-icon>mdi-file-excel</v-icon>
            </v-btn>
          </download-excel>
          <v-btn icon x-small color="error" @click="deleteArticle(item._id)">
            <v-icon >mdi-delete</v-icon>
          </v-btn>
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
      </v-data-table>
    </v-card>

    

    <!-- Modal pour créer une commande -->
    <v-dialog v-model="addModal" max-width="800px">
      <v-card>
        <v-card-title>Créer une Commande</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newCommande.client"
                label="Client"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="newCommande.statut"
                :items="statutOptions"
                label="Statut"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>
          <v-row v-for="(article, index) in newCommande.articles" :key="index" class="mb-3">
            <v-col cols="12" md="6">
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
            <v-col cols="12" md="6">
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
          <v-btn color="blue" @click="addArticle">Ajouter un article</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="createCommande">Créer</v-btn>
          <v-btn text @click="closeAddModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal des détails de la commande -->
    <v-dialog v-model="detailsModal" max-width="800px">
      <v-card>
        <v-card-title>Détails de la Commande {{ selectedCommande.total }} HTG</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title><strong>Client:</strong> {{ formatDate(selectedCommande.createdAt) }}</v-list-item-title>
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
          <v-btn text @click="detailsModal = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import jsonExcel from "vue-json-excel";

export default {
  components: {
    DownloadExcel: jsonExcel,
  },
  middleware: "admin",
  data() {
    return {
      showAllCommands: false, // Afficher toutes les commandes ou seulement celles du jour
      selectedStatut: null, // Filtre par statut
      selectedDate: new Date().toISOString().substr(0, 10), // Filtre par date (par défaut, la date du jour)
      datePickerMenu: false, // Contrôle l'affichage du date picker
      commandes: [], // Liste des commandes
      headers: [
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur" },
        // { text: "Statut", value: "statut" },
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
      detailsModal: false, // Contrôle l'affichage du modal des détails
      addModal: false, // Contrôle l'affichage du modal de création de commande
      newCommande: {
        client: "",
        statut: "En attente",
        articles: [{ produit: null, quantite: 1 }],
      },
      produitsOptions: [], // Liste des produits disponibles
      excelFields: {
        "En-tête": "header",
        "Détails": "details",
        "Produit": "produit",
        "Quantité": "quantite",
        "Prix Unitaire": "prixUnitaire",
        "Total": "total",
      },
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    // Filtre les commandes en fonction des sélections
    filteredCommandes() {
      let commandes = this.commandes;

      // Filtrer par date
      if (!this.showAllCommands) {
        const today = new Date(this.selectedDate).toLocaleDateString('fr-CA');
        commandes = commandes.filter(commande => {
          const commandeDate = new Date(commande.date).toLocaleDateString('fr-CA');
          return commandeDate === today;
        });
      }

      // Filtrer par statut
      if (this.selectedStatut) {
        commandes = commandes.filter(commande => commande.statut === this.selectedStatut);
      }

      return commandes;
    },
    // Calcule le total des ventes
    totalVentes() {
      return this.filteredCommandes.reduce((sum, commande) => sum + commande.total, 0);
    },
  },
  async mounted() {
    await this.fetchCommandes();
    await this.fetchProduits();
  },
  methods: {
    // Basculer entre les commandes du jour et toutes les commandes
    toggleShowAllCommands() {
      this.showAllCommands = !this.showAllCommands;
    },

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
          date: new Date(commande.date).toISOString().substr(0, 10),
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
      }
    },

    // Récupérer les produits disponibles
    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        this.produitsOptions = response.data.map(produit => ({
          text: produit.nom + ' --- ' + produit.prix + ' HTG',
          value: produit._id,
          prix: produit.prix,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    // Afficher les détails d'une commande
    viewDetails(commande) {
      this.selectedCommande = { ...commande };
      this.detailsModal = true;
    },

    // Formater une commande pour l'export Excel
    formatCommandeForExcel(commande) {
      const enTete = [
        { header: "Bénédictions de l'Éternel" },
        { header: "Adresse: Angle des Rues Bory & St-Charles, Fort-Liberté, Haïti" },
        { header: "Téléphone: +509 3779-6764 / +509 3596-7838" },
        { header: "Facture" },
        { header: `Client: ${commande.client}` },
        { header: `Date: ${commande.date}` },
        { header: "" }, // Ligne vide
      ];

      const details = commande.articles.map(article => ({
        produit: article.produit.nom,
        quantite: article.quantite,
        prixUnitaire: article.produit.prix,
        total: article.produit.prix * article.quantite,
      }));

      const total = [
        { header: "" }, // Ligne vide
        { header: `Total: ${commande.total} HTG` },
      ];

      return [...enTete, ...details, ...total];
    },

    // Ouvrir le modal de création de commande
    openAddModal() {
      this.addModal = true;
    },

    // Fermer le modal de création de commande
    closeAddModal() {
      this.addModal = false;
      this.newCommande = {
        client: "",
        statut: "En attente",
        articles: [{ produit: null, quantite: 1 }],
      };
    },

    // Ajouter un article à la nouvelle commande
    addArticle() {
      this.newCommande.articles.push({ produit: null, quantite: 1 });
    },

    // Créer une nouvelle commande
    async createCommande() {
      try {
        const response = await this.$axios.post('/commandes', this.newCommande);
        this.commandes.push(response.data);
        this.closeAddModal();
        this.$notifier.showMessage({
          content: "Commande créée avec succès.",
          color: "success",
        });
      } catch (error) {
        console.error('Erreur lors de la création de la commande :', error);
        this.$notifier.showMessage({
          content: "Erreur lors de la création de la commande.",
          color: "error",
        });
      }
    },

    // Formater la date
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', options).replace(',', '');
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
}
</style>