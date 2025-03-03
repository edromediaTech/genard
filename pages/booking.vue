<template>
    <v-container>
      <h1 class="mb-5 text-center">Réservation de Chambre</h1>
  
      <!-- Étape 1 : Choix des dates et sélection de la chambre -->
      <div v-if="step === 1">
        <h4 class="mb-4 text-center">Étape 1 : Sélection des Dates et Chambre</h4>
        <v-row class="mb-4">
          <v-col cols="12" md="4" sm="6">
            <v-menu
              v-model="checkInMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="checkInDate"
                  label="Date d'arrivée"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="checkInDate" @input="checkInMenu = false"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-menu
              v-model="checkOutMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="checkOutDate"
                  label="Date de départ"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="checkOutDate" @input="checkOutMenu = false"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-btn :disabled="checkInDate === null || checkOutDate === null" color="primary" @click="fetchAvailableRooms">
              <v-icon left>mdi-magnify</v-icon>Rechercher
            </v-btn>
          </v-col>
        </v-row>
  
        <!-- Tableau graphique des chambres par étage -->
        <v-expansion-panels v-if="availableRooms.length > 0" class="mt-5">
          <v-expansion-panel v-for="(floor, index) in groupedRooms" :key="index">
            <v-expansion-panel-header>Étage {{ floor.etage }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col v-for="room in floor.rooms" :key="room._id" cols="12" md="4" sm="6">
                  <v-card color="secondary lighten-4" elevation="5" class="pa-4" style="border-radius: 10px;">
                    <v-card-title class="text-h6">{{ room.roomNumber }} - {{ room.type }}</v-card-title>
                    <v-card-subtitle>Étage {{ room.etage }}</v-card-subtitle>
                    <v-card-text>
                      <p><strong>Prix :</strong> {{ room.price }} $ USD / nuit</p>
                      <v-checkbox v-model="selectedRoom" :value="room._id" label="Sélectionner cette chambre"></v-checkbox>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn small color="primary" @click="openRoomInfo(room)">Infos</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn v-if="selectedRoom" color="success" class="mt-4" @click="goToStep2">Suivant</v-btn>
      </div>
  
      <!-- Étape 2 : Saisie des informations du client et des occupants -->
      <div v-if="step === 2">
        <h4 class="mb-4 text-center">Étape 2 : Informations du Client et Occupants</h4>
        <v-form ref="bookingForm" v-model="formValid">
          <v-autocomplete
            v-model="selectedClientUser"
            :items="clientUsers"
            item-text="name"
            item-value="_id"
            label="Sélectionnez un client existant"
            clearable
            @change="onClientUserChange"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title>
                  Aucun client trouvé. Veuillez créer un nouveau client.
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
          <v-btn small color="primary" class="mb-4" @click="openAddClientDialog">Ajouter un nouveau client</v-btn>
          <v-text-field v-model="clientUser.name" label="Nom du client" required></v-text-field>
          <v-text-field v-model="clientUser.email" label="Email du client" required></v-text-field>
          <v-text-field v-model="clientUser.phoneNumber" label="Numéro de téléphone" required></v-text-field>
          <h3 class="mb-4">Occupants supplémentaires</h3>
          <v-row v-for="(occupant, index) in occupants" :key="index">
            <v-col cols="12" md="4">
              <v-text-field v-model="occupant.name" label="Nom de l'occupant"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="occupant.age" label="Âge" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select v-model="occupant.gender" :items="['male', 'female', 'other']" label="Sexe"></v-select>
            </v-col>
            <v-col cols="12" md="1">
              <v-btn icon color="error" @click="removeOccupant(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn class="mb-4" @click="addOccupant">Ajouter un occupant</v-btn>
        </v-form>
        <v-btn color="warning" class="mr-2" @click="goBackToStep1">Précédent</v-btn>
        <v-btn color="success" @click="goToStep3">Suivant</v-btn>
      </div>
  
      <!-- Étape 3 : Impression de la feuille de réservation -->
      <div v-if="step === 3" class="printable-content">
        <h2 class="text-center">Étape 3 : Récapitulatif et Impression</h2>
        <v-card class="mb-4">
          <v-card-title>Résumé de la Réservation</v-card-title>
          <v-card-text>
            <p><strong>Chambre :</strong> {{ selectedRoomDetails.roomNumber }} - {{ selectedRoomDetails.type }}</p>
            <p><strong>Dates :</strong> {{ checkInDate }} à {{ checkOutDate }}</p>
            <p><strong>Client :</strong> {{ clientUser.name }} ({{ clientUser.email }})</p>
            <p><strong>Occupants :</strong></p>
            <ul>
              <li v-for="(occupant, index) in occupants" :key="index">
                {{ occupant.name }} ({{ occupant.age }} ans, {{ occupant.gender }})
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="printReservation">Imprimer</v-btn>
            <v-btn color="success" @click="confirmBooking">Confirmer la réservation</v-btn>
          </v-card-actions>
        </v-card>
        <v-btn color="warning" @click="goBackToStep2">Précédent</v-btn>
      </div>
  
      <!-- Popup pour les informations de la chambre -->
      <v-dialog v-model="roomInfoDialog" max-width="600px">
        <v-card>
          <v-card-title>Informations de la Chambre</v-card-title>
          <v-card-text>
            <p><strong>Numéro :</strong> {{ selectedRoomDetails.roomNumber }}</p>
            <p><strong>Type :</strong> {{ selectedRoomDetails.type }}</p>
            <p><strong>Étage :</strong> {{ selectedRoomDetails.etage }}</p>
            <p><strong>Prix par nuit :</strong> {{ selectedRoomDetails.price }} $ USD</p>
            <p><strong>Disponible :</strong> {{ selectedRoomDetails.isAvailable ? 'Oui' : 'Non' }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="roomInfoDialog = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Popup pour ajouter un nouveau client -->
      <v-dialog v-model="addClientDialog" max-width="600px">
        <v-card>
          <v-card-title>Ajouter un Nouveau Client</v-card-title>
          <v-card-text>
            <v-form ref="addClientForm" v-model="addClientFormValid">
              <v-text-field v-model="newClient.name" label="Nom complet" required></v-text-field>
              <v-text-field v-model="newClient.email" label="Email" required></v-text-field>
              <v-text-field v-model="newClient.password" label="Mot de passe" type="password" required></v-text-field>
              <v-select v-model="newClient.gender" :items="['male', 'female', 'other']" label="Sexe" required></v-select>
              <v-text-field v-model="newClient.nationalId" label="ID national" required></v-text-field>
              <v-text-field v-model="newClient.phoneNumber" label="Numéro de téléphone" required></v-text-field>
              <v-menu
                v-model="newClientDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="newClient.dateOfBirth"
                    label="Date de naissance"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="newClient.dateOfBirth" @input="newClientDateMenu = false"></v-date-picker>
              </v-menu>
              <v-text-field v-model="newClient.address.street" label="Rue" required></v-text-field>
              <v-text-field v-model="newClient.address.city" label="Ville" required></v-text-field>
              <v-text-field v-model="newClient.address.state" label="État/Province" required></v-text-field>
              <v-text-field v-model="newClient.address.postalCode" label="Code postal" required></v-text-field>
              <v-text-field v-model="newClient.address.country" label="Pays" required></v-text-field>
              <v-text-field v-model="newClient.discount" label="Réduction (%)" type="number" min="0" max="100"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="addClientDialog = false">Annuler</v-btn>
            <v-btn color="success" @click="saveNewClient">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        step: 1,
        checkInDate: null,
        checkOutDate: null,
        checkInMenu: false,
        checkOutMenu: false,
        availableRooms: [],
        groupedRooms: [],
        selectedRoom: null,
        selectedRoomDetails: {},
        clientUsers: [],
        selectedClientUser: null,
        clientUser: {
          name: '',
          email: '',
          phoneNumber: ''
        },
        occupants: [],
        formValid: false,
        roomInfoDialog: false,
        addClientDialog: false,
        newClient: {
          name: '',
          email: '',
          password: '',
          gender: '',
          nationalId: '',
          phoneNumber: '',
          dateOfBirth: null,
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          discount: 0
        },
        newClientDateMenu: false,
        addClientFormValid: false
      };
    },
    async created() {
      await this.fetchClientUsers();
    },

    methods: {
      async fetchAvailableRooms() {
        this.visible = true
        try {
          const response = await this.$axios.get('/rooms', {
            params: { checkInDate: this.checkInDate, checkOutDate: this.checkOutDate }
          });
          this.availableRooms = response.data.rooms.filter(room => room.isAvailable);
  
          // Regrouper les chambres par étage
          const grouped = {};
          this.availableRooms.forEach(room => {
            if (!grouped[room.etage]) {
              grouped[room.etage] = { etage: room.etage, rooms: [] };
            }
            grouped[room.etage].rooms.push(room);
          });
          this.groupedRooms = Object.values(grouped);
        } catch (error) {
          console.error('Erreur lors de la récupération des chambres disponibles', error);
        }
         this.visible = false
      },

      async fetchClientUsers() {
        try {
          const response = await this.$axios.get('/clientUsers');
          this.clientUsers = response.data.users;
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs', error);
        }
      },

      openRoomInfo(room) {
        this.selectedRoomDetails = room;
        this.roomInfoDialog = true;
      },

      onClientUserChange(clientUserId) {
        if (clientUserId) {
          const selectedUser = this.clientUsers.find(user => user._id === clientUserId);
          this.clientUser = { ...selectedUser };
        } else {
          this.clientUser = { name: '', email: '', phoneNumber: '' };
        }
      },

      addOccupant() {
        this.occupants.push({ name: '', age: null, gender: '' });
      },

      removeOccupant(index) {
        this.occupants.splice(index, 1);
      },
      
      goToStep2() {
        if (!this.selectedRoom) {
          alert('Veuillez sélectionner une chambre.');
          return;
        }
        this.selectedRoomDetails = this.availableRooms.find(room => room._id === this.selectedRoom);
        this.step = 2;
      },
      goBackToStep1() {
        this.step = 1;
      },
      goToStep3() {
        if (!this.$refs.bookingForm.validate()) {
          alert('Veuillez remplir tous les champs requis.');
          return;
        }
        this.step = 3;
      },
      goBackToStep2() {
        this.step = 2;
      },
      printReservation() {
        window.print();
      },
      async confirmBooking() {
        try {
          const bookingData = {
            user: this.clientUser,
            room: this.selectedRoom,
            checkInDate: this.checkInDate,
            checkOutDate: this.checkOutDate,
            occupants: this.occupants
          };
           await this.$axios.post('/bookings', bookingData);
          
          alert('Réservation confirmée avec succès !');
          this.resetForm();
        } catch (error) {
          console.error('Erreur lors de la confirmation de la réservation', error);
        }
      },
     
      resetForm() {
        this.step = 1;
        this.checkInDate = null;
        this.checkOutDate = null;
        this.availableRooms = [];
        this.groupedRooms = [];
        this.selectedRoom = null;
        this.selectedRoomDetails = {};
        this.clientUser = { name: '', email: '', phoneNumber: '' };
        this.occupants = [];
      },
      openAddClientDialog() {
        this.newClient = {
          name: '',
          email: '',
          password: '',
          gender: '',
          nationalId: '',
          phoneNumber: '',
          dateOfBirth: null,
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          discount: 0
        };
        this.addClientDialog = true;
      },
      async saveNewClient() {
        if (!this.$refs.addClientForm.validate()) {
          alert('Veuillez remplir tous les champs requis.');
          return;
        }
        try {
          const response = await this.$axios.post('/users', this.newClient);
          this.clientUsers.push(response.data.user);
          this.selectedClientUser = response.data.user._id;
          this.onClientUserChange(this.selectedClientUser);
          this.addClientDialog = false;
        } catch (error) {
          console.error('Erreur lors de la création du client', error);
        }
      }
    }
  };
  </script>
  
  <!-- <style scoped>
  .v-card {
    transition: transform 0.3s ease;
  }
  .v-card:hover {
    transform: scale(1.05);
  }
  </style> -->