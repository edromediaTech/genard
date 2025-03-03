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
            <v-btn color="success" class="ml-4" @click="validateAndFetchReport">
              Générer
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
    <v-row class="mx-4 my-4">
               <v-progress-circular
                    v-show="visible"
                    :size="50"
                    :width="3"
                    color="info"
                    indeterminate                    
                    /> 
                    <v-card class="mb-4">
                    <v-card-title  v-if="salesReport.length > 0">
                      Total des ventes : {{ totalVentes }} HTG
                    </v-card-title>  <!-- Bouton pour créer une commande -->                  
                  </v-card>           
              <v-spacer />
      
    <!-- Bouton et composant pour exporter en PDF -->
         <v-btn
              v-if="salesReport.length > 0"
             
              class="mx-2 mt-2"
              fab
              x-small
              color="primary"
              @click="generateReport"
            >
              PDF
              <client-only>
                <vue-html2pdf
                  ref="html2Pdf"
                  :show-layout="false"
                  :float-layout="true"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1000"
                  filename="Rapport de Vente"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="portrait"
                  pdf-content-width="800px"
                >
                  <template slot="pdf-content">
                    <vente-printer
                      :salesreport="salesReport"
                      :totalventes ="totalVentes"
                     :texte="texte"
                    />
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
 </v-row>
 </template>
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
          <tr v-for="item in salesReport" :key="item._id">
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

import ventePrinter from '~/components/ventePrinter.vue';
export default {
  components: { ventePrinter },
  middleware:"superviseur",
  data() {
    return {
      visible:false,
      texte:'',
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
  computed : {
    totalVentes() {
      return this.salesReport.reduce((sum, commande) => sum + commande.total, 0);
    },
  },
  mounted() {
    const today = new Date().toLocaleDateString('fr-CA');   
    this.filters.dateDebut =today
    this.filters.dateFin =today    
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
      const today = new Date().toLocaleDateString('fr-CA');; // Date du jour

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
      if (!date) return '';
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      return new Intl.DateTimeFormat('fr-FR', options).format(date);
    },

    async beforeDownload({ html2pdf, options, pdfContent }) {
      await html2pdf()
        .set(options)
        .from(pdfContent)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              "Page " + i + " sur " + totalPages,
              pdf.internal.pageSize.getWidth() * 0.88,
              pdf.internal.pageSize.getHeight() - 0.3
            );
          }
        })
        .save();
    },

  setTexte() {
  // Vérification de la présence des dates de début et de fin
  const dateDebut = this.filters.dateDebut ;
  const dateFin = this.filters.dateFin;

  // Si les dates sont identiques, on affiche juste une date, sinon on affiche un intervalle
  if (dateDebut && dateFin) {
    if (dateDebut === dateFin) {
      this.texte = 'Rapport ' + dateFin;
    } else {
      this.texte = 'Rapport allant du ' + dateDebut + ' au ' + dateFin;
    }
  }
  console.log(dateDebut)
},

    // setTexte(){
    //   if(this.filters.dateDebut === this.filters.dateFin)
    //   this.texte = 'Rapport '+  this.formatDate(this.filters.dateFin)
    //   else
    //   this.texte = 'Rapport allant du '+  this.formatDate(this.filters.dateDebut) +' au ' + this.formatDate(this.filters.dateFin)
    // },
   
    generateReport() {      
      this.$refs.html2Pdf.generatePdf();
      this.setTexte()
    },

  }
};
</script>

<style>
/* Cacher la section utilisée pour le PDF en mode normal */
.d-none {
  display: none;
}
</style>