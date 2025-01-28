const escpos = require('escpos');

// Vérifiez que le module USB est chargé
try {
  escpos.USB = require('escpos-usb');
} catch (error) {
  console.error('Impossible de charger escpos-usb :', error);
}

// Vérifiez si un périphérique USB est détecté
let device;
try {
  device = new escpos.USB(); // Détecte l'imprimante par défaut
} catch (error) {
  console.error('Erreur lors de la création du périphérique USB :', error);
}

if (device) {
  const printer = new escpos.Printer(0x0408, 0x5368);

  // Ouvrir la connexion et imprimer
  device.open(() => {
    printer
      .align('ct') // Aligner au centre
      .size(2, 2)  // Taille de la police
      .text('Titre de la Facture') // Titre
      .drawLine()  // Ligne séparatrice
      .align('lt') // Aligner à gauche
      .text('Produit 1     10.00 USD') // Produit 1
      .text('Produit 2     5.00 USD') // Produit 2
      .feed(2) // Saut de ligne
      .cut()  // Couper le papier
      .close();
  });
} else {
  console.error('Aucun périphérique USB trouvé ou erreur de configuration.');
}