<template>
  <v-container id="regular-tables" fluid tag="section">
    <base-material-card
      icon="mdi-town-hall"
      title="Gestion Ecoles"
      class="px-5 py-3 mt-4"
    >
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="district"
            :items="districts"
            :rules="[(v) => !!v || msgrules]"
            label="District"
            required
            prepend-icon="mdi-earth"
            @change="getEcoleDistrict"
          ></v-select>
        </v-col>

        <v-col cols="12" md="3" sm="6">
          <!-- Select multiple field -->

          <v-select
           
            v-model="selectedItems"
            :items="tabselectfield"
            item-text="label"
            item-value="label"
            label="Filtre"
            multiple
            return-object
            prepend-icon="mdi-filter"
            @change="handleSelectionChange"
          ></v-select>
        </v-col>

        <template v-for="(field, index) in tabselectfield" >
          <v-col v-if="field.display" :key="index" cols="12" md="3" sm="6">
            <v-autocomplete
              v-model="field.vmodel"
              :items="field.items"
              :label="field.label"
              item-nom
              return-object
              @change="getLabel(field.vmodel, field.label)"
            ></v-autocomplete>
          </v-col>
        </template>
        <!-- <v-col cols="12" md="2" sm="6">
            <v-btn v-if="district !== ''" fat color="primary" @click="filterEnseignants"
              >Filtrer</v-btn
            >
          </v-col> -->
        <v-col cols="12" md="2" sm="6">
          <v-btn
            v-if="selectedItems.length > 0"
            fat
            color="primary"
            @click="getDataSchool"
            >Filtrer</v-btn
          >
        </v-col>
        <!-- <v-col cols="12" md="2" sm="6">
          <v-btn
            v-if="selected.length > 0"
            fat
            color="primary"
            @click="calculateChairsBySchool(alldata.communes, '65ff5483b97e17530b2358c1')"
            >Chaires dispo</v-btn
          >
        </v-col> -->

        <v-progress-circular
          v-show="visible"
          class="mt-4"
          :size="20"
          :width="2"
          color="info"
          indeterminate
        />
      </v-row>
      <v-data-table
        v-model="selected"
        show-select
        :headers="headers"
        :items="ecoles"
        :search="search"
        item-key="_id"
        :single-select="true"
        :footer-props="{ 'items-per-page-options': [50, 100, -1] }"
        sort-by="nom"
        class="elevation-1"
      >
        <template #[`item.totalChairs`]="{ item }">
          <span>{{ textchair[item.totalChairs] }} </span>
        </template>
        <template #[`item.datenais`]="{ item }">
          <span>{{ item.datenais | moment(" Do MMMM YYYY") }} </span>
        </template>
        <template #[`item.secteur`]="{ item }">
          <span>{{ item.secteur ? "Public" : "Privé" }} </span>
        </template>

        <template #top>
          <v-row class="mx-4 my-4">
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-if="ecoles.length > 0"
                v-model="search"
                append-icon="mdi-magnify"
                label="Recherche..."
                single-line
                hide-details
              ></v-text-field>
            </v-col>
            <v-divider v-if="ecoles.length > 0" class="mx-4" inset vertical />
            <v-spacer />

            <download-excel
              v-if="ecoles.length > 0"
              class="mx-2 mt-2"
              :data="ecoles"
              title="Telecharger en excel"
              name="Liste Ecoles"
              header="Liste des ecoles"
            >
              <v-img max-height="40" max-width="40" src="images/excel.png" />
            </download-excel>
            <v-btn
              v-if="ecoles.length > 0"
              class="mx-2 mt-2"
              fab
              x-small
              color="primary"
              @click="generateReport"
            >
              PDF
              <client-only>
                <vue-html2pdf
                  ref="html2Pdf"
                  :show-layout="false"
                  :float-layout="true"
                  :enable-download="true"
                  :preview-modal="false"
                  :paginate-elements-by-height="1300"
                  filename="Suped-DDENE-Ecole"
                  :pdf-quality="2"
                  :manual-pagination="false"
                  pdf-format="letter"
                  pdf-orientation="landscape"
                  pdf-content-width="1000px"
                >
                  <template slot="pdf-content">
                    <TablePrintEcole
                      :ecoles="ecoles"
                      :texte="texte"
                      :formation-c="formationC"
                    />
                  </template>
                </vue-html2pdf>
              </client-only>
            </v-btn>
            <v-btn v-if="ecoles.length > 0" class="mt-4 mx-4" small>
              <v-badge class="text-none" stacked color="success" :content="nbEcoles">
                <v-icon color="blue">mdi-town-hall</v-icon>
              </v-badge>
            </v-btn>
          </v-row>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-menu offset-y>
            <template #activator="{ on }">
              <v-btn icon :disabled="selected.length === 0" v-on="on">
                <v-icon color="blue darken-4">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <!-- <hr class="mx-4" color="blue">       -->
              <v-list-item :disabled="selected.length === 0">
                <ecoleEnseignant :ecoles="ecoles" :selected="selected" />
              </v-list-item>
              <v-list-item :disabled="selected.length === 0">
                <ecoleEnq :ecoles="ecoles" :selected="selected" />
              </v-list-item>
              <v-list-item :disabled="selected.length === 0">
                <infoEcole :ecoles="ecoles" :selected="selected"  :totalchairsdispo="totalchairsdispo"  :totalchairs="totalchairs" />
              </v-list-item>

              <v-list-item>
                <v-btn
                  :disabled="selected.length === 0"
                  color="blue"
                  small
                  title="editer ecole"
                  class="mr-2"
                  text
                  @click="editItem(item)"
                >
                  <v-icon> mdi-pencil</v-icon> Editer Enseignant
                </v-btn>
              </v-list-item>

              <v-list-item>
                <v-btn
                  :disabled="selected.length === 0"
                  color="red"
                  text
                  small
                  @click="deleteItem(item)"
                >
                  <v-icon>mdi-delete</v-icon> Supprimer Enseignant
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </base-material-card>
  </v-container>
</template>
<script>
// import ModalDecision from '~/components/modalDecision.vue';

// import etatBatiment from '~/components/etatBatiment.vue';
export default {
  // components: { saisieDirecteur },
  // middleware: 'admin',
  data: () => ({
    districts: [],
    communes: [],
    zones: [],
    matieres: [],
    ecoles: [],
    nbEcoles: [],
    niveauenseignements: [],
    niveauenseignement: "",
    nbchaire: "",
    textchair: ["N/A", "1 chaire", "2 chaires", "3 chaires", "Plein temps"],
    nbchaires: [
      { text: "1 Chaire", value: 1 },
      { text: "2 Chaires", value: 2 },
      { text: "3 Chaires", value: 3 },
      { text: "Temps Plein", value: 4 },
    ],
    statuts: [
      { value: "Bénévolat", text: "Bénévolat" },
      { value: "Contractuel", text: "Contractuel" },
      { value: "Fonctionnaire", text: "Fonctionnaire" },
      { value: "Remplacant", text: "Remplacant" },
      { value: "Stagiaire", text: "Stagiaire" },
      { value: "Sous-Traitant", text: "Sous-Traitant" },
      { value: "Situation Particulière", text: "Situation Particulière" },
    ],
    selectedItems: [],
    critere: {},
    tabselectfield: [
      {
        vmodel: [],
        items: [],
        label: "Commune",
        display: false,
        itemsSource: "communes",
        stateField: "commune",
      },
      {
        vmodel: [],
        items: [],
        label: "Zone",
        display: false,
        itemsSource: "zones",
        stateField: "zone",
        disabled: true,
      },

      {
        vmodel: [],
        items: [],
        label: "Catégorie",
        display: false,
        itemsSource: "categories",
        stateField: "categorie",
      },
      {
        vmodel: [],
        items: [],
        label: "Niveau Enseignement",
        display: false,
        itemsSource: "niveauens",
        stateField: "niveauenseignement",
      },
    ],
    valid: false,
    selreq: [],
    selectItems: [],
    ecoledata: [],
    items: ["Commune", "Zone", "Ecole", "Matière", "Nbre d'Heure"],
    selected: [],
    e1: 1,
    dialog: false,
    visible: false,
    classe: null,
    classes: [],
    eleves: [],
    enseignants: [],
    info: {},
    niveau: "",
    matiere: "",
    district: "",
    selectedDistrict: null,
    selectedCommune: null,
    selectedZone: null,
    selectedSectionCommunale: null,
    texte: "",
    secteur: 1,
    donnee: { district: 0, secteur: -1, niveau: 0, commune: 0, zone: 0 },
    commune: "",
    formationC: "",
    zone: "",
    ecole_id: "",
    ecole: null,
    loading: false,
    departement: "",
    departements: [],
    sectionCommunales: [],
    totalchairsdispo : 0,
    totalchairs : 0,
    access: ["Facile", "Dificile", "Très Dificile"],
    alldata: [],
    nif: null,
    prof: {
      nif: "",
      telephone: "",
      lieunais: "",
      adresse: "",
      cin: "",
      nom: "",
      prenom: "",
      sexe: 0,
      commune_n: "",
      commune_h: "",
      dept_n: "",
      dept_h: "",
      email: "",
      date_naissance: null,
      statutmat: "",
      niveauUniv: "",
      niveauClass: "",
      certification: "",
      enseignant: "",
    },

    enteteText: {},

    categories: [],
    niveauens: [],
    vacations: [],
    emailRules: [
      (v) => !!v || "E-mail obligatoire",
      (v) =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "E-mail doit être valide",
    ],
    annee: ["2020-2021", "2021-2022"],
    an: "",
    search: "",
    msgrules: "Champ obligatoire",
    dialogDelete: false,
    ajouter: false,
    sexeop: [
      { text: "Masculin", value: 1 },
      { text: "Féminin", value: 0 },
    ],
    // date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
    menu: false,
    modal: false,
    menu2: false,
    centres: [],
    tsf: [],
    editedIndex: -1,
    editedItem: {
      nom: "",
      prenom: "",
      sexe: "",
      lieunais: "",
      datenais: "",
      tel_persrep: "",
      deficience: "",
      prenom_mere: "",
    },
    defaultItem: {
      nom: "",
      prenom: "",
      sexe: "",
      lieunais: "",
      datenais: "",
      tel_persrep: "",
      deficience: "",
      prenom_mere: "",
    },
    headprint: [
      { text: "Nom", value: "nom" },
      { text: "Adresse", value: "adresse" },
      { text: "Tél", value: "tel" },
      { text: "Secteur", value: "secteur" },
    ],
  }),

  computed: {
    headers() {
      const headers = [
        { text: "Nom", value: "nom" },
        { text: "Adresse", value: "adresse" },
        { text: "Tél", value: "tel" },
        { text: "Secteur", value: "secteur" },
        { text: "Actions", value: "actions", sortable: false },
      ];
      if (this.editedItem.sexe === "0") {
        headers.push({ text: "Masculin", value: "0" });
        headers.push({ text: "Féminin", value: "1" });
      }
      return headers;
    },

    formTitle() {
      return this.editedIndex === -1 ? "Ecole" : "Editer ";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.$axios.defaults.headers.common.Authorization =
      "Bearer " + localStorage.getItem("authToken");
  },

  mounted() {
    // this.getDept();
    this.getDistricts();
    this.getCommunes();
    this.getEcole();
    this.info.annee = localStorage.anac;
  },

  methods: {
    nbchairesTotal() {
      const CHAIRE_HOURS = 6;
      const tabniveau = ["66044ea67d4e45baafd0434b", "66044eb57d4e45baafd0434c"];
      for (const commune of this.ecoledata) {
        for (const zone of commune.zones) {
          for (const ecole of zone.ecoles) {
            if (ecole._id === this.selected[0]._id) {
              let totalHours = 0;

              for (const ecoleEnseignant of ecole.ecoleEnseignants) {
                for (const ec of ecoleEnseignant.affectations) {
                  if (tabniveau.includes(ec.classeMatiere.classe.niveau))
                    totalHours += ec.nbheuref;
                }
              }

              const totalChairs = Math.ceil(totalHours / CHAIRE_HOURS);
              console.log(totalChairs);
              return totalChairs;
            }
          }
        }
      }
      return null; // Si l'école avec le nom donné n'est pas trouvée
    },

    nbchairesDispos(communes, id) {
      for (const commune of communes) {
        for (const zone of commune.zones) {
          for (const ecole of zone.ecoles) {
            if (ecole._id === id) {
              let totalChairs = 0;

              for (const ecoleEnseignant of ecole.ecoleEnseignants) {
                for (const ec of ecoleEnseignant) {
                  totalChairs += ec.nbChaire;
                }
              }
              console.log(totalChairs);
              return totalChairs;
            }
          }
        }
      }
      return null; // Si l'école avec le nom donné n'est pas trouvée
    },

    async getEcoleDistrict() {
      this.visible = true;
      await this.$axios.get("ecole/" + this.district + "/district").then((response) => {
        const ecolesD = response.data;
        this.ecoles = ecolesD;
        this.nbEcoles = this.ecoles.length;
      });
      
      this.visible = false;
    },

    async fetchEnseignants() {
      this.visible = true;
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("ecole/" + this.ecole + "/enseignants").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.enseignants.push({ text: d[i].nom, value: d[i].ecoleEnseignantId });
        }
      });
      this.visible = false;
    },

    async fetchClasseMatieres() {
      this.visible = true;
      this.matieres = [];
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("classe/" + this.classe + "/matieres").then((response) => {
        const d = response.data;
        this.tabselectfield[
          this.tabselectfield.findIndex((item) => item.label === "Matière")
        ].display = true;
        for (let i = 0; i < d.length; i++) {
          this.matieres.push({ text: d[i].libelle, value: d[i]._id });
        }
      });

      this.visible = false;
    },

    async fetchClasses() {
      this.visible = true;
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("classe/").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.classes.push({ text: d[i].nom, value: d[i]._id });
        }
      });

      this.visible = false;
    },

    calculateChairsAvailableBySchool(communes, id) {
      const CHAIRE_HOURS = 6;

      for (const commune of communes) {
        for (const zone of commune.zones) {
          for (const ecole of zone.ecoles) {
            if (ecole._id === id) {
              let totalHours = 0;

              for (const ecoleEnseignant of ecole.ecoleEnseignants) {
                for (const ec of ecoleEnseignant) {
                  totalHours += ec.nbheuref;
                }
              }

              this.totalchairsdispo = totalHours / CHAIRE_HOURS;
              console.log(this.totaldchairsdispo);
              return this.totalchairsdispo;
            }
          }
        }
      }
      return null; // Si l'école avec le nom donné n'est pas trouvée
    },

    calculateChairsBySchool(communes, id) {
      for (const commune of communes) {
        for (const zone of commune.zones) {
          for (const ecole of zone.ecoles) {
            if (ecole._id === id) {
              this.totalchairs = 0;

              for (const ecoleEnseignant of ecole.ecoleEnseignants) {
                for (const ec of ecoleEnseignant) {
                  this.totalchairs += ec.nbChaire;
                }
              }
              console.log(this.totalchairs);
              return this.totalchairs;
            }
          }
        }
      }
      return null; // Si l'école avec le nom donné n'est pas trouvée
    },

    async getAllData() {
      this.visible = true;
      // this.$axios.defaults.headers.common.Authorization =
      //   "Bearer " + localStorage.getItem("authToken");

      await this.$axios.get("district/alldata/" + this.district).then((response) => {
        this.alldata = response.data;
      });
      this.visible = false;
    },

    async getEnseignantEcole() {
      this.visible = true;
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("ecole/" + this.ecole + "/enseignants").then((response) => {
        this.enseignants = response.data;
      });
      this.visible = false;
    },

    async store_prof() {
      this.visible = true;
      const prof = { enseignant: this.prof, ecolesEnseignantData: this.ecolePlus };

      // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      await this.$axios.post("enseignant/", prof).then((res) => {
        if (res.status === 201) {
          //  this.resetObjectField(this.prof)
          this.$notifier.showMessage({ content: "Succès!!!", color: "success" });
          if (res.data.length > 0)
            this.$notifier.showMessage({ content: res.data.message, color: "error" });
          return true;
        } else {
          this.$notifier.showMessage({ content: res.data.message[0], color: "error" });
        }
      });
      this.visible = false;
    },

    async getNiveauens() {
      this.visible = true;
      // this.$axios.defaults.headers.common.Authorization =
      //   "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("niveauenseignement/").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.niveauens.push({ text: d[i].niveau, value: d[i]._id });
        }
      });
      this.getCategories();
      this.visible = false;
      // this.getOptions()
    },

    filterEnseignants() {
      this.ecoles = [];

      this.alldata.communes.forEach((commune) => {
        if (this.commune && commune._id.toString() !== this.commune) return;

        commune.zones.forEach((zone) => {
          if (this.zone && zone._id.toString() !== this.zone) return;

          zone.ecoles.forEach((ecole) => {
            if (this.ecole && ecole._id.toString() !== this.ecole) return;

            // ecole.ecoleEnseignants.forEach((ecoleEc) => {
            //   if (this.nbchaire && ecoleEc._id.toString() !== this.nbchaire) return;

            if (this.classe) {
              ecole.classes.forEach((classeEcole) => {
                if (classeEcole.classe._id.toString() === this.classe) {
                  classeEcole.salles.forEach((salle) => {
                    ecole.ecoleEnseignants.forEach((ecoleEnseignant) => {
                      this.ecoles.push(ecoleEnseignant.enseignant);
                    });
                  });
                }
              });
            } else {
              ecole.ecoleEnseignants.forEach((ecoleEnseignant) => {
                this.ecoles.push(ecoleEnseignant.enseignant);
              });
            }
          });
        });
        // });
      });
    },
    async getCategories() {
      this.visible = true;
      // this.$axios.defaults.headers.common.Authorization =
      //   "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("categorie/").then((response) => {
        const d = response.data;

        for (let i = 0; i < d.length; i++) {
          this.categories.push({ text: d[i].nom, value: d[i]._id });
        }
      });
      this.visible = false;
      // this.getOptions()
    },
    handleSelectionChange() {
      // Reset all vmodels to empty arrays if not selected
      this.tabselectfield.forEach((field) => {
        if (!this.selectedItems.includes(field)) {
          field.vmodel = [];
          field.display = false;
        } else {
          field.display = true;

          this.tabselectfield[
            this.tabselectfield.findIndex((item) => item.label === "Zone")
          ].display = false;
          if (field.itemsSource) {
            field.items = this[field.itemsSource];
          }

          // if(field.label === "Zone" && field.label !== "Commune"){

          //   this.$notifier.showMessage({ content: "Choisir d'abord une commune", color: "info" });
          //   this.zones = []
          //   return false
          //  }
        }
      });
    },

    async getLabel(items, label) {
      const field = this.tabselectfield.find((f) => f.label === label);

      if (field && field.stateField) {
        this[field.stateField] = items.value;
        this.tsf.push({ label: field.stateField, value: items.value });
        this.critere[field.stateField] = items.value;
        this.enteteText[field.stateField] = items.text;
      }

      if (label === "Commune") {
        this.commune = items.value;

        await this.getZone();
        this.tabselectfield[
          this.tabselectfield.findIndex((item) => item.label === "Zone")
        ].items = this.zones;
      }
    },

    async getCommunes() {
      this.visible = true;
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("commune").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.communes.push({ text: d[i].nom, value: d[i]._id });
        }
      });

      this.visible = false;
    },

    async getDistricts() {
      this.visible = true;

      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("district").then((response) => {
        const d = response.data;

        for (let i = 0; i < d.length; i++) {
          this.districts.push({ text: d[i].nom, value: d[i]._id });
        }
      });
      this.getNiveauens();
      this.visible = false;
    },

    getZoneCommune() {
      this.visible = true;
      this.zonesEc = this.zones.filter((ec) => ec.commune === this.commune);
      this.visible = false;
      return this.ZonesEc;
    },

    async get_ecole() {
      this.visible = true;
      // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      await this.$axios.get("ecole/" + this.commune + "/ecoles").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.ecoles.push({ text: d[i].nom, value: d[i]._id });
        }
      });

      this.visible = false;
    },

    assignRole(role, item) {
      // Logique pour assigner un rôle à l'élément sélectionné
    },
    async getDept() {
      this.visible = true;
      this.getDistricts();
      // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
      await this.$axios.get("departement/65f1fa7406915026f3cfa2ae").then((response) => {
        this.dataDept = response.data;
        console.log(response.data);
        // this.districts = this.dataDept.districts
      });

      this.visible = false;
    },

    async getEcole() {
      this.visible = true;
      await this.$axios.get("ecole/").then((response) => {
        
        this.ecoledata = response.data;
        this.ecoles = this.ecoledata;
        console.log(this.ecoledata)
        this.nbEcoles = this.ecoles.length;
        this.visible = false;
      });
    },

    async getEcoleCommune() {
      this.ecoles = [];
      this.visible = true;
      await this.$axios.get("ecole/" + this.commune + "/ecoles").then((response) => {
        const d = response.data;
        for (let i = 0; i < d.length; i++) {
          this.ecoles.push({ text: d[i].nom, value: d[i]._id });
          this.ecole_id = d[i]._id;
        }
      });
      this.visible = false;
    },

    async getZone() {
      this.visible = true;
      this.zones = [];
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
      await this.$axios.get("zone").then((response) => {
        const d = response.data;

        this.tabselectfield[
          this.tabselectfield.findIndex((item) => item.label === "Zone")
        ].display = true;

        for (let i = 0; i < d.length; i++) {
          if (d[i].commune === this.commune) {
            this.zones.push({ text: d[i].nom, value: d[i]._id });
          }
        }
      });

      this.visible = false;
    },

    async beforeDownload({ html2pdf, options, pdfContent }) {
      await html2pdf()
        .set(options)
        .from(pdfContent)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              "Page " + i + " sur " + totalPages,
              pdf.internal.pageSize.getWidth() * 0.88,
              pdf.internal.pageSize.getHeight() - 0.3
            );
          }
        })
        .save();
    },
    setTexte() {},
    generateReport() {
      this.texte = this.generateHeaderText(this.enteteText);

      // this.formationC = 'Formation de classe ' + this.an
      this.$refs.html2Pdf.generatePdf();
    },

    filterObjectBySelectedItems(filters, selectedItems) {
      const result = {};

      selectedItems.forEach((item) => {
        for (const key in item) {
          if (
            Object.prototype.hasOwnProperty.call(filters, key) &&
            filters[key] === item[key]
          ) {
            result[key] = filters[key];
          }
        }
      });

      return result;
    },

    getTeacherChairs() {
      const teacherChairs = {};
      const a = Object.keys(this.critere).length;
      const b = a - this.selectedItems.length;
      if (b > 0) {
        const keys = Object.keys(this.critere);
        for (let i = 0; i < b; i++) {
          if (keys[i] !== undefined) {
            delete this.critere[keys[i]];
          }
        }
      }

      this.alldata.communes.forEach((commune) => {
        if (this.critere.commune && this.critere.commune !== commune._id) return;
        commune.zones.forEach((zone) => {
          if (this.critere.zone && this.critere.zone !== zone._id) return;

          zone.ecoles.forEach((ecole) => {
            if (this.critere.ecole && this.critere.ecole !== ecole._id) return;

            ecole.ecoleEnseignants.forEach((ecoleEnseignant) => {
              const teacher = ecoleEnseignant.enseignant;
              const personnel = teacher.personnel;
              const nbChaire = ecoleEnseignant.nbChaire;
              const statut = ecoleEnseignant.statut;
              const nif = personnel.nif;

              let nbChairep = "";
              let matieresp = "";
              let classesp = "";
              let nbheurefp = 0;

              if (ecoleEnseignant.enseignant.personnel.nif === nif) {
                nbChairep = ecoleEnseignant.nbChaire;
                matieresp = ecoleEnseignant.affectations
                  .map((a) => a.classeMatiere.matiere.libelle)
                  .join(", ");
                classesp = ecoleEnseignant.affectations
                  .map((a) => a.classeMatiere.classe.nom)
                  .join(", ");
                nbheurefp = ecoleEnseignant.affectations.reduce(
                  (acc, a) => acc + a.nbheuref,
                  0
                );
              }
              const matchClasseMatiere = ecoleEnseignant.affectations.some(
                (affectation) => affectation.classeMatiere._id === this.critere.matiere
              );
              const matchClasse = ecoleEnseignant.affectations.some(
                (affectation) => affectation.classeMatiere.classe === this.critere.classe
              );

              if (this.critere.nbChaire && this.critere.nbChaire !== nbChaire) return;
              if (this.critere.statut && this.critere.statut !== statut) return;
              if (this.critere.nif && this.critere.nif !== nif) return;
              if (this.critere.matiere && !matchClasseMatiere) return;
              if (this.critere.classe && !matchClasse) return;

              const teacherId = teacher._id;
              const teacherName = personnel.nom;
              const teacherFirstName = personnel.prenom;
              const teacherNif = personnel.nif;
              const teacherSexe = personnel.sexe;
              const teacherTel = ecoleEnseignant.enseignant.personnel.telephone;
              const teacherStatut = ecoleEnseignant.statut;
              const teacherNbchairep = nbChairep;

              if (!teacherChairs[teacherId]) {
                teacherChairs[teacherId] = {
                  _id: teacherId,
                  nom: teacherName,
                  prenom: teacherFirstName,
                  nif: teacherNif,
                  sexe: teacherSexe,
                  telephone: teacherTel,
                  statut: teacherStatut,
                  totalChairs: 0,
                  ecole: ecole.nom,
                  nbChairep: teacherNbchairep,
                  matierep: matieresp,
                  nbheurefp,
                  classesp,
                };
              }

              teacherChairs[teacherId].totalChairs += nbChaire;
            });
          });
        });
      });

      this.ecoles = Object.values(teacherChairs);
      this.nbEnseignant = this.ecoles.length;
    },

    // Function to parse, filter, and aggregate teacher chair data
    getDataSchool() {
      const ecoleInfo = {};
      const a = Object.keys(this.critere).length;
      const b = a - this.selectedItems.length;
      if (b > 0) {
        const keys = Object.keys(this.critere);
        for (let i = 0; i < b; i++) {
          if (keys[i] !== undefined) {
            delete this.critere[keys[i]];
          }
        }
      }
      
      this.ecoledata.forEach((ecole) => {
        if (!ecole.commune) {
          return false; // Ignorez les écoles sans commune définie
        }

        // Si le critère commune n'est pas défini, ne filtre pas par commune
        // if (!this.critere.commune) {
        //   return true;
        // }

        if (this.critere.commune && this.critere.commune !== ecole.commune._id) return;
        if (this.critere.zone && this.critere.zone !== ecole.zone) return;
        if (this.critere.categorie && this.critere.categorie !== ecole.categorie) return;
        if (
          this.critere.niveauenseignement &&
          this.critere.niveauenseignement !== ecole.niveauenseignement
        )
          return;

        const ecoleId = ecole._id;
        const ecoleName = ecole.nom;

        if (!ecoleInfo[ecoleId]) {
          ecoleInfo[ecoleId] = {
            _id: ecoleId,
            nom: ecoleName,
            tel: ecole.tel,
            code: ecole.code,
            categorie :ecole.categorie,
           vacation: ecole.vacation,
           milieu: ecole.milieu,
            adresse: ecole.adresse,
            secteur: ecole.secteur,
            totalChairs: 0,
            niveau :ecole.niveauenseignement,
            latitude : ecole.latitude,
            longitude : ecole.longitude
          };
        }
      });

      this.ecoles = Object.values(ecoleInfo);
      this.nbEcoles = this.ecoles.length;
    },

    findEcoleInfoById() {
      const id = this.selected[0]._id;

      for (const commune of this.alldata.communes) {
        for (const zone of commune.zones) {
          for (const ecole of zone.ecoles) {
            for (const ecoleEnseignant of ecole.ecoleEnseignants) {
              if (ecoleEnseignant.enseignant.personnel.nif === id) {
                const nbChaire = ecoleEnseignant.nbChaire;
                const matieres = ecoleEnseignant.affectations
                  .map((a) => a.classeMatiere.matiere.libelle)
                  .join(", ");
                const classes = ecoleEnseignant.affectations
                  .map((a) => a.classeMatiere.classe.nom)
                  .join(", ");
                const nbheuref = ecoleEnseignant.affectations.reduce(
                  (acc, a) => acc + a.nbheuref,
                  0
                );
                console.log({
                  ecole: ecole.nom,
                  nbChaire,
                  matiere: matieres,
                  nbheuref,
                  classe: classes,
                });
                return {
                  ecoleP: ecole.nom,
                  nbChaireP: nbChaire,
                  matiereP: matieres,
                  nbheuref,
                  classeP: classes,
                };
              }
            }
          }
        }
      }

      return null; // Si aucun enseignant n'est trouvé avec le NIF donné
    },

    generateHeaderText(filter) {
      let headerText = "Liste des ecoles";

      const filterMapping = {
        commune: "Commune",
        zone: "Zone",
        ecole: "École",
        classe: "Classe",
        categorie: "Catégorie",
        niveauenseignement: "Niveau d'enseignement",
      };

      const appliedFilters = [];
      const a = Object.keys(this.enteteText).length;
      const b = a - this.selectedItems.length;
      if (b > 0) {
        const keys = Object.keys(this.enteteText);
        for (let i = 0; i < b; i++) {
          if (keys[i] !== undefined) {
            delete this.enteteText[keys[i]];
          }
        }
      }

      for (const key in filter) {
        if (filter[key] !== null) {
          appliedFilters.push(`${filterMapping[key]}: ${filter[key]}`);
        }
      }

      if (appliedFilters.length > 0) {
        headerText += " filtrée par " + appliedFilters.join(", ");
      }

      return headerText;
    },

    editItem(item) {
      this.editedIndex = this.ecoles.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.ecoles.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.deleteEcole(this.editedItem);
      this.ecoles.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    showSnackbar() {
      this.$notifier.showMessage({
        content: "veuillez saisir les champs obligatoires",
        color: "info",
      });
    },

    save() {
      this.loading = true;
      // if (!this.$refs.form.validate()) { this.loading = false; return false }

      if (!this.check_age(this.classe, this.editedItem.datenais)) {
        this.$notifier.showMessage({
          content: "La Date de naissance ne correspond pas a la classe!",
          color: "error",
        });
        return false;
      }

      if (this.editedIndex > -1) {
        this.editedItem.ecole_id = this.ecole;
        this.editedItem.classe_id = this.classe;
        this.updateEleve(this.editedItem);
        Object.assign(this.eleves[this.editedIndex], this.editedItem);
      } else {
        this.storeEleve();
      }
      this.close();
    },
  },
};
</script>
<style scoped>
.v-progress-circular {
  margin: 1rem;
}
.sectpdf {
  margin: 1em;
  color: #000;
}
</style>
