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
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn color="primary" class="ml-4" @click="fetchReport">
              Générer
            </v-btn>
            <v-btn
              v-if="salesReport.length > 0"
              color="success"
              class="ml-2"
              @click="generatePDF"
            >
              <v-icon>mdi-printer</v-icon> Imprimer
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
          <template #[`item.total`]="{ item }">
            {{ formatCurrency(item.total) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Section invisible pour le PDF -->
    <div ref="reportContent" class="d-none">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1>{{ companyInfo.name }}</h1>
        <p>{{ companyInfo.address }}</p>
        <p>{{ companyInfo.phone }}</p>
        <h2>Rapport de vente</h2>
        <p>
          Période : {{ filters.dateDebut || "..." }} au {{ filters.dateFin || "..." }}
        </p>
      </div>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité vendue</th>
            <th>Prix</th>
            <th>Total des ventes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in salesReport" :key="item.id">
            <td>{{ item.nom }}</td>
            <td>{{ item.quantite }}</td>
            <td>{{ formatCurrency(item.prix) }}</td>
            <td>{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-container>
</template>

<script>
import html2pdf from "html2pdf.js";

export default {
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
      companyInfo: {
        name: "Nom de l'entreprise",
        address: "Adresse de l'entreprise",
        phone: "Téléphone de l'entreprise",
      },
    };
  },
  methods: {
    async fetchReport() {
      this.loading = true;
      try {
        const response = await this.$axios.get(
          `commandes/produits?dateDebut=${this.filters.dateDebut}&dateFin=${this.filters.dateFin}`
        );
        this.salesReport = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération du rapport :", error);
      } finally {
        this.loading = false;
      }
    },
    generatePDF() {
      const element = this.$refs.reportContent;
      const options = {
        margin: 10,
        filename: `rapport_vente_${this.filters.dateDebut}_to_${this.filters.dateFin}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(options).from(element).save();
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

<style>
/* Cacher la section utilisée pour le PDF en mode normal */
.d-none {
  display: none;
}
</style>
