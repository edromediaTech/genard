<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Suppliers
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openDialog(null)">Add Supplier</v-btn>
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="suppliers"
              @click:row="openDialog"
            ></v-data-table>
          </v-card>
        </v-col>
      </v-row>
  
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.contact" label="Contact"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.email" label="Email"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.phone" label="Phone"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.address" label="Address"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.totalDebt" label="Total Debt"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="saveSupplier">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        dialog: false,
        headers: [
          { text: 'Name', value: 'name' },
          { text: 'Contact', value: 'contact' },
          { text: 'Email', value: 'email' },
          { text: 'Phone', value: 'phone' },
          { text: 'Address', value: 'address' },
          { text: 'Total Debt', value: 'totalDebt' },
        ],
        suppliers: [],
        editedIndex: -1,
        editedItem: {
          name: '',
          contact: '',
          email: '',
          phone: '',
          address: '',
          totalDebt: 0,
        },
        defaultItem: {
          name: '',
          contact: '',
          email: '',
          phone: '',
          address: '',
          totalDebt: 0,
        },
      };
    },
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'New Supplier' : 'Edit Supplier';
      },
    },
    watch: {
      dialog(val) {
        val || this.closeDialog();
      },
    },
    async created() {
      await this.fetchSuppliers();
    },
    methods: {
      async fetchSuppliers() {
        this.suppliers = await this.$axios.$get('supplier');
      },
      openDialog(item) {
        this.editedIndex = this.suppliers.indexOf(item);
        this.editedItem = Object.assign({}, item || this.defaultItem);
        this.dialog = true;
      },
      closeDialog() {
        this.dialog = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },
      async saveSupplier() {
        if (this.editedIndex > -1) {
          await this.$axios.$put('supplier', this.editedItem);
        } else {
          await this.$axios.$post('supplier', this.editedItem);
        }
        await this.fetchSuppliers();
        this.closeDialog();
      },
    },
  };
  </script>