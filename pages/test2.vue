<template>
  <v-container>
    <!-- Bouton pour ajouter une nouvelle commande -->
    <v-btn color="primary" class="mb-4" @click="openAddCommandeDialog">Ajouter une commande</v-btn>

    <!-- Table des commandes -->
    <v-data-table
      v-if="commandes.length"
      :headers="headers"
      :items="commandes"
      item-key="id"
      class="mb-4"
    >
      <template #[`item.actions`]="{ item }">
        <!-- Bouton Voir Détails -->
        <v-btn color="blue" small @click="viewDetail(item)">Voir les détails</v-btn>
      </template>
    </v-data-table>

    <!-- Modal pour ajouter une nouvelle commande -->
    <v-dialog v-model="addCommandeDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Créer une commande</v-card-title>
        <v-card-text>
          <v-form ref="addCommandeForm" v-model="valid" lazy-validation>
            <v-text-field
              v-model="newCommande.client"
              label="Nom du client"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCommande.serveur"
              label="Nom du serveur"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-select
              v-model="newCommande.statut"
              :items="statutOptions"
              label="Statut de la commande"
              :rules="[rules.required]"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!valid" color="primary" @click="saveNewCommande">Créer</v-btn>
          <v-btn color="grey" @click="addCommandeDialog = false">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour afficher et gérer les détails de la commande -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">Détails de la commande</v-card-title>
        <v-card-text>
          <!-- Informations de la commande -->
          <v-text-field v-model="selectedCommande.client" label="Client" disabled></v-text-field>
          <v-text-field v-model="selectedCommande.serveur" label="Serveur" disabled></v-text-field>
          <v-text-field v-model="selectedCommande.statut" label="Statut" disabled></v-text-field>
          <v-text-field v-model="selectedCommande.date" label="Date" disabled></v-text-field>

          <!-- Table des articles -->
          <v-data-table
            :headers="articleHeaders"
            :items="selectedCommande.articles"
            item-key="produit"
            disable-sort
          >
            <template #[`item.actions`]="{ index }">
              <v-btn color="red" icon @click="removeArticle(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <!-- Ajouter un produit -->
          <v-btn color="green" small @click="openAddProductDialog">Ajouter un produit</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="printInvoice">Imprimer</v-btn>
          <v-btn color="grey" @click="dialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour ajouter un produit -->
    <v-dialog v-model="addProductDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Ajouter un produit</v-card-title>
        <v-card-text>
          <v-form ref="addProductForm" v-model="valid" lazy-validation>
            <v-select
              v-model="newProduct.produit"
              :items="productOptions"
              label="Produit"
              :rules="[rules.required]"
              required
            ></v-select>
            <v-text-field
              v-model.number="newProduct.quantite"
              type="number"
              label="Quantité"
              :rules="[rules.required, rules.positive]"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!valid" color="primary" @click="addProduct">Ajouter</v-btn>
          <v-btn color="grey" @click="addProductDialog = false">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      commandes: [],
      addCommandeDialog: false,
      dialog: false,
      addProductDialog: false,
      valid: false,
      statutOptions: ['En cours', 'Livrée', 'Annulée'], // Options de statut
      productOptions: ['Produit A', 'Produit B', 'Produit C'], // Produits disponibles
      newCommande: {
        client: '',
        serveur: '',
        statut: null,
        articles: [],
        total: 0,
        date: new Date().toLocaleDateString(),
      },
      selectedCommande: {},
      newProduct: {
        produit: '',
        quantite: 1,
      },
      headers: [
        { text: 'Client', value: 'client' },
        { text: 'Serveur', value: 'serveur' },
        { text: 'Statut', value: 'statut' },
        { text: 'Date', value: 'date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      articleHeaders: [
        { text: 'Produit', value: 'produit' },
        { text: 'Quantité', value: 'quantite' },
        { text: 'Actions', value: 'actions' },
      ],
      rules: {
        required: (value) => !!value || 'Champ requis.',
        positive: (value) => value > 0 || 'Doit être un nombre positif.',
      },
    };
  },
  methods: {
    openAddCommandeDialog() {
      this.addCommandeDialog = true;
      this.newCommande = {
        client: '',
        serveur: '',
        statut: null,
        articles: [],
        total: 0,
        date: new Date().toLocaleDateString(),
      };
    },
    saveNewCommande() {
      const newCommande = { ...this.newCommande, id: Date.now() };
      this.commandes.push(newCommande);
      this.addCommandeDialog = false;
    },
    viewDetail(commande) {
      this.selectedCommande = { ...commande };
      this.dialog = true;
    },
    openAddProductDialog() {
      this.addProductDialog = true;
      this.newProduct = { produit: '', quantite: 1 };
    },
    addProduct() {
      const existingProduct = this.selectedCommande.articles.find(
        (article) => article.produit === this.newProduct.produit
      );
      if (existingProduct) {
        existingProduct.quantite += this.newProduct.quantite;
      } else {
        this.selectedCommande.articles.push({ ...this.newProduct, prix: 100 });
      }
      this.updateTotal();
      this.addProductDialog = false;
    },
    removeArticle(index) {
      this.selectedCommande.articles.splice(index, 1);
      this.updateTotal();
    },
    updateTotal() {
      this.selectedCommande.total = this.selectedCommande.articles.reduce(
        (acc, article) => acc + article.quantite * 100,
        0
      );
    },
    printInvoice() {
      const printContent = `
        <h1>Facture</h1>
        <p>Client: ${this.selectedCommande.client}</p>
        <p>Serveur: ${this.selectedCommande.serveur}</p>
        <p>Date: ${this.selectedCommande.date}</p>
        <p>Total: ${this.selectedCommande.total}</p>
        <h2>Articles:</h2>
        <ul>
          ${this.selectedCommande.articles
            .map(
              (article) =>
                `<li>${article.produit}: ${article.quantite} x 100 = ${
                  article.quantite * 100
                }</li>`
            )
            .join('')}
        </ul>
      `;
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },
  },
};
</script>
