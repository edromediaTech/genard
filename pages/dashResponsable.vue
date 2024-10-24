<template>    
    <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-row > 
      <v-col
      class="mt-4"
        cols="12"
        sm="6"
        lg="4"
      >
        <base-material-stats-card
          color="info"
          icon="mdi-account-plus"
          title="Elèves"
          :value="sumEleve"
          sub-icon="mdi-account"
          sub-text="Total Elèves"
        />
      </v-col>

      <v-col
      class="mt-4"
        cols="12"
        sm="6"
        lg="4"
      >
        <base-material-stats-card
          color="success"
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
        lg="4"
      >
        <base-material-stats-card
          color="pink"
          icon="mdi-human-male"
          title="Garcons"
          :value="sumgarcon"
          sub-icon="mdi-human-male"
          sub-text="Total Garcons"
        />
      </v-col>

      <!-- <v-col
      class="mt-4"
        cols="12"
        sm="6"
        lg="3"
      >
        <base-material-stats-card
          color="orange"
          icon="mdi-bunk-bed"
          title="Programmes"
          value=""
          sub-icon="mdi-alert"
          sub-icon-color="red"
          sub-text="Get More Space..."
        />
      </v-col>   -->
     
    </v-row>
    <v-row>
      
      <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
        <center>
         <v-progress-circular
          v-show="visible"
          :size="70"
          :width="7"
          color="info"
          indeterminate
          class="ma-auto"
        /></center>
        <span>Statistique elèves par classe</span>
        <apexchart width="400" type="bar" :options="options" :series="series"></apexchart>
      </v-col>
    <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
         <span>Pourcentage elèves par classe</span>
        <apexchart width="400" type="donut" :options="chartOptions" :series="seriesd"></apexchart>
   </v-col>
        <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
         <span>Pourcentage filles par classe</span>
        <apexchart width="400" type="pie" :options="chartOptionsf" :series="seriesf"></apexchart>
    </v-col>
      <v-col cols="12"
        sm="6"
        md="6"
        lg="6">
         <span>Statistique filles par classe</span>
        <apexchart width="400" type="bar" :options="optionsf" :series="seriesfl"></apexchart>
      </v-col> 
  </v-row>
<!-- <v-data-table :headers="headers" :items="eleves" :footer-props="{'items-per-page-options':[50, 100, -1]}">     
           
    </v-data-table> -->

  </v-container>
</template>
<script>
 import {mapMutations, mapActions } from 'vuex'
export default {
    middleware: 'responsable', 
      data () {
      return {
        visible: false,
        eleves:[],
        donnees: [],
        sumEleve: '',
        sumfille:'',  
        sumgarcon:'',      
        options: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: []
        }
      },
      series: [{
        name: '2020-2021',
        data: []
      }], 

       seriesd: [],
       chartOptions: {
       labels: []
},
   optionsf: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: []
        }
      },
      seriesfl: [{
        name: '2020-2021',
        data: []
      }], 

       seriesf: [],
       chartOptionsf: {
       labels: []
},
headers: [
     { text: "Classe", value: "nomclasse" },
     { text: "Fille", value: "nb_fille" },
     { text: "Garcon", value: "nb_garcon" },
     { text: "Total", value: "nb_eleve" },
],

      }

    },
     computed: {
  
 // ...mapGetters('dataUtil', ['ecole']),
  ...mapMutations('dataUtil', ['setEcoleData']),
     },
    mounted (){
        this.getdata()    
              
       },

       methods :{
          ...mapActions('dataUtil', [ 'getEcolenameData']),
  
            async getdata(){
               this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
                   await this.$axios.get('get-data/' + localStorage.responsable).then(response =>{
                      this.getEcolenameData(response.data.ecole)
                        localStorage.removeItem('ecole')
                        localStorage.removeItem('ecole_id')
                        localStorage.removeItem('niveau')
                        localStorage.setItem('ecole', response.data.ecole)                      
                        localStorage.setItem('ecole_id', response.data.ecole_id)
                        localStorage.setItem('niveau', response.data.niveau) 
                         this.get_total()                        
                     })
                },

     async get_total (){       
         this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')
         this.visible = true
               await this.$axios.get('total-eleve/' + localStorage.ecole_id +'|'+ localStorage.niveau +'|'+ localStorage.anac).then(response =>{
                   this.donnees = response.data
                   this.eleves = this.donnees.fille 
                   this.get_data_chart()
                   this.get_data_chart_donut()
                   this.get_data_chart_fille()
                    this.get_data_chart_donut_fille()
                  
                    this.calcul_sum()
                   // this.format_datatable()                                           
                   })
                    this.visible = false
                }, 
                
      get_data_chart (){                 
          this.donnees.total.forEach((el) => {                  
          this.options.xaxis.categories.push(el.nomclasse)
          this.series[0].data.push(el.nb_eleve)               
          })              
      },

      get_data_chart_donut (){                 
          this.donnees.total.forEach((el) => {                  
          this.chartOptions.labels.push(el.nomclasse)
          this.seriesd.push(el.nb_eleve)               
          })              
      },
      get_data_chart_fille (){                 
          this.eleves.forEach((el) => {                  
          this.optionsf.xaxis.categories.push(el.nomclasse)
          this.seriesfl[0].data.push(el.nb_fille)               
          })              
      },

      get_data_chart_donut_fille (){                 
          this.eleves.forEach((el) => {                  
          this.chartOptionsf.labels.push(el.nomclasse)
          this.seriesf.push(el.nb_fille)               
          })              
      },

        calcul_sum (){
          let sum = 0
          this.donnees.total.forEach((to) =>{
            sum += to.nb_eleve            
          })
          this.sumEleve = sum.toString()
          sum = 0
          this.donnees.fille.forEach((fl) =>{
            sum += fl.nb_fille            
          })
          this.sumfille = sum.toString()
          this.sumgarcon = (this.sumEleve - this.sumfille).toString()
        },

          
     async  getClasses () { 
          const responsable = localStorage.niveau; 
         this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('authToken')           
        await this.$axios.get('get-classe-responsable/'+ responsable).then(res => {
          this.classes = res.data         
        })
      },

          format_datatable (){
           const data = []
             const classe = this.getClasses()
            for(let i=0; i<classe.length; i++){
              let ob = {}
              let trouve = false
              this.donnees.fille.forEach((fl)=>{
                if(classe[i] === fl.id){
                  ob = fl
                  trouve = true
                  return false
                }
                if(trouve === false){               
                 ob = {'id': classe[i], 'nomclasse':'Inconnu', 'nb_fille':0}
                }
              })
              let trouv = false
              this.donnees.total.forEach((to)=>{
                if(classe[i] === to.id){
                  Object.assign(ob, ob, to)
                  trouv = true
                  return false
                }
                if(trouv === false){               
                 Object.assign(ob, ob, {'id': classe[i], 'nomclasse':'Inconnu', 'nb_eleve':0})
                }
              })
              data.push(ob)
            }
          console.log(data)
            this.eleves = data

          }
       }
        
}
</script>