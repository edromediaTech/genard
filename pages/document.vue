<template>
  <v-container>
    <h1>Gestion des Documents</h1>

    <!-- Formulaire pour créer ou mettre à jour un document -->
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-select
        v-model="documentForm.proprietaire"
        :items="proprietaires"
        item-text="nom"
        item-value="_id"
        label="Propriétaire"
        required
      ></v-select>

      <v-text-field
        v-model="documentForm.typeDocument"
        label="Type de document"
        :rules="documentRules"
        required
      ></v-text-field>

      <v-text-field
        v-model="documentForm.url"
        label="URL du document"
        :rules="urlRules"
        required
      ></v-text-field>

      <v-btn :disabled="!valid" @click="submitForm">Enregistrer</v-btn>
    </v-form>

    <!-- Liste des documents -->
    <v-data-table :headers="headers" :items="documents" class="elevation-1" item-key="id">
      <template #[`item.actions`]="{ item }">
        <v-icon small @click="editDocument(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteDocument(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      documentForm: {
        proprietaire: "",
        typeDocument: "",
        url: "",
      },
      documents: [],
      proprietaires: [], // Pour stocker les propriétaires (investisseurs ou projets)
      headers: [
        { text: "ID", value: "id" },
        { text: "Propriétaire", value: "proprietaire.nom" },
        { text: "Type de document", value: "typeDocument" },
        { text: "URL", value: "url" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      documentRules: [(v) => !!v || "Le type de document est requis"],
      urlRules: [(v) => !!v || "L'URL du document est requise"],
    };
  },
  mounted() {
    this.getDocuments();
    this.getProprietaires();
  },
  methods: {
    async getDocuments() {
      try {
        const response = await axios.get("document");
        this.documents = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async getProprietaires() {
      try {
        const response = await axios.get("proprietaire"); // récupère les investisseurs ou projets
        this.proprietaires = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async submitForm() {
      if (this.documentForm.id) {
        // Mettre à jour un document
        await this.updateDocument();
      } else {
        // Créer un nouveau document
        await this.createDocument();
      }
    },
    async createDocument() {
      try {
        const response = await axios.post("document", this.documentForm);
        this.documents.push(response.data);
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    async updateDocument() {
      try {
        await axios.put("document/" + this.documentForm.id, this.documentForm);
        this.getDocuments();
        this.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
    editDocument(document) {
      this.documentForm = { ...document };
    },
    async deleteDocument(id) {
      try {
        await axios.delete("document/" + id);
        this.getDocuments();
      } catch (error) {
        console.error(error);
      }
    },
    resetForm() {
      this.documentForm = {
        proprietaire: "",
        typeDocument: "",
        url: "",
      };
    },
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
