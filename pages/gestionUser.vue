<template>
  <v-container id="regular-tables" fluid tag="section">
    <base-material-card
      icon="mdi-account"
      title="Liste des utilisateurs"
      class="px-5 py-3 mt-4"
    >
      <h1>Gestion Utilisateur {{ nbu }}</h1>
      <center>
        <v-progress-circular
          v-show="visible"
          :size="20"
          :width="3"
          color="primary"
          indeterminate
          class="ma-auto"
        />
      </center>

      <v-data-table
        :search="search"
        :headers="headers"
        :items="users"
        :footer-props="{ 'items-per-page-options': [50, 100, -1] }"
      >
        <template #[`item.lastSeen`]="{ item }">
          <span> {{ getdate(item.lastSeen) }} </span>
        </template>
        <template #[`item.statut`]="{ item }">
          <span v-if="item.statut === 'Online'">
            <v-icon color="success" title="Online">mdi-circle</v-icon>
          </span>
          <span v-else> <v-icon color="gray" title="Offline">mdi-circle</v-icon> </span>
        </template>
        <template #[`item.userLevel`]="props">
          <v-edit-dialog
            :return-value.sync="props.item.userLevel"
            @save="save"
            @cancel="cancel"
            @open="open"
            @close="close"
          >
            {{ privilege[props.item.user_level] }}
            <template #input>
              <v-select
                v-model="props.item.userLevel"
                :items="privileges"
                label="Privileges"
                @change="updatePrivilege(props.item)"
              />
            </template>
          </v-edit-dialog>
        </template>
        <template #top>
          <v-toolbar flat>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
            <!-- <v-divider
              class="mx-4"
              inset
              vertical
            /> -->
            <v-spacer />
            <v-dialog v-model="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="editedItem.name"
                          label="Nom"
                          maxlength="25"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="editedItem.password"
                          prepend-icon="mdi-lock"
                          label="Entrer le mot de passe"
                          min="8"
                          :append-icon="e1 ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="e1 ? 'text' : 'password'"
                          :rules="passwordRules"
                          counter
                          required
                          @click:append="() => (e1 = !e1)"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="12">
                        <v-text-field
                          v-model="editedItem.password1"
                          label="Confirm Password"
                          prepend-icon="mdi-lock"
                          min="8"
                          :append-icon="e1 ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="e1 ? 'text' : 'password'"
                          counter
                          required
                          @click:append="() => (e1 = !e1)"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer />
                  <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                  <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="text-h5"> Etes-vous sur ? </v-card-title>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="blue darken-1" text @click="closeDelete"> Cancel </v-btn>
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm">
                    OK
                  </v-btn>
                  <v-spacer />
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
          <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </base-material-card>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import { role } from "~/role";
export default {
  // middleware: "admin",
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      nbu: 0,
      e1: false,
      search: "",
      visible: false,
      password: "",
      password1: "",
      passwordRules: [(v) => !!v || "Password obligatoire"],
      //     rules: {
      //     required: value => !!value || "Required.",
      //     password: value => {
      //       const pattern =" /^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#$%^&*])(?=.{8,})/"
      //       return (
      //     pattern.test(value) ||
      //     "Min. 8 characters with at least one capital letter, a number and a special character."
      //   );
      //   }
      // },

      users: [],
      privileges: [],
      privilege: [],
      headers: [
        { text: "Statut", value: "statut" },
        { text: "Nom", value: "prenom" },
        { text: "Code", value: "code" },
        { text: "Email", value: "email" },
        { text: "Dernière Visite", value: "lastSeen" },
        { text: "Privilège", value: "userLevel" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        password: "",
      },
      defaultItem: {
        name: "",
        email: "",
        user_level: "",
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Utilisateur" : "Editer ";
    },
    ...mapGetters("auth", ["user"]),
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  mounted() {
    this.privilege = Object.keys(role);

    const option = Object.entries(role).map(([text, value]) => ({ text, value }));
    this.privileges = option;
    this.get_users_online();
  },

  methods: {
    async get_users_online() {
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");

      this.visible = true;
      await this.$axios.get("auth/all").then((res) => {
        this.users = res.data;
        console.log(this.users)
        this.nbu = res.data.length;
        this.visible = false;
      });
    },

    getKeyByValue(obj, value) {
      for (const key in obj) {
        if (obj[key] === value) {
          return key;
        }
      }
      return null;
    },

    updateUser(user) {
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");

      this.$axios.patch("auth/" + user.id, this.editedItem).then((res) => {
        if (res.data === 1)
          this.$notifier.showMessage({
            content: "Utilisateur modifié",
            color: "success",
          });
        else this.$notifier.showMessage({ content: "Echec", color: "error" });
      });
    },

    updatePrivilege(user) {
      // this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')

      this.$axios
        .patch("auth/userlevel/" + user._id, { user_level: user.user_level })
        .then((res) => {
          if (res.status === 201) {
            this.$notifier.showMessage({
              content: "Privilège modifié",
              color: "success",
            });
          } else {
            this.$notifier.showMessage({ content: "Opération échouée!", color: "echec" });
          }
        });
    },

    deleteUser(user) {
      this.$axios.delete("user-delete/" + this.user.id).then((res) => {
        if (res.data.status === 1) {
          this.$notifier.showMessage({
            content: "Utilisateur supprimé",
            color: "success",
          });
          return true;
        } else {
          return false;
        }
      });
    },

    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    save() {
      this.loading = true;

      if (this.editedItem.password !== this.editedItem.password1) {
        this.$notifier.showMessage({ content: "Password incorrect!", color: "error" });
        return false;
      }

      if (this.editedIndex > -1) {
        this.updateUser(this.editedItem);
        Object.assign(this.users[this.editedIndex], this.editedItem);
      }

      this.close();
    },

    deleteItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.deleteuser(this.editedItem);
      this.users.splice(this.editedIndex, 1);
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

    getdate(dated) {
      const diff = new Date().getTime() - new Date(dated).getTime();
      if (diff < 1000) return "maintenant";
      const nbjour = Math.trunc(diff / (1000 * 60 * 60 * 24));
      if (nbjour > 6) return dated;
      else if (nbjour < 6 && nbjour > 0) return "il y a " + nbjour + " j";
      else {
        const nbheure = Math.trunc(diff / (1000 * 60 * 60));
        if (nbheure > 11) return "Il y a " + nbheure + " heures";
        else if (nbheure < 12 && nbheure > 0) return "il y a " + nbheure + "h";
        else {
          const nbminute = Math.trunc(diff / (1000 * 60));
          if (nbminute > 29) return "moins de 1h";
          else if (nbminute < 30 && nbminute > 0) return "il y a " + nbminute + " min";
          else {
            const nbseconde = Math.trunc(diff / 1000);
            if (nbseconde > 29) return "moins de 1mn";
            else if (nbseconde < 30 && nbseconde > 0)
              return "il y a " + nbseconde + " sec";
          }
        }
      }
    },

    cancel() {
      this.snack = true;
      this.snackColor = "error";
      this.snackText = "Canceled";
    },
    open() {
      this.snack = true;
      this.snackColor = "info";
      this.snackText = "Dialog opened";
    },
  },
};
</script>
