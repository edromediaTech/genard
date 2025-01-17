<template>
  <v-container>
    <v-btn color="primary" class="mb-4" @click="openAddModal">Créer une Commande</v-btn>
    <v-btn color="primary" class="mb-4" @click="toggleShowAllCommands">
      {{ showAllCommands ? "Commandes du jour" : "Toutes les commandes" }}
    </v-btn>
    <v-spacer></v-spacer>

    <v-card class="mb-4">
      <v-card-title>
        Total des ventes : {{ totalVentes }} HTG
      </v-card-title>
    </v-card>

    <v-card>
      <v-card-title>Liste des Commandes</v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredCommandes"
        item-value="id"
        dense
        item-key="_id"
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon small title="Details de la Commande" @click="viewDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteArticle(item._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Modals et autres éléments -->
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      showAllCommands: false, // Par défaut, afficher les commandes du jour
      commandes: [], // Liste complète des commandes
      headers: [
        { text: "Client", value: "client" },
        { text: "Serveur", value: "serveur" },
        { text: "Statut", value: "statut" },
        { text: "Total (HTG)", value: "total" },
        { text: "Date", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    filteredCommandes() {
      if (!this.showAllCommands) {
        // Afficher uniquement les commandes du jour
        const today = new Date().toLocaleDateString('fr-CA');
        return this.commandes.filter(commande => {
          const commandeDate = new Date(commande.createdAt).toLocaleDateString('fr-CA');
          return commandeDate === today;
        });
      } else {
        // Afficher toutes les commandes
        return this.commandes;
      }
    },
    totalVentes() {
      return this.filteredCommandes.reduce((sum, commande) => sum + commande.total, 0);
    },
  },
  async mounted() {
    await this.fetchCommandes();
  },
  methods: {
    toggleShowAllCommands() {
      this.showAllCommands = !this.showAllCommands;
    },
    async fetchCommandes() {
      try {
        const { data } = await this.$axios.get('/commandes');
        this.commandes = data.map(commande => {
          if (commande.total === 0) {
            commande.total = commande.articles.reduce((sum, article) => {
              return sum + (article.produit.prix * article.quantite);
            }, 0);
          }
          return {
            ...commande,
            serveur: commande.serveur.prenom,
            client: commande.client,
            statut: commande.statut,
            total: commande.total,
            createdAt: commande.createdAt,
          };
        });
      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
      }
    },
  },
};
</script>