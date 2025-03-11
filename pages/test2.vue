<template>
  <v-container>
    <v-card>
      <v-card-title>Impression Ticket de Vente</v-card-title>
      <v-card-text>
        <v-btn color="primary" @click="connectToQZ">Connecter à QZ Tray</v-btn>
        <v-btn color="secondary" @click="listPrinters">Lister les imprimantes</v-btn>
        <v-btn color="success" @click="printInvoice">Imprimer le ticket</v-btn>
        <v-alert v-if="message" type="info" class="mt-3">{{ message }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import qz from "qz-tray";

export default {
  data() {
    return {
      message: "",
      selectedPrinter: null,
    };
  },
  methods: {
    async connectToQZ() {
      try {
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect({ host: "localhost" });
          this.message = "Connecté à QZ Tray";
        } else {
          this.message = "Déjà connecté à QZ Tray";
        }
      } catch (error) {
        console.error("Erreur de connexion à QZ Tray :", error);
        this.message = "Erreur de connexion à QZ Tray";
      }
    },

    async listPrinters() {
  try {
    const printers = await qz.printers.find();
    console.log("Imprimantes disponibles :", printers);

    // Remplace "Nom de mon imprimante thermique" par le nom réel de l'imprimante détectée
    const thermalPrinter = printers.find(p => p.includes("XP-58 (copy 5)"));
    
    if (thermalPrinter) {
      this.selectedPrinter = thermalPrinter;
      this.message = `Imprimante sélectionnée : ${this.selectedPrinter}`;
    } else {
      this.message = "Imprimante thermique non trouvée.";
    }
  } catch (error) {
    console.error("Erreur récupération imprimantes :", error);
    this.message = "Impossible de récupérer les imprimantes";
  }
},


    async printInvoice() {
      if (!this.selectedPrinter) {
        this.message = "Veuillez d'abord sélectionner une imprimante.";
        return;
      }

      const printData = [
        {
          type: "raw", // Impression directe
          format: "plain",
          data: "\x1B\x40", // Reset de l'imprimante
        },
        {
          type: "raw",
          format: "plain",
          data: "Ticket de vente\n-------------------\nProduit 1: 10$\nProduit 2: 20$\n-------------------\nTOTAL: 30$\n",
        },
        {
          type: "raw",
          format: "plain",
          data: "\x1D\x56\x41\x03", // Découpe du papier
        },
      ];

      try {
        await qz.print(this.selectedPrinter, printData);
        this.message = "Ticket imprimé avec succès !";
      } catch (error) {
        console.error("Erreur d'impression :", error);
        this.message = "Erreur lors de l'impression";
      }
    },
  },
};
</script>

<style scoped>
.v-btn {
  margin: 10px;
}
</style>
