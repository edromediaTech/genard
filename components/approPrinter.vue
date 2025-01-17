<template>
    <div class="body" >
  <div class="card-body " >
  <div class="header" >
      <div>
        <!-- <center><img src='images/logo.jpg' width="60" class="imag"></center> -->
    </div>
      <div  class="entete"><h3>Bénédiction de l'Eternel</h3>
         <center> <h5>Rue Bory & St-Charles, Fort-Liberté, Haiti</h5></center>
      </div>      
      
    </div>
    <center ><h5 class="ecole">Liste d'Approvisionnement</h5></center>
    <h5 style="text-align:right; padding-right:20%"  >Date : {{new Date() | moment(" Do/MM/YYYY")}}</h5>
       <v-simple-table id="pdf-container" class="theme--light no-dark-theme">
                <thead>
                  <tr>
                    <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix (HTG)</th>
                <th>Qté</th>
                <th>Prix d'Achat</th>
                                                  
                  </tr>
               </thead>
                <tbody>                                   
                  <tr v-for="produit in produits" :key="produit.id"  style="page-break-inside: avoid">
                    <td>{{ produit.nom }}</td>
                <td>{{ produit.categorie }}</td>
                <td>{{ produit.prix }}</td>
                <td>{{ produit.quantite }}</td>
                <td></td>                                       
                  </tr>                                                                                       
                </tbody>
              </v-simple-table>
             
          </div>
      </div>  
  </template>
  <script>
  export default {
    props : {produits: { type: Array, default: () => []} ,
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