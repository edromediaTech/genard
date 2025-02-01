async fetchDashboardData() {
  try {
    // Récupérer les commandes et produits
    const ordersResponse = await this.$axios.get("/commandes");
    const productsResponse = await this.$axios.get("/produits");
    const orders = ordersResponse.data;
    const products = productsResponse.data;

    // Normaliser les dates
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD en UTC
    const currentMonth = new Date().toISOString().slice(0, 7); // Format YYYY-MM

    // Filtrer les commandes d'aujourd'hui
    const todayOrders = orders
      .filter(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        return orderDate === today;
      })
      .map(order => {
        if (order.total === 0) {
          order.total = order.articles.reduce((sum, article) => {
            return sum + (article.produit.prix * article.quantite);
          }, 0);
        }
        return {
          ...order,
          date: new Date(order.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }),
        };
      });

    // Calculer les statistiques principales
    this.totalSales = orders.reduce((sum, order) => {
      const montant = order.total === 0 
        ? order.articles.reduce((sum, article) => sum + (article.produit.prix * article.quantite), 0) 
        : order.total;
      return sum + montant;
    }, 0);

    this.dailySales = todayOrders.reduce((sum, order) => {
      const montant = order.total === 0 
        ? order.articles.reduce((sum, article) => sum + (article.produit.prix * article.quantite), 0) 
        : order.total;
      return sum + montant;
    }, 0);

    this.monthlySales = orders
      .filter(order => {
        const orderMonth = new Date(order.date).toISOString().slice(0, 7);
        return orderMonth === currentMonth;
      })
      .reduce((sum, order) => {
        const montant = order.total === 0 
          ? order.articles.reduce((sum, article) => sum + (article.produit.prix * article.quantite), 0) 
          : order.total;
        return sum + montant;
      }, 0);

    // Mettre à jour les autres données
    this.lowStockItems = products.filter(product => product.quantite <= product.critique);
    this.recentOrders = todayOrders;
  } catch (error) {
    console.error("Erreur lors de la récupération des données du dashboard :", error);
  }
}



this.dailySales = todayOrders.reduce((sum, order) => {
  const montant = order.total === 0 
    ? order.articles.reduce((sum, article) => sum + (article.produit.prix * article.quantite), 0) 
    : order.total;
  return sum + montant;
}, 0);

this.monthlySales = orders
  .filter(order => {
    const orderMonth = new Date(order.date).toISOString().slice(0, 7);
    return orderMonth === currentMonth;
  })
  .reduce((sum, order) => {
    const montant = order.total === 0 
      ? order.articles.reduce((sum, article) => sum + (article.produit.prix * article.quantite), 0) 
      : order.total;
    return sum + montant;
  }, 0);
