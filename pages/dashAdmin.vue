<template>    
    <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-row >
       <v-col  cols="12"   sm="6"    md="11">
       <v-select    
         v-model="an"
         :items="annee"                            
         @change="change_anac(an)"                                           
        ></v-select>                           
      </v-col>                           
         <v-progress-circular
          v-show="visible"
          :size="20"
          :width="3"
          color="info"
          indeterminate
          class="ma-auto"/>
       <v-col  class="mt-4"  cols="12"  sm="6"   md="4"  lg="4" >
        <base-material-stats-card
          color="orange"
          icon="mdi-home"
          title="Ecoles"
          :value="sumEcole"        
          sub-icon="mdi-home"
          sub-icon-color="red"
          sub-text="Total Ecoles"
        />
      </v-col> 
      <v-col   class="mt-4"  cols="12"  sm="6"   md="4"  lg="4">
        <base-material-stats-card
          color="success"
          icon="mdi-account-plus"
          title="Elèves"
          :value="sumEleve"
          sub-icon="mdi-account"
          sub-text="Total elèves"
        />
      </v-col>
      <v-col  class="mt-4"   cols="12"   sm="6"    md="4"   lg="4">
        <base-material-stats-card
          color="purple"
          icon="mdi-account"
          title="Enseignants"
          :value="sumEnseignant"
          sub-icon="mdi-account"
          sub-text="Total enseignants"
        />
      </v-col>

      <v-col
      class="mt-4"
        cols="12"
        sm="6"
         md="4"
        lg="4"
      >
        <base-material-stats-card
          color="pink"
          title="Filles"
          icon="mdi-human-female"
          :value="sumfille"
          sub-icon="mdi-human-female"
          sub-text="Total filles"
        />
      </v-col>

      <v-col
      class="mt-4"
        cols="12"
        sm="6"
         md="4"
        lg="4"
      >
        <base-material-stats-card
          color="primary"
          icon="mdi-human-male"
          title="Garcons"
          :value="sumgarcon"
          sub-icon="mdi-human-male"
          sub-text="Total garcons"
        />
      </v-col> 
      <v-col  cols="12"
        sm="6"
        md="4"
        lg="4">
         <span><center>Décision de fin d'année {{anac1}}</center></span>
        <apexchart  v-if="show" width="220" type="radialBar" :options="chartDec" :series="seriesdec"></apexchart>
   </v-col>
       
    </v-row>
     <v-row>
      
      <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
       
        
        <span>Statistique écoles par district</span>
        <apexchart width="400" type="bar" :options="options" :series="series"></apexchart>
      </v-col>
    <v-col cols="12"
        sm="6"
        md="6"
         
        lg="6">
        <span>Pourcentage élèves par secteur</span>
        <apexchart width="350" type="donut" :options="chartOptions" :series="seriesd"></apexchart>
   </v-col>
   
       <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
         <span>Pourcentage élèves par district</span>         
        <apexchart width="400" type="pie" :options="chartOptionsl" :series="seriesl"></apexchart>
    </v-col>
      <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
       <span>Statistique élèves par district</span>
        <apexchart width="430" type="bar" :options="optionsl" :series="seriesel"></apexchart>
      </v-col>  
  </v-row>
  </v-container>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
    middleware: 'admin', 
      data () {
      return {
       nb_ecole:[],
       donnees:[],
       decisions:'',
        sumEleve: '',
        sumfille:'',  
        sumgarcon:'', 
        sumEcole:'',
        sumEnseignant:'',
        eleved:'',
        ecoles:[],
        enseignants:'',
        show :true,
        ecoled:'',
        percent:'',
        anac1:'',
        secteur:{},
         annee: ['2020-2021', '2021-2022'],
      an: '',
        visible:false,
         options: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: []
        }
      },
      series: [{
        name: '',
        data: []
      }], 
        optionsl: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: []
        }
      },
      seriesel: [{
        name: '',
        data: []
      }],

       seriesd: [],
       chartOptions: {
       labels: []
        },
        seriesl: [],
       chartOptionsl: {
       labels: []
        },
         seriesdec: [],
       chartDec: {
       labels: []
        },    
       
      
      }
  },
  computed:{
        ...mapGetters('dataUtil', ['anac'])
  },
    mounted (){     
          this.getEcole()
          this.getEnseignant()
       },
       methods :{
              ...mapActions('dataUtil', [ 'getAnacDataP']),

            async getEcole(){
                this.visible = true          
                await this.$axios.get( 'ecole/').then( response => {                
                  this.ecoles =  response.data;  
                  this.sumEcole = response.data.length                               
                this.visible = false                    
                  })               
           },

       async getStatEcoleDis(){
              this.visible = true          
              await this.$axios.get( 'ecole/ecoped/count').then( response => {                
                  this.ecoledis =  response.data;                                            
                  this.visible = false                    
                  }) 
                this.get_data_chart()
                this. get_data_chart_donut()            
          },

      async getEnseignant(){
              this.visible = true          
                await this.$axios.get( 'enseignant/nbEnseignant/').then( response => {                
                  this.enseignants =  response.data;  
                  this.sumEnseignant = response.data.nbEnseignant                               
                  this.visible = false                    
                  })             
      },

          async get_ecole (){
                    this.visible = true
                    this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.authToken
                      await this.$axios.get('get-info/'+localStorage.anac).then(response =>{                      
                              this.donnees = response.data
                           this.sumEleve = response.data.eleves.toString()
                           this.sumEnseignant = response.data.enseignants.toString()
                           this.sumEcole = response.data.ecoles.toString()
                           this.sumfille = response.data.filles.toString()
                           this.sumgarcon = (response.data.eleves - response.data.filles).toString()
                           this.ecoled = this.donnees.ecoledis
                           this.eleved = this.donnees.elevedis
                           this.percent= this.donnees.deci.percent
                           this.decisions = this.donnees.deci.dec
                           this.anac1 = localStorage.anac  
                           this.secteur = response.data.secteur[0]                            
                                                        
                   })
                   this.visible = false
            },

              async get_ecole_info (){
                    this.visible = true
                    this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.authToken
                      await this.$axios.get('get-info/'+localStorage.anac).then(response =>{                      
                              this.donnees = response.data
                           this.sumEleve = response.data.eleves.toString()
                           this.sumEnseignant = response.data.enseignants.toString()
                           this.sumEcole = response.data.ecoles.toString()
                           this.sumfille = response.data.filles.toString()
                           this.sumgarcon = (response.data.eleves - response.data.filles).toString()
                           this.ecoled = this.donnees.ecoledis
                           this.eleved = this.donnees.elevedis
                           this.percent= this.donnees.deci.percent
                           this.decisions = this.donnees.deci.dec
                             this.anac1 = localStorage.anac  
                           this.secteur = response.data.secteur[0]
                              })
                   this.visible = false

            },


       get_data_chart (){                            
          this.ecoledis.forEach((el) => {                             
          this.options.xaxis.categories.push(el.districtName)         
          this.series[0].data.push(el.ecoleCount)                         
          })                      
      },

      

      get_data_chart_donut (){                 
          this.ecoledis.forEach((el) => {                  
          this.chartOptions.labels.push(el.districtName)
          this.seriesd.push(el.ecoleCount)                    
          })              
      },

      get_data_chart_donut1 (){              
                            
          this.chartOptions.labels.push('Public')
          this.seriesd.push(this.secteur.Public) 
                    
          this.chartOptions.labels.push('Privé')
          this.seriesd.push(this.secteur.Prive)   
                       
      },
      

       get_dec_chart_donut (){  
                      
         // this.decisions.forEach((el) => {                  
          this.chartDec.labels.push(this.decisions)
         this.seriesdec.push(this.percent )                    
         // })              
      },
      get_data_chart_el (){                            
          this.eleved.forEach((el) => {                  
          this.optionsl.xaxis.categories.push(el.nom)         
          this.seriesel[0].data.push(el.nb_eleve)                              
          })              
      },

      get_data_chart_donut_el (){                 
            this.eleved.forEach((el) => {                  
          this.chartOptionsl.labels.push(el.nom)
          this.seriesl.push(el.nb_eleve) 
                    
          })              
      },


    async change_anac(annee){
      this.visible = true
      this.show = false
      await this.$axios.get('set-anac/'+annee).then( res =>{
         localStorage.removeItem('anac')    
     
        this.visible = false
         this.$router.go()
            this.getAnacDataP(annee)
          localStorage.setItem('anac', annee)
         
          this.get_ecole_info()
          this.show = true
      })
       
    }

            }
        
}
</script>