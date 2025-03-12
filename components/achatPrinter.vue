<template>
    <div class="body" >
  <div class="card-body " >
  <div class="header" >
      <div>
        <!-- <center><img src='images/logo.jpg' width="60" class="imag"></center> -->
    </div>
    <div  class="entete"><h3>Genard Market</h3>
         <center> <h5>Rue St-Charles, Carrenage, Fort-Liberté, Haiti</h5></center>
      </div>     
      
    </div>
    <center ><h5 class="ecole">Liste des Achats</h5></center>
    <h5 style="text-align:right; padding-right:20%"  >Date : {{new Date() | moment(" Do/MM/YYYY")}}</h5>
       <v-simple-table id="pdf-container" class="theme--light no-dark-theme">
                <thead>
                  <tr>
                    <th>Produits</th>
                <th>Fournisseurs</th>
                <th>Prix (HTG)</th>
                <th>Qté</th>
                                               
                  </tr>
               </thead>
                <tbody>                                   
                  <tr v-for="produit in transactions" :key="produit.id"  style="page-break-inside: avoid">
                    <td>{{ produit.produitId.nom }}</td>
                <td>{{ produit.fournisseur }}</td>
                <td>{{ produit.prix }}</td>
                <td>{{ produit.quantite }}</td>
                                                       
                  </tr>                                                                                       
                </tbody>
              </v-simple-table>
             
          </div>
      </div>  
  </template>
  <script>
  export default {
    props : {transactions: { type: Array, default: () => []} ,
     texte:{ type:String, default: ''},
    
    },
      data (){
          return{
          n:0,
        }
      },
      methods : {
          check_n (){
              if(this.n % 14 === 0){                  
                  return true
              }
              else 
              {
                  this.n++
                  return false
              }
          }
      } 
  }
  </script>
  <style scoped>
  .no-dark-theme {
  background-color: white !important;
  color: black !important;
}

.no-dark-theme * {
  background-color: white !important;
  color: black !important;
  box-shadow: none !important;
}

  table{
  border-collapse: collapse; 
  width: 100%;
  margin-top: 20px;  
  }
  th,td{
     border:1px solid #ddd;
     padding: 8px;
   }
   .entete{
       text-align: center;  
       border-bottom: 1px solid gray;
        margin-top: 5px;
   }
   .imag{
       margin-bottom: 0%;
   }
   .body{
       margin: 30px;
   }
   .ecole{
       margin-top: 20px ;
   }
  
  
  </style>