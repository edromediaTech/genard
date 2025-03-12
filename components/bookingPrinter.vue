<template>
    <div class="body">
      <div class="card-body">
        <div class="header">
          <div>
            <center><img src='images/logoNG.pNg' width="50" class="imag"></center>
          </div>
          <div class="entete">
            <h4 class="hotel-title">Hôtel Bénédiction de l'Eternel</h4>
            <center><h5 class="hotel-location">Rue Bory & St-Charles, Fort-Liberté, Haiti</h5></center>
          </div>
        </div>
        <center><h5 class="ecole">Fiche de Réservation</h5></center>
  
        <!-- Détails de la réservation -->
        <v-simple-table id="pdf-container" class="theme--light no-dark-theme table-styles">
          <thead>
            <tr>
              <th>Chambre</th>
              <th>Type de Chambre</th>
              <th>Date d'Arrivée</th>
              <th>Date de Départ</th>
              <th>Prix Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="page-break-inside: avoid">
              <td>{{ booking.roomNumber }}</td>
              <td>{{ booking.roomType }}</td>
              <td>{{ booking.checkInDate }}</td>
              <td>{{ booking.checkOutDate }}</td>
              <td>{{ booking.totalPrice }}</td>
            </tr>
          </tbody>
        </v-simple-table>
  
        <!-- Section pour les occupants -->
        <div class="occupants-section">
          <h3 class="section-title mb-2">Occupants supplémentaires</h3>
          <v-simple-table class="theme--light no-dark-theme table-styles">
            <thead>
              <tr>
                <th>Nom de l'occupant</th>
                <th>Âge</th>
                <th>No identité</th>
                <th>Sexe</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(occupant, index) in booking.occupants" :key="index">
                <td>{{ occupant.name }}</td>
                <td>{{ occupant.age }}</td>
                <td>{{ occupant.identity }}</td>
                <td>{{ occupant.gender }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </div>
  
        <!-- Informations du client -->
        <div class="client-info">
          <h4 class="section-title mb-2">Informations du Client</h4>
          <v-row>
            <v-col cols="12" md="4">
              <p><strong>Client :</strong> {{ booking.clientName }}</p>
            </v-col>
            <v-col cols="12" md="4">
              <p><strong>Email :</strong> {{ booking.clientEmail }}</p>
            </v-col>
            <v-col cols="12" md="4">
              <p><strong>Tél :</strong> {{ booking.clientPhone }}</p>
            </v-col>
          </v-row>
        </div>
  
        <!-- Clause de non-remboursement -->
        <div class="clause-section">
          <h4 class="section-title mb-2">Clause de Non-Remboursement</h4>
          <p>
            En confirmant cette réservation, le client reconnaît et accepte que toute réservation confirmée est
            <strong>non remboursable</strong>. Aucun remboursement ne sera accordé après confirmation de la réservation.
          </p>
        </div>
  
        <!-- Espace pour la signature -->
        <div class="signature-section">
          <h4 class="section-title mb-2">Signature du Client</h4>
          <v-row class="signature-box">
            <v-col cols="12" md="6">
              <p>Signature : ___________________________</p>
            </v-col>
            <v-col cols="12" md="6">
              <p>Date : ___________________________</p>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      booking: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        // Exemple de données pour la réservation
         // Liste des occupants avec leurs détails
        
      };
    },
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');
  
  .body {
    margin: 20px; /* Réduit la marge globale */
    font-family: 'Lato', sans-serif;
  }
  
  .no-dark-theme {
    background-color: #f4f6f9 !important;
    color: #333 !important;
  }
  
  .table-styles {
    width: 100%;
    margin-top: 10px; /* Réduit la marge supérieure */
    border-collapse: collapse;
  }
  
  th,
  td {
    padding: 8px; /* Réduit le padding des cellules */
    text-align: left;
    border: 1px solid #e0e0e0;
    color: #0a0909;
    font-family: 'Lato', sans-serif;
  }
  
  th {
    background-color: #2c3e50;
    color: #ffffff;
    font-weight: 700;
  }
  
  .hotel-title {
    font-size: 24px; /* Taille de police réduite */
    color: #2c3e50;
    font-weight: 700;
    font-family: 'Playfair Display', serif;
  }
  
  .hotel-location {
    font-size: 16px; /* Taille de police réduite */
    color: #7f8c8d;
    font-family: 'Lato', sans-serif;
  }
  
  .entete {
    text-align: center;
    border-bottom: 2px solid #7f8c8d;
    margin-top: 5px; /* Réduit la marge supérieure */
    padding-bottom: 5px; /* Réduit le padding inférieur */
  }
  
  .ecole {
    font-size: 20px; /* Taille de police réduite */
    color: #34495e;
    margin-top: 15px; /* Réduit la marge supérieure */
    font-family: 'Playfair Display', serif;
  }
  
  .section-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 10px; /* Réduit la marge inférieure */
    font-family: 'Playfair Display', serif;
  }
  
  .clause-section,
  .client-info,
  .signature-section,
  .occupants-section {
    background-color: #ffffff;
    padding: 15px; /* Réduit le padding */
    border-radius: 8px;
    margin-top: 20px; /* Réduit la marge supérieure */
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1); /* Ombre plus légère */
  }
  
  .signature-box {
    padding: 10px; /* Réduit le padding */
    border: 2px dashed #95a5a6;
    margin-top: 5px; /* Réduit la marge supérieure */
    background-color: #f9f9f9;
  }
  
  .signature-box p {
    font-size: 14px; /* Taille de police réduite */
    color: #7f8c8d;
    margin: 5px 0; /* Réduit la marge */
    font-family: 'Lato', sans-serif;
  }
  
  .occupants-section .v-row {
    margin-bottom: 10px; /* Réduit la marge inférieure */
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px; /* Réduit le padding inférieur */
  }
  
  .occupants-section .v-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .occupants-section p {
    font-size: 14px; /* Taille de police réduite */
    color: #2c3e50;
    margin: 0;
    font-family: 'Lato', sans-serif;
  }
  </style>