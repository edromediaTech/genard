<template>
  <v-container>
    <!-- Statistiques principales -->
    <v-row>
      <!-- Total des ventes -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-icon color="primary" large>mdi-cash-register</v-icon>
          <h5 class="font-weight-bold text-subtitle-1">Cash Aujourd'hui</h5>
          <p class="headline font-weight-bold">{{ formatCurrency(cashToday) }}</p>
        </v-card>
      </v-col>

      <!-- Ventes aujourd'hui -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-icon color="green" large>mdi-calendar-today</v-icon>
          <h5 class="font-weight-bold text-subtitle-1">Ventes Aujourd'hui</h5>
          <p class="headline font-weight-bold">{{ formatCurrency(dailySales) }}</p>
        </v-card>
      </v-col>

      <!-- Clients aujourd'hui -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-icon color="purple" large>mdi-account-group</v-icon>
          <h5 class="font-weight-bold text-subtitle-1">Clients Aujourd'hui</h5>
          <p class="headline font-weight-bold">{{ todayCustomers }}</p>
        </v-card>
      </v-col>

      <!-- Ventes ce mois -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-icon color="blue" large>mdi-calendar-month</v-icon>
          <h5 class="font-weight-bold text-subtitle-1">Ventes Ce Mois</h5>
          <p class="headline font-weight-bold">{{ formatCurrency(monthlySales) }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Hôtel -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-card-title class="text-h6 font-weight-bold">Statistiques de l'Hôtel</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Taux d'Occupation</v-card-title>
                  <v-card-text class="text-center">{{ hotelOccupancyRate }}%</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Revenu par Chambre (RevPAR)</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(hotelRevPAR) }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Durée Moyenne du Séjour</v-card-title>
                  <v-card-text class="text-center">{{ hotelAverageStay }} nuits</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Dépenses -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-card-title class="text-h6 font-weight-bold">Dépenses</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Dépenses Opérationnelles</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(operationalExpenses) }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Dépenses Fixes</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(fixedExpenses) }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Total des Dépenses</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(totalExpenses) }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Revenus -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-card-title class="text-h6 font-weight-bold">Revenus</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Revenus du Restaurant</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(restaurantRevenue) }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Revenus de l'Hôtel</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(hotelRevenue) }}</v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="elevation-8">
                  <v-card-title>Revenus Totaux</v-card-title>
                  <v-card-text class="text-center">{{ formatCurrency(totalRevenue) }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Bénéfices/Perte -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-card-title class="text-h6 font-weight-bold">Bénéfices/Perte</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-card class="elevation-8">
                  <v-card-title>Bénéfices</v-card-title>
                  <v-card-text :class="profit >= 0 ? 'green--text' : 'red--text'">
                    {{ formatCurrency(profit) }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card class="elevation-8">
                  <v-card-title>Tendance des Bénéfices</v-card-title>
                  <ApexChart
                    type="line"
                    :options="profitChartOptions"
                    :series="profitChartSeries"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section Analyse Globale -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 rounded-lg elevation-12">
          <v-card-title class="text-h6 font-weight-bold">Analyse Globale</v-card-title>
          <v-card-text>
            <v-alert v-if="profit < 0" type="error" border="left" dense>
              L'entreprise est en perte ce mois-ci.
            </v-alert>
            <v-alert v-else type="success" border="left" dense>
              L'entreprise est bénéficiaire ce mois-ci.
            </v-alert>
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
      cashToday: 0,
      dailySales: 0,
      monthlySales: 0,
      todayCustomers: 0,
      // Statistiques de l'Hôtel
      hotelOccupancyRate: 0,
      hotelRevPAR: 0,
      hotelAverageStay: 0,
      // Dépenses
      operationalExpenses: 0,
      fixedExpenses: 0,
      totalExpenses: 0,
      // Revenus
      restaurantRevenue: 0,
      hotelRevenue: 0,
      totalRevenue: 0,
      // Bénéfices
      profit: 0,
      profitChartOptions: {
        chart: {
          type: "line",
          height: 350,
        },
        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        },
      },
      profitChartSeries: [
        {
          name: "Profit",
          data: [400, 700, 800, 1200, 1500, 1800, 2200],
        },
      ],
    };
  },
  methods: {
    formatCurrency(value) {
      return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    },
  },
};
</script>

<style scoped>
.pa-4 {
  padding: 16px !important;
}
.rounded-lg {
  border-radius: 12px !important;
}
.elevation-12 {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}
.text-subtitle-1 {
  color: #333 !important;
}
</style>
