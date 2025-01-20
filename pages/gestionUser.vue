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
        <template #[`item.canPrint`]="{ item }">
          <v-switch
            :input-value="item.canPrint"
            @change="updatePrintPermission(item, $event)"
          ></v-switch>
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
  middleware: "supadmin",
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
      users: [],
      privileges: [],
      privilege: [],
      headers: [
        { text: "Statut", value: "statut" },
        { text: "Nom", value: "prenom" },
        { text: "Code", value: "code" },
        { text: "Email", value: "email" },
        { text: "Privilège", value: "userLevel" },
        { text: "Permission Imprimer", value: "canPrint", sortable: false },
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
      try {
        const response = await this.$axios.get("auth/all");
        this.users = response.data.map((user) => ({
          ...user,
          canPrint: user.permissions?.canPrint || false,
        }));
        this.nbu = this.users.length;
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      } finally {
        this.visible = false;
      }
    },
    async updatePrintPermission(user, canPrint) {
      this.$axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");

      try {
        await this.$axios.put("/auth/update-permission", {
          userId: user._id,
          canPrint,
        });

        const index = this.users.findIndex((u) => u._id === user._id);
        if (index !== -1) {
          this.users[index].canPrint = canPrint;
        }

        this.$notifier.showMessage({
          content: `Permission "Imprimer" mise à jour pour ${user.prenom}.`,
          color: "success",
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la permission:", error);
        this.$notifier.showMessage({
          content: "Erreur lors de la mise à jour de la permission.",
          color: "error",
        });
      }
    },
    // ... (autres méthodes existantes)
  },
};
</script>