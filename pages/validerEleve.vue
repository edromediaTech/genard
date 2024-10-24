<template>
  <v-container id="regular-tables" fluid tag="section">
    <base-material-card
      icon="mdi-check"
      title=" Valider Transferts"
      class="px-5 py-3 mt-4"
    >
      <v-data-table
        v-model="selected"
        show-select
        :headers="headers"
        :items="eleves"
        class="elevation-1"
        :footer-props="{ 'items-per-page-options': [50, 100, -1] }"
      >
        <template #top>
          <v-row class="mx-4 my-4">
            <v-btn
              v-if="selected.length > 0"
              class="mx-2 mt-2"
              fab
              small
              color="info"
              title="Valider Transferts"
              @click="validerTransfert"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-btn
              class="mx-2 mt-2"
              fab
              small
              color="info"
              title="Imprimer Transfert entrant"
              @click="generateReport"
            >
              <v-icon>mdi-printer</v-icon>
              <client-only>
                <vue-html2pdf
                  ref="html2Pdf"
                  :show-layout="false"
                  :float-layout="true"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1400"
                  filename="Suped-DDENE"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="landscape"
                  pdf-content-width="1000px"
                >
                  <template slot="pdf-content">
                    <!-- <liste-tranfert-pdf :eleves="eleves" :texte="texte" /> -->
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
          </v-row>
        </template>
        <template #[`item.datenais`]="{ item }">
          <span>{{ item.datenais | moment(" Do-MM-YYYY") }} </span>
        </template>
        <template #[`item.sexe`]="{ item }">
          <span>{{ item.sexe ? "M" : "F" }} </span>
        </template>
        <template #[`item.valider`]="{ item }">
          <span v-if="item.valider"><v-icon>mdi-check</v-icon> </span>
          <span v-else><v-icon>mdi-close</v-icon> </span>
        </template>
      </v-data-table>
    </base-material-card>
  </v-container>
</template>
<script>
// import ListeTranfertPdf from "~/components/listeTranfertPdf.vue";
export default {
  // components: { ListeTranfertPdf },
  // middleware: 'inspect',
  data() {
    return {
      dialog: false,
      transferes: [],
      transprint: [],
      tab_del: [],
      tab_val: [],
      eleves: [],
      acceptes: [],
      id: null,
      selected: [],
      btext: "Accepter",
      texte: "",
      classe: "",
      headers: [
        { text: "ID", value: "eleve_id" },
        { text: "Nom", value: "nom" },
        { text: "Prénom", value: "prenom" },
        { text: "Classe", value: "nomclasse" },
        { text: "Ecole", value: "ecole" },
        { text: "Naissance", value: "lieunais" },
        { text: "Date", value: "datenais" },
        { text: "Sexe", value: "sexe" },
        { text: "Tel Personne responsable ", value: "tel_persrep" },
        { text: "Prenom Mère", value: "prenom_mere" },
        { text: "Valider", value: "valider" },
      ],
    };
  },
  mounted() {
    this.get_eleve_accepter();
  },

  methods: {
    get_tabecole(tabl) {
      const tab = tabl.map((item) => item.id);
      return tab;
    },
    delAllItem() {
      this.selected.forEach((se) => {
        const editedIndex = this.eleves.indexOf(se);
        this.eleves.splice(editedIndex, 1);
      });
    },
    get_eleve_accepter() {
      this.eleves = this.$route.params.eleves;
      //    const id = this.get_tabecole(tab).join('|')

      //  this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      //   await  this.$axios.get('get-eleve-accepter/'+ id).then(res => {
      //         this.eleves = res.data
      //     })
    },
    async validerTransfert() {
      const id = this.get_tabecole(this.selected).join("|");
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.patch("valider-transfert/" + id).then((res) => {
        this.delAllItem();
        //   this.eleves = res.data
        this.$notifier.showMessage({ content: "Validation réussie", color: "success" });
      });
    },

    generateReport() {
      this.texte = localStorage.ecole;
      this.$refs.html2Pdf.generatePdf();
    },

    // generateTransfert(){
    //      this.transprint = this.selected
    //       this.texte = localStorage.ecole
    //     this.$refs.trans.generatePdf()
    // },

    async deleteAll_transferts() {
      this.sug_id();
      this.visible = true;
      const tab = this.tab_del.join("|");
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.delete("delete-group-trans/" + tab).then((res) => {
        if (res.data !== 0) {
          let message = res.data + " élève restauré";
          if (res.data > 1) message = res.data + " élèves restaurés";
          this.$notifier.showMessage({ content: message, color: "success" });
          this.delAllItem();
          this.selected = [];
        }
        this.visible = false;
      });
    },

    close() {
      this.eleveAccept = [];
      this.dialog = false;
    },
  },
};
</script>
