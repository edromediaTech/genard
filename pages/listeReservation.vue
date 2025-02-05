<template>
    <v-container>
      <h1 class="mb-5">Liste des Réservations pour une Période</h1>
  
      <!-- Formulaire pour sélectionner la période -->
      <v-row>
        <v-col cols="6">
          <v-menu
            v-model="startDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="startDate"
                label="Date de début"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="startDate" @input="startDateMenu = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="6">
          <v-menu
            v-model="endDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="endDate"
                label="Date de fin"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="endDate" @input="endDateMenu = false"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-btn color="primary" @click="fetchBookings">Rechercher</v-btn>
  
      <!-- Tableau des réservations -->
      <v-data-table
        v-if="bookings.length > 0"
        :headers="headers"
        :items="bookings"
        class="elevation-1 mt-5"
      >
        <template #[`item.clientUser`]="{ item }">
          {{ item.clientUser.name }} ({{ item.user.email }})
        </template> 
         <template #[`item.room`]="{ item }">
          {{ item.room.roomNumber }} - {{ item.room.type }}
        </template>
        <template #[`item.totalPrice`]="{ item }">
          {{ item.totalPrice }} $ USD
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn small color="info" @click="viewBookingDetails(item)">Détails</v-btn>
        </template> 
      </v-data-table>
  
      <!-- Popup pour les détails de la réservation -->
      <v-dialog v-model="bookingDetailsDialog" max-width="800px">
        <v-card>
          <v-card-title>Détails de la Réservation</v-card-title>
          <v-card-text>
            <p><strong>Client :</strong> {{ selectedBooking.clientUser.name }} ({{ selectedBooking.clientUser.email }})</p>
            <p><strong>Chambre :</strong> {{ selectedBooking.room.roomNumber }} - {{ selectedBooking.room.type }}</p>
            <p><strong>Dates :</strong> {{ selectedBooking.checkInDate }} à {{ selectedBooking.checkOutDate }}</p>
            <p><strong>Prix total :</strong> {{ selectedBooking.totalPrice }} $ USD</p>
            <p><strong>Statut :</strong> {{ selectedBooking.status }}</p>
            <p><strong>Occupants :</strong></p>
            <ul>
              <li v-for="(occupant, index) in selectedBooking.occupants" :key="index">
                {{ occupant.name }} ({{ occupant.age }} ans, {{ occupant.gender }})
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="bookingDetailsDialog = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
 
  
  export default {
    data() {
      return {
        startDate: null,
        endDate: null,
        startDateMenu: false,
        endDateMenu: false,
        bookings: [],
        headers: [
          { text: 'Client', value: 'user' },
          { text: 'Chambre', value: 'room' },
          { text: 'Date d\'arrivée', value: 'checkInDate' },
          { text: 'Date de départ', value: 'checkOutDate' },
          { text: 'Prix total', value: 'totalPrice' },
          { text: 'Actions', value: 'actions', sortable: false }
        ],
        bookingDetailsDialog: false,
        selectedBooking: {}
      };
    },
    methods: {
      async fetchBookings() {
        if (!this.startDate || !this.endDate) {
          alert('Veuillez sélectionner une date de début et une date de fin.');
          return;
        }
        try {
          const response = await this.$axios.get('/bookings', {
            params: { startDate: this.startDate, endDate: this.endDate }
          });
          console.log(this.bookings)
          this.bookings = response.data.bookings.map(booking => ({
            ...booking,
            checkInDate: new Date(booking.checkInDate).toLocaleDateString(),
            checkOutDate: new Date(booking.checkOutDate).toLocaleDateString()
          }));
        } catch (error) {
          console.error('Erreur lors de la récupération des réservations', error);
        }
      },
      viewBookingDetails(booking) {
        this.selectedBooking = booking;
        this.bookingDetailsDialog = true;
      }
    }
  };
  </script>
  
  <style scoped>
  .v-data-table {
    margin-top: 20px;
  }
  </style>