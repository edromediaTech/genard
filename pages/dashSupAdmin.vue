<template>
  <v-container>
    <!-- Statistiques principales -->
    <v-row>
      <!-- Restaurant -->
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="primary" large>mdi-cash-register</v-icon>
          <h5>Cash Aujourd'hui (Restaurant)</h5>
          <p class="headline">{{ formatCurrency(cashTodayRestaurant) }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="green" large>mdi-calendar-today</v-icon>
          <h5>Ventes Aujourd'hui (Restaurant)</h5>
          <p class="headline">{{ formatCurrency(dailySalesRestaurant) }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="purple" large>mdi-account-group</v-icon>
          <h5>Clients Aujourd'hui (Restaurant)</h5>
          <p class="headline">{{ todayCustomersRestaurant }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="blue" large>mdi-calendar-month</v-icon>
          <h5>Ventes Ce Mois (Restaurant)</h5>
          <p class="headline">{{ formatCurrency(monthlySalesRestaurant) }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Hotel -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="orange" large>mdi-hotel</v-icon>
          <h5>Revenus Hôtel Aujourd'hui</h5>
          <p class="headline">{{ formatCurrency(dailySalesHotel) }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="teal" large>mdi-calendar-today</v-icon>
          <h5>Clients Hôtel Aujourd'hui</h5>
          <p class="headline">{{ todayCustomersHotel }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="purple" large>mdi-account-group</v-icon>
          <h5>Réservations Ce Mois (Hôtel)</h5>
          <p class="headline">{{ monthlyBookingsHotel }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="blue" large>mdi-calendar-month</v-icon>
          <h5>Revenus Hôtel Ce Mois</h5>
          <p class="headline">{{ formatCurrency(monthlySalesHotel) }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Services (Location d'espace, événements) -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="red" large>mdi-cottage</v-icon>
          <h5>Revenus Location d'Espace Aujourd'hui</h5>
          <p class="headline">{{ formatCurrency(dailySalesSpace) }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="blue" large>mdi-calendar-today</v-icon>
          <h5>Événements Aujourd'hui</h5>
          <p class="headline">{{ todayEvents }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="green" large>mdi-calendar-month</v-icon>
          <h5>Revenus Location d'Espace Ce Mois</h5>
          <p class="headline">{{ formatCurrency(monthlySalesSpace) }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <v-icon color="amber" large>mdi-calendar-today</v-icon>
          <h5>Événements Ce Mois</h5>
          <p class="headline">{{ monthlyEvents }}</p>
        </v-card>
      </v-col>
    </v-row>
        <v-row>
      <v-col cols="12">
        <v-card class="pa-4" color="grey-lighten-3">
          <v-card-title class="headline">Bilan Financier</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Dépenses et Revenus -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title>
            <v-icon color="green">mdi-currency-usd</v-icon>
            Revenus
          </v-card-title>
          <v-card-text>
            <p class="headline">{{ formatCurrency(totalRevenues) }}</p>
            <v-progress-linear :value="revenueProgress" color="green" height="10"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title>
            <v-icon color="red">mdi-currency-usd</v-icon>
            Dépenses
          </v-card-title>
          <v-card-text>
            <p class="headline">{{ formatCurrency(totalExpenses) }}</p>
            <v-progress-linear :value="expenseProgress" color="red" height="10"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Bénéfice ou Perte -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title>
            <v-icon color="blue">mdi-trending-up</v-icon>
            Bénéfice ou Perte
          </v-card-title>
          <v-card-text>
            <p class="headline" :style="isProfit ? 'color: green;' : 'color: red;'">
              {{ formatCurrency(profitOrLoss) }}
            </p>
            <v-progress-linear
              :value="isProfit ? 100 : 0"
              :color="isProfit ? 'green' : 'red'"
              height="10"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphiques Financiers -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Graphique des Revenus vs Dépenses</v-card-title>
          <v-card-text>
            <apexchart type="bar" :options="barChartOptions" :series="barChartSeries" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphiques -->
    <v-row>
      <!-- Graphiques pour Restaurant -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Ventes par Catégorie (Restaurant)</v-card-title>
          <v-card-text>
            <apexchart type="pie" :options="pieChartOptionsRestaurant" :series="pieChartSeriesRestaurant" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Graphiques pour l'Hôtel -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title>Ventes par Catégorie (Hôtel)</v-card-title>
          <v-card-text>
            <apexchart type="pie" :options="pieChartOptionsHotel" :series="pieChartSeriesHotel" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des stocks faibles (Restaurant) -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Articles à Faible Stock (Restaurant)</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="lowStockHeaders"
              :items="lowStockItemsRestaurant"
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
          <v-card-title>Commandes Récentes (Restaurant)</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recentOrdersHeaders"
              :items="recentOrdersRestaurant"
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
      // Restaurant
      cashTodayRestaurant: 0,
      dailySalesRestaurant: 0,
      monthlySalesRestaurant: 0,
      todayCustomersRestaurant: 0,
      pieChartOptionsRestaurant: {
        labels: ["Plats Principaux", "Boissons", "Desserts"],
      },
      pieChartSeriesRestaurant: [50, 30, 20],
      lowStockItemsRestaurant: [],
      recentOrdersRestaurant: [],
      
      // Hôtel
      dailySalesHotel: 0,
      monthlySalesHotel: 0,
      todayCustomersHotel: 0,
      monthlyBookingsHotel: 0,
      pieChartOptionsHotel: {
        labels: ["Chambres", "Réservations", "Services"],
      },
      pieChartSeriesHotel: [60, 30, 10],
      
      // Services
      dailySalesSpace: 0,
      monthlySalesSpace: 0,
      todayEvents: 0,
      monthlyEvents: 0,
      pieChartOptionsSpace: {
        labels: ["Location de Salle", "Événements"],
      },
      pieChartSeriesSpace: [70, 30],
      
      // Commandes récentes
      recentOrdersHeaders: [
        { text: "Date", value: "date" },
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur.prenom" },
        { text: "Statut", value: "statut" },
        { text: "Total", value: "total" },
      ],
      lowStockHeaders: [
        { text: "Nom", value: "nom" },
        { text: "Qté", value: "quantite" },
      ],
       // Revenus et Dépenses
      totalRevenues: 0,
      totalExpenses: 0,
      revenueProgress: 0,
      expenseProgress: 0,

      // Bénéfice ou Perte
      profitOrLoss: 0,
      isProfit: true,

      // Graphiques
      barChartOptions: {
        chart: {
          type: 'bar',
          height: '300px'
        },
        xaxis: {
          categories: ['Revenus', 'Dépenses'],
        },
        colors: ['#4CAF50', '#FF5722']
      },
      barChartSeries: [
        {
          name: 'Montant',
          data: [0, 0], // Placeholder pour les revenus et les dépenses
        },
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
     async fetchFinancialData() {
      try {
        // Supposons que vous ayez une API pour récupérer ces données
        const financialData = await this.$axios.get("/financial-data");

        // Revenus et Dépenses
        this.totalRevenues = financialData.revenues;
        this.totalExpenses = financialData.expenses;

        // Calcul du Bénéfice ou de la Perte
        this.profitOrLoss = this.totalRevenues - this.totalExpenses;
        this.isProfit = this.profitOrLoss >= 0;

        // Progression des revenus et dépenses
        this.revenueProgress = (this.totalRevenues / (this.totalRevenues + this.totalExpenses)) * 100;
        this.expenseProgress = (this.totalExpenses / (this.totalRevenues + this.totalExpenses)) * 100;

        // Mise à jour du graphique des revenus vs dépenses
        this.barChartSeries[0].data = [this.totalRevenues, this.totalExpenses];
      } catch (error) {
        console.error("Erreur lors de la récupération des données financières :", error);
      }
    },
    async fetchDashboardData() {
      try {
        const ordersResponse = await this.$axios.get("/commandes");
        const orders = ordersResponse.data;

        const productsResponse = await this.$axios.get("/produits");
        const products = productsResponse.data;

        // Statistiques Restaurant
        this.cashTodayRestaurant = this.calculateDailySales(orders, "restaurant");
        this.dailySalesRestaurant = this.calculateDailySales(orders, "restaurant");
        this.monthlySalesRestaurant = this.calculateMonthlySales(orders, "restaurant");

        // Statistiques Hôtel
        this.dailySalesHotel = this.calculateDailySales(orders, "hotel");
        this.monthlySalesHotel = this.calculateMonthlySales(orders, "hotel");
        this.monthlyBookingsHotel = this.calculateMonthlyBookings(orders);

        // Statistiques Services
        this.dailySalesSpace = this.calculateDailySales(orders, "space");
        this.monthlySalesSpace = this.calculateMonthlySales(orders, "space");
        this.monthlyEvents = this.calculateMonthlyEvents(orders);

        // Articles à faible stock
        this.lowStockItemsRestaurant = products.filter(product => product.quantite <= product.critique);
        
        // Récupérer les commandes récentes
        this.recentOrdersRestaurant = orders.filter(order => order.statut === "Restaurant");
      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard :", error);
      }
    },
    calculateDailySales(orders, type) {
      return orders
        .filter(order => order.type === type && new Date(order.date).toLocaleDateString() === new Date().toLocaleDateString())
        .reduce((total, order) => total + order.total, 0);
    },
    calculateMonthlySales(orders, type) {
      return orders
        .filter(order => order.type === type && new Date(order.date).getMonth() === new Date().getMonth())
        .reduce((total, order) => total + order.total, 0);
    },
    calculateMonthlyBookings(orders) {
      return orders.filter(order => order.type === "hotel" && new Date(order.date).getMonth() === new Date().getMonth()).length;
    },
    calculateMonthlyEvents(orders) {
      return orders.filter(order => order.type === "event" && new Date(order.date).getMonth() === new Date().getMonth()).length;
    },
  },
};
</script>

<style scoped>
</style>
