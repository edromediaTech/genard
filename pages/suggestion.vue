<template>
  <v-container>
    <v-card>
      <v-card-title class="headline">Gestion des Suggestions</v-card-title>
      <v-card-text>
        <!-- Formulaire de création d'une nouvelle suggestion -->
        <v-form @submit.prevent="createSuggestion">
          <v-autocomplete
            v-model="newSuggestion.sujet"
            label="Sujet"
            :items="['Financement', 'Projet', 'Administration', 'Reglements', 'Global', 'Autres']"
            required
          ></v-autocomplete>
          <v-textarea
            v-model="newSuggestion.message"
            label="Message"
            required
          ></v-textarea>
          <v-btn type="submit" color="primary">Créer la suggestion</v-btn>
        </v-form>

        <!-- Liste des suggestions -->
        <v-list two-line>
          <v-subheader>Suggestions</v-subheader>
          <v-list-item
            v-for="suggestion in suggestions"
            :key="suggestion._id"
            @click="selectSuggestion(suggestion)"
          >
            <v-list-item-content>
             
              <v-list-item-title>{{ suggestion.sujet }}</v-list-item-title>
              <v-list-item-subtitle>{{ suggestion.message }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ suggestion.expediteur.prenom }} {{ suggestion.expediteur.nom }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ suggestion.date }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn v-if="suggestion.expediteur._id === userId" icon @click.stop="deleteSuggestion(suggestion._id)">
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      suggestions: [],
      userId:null,
      newSuggestion: {
        sujet: '',
        message: '',
        expediteur:null
      },
    };
  },
  async fetch() {
    this.userId = localStorage.userId
    this.suggestions = await this.$axios.$get('suggestion');
    console.log(this.suggestions)
  },
  methods: {
    async createSuggestion() {
      this.newSuggestion.expediteur = localStorage.userId
      try {
        const response = await this.$axios.$post('suggestion', this.newSuggestion);
        this.suggestions.push(response); // Ajouter la nouvelle suggestion à la liste
        this.newSuggestion = { sujet: '', message: '' }; // Réinitialiser le formulaire
      } catch (error) {
        console.error('Erreur lors de la création de la suggestion:', error);
      }
    },
    async deleteSuggestion(id) {
    
      try {
        await this.$axios.$delete(`suggestion/${id}`);
        this.suggestions = this.suggestions.filter((suggestion) => suggestion._id !== id );
      } catch (error) {
        console.error('Erreur lors de la suppression de la suggestion:', error);
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  max-width: 800px;
  margin: auto;
}
.v-list-item {
  cursor: pointer;
}
</style>
