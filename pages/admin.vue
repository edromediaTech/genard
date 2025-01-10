<template>
  <v-container>
    <v-row>
      <!-- Statistiques principales -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="primary" large>mdi-cash-register</v-icon>
          <h5>Total Ventes</h5>
          <p class="headline">{{ formatCurrency(totalSales) }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="green" large>mdi-cart</v-icon>
          <h5>Commandes Terminées</h5>
          <p class="headline">{{ completedOrders }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="orange" large>mdi-clock-outline</v-icon>
          <h5>Commandes En Cours</h5>
          <p class="headline">{{ ongoingOrders }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="red" large>mdi-alert-circle-outline</v-icon>
          <h5>Commandes Annulées</h5>
          <p class="headline">{{ canceledOrders }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphiques -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Ventes par Catégorie</v-card-title>
          <v-card-text>
            <apexchart type="pie" :options="pieChartOptions" :series="pieChartSeries" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Ventes Hebdomadaires</v-card-title>
          <v-card-text>
            <apexchart type="bar" :options="barChartOptions" :series="barChartSeries" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des stocks faibles -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Articles à Faible Stock</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="lowStockHeaders"
              :items="lowStockItems"
              dense
              outlined
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
   // apexchart: VueApexCharts,
  },
  data() {
    return {
      // Statistiques principales
      totalSales: 0,
      completedOrders: 0,
      ongoingOrders: 0,
      canceledOrders: 0,

      // Graphique des ventes par catégorie
      pieChartOptions: {
        labels: ["Plats Principaux", "Boissons", "Desserts"],
      },
      pieChartSeries: [50, 30, 20], // Exemple de données (en %)

      // Graphique des ventes hebdomadaires
      barChartOptions: {
        chart: {
          id: "weekly-sales",
        },
        xaxis: {
          categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        },
      },
      barChartSeries: [
        {
          name: "Ventes",
          data: [120, 200, 150, 300, 400, 250, 320], // Exemple de données
        },
      ],

      // Articles à faible stock
      lowStockHeaders: [
        { text: "Nom", value: "nom"},
        { text: "Qté", value: "quantite" },
      ],
      lowStockItems: [ ],
    };
  },
  mounted() {
    this.fetchDashboardData();
    this.fetchProduits()
    this.fetchCommandes()
  },
  
  methods: {
    async fetchDashboardData() {
      try {
        // Exemple d'appel à l'API pour obtenir les données
        const response = await this.$axios.get("/api/restaurant/dashboard");
        const data = response.data;

        // Mise à jour des statistiques principales
        this.totalSales = data.totalSales;
        this.completedOrders = data.completedOrders;
        this.ongoingOrders = data.ongoingOrders;
        this.canceledOrders = data.canceledOrders;

        // Mise à jour des données de graphique
        this.pieChartSeries = data.pieChartSeries;
        this.barChartSeries[0].data = data.weeklySales;

        // Mise à jour des stocks faibles       
      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard :", error);
      }
    },

    async fetchProduits() {
      try {
        const response = await this.$axios.get('/produits');
        const allProducts = response.data;

        // Filtrer les produits dont la quantité est inférieure ou égale au seuil critique
        // Seuil critique à définir
        this.lowStockItems = allProducts.filter(product => product.quantite <= product.critique);

      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

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

    // async fetchProduits() {
    //     try {
    //       const response = await this.$axios.get('/produits');
    //       this.lowStockItems =response.data;         
    //     } catch (error) {
    //       console.error('Erreur lors de la récupération des produits:', error);
    //     }
    //   },

    formatCurrency(value) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "HTG",
      }).format(value);
    },
  },
};
</script>
