<template>
  <v-snackbar v-model="show" :color="color">
  
      <v-icon  v-if="color==='success'" dark >
        mdi-check-circle
      </v-icon>
    
      <v-icon v-else-if="color==='error'" class="text-ligth" dark >
        mdi-close-circle
      </v-icon>
       
      <v-icon  v-else dark >
        mdi-alert-circle
      </v-icon>
     {{message}}
  
    <template #action="{ attrs }">
        <v-btn
          color="black"
          text
          v-bind="attrs"
          @click="show = false"
        >
          Fermer
        </v-btn>
      </template>
  </v-snackbar>
</template>

<script>
export default {
  data () {
    return {
      show: false,
      message: '',
      color: ''
    }
  },

  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'snackbar/showMessage') {
        this.message = state.snackbar.content
        this.color = state.snackbar.color
        this.show = true
      }
    })
  }
}
</script>