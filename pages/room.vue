<template>
    <v-container>
      <h1 class="mb-5">Gestion des Chambres</h1>
  
      <!-- Formulaire pour ajouter ou modifier une chambre -->
      <v-dialog v-model="dialog" max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" @click="openDialog(null)">
            Ajouter une chambre
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ editedIndex === null ? 'Ajouter' : 'Modifier' }} une chambre</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field v-model="editedRoom.roomNumber" label="Numéro de chambre" required></v-text-field>
              <v-select v-model="editedRoom.type" :items="['single', 'double', 'suite']" label="Type de chambre" required></v-select>
              <v-select v-model="editedRoom.etage" :items="[1, 2, 3]" label="Etage" required></v-select>
              <v-text-field v-model="editedRoom.price" label="Prix par nuit" type="number" required></v-text-field>
              <v-checkbox v-model="editedRoom.isAvailable" label="Disponible"></v-checkbox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
            <v-btn color="blue darken-1" text :disabled="!valid" @click="saveRoom">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Liste des chambres -->
      <v-data-table :headers="headers" :items="rooms" class="elevation-1">
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteRoom(item._id)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-container>
  </template>
  
  <script>

  
  export default {
    data() {
      return {
        dialog: false,
        valid: true,
        rooms: [],
        editedIndex: null,
        editedRoom: {
          roomNumber: '',
          type: '',
          etage: null,
          price: 0,
          isAvailable: true
        },
        headers: [
          { text: 'Numéro', value: 'roomNumber' },
          { text: 'Type', value: 'type' },
          { text: 'Prix', value: 'price' },
          { text: 'Etage', value: 'etage' },
          { text: 'Disponible', value: 'isAvailable' },
          { text: 'Actions', value: 'actions', sortable: false }
        ]
      };
    },
    async created() {
      await this.fetchRooms();
    },
    methods: {
      async fetchRooms() {
        try {
          const response = await this.$axios.get('/rooms');
          this.rooms = response.data.rooms;
        } catch (error) {
          console.error('Erreur lors de la récupération des chambres', error);
        }
      },
      openDialog(room) {
        if (room) {
          this.editedIndex = room._id;
          this.editedRoom = { ...room };
        } else {
          this.editedIndex = null;
          this.editedRoom = {
            roomNumber: '',
            type: '',
            price: 0,
            etage: null,
            isAvailable: true
          };
        }
        this.dialog = true;
      },
      closeDialog() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      async saveRoom() {
        try {
          if (this.editedIndex === null) {
            // Créer une nouvelle chambre
            const response = await this.$axios.post('/rooms', this.editedRoom);
            this.rooms.push(response.data.room);
          } else {
            // Mettre à jour une chambre existante
            const response = await this.$axios.put('/rooms/'+this.editedIndex, this.editedRoom);
            const index = this.rooms.findIndex(room => room._id === this.editedIndex);
            if (index !== -1) {
              this.rooms.splice(index, 1, response.data.room);
            }
          }
          this.closeDialog();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la chambre', error);
        }
      },
      async deleteRoom(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
          try {
            await this.$axios.delete('/rooms/'+id);
            this.rooms = this.rooms.filter(room => room._id !== id);
          } catch (error) {
            console.error('Erreur lors de la suppression de la chambre', error);
          }
        }
      }
    }
  };
  </script>