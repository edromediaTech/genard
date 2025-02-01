<template>
  <div class="container">
    <h1>Facture</h1>
    <div id="receipt" class="receipt">
      {{ receipt }}
    </div>
    <button @click="printReceipt">Imprimer</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      receipt: "", // Contenu de la facture
    };
  },
  created() {
    // Générer la facture au chargement du composant
    this.receipt = this.generateReceipt();
  },
  methods: {
    generateReceipt() {
      const maxwidth = 36;

      let header = "MA BOUTIQUE".padStart(maxwidth / 2 + 8, " ").padEnd(maxwidth, " ") + "\n";
      header += "Ticket de caisse".padStart(maxwidth / 2 + 8, " ").padEnd(maxwidth, " ") + "\n";
      header += "-".repeat(maxwidth) + "\n";

      const items = [
        ["Coca-Cola 33cl", 2.5],
        ["Chips Paprika", 1.8],
        ["Pain au chocolat", 1.2],
      ];

      const itemLines = items.map(([name, price]) => {
        return name.slice(0, 18).padEnd(18, " ")+ price.toFixed(2).padStart(5, " ");
      });

      const subtotal = items.reduce((sum, [, price]) => sum + price, 0);
      const tax = subtotal * 0.2;
      const total = subtotal + tax;

      const totalsSection = `
Sous-total${subtotal.toFixed(2).padStart(18, " ")}€
TVA (20%)${tax.toFixed(2).padStart(20, " ")}€
${"-".repeat(maxwidth)}
Total${total.toFixed(2).padStart(22, " ")}€
`;

      return header + itemLines.join("\n") + "\n" + "-".repeat(maxwidth) + "\n" + totalsSection;
    },
    printReceipt() {
      const receiptContent = this.receipt;

      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression Facture</title>
            <style>
              body {
                font-family: monospace;
                white-space: pre-wrap;
                margin: 20px;
              }
            </style>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    },
  },
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.receipt {
  border: 1px solid #ccc;
  padding: 10px;
  white-space: pre-wrap; /* Conserver les retours à la ligne */
  font-family: monospace;
  background-color: #f9f9f9;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>