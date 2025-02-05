<template>
    <v-container>
      <h1 class="mb-5">Gestion des Utilisateurs Clients</h1>
  
      <!-- Formulaire pour ajouter ou modifier un utilisateur -->
      <v-dialog v-model="dialog" max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" @click="openDialog(null)">
            Ajouter un utilisateur
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ editedIndex === null ? 'Ajouter' : 'Modifier' }} un utilisateur</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
                <v-row>
            <v-col cols="12"   sm="6"  md="12">
              <v-text-field v-model="editedUser.name" label="Nom complet" required></v-text-field>
            </v-col>
            <v-col cols="12"   sm="6"  md="6">
              <v-text-field v-model="editedUser.email" label="Email" required></v-text-field>
            </v-col>
            <v-col cols="12"   sm="6"  md="6">
              <v-text-field v-model="editedUser.password" label="Mot de passe" type="password" required></v-text-field>
            </v-col>
            <v-col cols="12"   sm="6"  md="6">
              <v-select v-model="editedUser.gender" :items="['male', 'female', 'other']" label="Sexe" required></v-select>
              </v-col>
              <v-col cols="12"   sm="6"  md="6">
              <v-text-field v-model="editedUser.nationalId" label="ID national" required></v-text-field>
              </v-col>
              <v-col cols="12"   sm="6"  md="6">
              <v-text-field v-model="editedUser.phoneNumber" label="Numéro de téléphone" required></v-text-field>
              </v-col>
              <v-col cols="12"   sm="6"  md="6">
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="editedUser.dateOfBirth"
                    label="Date de naissance"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="editedUser.dateOfBirth" @input="dateMenu = false"></v-date-picker>
              </v-menu>
              </v-col>
              <v-col cols="12"   sm="6"  md="4">
              <v-text-field v-model="editedUser.address.city" label="Ville" required></v-text-field> 
              </v-col>
              <v-col cols="12"   sm="6"  md="4">            
              <v-select v-model="editedUser.address.country" :items="countries" label="Pays" required></v-select>
              </v-col>
              <v-col cols="12"   sm="6"  md="4">
              <v-text-field v-model="editedUser.discount" label="Réduction (%)" type="number" min="0" max="100"></v-text-field>
              </v-col>
            </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
            <v-btn color="blue darken-1" text :disabled="!valid" @click="saveUser">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Liste des utilisateurs -->
      <v-data-table :headers="headers" :items="users" class="elevation-1">
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteUser(item._id)">mdi-delete</v-icon>
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
        users: [],
        editedIndex: null,
        editedUser: {
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
        dateMenu: false,
        headers: [
          { text: 'Nom', value: 'name' },
          { text: 'Email', value: 'email' },
          { text: 'Téléphone', value: 'phoneNumber' },
          { text: 'Réduction (%)', value: 'discount' },
          { text: 'Actions', value: 'actions', sortable: false }
        ],
        countries: [
          "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
          "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
          "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
          "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)",
          "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
          "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
          "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
          "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
          "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
          "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
          "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
          "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
          "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
          "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
          "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
          "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
          "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
          "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
          "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
          "Vietnam", "Yemen", "Zambia", "Zimbabwe"
        ]
      };
    },
    async created() {
      await this.fetchUsers();
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await this.$axios.get('/clientUsers');
          this.users = response.data.users;
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs', error);
        }
      },
      openDialog(user) {
        if (user) {
          this.editedIndex = user._id;
          this.editedUser = { ...user };
        } else {
          this.editedIndex = null;
          this.editedUser = {
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
        }
        this.dialog = true;
      },
      closeDialog() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      async saveUser() {
        try {
          if (this.editedIndex === null) {
            // Créer un nouvel utilisateur
            const response = await this.$axios.post('/clientUsers', this.editedUser);
            this.users.push(response.data.user);
          } else {
            // Mettre à jour un utilisateur existant
            const response = await this.$axios.put('/clientUsers/'+this.editedIndex, this.editedUser);
            const index = this.users.findIndex(user => user._id === this.editedIndex);
            if (index !== -1) {
              this.users.splice(index, 1, response.data.user);
            }
          }
          this.closeDialog();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de l\'utilisateur', error);
        }
      },
      async deleteUser(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          try {
            await this.$axios.delete('/clientUsers/'+id);
            this.users = this.users.filter(user => user._id !== id);
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
          }
        }
      }
    }
  };
  </script>