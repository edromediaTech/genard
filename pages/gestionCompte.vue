<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title>Gestion des Comptes Bancaires</v-card-title>

      <v-btn color="primary" @click="dialog = true">Ajouter un compte</v-btn>

      <v-data-table :headers="headers" :items="accounts" class="mt-5" :loading="loading" loading-text="Chargement en cours...">
        <template #[`item.actions`]="{ item }">
          <v-btn v-if="isAdmin" icon color="blue" @click="editAccount(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon color="red" @click="deleteAccount(item._id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon color="green" @click="openTransactionDialog(item, 'deposit')">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn v-if="isAdmin" icon color="orange" @click="openTransactionDialog(item, 'withdraw')">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn icon color="blue" @click="openTransactionModal(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Formulaire pour ajout/mise à jour -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>{{ isEditing ? 'Modifier' : 'Ajouter' }} un compte</v-card-title>
          <v-card-text>
            <v-text-field v-model="form.accountName" label="Nom du compte"></v-text-field>
            <v-text-field v-model="form.accountNumber" label="Numéro du compte"></v-text-field>
            <v-select v-model="form.bank" label="Banque" :items="banks"></v-select>
            <v-select v-model="form.devise" label="Devise" :items="devises"></v-select>
            <v-text-field v-model.number="form.balance" label="Solde" type="number"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" @click="saveAccount">Enregistrer</v-btn>
            <v-btn color="red" @click="dialog = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Formulaire de transaction -->
      <v-dialog v-model="transactionDialog" max-width="400px">
        <v-card>
          <v-card-title>{{ transactionType === 'deposit' ? 'Dépôt' : 'Retrait' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model.number="transaction.amount" label="Montant" type="number" min="1"></v-text-field>
            <v-text-field v-model="transaction.auteur" label="Auteur"></v-text-field>
            <v-text-field v-model="transaction.description" label="Description"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn :disabled="transaction.amount===0 || transaction.description === ''" color="green" @click="processTransaction">Confirmer</v-btn>
            <v-btn color="red" @click="transactionDialog = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal pour afficher les transactions -->
      <v-dialog v-model="transactionModal" max-width="600">
        <v-card>
          <v-card-title v-if="selectedAccount">
            Transactions de {{ selectedAccount.accountName }}
          </v-card-title>
          <v-card-text>
            <!-- Tableau pour afficher les transactions -->
            <v-data-table
              :headers="transactionHeaders"
              :items="transactions"
              :items-per-page="5"
            >
              <template #[`item.amount`]="{ item }">
                {{ item.amount }} {{ selectedAccount ? selectedAccount.devise : '' }}
              </template>
              <template #[`item.type`]="{ item }">
                <span :class="item.type === 'deposit' ? 'green--text' : 'red--text'">
                  {{ formatTransactionType(item.type) }}
                </span>
              </template>
              <template #[`item.date`]="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-btn color="red" @click="transactionModal = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { role } from "../role";

export default {
  middleware: 'superviseur',
  data() {
    return {
      accounts: [],
      dialog: false,
      loading: false,
      transactionDialog: false,
      isEditing: false,
      transactionType: '',
      selectedAccount: null,
      transaction: { amount: 0, description: '', auteur: '' },
      form: { accountName: '', accountNumber: '', balance: 0, devise: '', bank: '' },
      devises: ['Gourde', 'Dollar'],
      banks:['BNC', 'Unibank', 'Sogebank', 'Capital Bank'],
      transactionModal: false,
      transactions: [],
      transactionHeaders: [
        { text: "Montant", value: "amount" },
        { text: "Date", value: "date" },
        { text: "Auteur", value: "auteur" },
        { text: "Description", value: "description" },
        { text: "Type", value: "type" },
      ],
      headers: [
        { text: 'Nom du compte', value: 'accountName' },
        { text: 'Numéro du compte', value: 'accountNumber' },
        { text: 'Banque', value: 'bank' },
        { text: 'Devise', value: 'devise' },
        { text: 'Solde', value: 'balance' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    isAdmin() {
      return this.user && parseInt(this.user.user_level) === role.supadmin;
    },
  },
  mounted() {
    this.fetchAccounts();
  },
  methods: {
    ...mapActions("auth", ["sendLoginRequest"]),

    async fetchAccounts() {
      this.loading = true;
      const { data } = await this.$axios.get('finance/accounts');
      this.accounts = data;
      console.log(data)
      this.loading = false;
    },

    formatTransactionType(type) {
      switch (type) {
        case "deposit":
          return "Dépôt";
        case "withdrawal":
          return "Retrait";
        default:
          return type;
      }
    },

    editAccount(account) {
      this.form = { ...account };
      this.isEditing = true;
      this.dialog = true;
    },

    async deleteAccount(id) {
      await this.$axios.delete('finance/accounts/' + id);
      this.fetchAccounts();
    },

    async saveAccount() {
      try {
        let res;
        if (this.isEditing) {
          res = await this.$axios.put('finance/accounts/' + this.form._id, this.form);
        } else {
          res = await this.$axios.post('finance/accounts', this.form);
        }

        if (res.status === 201) {
          this.$notifier.showMessage({ content: 'Compte créé avec succès !', color: 'success' });
        } else if (res.status === 200) {
          this.$notifier.showMessage({ content: 'Compte mis à jour avec succès !', color: 'success' });
        }

        this.dialog = false;
        this.fetchAccounts();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du compte:", error);
        this.$notifier.showMessage({ content: 'Erreur !', color: 'error' });
      }
    },

    openTransactionDialog(account, type) {
      this.selectedAccount = account;
      this.transactionType = type;
      this.transaction = { amount: 0, description: '' };
      this.transactionDialog = true;
    },

    async processTransaction() {
      try {
        await this.$axios.post('finance/accounts/' + this.selectedAccount._id + '/' + this.transactionType, this.transaction);
        this.transactionDialog = false;
        this.fetchAccounts();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.$notifier.showMessage({ content: 'Fond insuffisant', color: 'error' });
        } else if (error.response && error.response.status === 402) {
          this.$notifier.showMessage({ content: 'Balance inférieure au minimum', color: 'error' });
        } else {
          this.$notifier.showMessage({ content: 'Une erreur est survenue !', color: 'error' });
        }
      }
    },

    openTransactionModal(account) {
      if (account) {
        this.selectedAccount = account;
        this.transactions = account.transactions || [];
        this.transactionModal = true;
      } else {
        console.error("Aucun compte sélectionné.");
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  }
};
</script>

<style>
.v-btn { margin: 5px; }
</style>