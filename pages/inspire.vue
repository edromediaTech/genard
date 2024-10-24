<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row justify="start" align="start">
      <v-col cols="12" sm="8" md="12">
        <Carousel></Carousel>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Carousel from "../components/carousel";

export default {
  components: { Carousel },
  data() {
    return {
      nb_ecole: [],
      ecole: [],
      ecoledis: [],
      donnees: [],
      sumEleve: "",
      sumfille: "",
      sumgarcon: "",
      sumEcole: "",
      sumEnseignant: "",
      page: 1,
      eleved: "",
      ecoled: "",
      visible: false,

      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [],
        },
      },
      legend: {
        show: true,
        position: top,
      },
      series: [
        {
          name: "2020-2021",
          data: [],
        },
      ],
      optionsl: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [],
        },
      },
      seriesel: [
        {
          name: "2023-2024",
          data: [],
        },
      ],

      seriesd: [],
      chartOptions: {
        labels: [],
      },
      seriesl: [],
      chartOptionsl: {
        labels: [],
      },

      education: "Les Directions Départementales d'Éducation (DDE)",
      education1:
        "La DDE est la structure déconcentrée du MENFP chargée de la planification et de la mise en œuvre des politiques sectorielles d’éducation et de la réalisation des opérations administratives dans les divisions territoriales.",
      education2:
        "Ainsi le décret-loi de mai 2005 fait du directeur départemental le premier superviseur de son département.",
    };
  },
  mounted() {},
  methods: {
    async getEcole() {
      this.visible = true;
      await this.$axios.get("ecole/").then((response) => {
        this.ecoles = response.data;
        this.sumEcole = response.data.length;
        this.visible = false;
      });
      this.getStatEcoleDis();
    },

    async getStatEcoleDis() {
      this.visible = true;
      await this.$axios.get("ecole/ecoped/count").then((response) => {
        this.ecoledis = response.data;
        this.visible = false;
      });
      this.get_data_chart();
      this.get_data_chart_donut();
    },

    async getEnseignant() {
      this.visible = true;
      await this.$axios.get("enseignant/nbEnseignant/").then((response) => {
        this.sumEnseignant = response.data.nbEnseignant;
      });

      this.visible = false;
    },
    async getEnseignants() {
      this.visible = true;
      await this.$axios.get("enseignant/").then((response) => {
        this.enseignants = response.data;
        console.log(this.enseignants);
        this.visible = false;
      });
    },

    async get_ecole() {
      this.visible = true;
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.authToken;
      await this.$axios.get("get-all-info").then((response) => {
        this.donnees = response.data;
        this.sumEleve = response.data.eleves.toString();
        this.sumEnseignant = response.data.enseignants.toString();
        // this.sumEcole = response.data.ecoles.toString()
        this.sumfille = response.data.filles.toString();
        this.sumgarcon = (response.data.eleves - response.data.filles).toString();
        this.ecoled = this.donnees.ecoledis;
        this.eleved = this.donnees.elevedis;
      });
      this.visible = false;
    },

    get_data_chart() {
      this.ecoledis.forEach((el) => {
        this.options.xaxis.categories.push(el.districtName);
        this.series[0].data.push(el.ecoleCount);
      });
    },

    get_data_chart_donut() {
      this.ecoledis.forEach((el) => {
        this.chartOptions.labels.push(el.districtName);
        this.seriesd.push(el.ecoleCount);
      });
    },
    get_data_chart_el() {
      this.eleved.forEach((el) => {
        this.optionsl.xaxis.categories.push(el.nom);
        this.seriesel[0].data.push(el.nb_eleve);
      });
    },

    get_data_chart_donut_el() {
      this.eleved.forEach((el) => {
        this.chartOptionsl.labels.push(el.nom);
        this.seriesl.push(el.nb_eleve);
      });
    },
  },
};
</script>
