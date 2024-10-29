<template>
  <v-container>
    <!-- Titre du Dashboard -->
    <v-row>
      <v-col cols="12" class="text-h4 text-center mb-4">Tableau de Bord des Investissements</v-col>
    </v-row>

    <!-- Informations du Projet -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="info-card" outlined>
          <v-card-title>
            <v-icon class="mr-2" color="blue">mdi-cash</v-icon>
            Montant Total du Projet
          </v-card-title>
          <v-card-text class="text-h5">{{ totalProjectAmount.toLocaleString() }} G</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="info-card" outlined>
          <v-card-title>
            <v-icon class="mr-2" color="green">mdi-account-cash</v-icon>
            Montant Collecté
          </v-card-title>
          <v-card-text class="text-h5">{{ totalCollected.toLocaleString() }} G</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="info-card" outlined>
          <v-card-title>
            <v-icon class="mr-2" color="green">mdi-account-cash</v-icon>
            Votre Investissement
          </v-card-title>
          <v-card-text class="text-h5">{{ totalCollectedByUser.toLocaleString() }} G</v-card-text>
        </v-card>
      </v-col>
     
      <!-- <v-col cols="12" md="4">
        <v-card class="info-card" outlined>
          <v-card-title>
            <v-icon class="mr-2" color="orange">mdi-chart-line</v-icon>
            Rendement
          </v-card-title>
          <v-card-text class="text-h5">{{ rendement }} %</v-card-text>
        </v-card>
      </v-col> -->
    </v-row>

    <!-- Graphique de Progression de l'Investissement -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-icon class="mr-2" color="purple">mdi-chart-donut</v-icon>
            Progression des Investissements
          </v-card-title>
          <v-card-text>
            <apexchart
              type="radialBar"
              :options="chartOptions"
              :series="[investmentPercentage]"
              width="50%"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tableaux d'Investisseurs et de Projets -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>
            <v-icon class="mr-2" color="teal">mdi-account-group</v-icon>
            Liste des Investisseurs
          </v-card-title>
          <v-data-table
            :headers="investorsTableHeaders"
            :items="investors"
            item-key="name"
            class="elevation-1"
          >
          <template #[`item.nomPrenom`]="{ item }">
             {{ item.user.prenom}}  {{ item.user.nom }}
          </template>
          </v-data-table>
        </v-card>
      </v-col>    
     
      <v-col cols="12" md="8">
          <!-- Tableau des Projets -->
    <v-data-table
      :headers="projectHeaders"
      :items="userProjects"
      class="elevation-1"
      :items-per-page="5"
      item-key="id"
    >
      <template #[`item.profit`]="{ item }">
        <span>{{ calculateProfit(item) }} $</span>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon @click="showProjectDetails(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
      <!-- <template #[`item.montantInvesti`]="{}">
             {{ montantInvestiUser}}
          </template> -->
    </v-data-table>

    <!-- Modal de Détails du Projet -->
    <v-dialog v-model="projectDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">Détails du Projet - {{ selectedProject.name }}</v-card-title>
        <v-card-text>
          <p><strong>Montant Investi:</strong> {{ selectedProject.investment }} $</p>
          <p><strong>Statut:</strong> {{ selectedProject.status }}</p>
          <p><strong>Rendement:</strong> {{ selectedProject.return }} %</p>
          <p><strong>ROI:</strong> {{ selectedProject.roi }} %</p>
          <p><strong>Bénéfice:</strong> {{ calculateProfit(selectedProject) }} $</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="projectDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        </v-col>
     
    </v-row>
  </v-container>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      montantInvestiUser:[],
      totalCollectedByUser:0,     
      totalCollected:0,     
      totalProjectAmount: 0,
      totalInvested: 10000000, // Montant total collecté par tous les investisseurs
      rendement: 15, // Exemple de rendement
      totalInvestment: 50000,
      averageReturn: 8.5,
      totalROI: 12.3,
      totalProfit: 0,
      projectDialog: false,
      selectedProject: {},
      investissements: [],
      investisseursList: [], // Liste des investisseurs disponibles
      projetsList: [], // Liste des projets disponibles
      userProjects: [
        
      ],
      projectHeaders: [
      
        { text: "Projet", value: "projet.nomProjet" },
        { text: "Montant Collecté", value: "montantInvesti" },              
        { text: "Statut", value: "projet.statut" },
       // { text: "Rendement (%)", value: "return" },
       // { text: "ROI (%)", value: "roi" },
       // { text: "Bénéfice ($)", value: "profit" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      investors: [       
      ],
      projects: [
        {
          name: "Projet 1",
          description: "Description du projet 1",
          status: "En Cours",
          amount: 10000000,
        },
        {
          name: "Projet 2",
          description: "Description du projet 2",
          status: "Terminé",
          amount: 15000000,
        },
      ],
      investorsTableHeaders: [
        { text: "Investisseurs", value: "nomPrenom" },
              
      ],
      projectsTableHeaders: [
        { text: "Nom du Projet", value: "name" },
        { text: "Description", value: "description" },
        { text: "Statut", value: "status" },
        { text: "Montant (G)", value: "amount" },
      ],
      chartOptions: {
        chart: {
          type: "radialBar",
          offsetY: -20,
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            hollow: {
              size: "60%",
            },
            dataLabels: {
              value: {
                formatter: (val) => `${val}%`,
                color: "#20E647",
                fontSize: "22px",
                show: true,
              },
            },
          },
        },
        colors: ["#20E647"],
        labels: ["Investissement"],
      }
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
   
    investmentPercentage() {
      return ((this.totalCollected / this.totalProjectAmount) * 100).toFixed(2);
    },
  },

  async mounted() {
    // Charger la liste des investissements et des dépendances au montage du composant
    await this.fetchInvestissements();
    await this.fetchDependencies();
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),
    
    async fetchInvestissements() {
      try {
        const response = await this.$axios.get("investissement");
        this.userProjects = response.data;
        this.totalProjectAmount = response.data[0].projet.montantNecessaire
      const currentUserId = this.user.userId;
      
     this.userProjects.filter(investment => investment.investisseur.user._id === this.currentUserId);
        
        // Calcul du montant total collecté par tous les investisseurs
      this.totalCollected = this.userProjects.reduce((acc, investment) => acc + investment.montantInvesti, 0);

    // Calcul du montant total collecté par l'investisseur connecté
    this.totalCollectedByUser = this.userProjects
  .filter(investment => investment.investisseur.user._id === currentUserId)
  .reduce((acc, investment) => acc + investment.montantInvesti, 0);
  this.userProjects.filter(
        (investment) => investment.investisseur.user._id === this.currentUserId
      );
      } catch (error) {
        console.error(error);
      }
    },

     // Filtrer les investissements de l'utilisateur connecté
     filteredInvestments() {
      return this.userProjects.filter(
        (investment) => investment.investisseur.user._id === this.currentUserId
      );
    },
    async fetchDependencies() {
      try {
        const [investisseursResponse, projetsResponse] = await Promise.all([
          this.$axios.get("investisseur"),
          this.$axios.get("projet"),
        ]);
       this.investors = investisseursResponse.data;  
        
        this.projetsList = projetsResponse.data; 
              
      } catch (error) {
        console.error(error);
      }
    },

    showProjectDetails(project) {
      this.selectedProject = project;
      this.projectDialog = true;
    },
    calculateProfit(project) {
      return ((project.return / 100) * project.investment).toFixed(2);
    },
    calculateTotalProfit() {
      return this.userProjects.reduce(
        (acc, project) => acc + parseFloat(this.calculateProfit(project)),
        0
      );
    },
  },
};
</script>

<style scoped>
.info-card {
  text-align: center;
  border-radius: 8px;
}
.v-card-title {
  display: flex;
  align-items: center;
}
</style>
