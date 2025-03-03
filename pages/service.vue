<template>
  <v-container>
    <v-card>
      <v-card-title>
        Gestion des Services
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openDialog()">Nouveau Service</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="services" class="elevation-1">
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteService(item._id)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Formulaire pour ajouter/modifier un service -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ form._id ? 'Modifier Service' : 'Ajouter Service' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="form.name" label="Nom du Service" required></v-text-field>
            <v-textarea v-model="form.description" label="Description" required></v-textarea>
            <v-select
              v-model="form.category"
              :items="['restauration', 'conference', 'evenement', 'autre']"
              label="Catégorie"
              required
            ></v-select>
            <v-text-field v-model="form.price" label="Prix" type="number" required></v-text-field>
            <v-text-field v-model="form.duration" label="Durée (heures)" type="number"></v-text-field>
            <v-text-field v-model="form.capacity" label="Capacité (personnes)" type="number"></v-text-field>
            <v-text-field v-model="form.images" label="Images (URLs séparées par des virgules)"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="green" text @click="saveService">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      services: [],
      dialog: false,
      form: {},
      headers: [
        { text: 'Nom', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Catégorie', value: 'category' },
        { text: 'Prix', value: 'price' },
        { text: 'Durée (heures)', value: 'duration' },
        { text: 'Capacité', value: 'capacity' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  mounted() {
    this.fetchServices();
  },
  methods: {
    // Récupérer tous les services
   async fetchServices() {
  try {
    const res = await this.$axios.get('service');
    console.log('Réponse de l\'API:', res.data);

    // Vérifie si 'services' est un tableau
    if (Array.isArray(res.data.services)) {
      this.services = res.data.services; // Assigne correctement les données au tableau
    } else {
      console.error('Les services ne sont pas un tableau:', res.data.services);
      this.services = []; // Assigner un tableau vide par défaut
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error);
    this.services = []; // En cas d'erreur, assigner un tableau vide
  }
},


    // Ouvrir le dialogue pour ajouter ou modifier un service
    openDialog(service = {}) {
      this.form = { ...service }; // Copier les données du service sélectionné
      this.dialog = true;
    },

    // Fermer le dialogue
    closeDialog() {
      this.dialog = false;
      this.form = {}; // Réinitialiser le formulaire
    },

    // Enregistrer un service (ajout ou modification)
    async saveService() {
      try {
        if (this.form._id) {
          // Mise à jour d'un service existant
          await this.$axios.put('service/'+this.form._id, this.form);
        } else {
          // Création d'un nouveau service
          await this.$axios.post('service', this.form);
        }
        this.closeDialog();
        this.fetchServices(); // Actualiser la liste des services
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du service :', error);
      }
    },

    // Supprimer un service
    async deleteService(id) {
      try {
        await this.$axios.delete('service/'+id);
        this.fetchServices(); // Actualiser la liste des services
      } catch (error) {
        console.error('Erreur lors de la suppression du service :', error);
      }
    }
  }
};
</script>
