<template>
    <div class="body" >
  <div class="card-body " >
  <div class="header" >
      <div>
        <center><img src='images/amoirie.jpg' width="80" class="imag"></center>
    </div>
      <div  class="entete"><h4>MINISTERE DE L'EDUCATION NATIONALE ET DE LA FORMATION PROFESSIONNELLE</h4>
         <center> <h4>Direction Départementale d'Education du Nord'Est</h4></center>
      </div>      
      
    </div>
    <!-- <center ><h5 class="ecole">{{texte}}</h5></center> -->
       <v-simple-table >
                <thead>
                  <tr>
                    <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix (HTG)</th>
                <th>Qté</th>
                <th>Remplacés</th>
                <th>Défectueux</th>
                <th>Critiques</th>
                <th>Alertes</th>                                   
                  </tr>
               </thead>
                <tbody>                                   
                  <tr v-for="produit in produits" :key="produit.id"  style="page-break-inside: avoid">
                    <td>{{ produit.nom }}</td>
                <td>{{ produit.categorie }}</td>
                <td>{{ produit.prix }}</td>
                <td>{{ produit.quantite }}</td>
                <td>{{ produit.ramplacement }}</td>
                <td>{{ produit.defectue }}</td>
                <td>{{ produit.critique }}</td>
                <td>{{ produit.alerte }}</td>                                        
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