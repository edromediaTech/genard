<template>
  <v-container>
    <!-- Statistiques principales -->
    <v-row>
      <!-- Total des ventes -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="primary" large>mdi-cash-register</v-icon>
          <h5>Total Ventes</h5>
          <p class="headline">{{ formatCurrency(totalSales) }}</p>
        </v-card>
      </v-col>

      <!-- Ventes aujourd'hui -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="green" large>mdi-calendar-today</v-icon>
          <h5>Ventes Aujourd'hui</h5>
          <p class="headline">{{ formatCurrency(dailySales) }}</p>
        </v-card>
      </v-col>

      <!-- Ventes ce mois -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="blue" large>mdi-calendar-month</v-icon>
          <h5>Ventes Ce Mois</h5>
          <p class="headline">{{ formatCurrency(monthlySales) }}</p>
        </v-card>
      </v-col>

      <!-- Clients aujourd'hui -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="purple" large>mdi-account-group</v-icon>
          <h5>Clients Aujourd'hui</h5>
          <p class="headline">{{ todayCustomers }}</p>
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

    <!-- Commandes récentes -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Commandes Récentes</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recentOrdersHeaders"
              :items="recentOrders"
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
export default {
  middleware: "superviseur",
  data() {
    return {
      // Statistiques principales
      totalSales: 0,
      dailySales: 0, // Total des ventes par jour
      monthlySales: 0, // Total des ventes par mois
      completedOrders: 0,
      ongoingOrders: 0,
      canceledOrders: 0,
      todayCustomers: 0, // Nombre de clients aujourd'hui

      // Graphiques
      pieChartOptions: {
        labels: ["Plats Principaux", "Boissons", "Desserts"],
      },
      pieChartSeries: [50, 30, 20], // Exemple de données (en %)
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
        { text: "Nom", value: "nom" },
        { text: "Qté", value: "quantite" },
      ],
      lowStockItems: [],

      // Commandes récentes
      recentOrdersHeaders: [
        { text: "Date", value: "date" },
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur.prenom" },
        { text: "Statut", value: "statut" },
        { text: "Total", value: "total" },
      ],
      recentOrders: [],
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "HTG",
      }).format(value);
    },
    async fetchDashboardData() {
      try {
        // Récupérer les commandes
        const ordersResponse = await this.$axios.get("/commandes");
        const orders = ordersResponse.data;

        // Récupérer les produits
        const productsResponse = await this.$axios.get("/produits");
        const products = productsResponse.data;

        // Calculer les statistiques principales
        this.totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        this.completedOrders = orders.filter(order => order.statut === "Terminée").length;
        this.ongoingOrders = orders.filter(order => order.statut === "En cours").length;
        this.canceledOrders = orders.filter(order => order.statut === "Annulée").length;

        // Calculer le nombre de clients aujourd'hui
        const today = new Date().toISOString().split("T")[0];
        this.todayCustomers = orders.filter(order => order.date.split("T")[0] === today).length;

        // Calculer les ventes par jour
        this.dailySales = orders
          .filter(order => order.date.split("T")[0] === today)
          .reduce((sum, order) => sum + order.total, 0);

        // Calculer les ventes par mois
        const currentMonth = new Date().toISOString().slice(0, 7); // Format YYYY-MM
        this.monthlySales = orders
          .filter(order => order.date.slice(0, 7) === currentMonth)
          .reduce((sum, order) => sum + order.total, 0);

        // Récupérer les articles à faible stock
        this.lowStockItems = products.filter(product => product.quantite <= product.critique);

        // Récupérer les commandes récentes (5 dernières commandes)
        this.recentOrders = orders.slice(-5).map(order => ({
          ...order,
          date: new Date(order.date).toLocaleDateString("fr-FR"),
        }));

        // Calculer les ventes par catégorie
        const categories = {};
        orders.forEach(order => {
          const category = order.produit.categorie; // Supposons que la catégorie est dans order.produit.categorie
          if (!categories[category]) {
            categories[category] = 0;
          }
          categories[category] += order.total; // Ajouter le total de la commande à la catégorie
        });

        // Mettre à jour les données du graphique des ventes par catégorie
        this.pieChartOptions.labels = Object.keys(categories);
        this.pieChartSeries = Object.values(categories);

        // Exemple de données pour les ventes hebdomadaires (à adapter selon vos besoins)
        this.barChartSeries[0].data = [120, 200, 150, 300, 400, 250, 320]; // Exemple de données
      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard :", error);
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>