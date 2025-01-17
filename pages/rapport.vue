app.get("/rapport-ventes", async (req, res) => {
    const { dateDebut, dateFin, serveurId } = req.query;
  
    try {
      const query = {
        date: { $gte: new Date(dateDebut), $lte: new Date(dateFin) },
      };
      if (serveurId) query.serveurId = serveurId;
  
      const ventes = await Vente.find(query).populate("serveur produits.produit");
  
      const rapport = ventes.reduce((acc, vente) => {
        const serveur = vente.serveur.nom;
        if (!acc[serveur]) {
          acc[serveur] = { totalVentes: 0, produitsVendus: [] };
        }
        acc[serveur].totalVentes += vente.total;
        vente.produits.forEach((item) => {
          const produit = {
            nom: item.produit.nom,
            quantite: item.quantite,
            prix: item.prix,
          };
          acc[serveur].produitsVendus.push(produit);
        });
        return acc;
      }, {});
  
      const result = Object.keys(rapport).map((serveur) => ({
        serveur,
        totalVentes: rapport[serveur].totalVentes,
        produitsVendus: rapport[serveur].produitsVendus,
      }));
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      res.status(500).send("Erreur serveur");
    }
  });