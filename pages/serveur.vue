<template>
    <v-container>
      <!-- Ajouter un nouveau serveur -->
      <v-btn color="primary" class="mb-4" @click="isEditing = false; clearForm()">Ajouter un serveur</v-btn>
  
      <!-- Formulaire de serveur -->
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-row>
          <!-- Nom du serveur -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="serveur.nom"
              label="Nom du serveur"
              required
            ></v-text-field>
          </v-col>
  
          <!-- Tables attribuées -->
          <v-col cols="12" sm="6">
            <v-select
              v-model="serveur.tablesAttribuees"
              :items="tablesOptions"
              label="Tables attribuées"
              multiple
              
              required
            ></v-select>
          </v-col>
  
          <!-- Commandes servies -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="serveur.performances.commandesServies"
              label="Commandes servies"
              type="number"
            ></v-text-field>
          </v-col>
  
          <!-- Temps moyen -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="serveur.performances.tempsMoyen"
              label="Temps moyen (en minutes)"
              type="number"
            ></v-text-field>
          </v-col>
  
          <!-- Bouton de soumission -->
          <v-col cols="12">
            <v-btn :disabled="!valid" color="primary" @click="submitForm">
              {{ isEditing ? 'Modifier le serveur' : 'Ajouter le serveur' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
  
      <!-- Liste des serveurs -->
      <v-divider class="my-4"></v-divider>
      <v-data-table
        :headers="headers"
        :items="serveurs"
        item-key="id"
        class="elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon @click="editServeur(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="deleteServeur(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </template>
  
  ---
  
  ### **Script**
  
  ```javascript
  <script>
  export default {
    data() {
      return {
        valid: false,
        isEditing: false, // Mode édition
        serveur: {          
          nom: '',
          tablesAttribuees: [],
          performances: {
            commandesServies: 0,
            tempsMoyen: 0,
          },
        },
        headers: [
         
          { text: 'Nom', value: 'nom' },
          { text: 'Tables Attribuées', value: 'tablesAttribuees' },
          { text: 'Commandes Servies', value: 'performances.commandesServies' },
          { text: 'Temps Moyen (min)', value: 'performances.tempsMoyen' },
          { text: 'Actions', align: 'end', value: 'actions' },
        ],
        serveurs: [], // Liste des serveurs
        tablesOptions: [], // Liste des tables disponibles
      };
    },
    // Charger les données lors du montage
    async created() {
      await this.fetchServeurs();
      await this.fetchTables();
    },
    methods: {
      // Soumettre le formulaire
      async submitForm() {
        try {
        
          if (this.isEditing) {
            // Modifier un serveur
            await this.$axios.put(`/serveurs/${this.serveur.id}`, this.serveur);
          } else {
            // Ajouter un nouveau serveur
            await this.$axios.post('/serveurs', this.serveur);
          }
          this.clearForm();
          this.fetchServeurs();
        } catch (error) {
          console.error('Erreur lors de la soumission du serveur:', error);
        }
      },
      // Récupérer tous les serveurs
      async fetchServeurs() {
        try {
          const response = await this.$axios.get('/serveurs');
          this.serveurs = response.data;
          
        } catch (error) {
          console.error('Erreur lors de la récupération des serveurs:', error);
        }
      },
      // Récupérer toutes les tables
      async fetchTables() {
        try {
          const response = await this.$axios.get('/tables');
          this.tablesOptions = response.data.map((table) => ({
            text: `Table ${table.numero}`,
            value: table._id,
          }));
        } catch (error) {
          console.error('Erreur lors de la récupération des tables:', error);
        }
      },
      // Réinitialiser le formulaire
      clearForm() {
        this.serveur = {
          id: null,
          nom: '',
          tablesAttribuees: [],
          performances: {
            commandesServies: 0,
            tempsMoyen: 0,
          },
        };
        this.valid = false;
        this.isEditing = false;
      },
      // Activer le mode édition
      editServeur(item) {
        this.serveur = { ...item };
        this.isEditing = true;
      },
      // Supprimer un serveur
      async deleteServeur(id) {
        try {
          await this.$axios.delete(`/serveurs/${id}`);
          this.fetchServeurs();
        } catch (error) {
          console.error('Erreur lors de la suppression du serveur:', error);
        }
      },
    },
  };
  </script>
  