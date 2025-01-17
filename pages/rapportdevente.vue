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
              :error-messages="dateDebutErrors"
              @input="clearErrors"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.dateFin"
              label="Date de fin"
              type="date"
              outlined
              dense
              :error-messages="dateFinErrors"
              @input="clearErrors"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn color="primary" class="ml-4" @click="validateAndFetchReport">
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
  middleware:"superviseur",
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
        name: "Bénédiction de l'Eternel",
        address: " Angle des Rues Bry & St-Charles, Fort-Liberté, Haïti",
        phone: "+509 3779-6764 / +509 3596-7838",
      },
      dateDebutErrors: [],
      dateFinErrors: [],
    };
  },
  mounted() {
    const today = new Date();
    this.filters.dateDebut = this.formatDate(today);
    this.filters.dateFin = this.formatDate(today);
  },
  methods: {
    validateDates() {
      this.dateDebutErrors = [];
      this.dateFinErrors = [];

      // Vérifier si les dates sont renseignées
      if (!this.filters.dateDebut) {
        this.dateDebutErrors.push("La date de début est requise.");
      }
      if (!this.filters.dateFin) {
        this.dateFinErrors.push("La date de fin est requise.");
      }

      // Vérifier si les dates sont valides
      const dateDebut = new Date(this.filters.dateDebut);
      const dateFin = new Date(this.filters.dateFin);
      const today = new Date(); // Date du jour

      if (isNaN(dateDebut.getTime())) {
        this.dateDebutErrors.push("La date de début est invalide.");
      }
      if (isNaN(dateFin.getTime())) {
        this.dateFinErrors.push("La date de fin est invalide.");
      }

      // Vérifier si la date de début est antérieure ou égale à la date de fin
      if (dateDebut > dateFin) {
        this.dateFinErrors.push("La date de fin doit être postérieure ou égale à la date de début.");
      }

      // Vérifier si la date de début n'est pas supérieure à la date du jour
      if (dateDebut > today) {
        this.dateDebutErrors.push("La date de début ne peut pas être supérieure à la date du jour.");
      }

      // Vérifier si la date de fin n'est pas supérieure à la date du jour
      if (dateFin > today) {
        this.dateFinErrors.push("La date de fin ne peut pas être supérieure à la date du jour.");
      }

      // Retourner true si aucune erreur n'est trouvée
      return this.dateDebutErrors.length === 0 && this.dateFinErrors.length === 0;
    },
    async validateAndFetchReport() {
      if (this.validateDates()) {
        await this.fetchReport();
      }
    },
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
    clearErrors() {
      this.dateDebutErrors = [];
      this.dateFinErrors = [];
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
};
</script>

<style>
/* Cacher la section utilisée pour le PDF en mode normal */
.d-none {
  display: none;
}
</style>