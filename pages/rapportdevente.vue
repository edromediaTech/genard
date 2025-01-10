<template>
    <v-container>
      <v-card>
        <v-card-title>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.dateDebut"
                label="Date de début"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.dateFin"
                label="Date de fin"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn color="primary" class="ml-4" @click="fetchReport">
                Générer le rapport
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="salesReport"
            :loading="loading"
            loading-text="Chargement du rapport de vente..."
            dense
            outlined
          >
            <template #top>
              <v-toolbar flat>
                <v-toolbar-title>Rapport de vente</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>
            <template #[`item.total`]="{ item }">
              {{ formatCurrency(item.total) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
  
      <!-- Section des graphiques -->
      <v-card class="mt-5">
        <v-card-title>Statistiques des ventes</v-card-title>
        <v-card-text>
          <apexchart type="bar" :options="chartOptions" :series="chartSeries" />
        </v-card-text>
      </v-card>
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
        filters: {
          dateDebut: "",
          dateFin: "",
        },
        salesReport: [],
        loading: false,
        headers: [
          { text: "Produit", value: "nom" },
          { text: "Quantité vendue", value: "quantite" },
          { text: "Prix", value: "prix" },
          { text: "Total des ventes", value: "total" },
        ],
        chartOptions: {
          chart: {
            id: "sales-chart",
            toolbar: {
              show: true,
            },
          },
          xaxis: {
            categories: [], // Dynamically filled
          },
          title: {
            text: "Ventes par produit",
            align: "center",
          },
        },
        chartSeries: [
          {
            name: "Quantité vendue",
            data: [], // Dynamically filled
          },
        ],
      };
    },
    methods: {
      async fetchReport() {
        this.loading = true;
        try {
          // Appel à l'API
          const response = await this.$axios.get(
            `commandes/produits?dateDebut=${this.filters.dateDebut}&dateFin=${this.filters.dateFin}`
          );
  
          // Mise à jour du tableau
          this.salesReport = response.data;
  
          // Préparer les données pour les graphiques
          this.chartOptions.xaxis.categories = this.salesReport.map(
            (item) => item.nom
          );
          this.chartSeries[0].data = this.salesReport.map((item) => item.quantite);
        } catch (error) {
          console.error("Erreur lors de la récupération du rapport :", error);
        } finally {
          this.loading = false;
        }
      },
      formatCurrency(value) {
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "HTG",
        }).format(value);
      },
    },
  };
  </script>
  