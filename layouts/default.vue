<template>
  <v-app color="#000000" dark dense>
    <Snackbar />
    <autoLogout v-if="user" />
    <v-navigation-drawer
      v-if="user"
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <!-- <v-list dense nav>
        <v-list-item>
          <v-list-item-avatar class="align-self-center" color="white" contain>
            <v-img src="images/logo.jpeg" max-height="30" />
          </v-list-item-avatar>
          <span v-if="user && user.user_level === 2" class="ecole">{{ ecolename }}</span>
          <span v-if="user && user.user_level === 3" class="ecole">{{ zonename }}</span>
        </v-list-item>
      </v-list> -->

      <!-- <v-divider class="mb-2" /> -->

      <!-- Liste principale avec sous-menus -->
      <v-list dense nav>
        <!-- Menu principal avec une icône -->
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Sous-menu exemple -->
        <!-- <v-list-group prepend-icon="mdi-folder" no-action>
        <template #activator>
          <v-list-item-content>
            <v-list-item-title>Menu avec sous-menu</v-list-item-title>
          </v-list-item-content>
        </template> -->

        <!-- Éléments du sous-menu -->
        <!-- <v-list-item v-for="(subItem, index) in subItems" :key="index" :to="subItem.to" router exact>
          <v-list-item-action>
            <v-icon>{{ subItem.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ subItem.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group> -->
      </v-list>
      <!-- <v-list dense nav>
        <v-list-item>
          <v-list-item-avatar class="align-self-center" color="white" contain>
            <v-img src="images/logo.jpg" max-height="30" />
          </v-list-item-avatar>
          <span v-if="user && user.user_level === 2" class="ecole">{{ ecolename }}</span>
          <span v-if="user && user.user_level === 3" class="ecole">{{ zonename }}</span>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2" />
      <v-list dense nav>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list> -->
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app color="#000000" dark dense>
      <v-app-bar-nav-icon v-if="user" color="#FFD700" @click.stop="drawer = !drawer" />
      <v-btn v-if="user" color="#FFD700" icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? "right" : "left"}` }}</v-icon>
      </v-btn>
      <span href="/inspire" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
        <h3 class="m-0 text-primary">
          <!-- <img src="images/logo.jpg" class="d-inline-block imgLogo" width="30" /> -->
           Bénédictions de l'Eternel
        </h3>
      </span>
      <!-- <div class="text-center">
        <img src="images/logo.jpeg" alt="" width="30" />
      </div> -->
      <!-- <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn> -->
      <!-- <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn> -->

      <!-- <v-toolbar-title><span color="#FFD700">MBE</span></v-toolbar-title> -->

      <v-spacer />
      <!-- <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn> -->
      <!-- <v-btn
        v-if="!user"
        color="#FFD700"
        class="ml-0"
        min-width="0"
        text
        title="Enregistrer"
        to="/register"
      >
        <v-icon>mdi-account</v-icon>
      </v-btn> -->
      <!-- <v-btn
        v-if="!user"
        color="#FFD700"
        class="ml-0"
        min-width="0"
        text
        title="Connecter"
        to="/loginDialog"
      >
        <v-icon small>mdi-lock</v-icon>
      </v-btn> -->
      <v-btn
        v-if="user"
        class="ml-0"
        min-width="0"
        title="Déconnecter"
        text
        @click="logout"
      >
        {{ privileges[user.user_level] }}, {{ get_initial(user.prenom) }}
      </v-btn>   
    </v-app-bar>    
    <v-main>      
      <v-alert
      v-if="nouveauUser !== null && user "
      type="success"
      dismissible
    icon="mdi-check-circle"
    border="top"
    elevation="2"
    >
       {{ user.nom }} {{ user.prenom }} vient de connecter 
    </v-alert>
      <!-- style="background-color: rgb(241, 241, 241);" -->
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
   <div v-if="showPopup" class="notification-popup" >
    {{ message }}
   </div>
    <v-footer :absolute="!fixed" app>
      <span class="ecole">&copy; {{ new Date().getFullYear() }} Design by EDROMEDIA</span>
    </v-footer>
  </v-app>
</template>
<script>
import axios from "axios";
import { mapActions, mapGetters } from "vuex";
// import {io} from 'socket.io-client'
import autoLogout from "../components/base/autoLogout.vue";
import Snackbar from "../components/Snackbar.vue";
import { role } from "~/role";
export default {
  name: "Default",
  components: { autoLogout, Snackbar },
  data() {
    return {
      message: "",
      showPopup:false,
      socket:null,
      loginDialog: false,
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      showAnnee: "",
      title: "MBE",
      ecole_name: "",
      zone_name: "",
      privileges: [],
      lastActivityTime: null,
      isPageRefreshed: false,
      nouveauUser:null,
    };
  },
  computed: {
    ...mapGetters("auth", ["anac"]),
    ...mapGetters("auth", ["user"]),
  
    items() {
      const items = [
        {
          icon: "mdi-apps",
          title: "Accueil",
          to: "/inspire",
        },       
        
      ];

      if (this.user && parseInt(this.user.user_level) === role.serveur) {
        items.push({
          icon: "mdi-food",
          title: "Gestion des Commandes",
          to: "/commande",
        });
       
      }

      if (this.user && parseInt(this.user.user_level) === role.superviseur) {
        items.push({
          icon: "mdi-view-dashboard",
          title: "Tableau de bord",
          to: "/admin",
        });
        items.push({
          icon: "mdi-file",
          title: "Rapport de Ventes",
          to: "/rapportdevente",
        });
        items.push({
          icon: "mdi-package-variant",
          title: "Produits",
          to: "/produit",
        });
        items.push({
          icon: "mdi-basket",
          title: "Approvisionnement",
          to: "/appro",
        });
       

        items.push({
          icon: "mdi-package-variant",
          title: "Produits",
          to: "/produit",
        });
        items.push({
          icon: "mdi-basket",
          title: "Achats",
          to: "/achat",
        });
      }
      if (this.user && parseInt(this.user.user_level) >= role.admin) {
        items.push({
          icon: "mdi-view-dashboard",
          title: "Tableau de bord",
          to: "/admin",
        });

        items.push({
          icon: "mdi-account",
          title: "Gestion Utilisateur",
          to: "/gestionUser",
        });

        items.push({
          icon: "mdi-account-multiple",
          title: "Inscription User",
          to: "/userInscription",
        });

        items.push({
          icon: "mdi-file",
          title: "Rapport de Ventes",
          to: "/rapportdevente",
        });
        items.push({
          icon: "mdi-basket",
          title: "Approvisionnement",
          to: "/appro",
        });
        items.push({
          icon: "mdi-basket",
          title: "Stockage",
          to: "/stock",
        });

        items.push({
          icon: "mdi-package-variant",
          title: "Produits",
          to: "/produit",
        });
        items.push({
          icon: "mdi-basket",
          title: "Achats",
          to: "/achat",
        });

        if (this.user && parseInt(this.user.user_level) === role.supadmin) {
       

        items.push({
          icon: "mdi-account",
          title: "Gestion Utilisateur",
          to: "/gestionUser",
        });
      }
       
      }
      return items;
    },

    subItems() {
      const subItem = [
        // {
        //   icon: "mdi-apps",
        //   title: "Accueil",
        //   to: "/",
        // },
        // {
        //   icon: "mdi-map-marker-radius-outline",
        //   title: "Carte Scolaire",
        //   to: "/carte",
        // },
      ];
      return subItem;
    },
  },

  mounted() {
    if (window) {
      axios.defaults.headers.common.Authorization =
        "Bearer " + localStorage.getItem("authToken");
    }
   // Écouter l'événement 'login' émis par le backend
   this.$socket.on('login', (user) => {
      this.nouveauUser = user;
      this.showNotification(user)
    });
    this.privileges = Object.keys(role);

   

    if (localStorage.authToken) {
      const data = {
        userId: localStorage.userId,
        token: localStorage.token,
        user_level: localStorage.user_level,
        nom: localStorage.nom,
        prenom: localStorage.prenom,
        anac: localStorage.anac,
      };

      this.setUser(data);
    }

    this.detectWakeup(this.logout);
    // Initialiser l'indicateur de rafraîchissement
  },

  methods: {
    ...mapActions("auth", ["sendLogoutRequest", "getUserData", "setUser"]),
    

    detectWakeup(callback) {
      const myWorker = new Worker("/DetectWakeup.js");

      myWorker.onmessage = function (ev) {
        if (ev && ev.data === "wakeup") {
          // wakeup here
          // this.logout()
          callback();
        }
      };
    },

    handleLogout() {
      // Utiliser sendBeacon pour envoyer une requête de déconnexion en arrière-plan
      const url = this.$axios.delete("auth/logout/");
      const token = localStorage.getItem("authToken");
      if (token) {
        const data = JSON.stringify({ token });
        navigator.sendBeacon(url, data);
      }
      // Nettoyer les informations de session
      localStorage.removeItem("authToken");
      localStorage.removeItem("user_level");
    },

    handleBeforeUnload(event) {
      // Marquer l'indicateur de rafraîchissement
      if (!this.isPageRefreshed) {
        this.handleLogout();
      }
      // Nettoyer l'indicateur pour les prochaines utilisations
      this.isPageRefreshed = false;
    },

    updateActivity() {
      this.lastActivityTime = Date.now();
      sessionStorage.setItem("lastActivityTime", this.lastActivityTime);
    },

    checkSessionTimeout() {
      const currentTime = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // Timeout de 30 minutes
      const lastActivity = sessionStorage.getItem("lastActivityTime");

      if (lastActivity && currentTime - lastActivity > sessionTimeout) {
        this.sendLogoutRequest();
      }
    },

    showNotification(user){
      if(Notification.permission === "granted"){
        //  new Notification('Nouvelle connexion'),
        // {
        //    body: user.prenom
        //    // icon:'mdi-account-user'
        //  }
      }
    },

    showPopupNotification(message){
      this.message = message
      this.showPopup = true
      setTimeout(() =>{
        this.showPopup = false;
      }, 5000)
    },
    get_initial(name) {
      const nom = name.split(" ");
      let initial = "";
      if (nom.length > 1) initial = nom[0].substring(0, 1) + nom[1].substring(0, 1);
      else initial = nom[0].substring(0, 2);

      return initial;
    },

   
    logout() {
      this.sendLogoutRequest();
      localStorage.removeItem("userToken");
      this.$router.push("/");
    },

   
  },
};
</script>
<style scoped>
.ecole {
  font-size: 11px;
}
.custom-container {
  max-width: 1200px; /* Par exemple, pour une largeur maximale de 1200px */
  margin: 0 auto; /* Centrer le conteneur */
}
.notification-popup{
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 9999;
  opacity: 0.9;
}
</style>
