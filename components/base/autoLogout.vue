<template>
  <div class="text-center">
    <v-dialog
      v-model="warningZone"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Alerte de déconnection
        </v-card-title>

        <v-card-text>
          Etes-vous toujours là ?, vous allez êtes deconnectés dans 1 minutes
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="warningZone = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import { mapActions } from 'vuex'
  export default {
    name: 'AutoLogout',
    data () {
      return {
        events: ['click', 'mousemove', 'keypress', 'load', 'mousedown', 'scroll'],
        warningTimer: null,
        logoutTimer: null,
        warningZone: false,
      }
    },
    mounted () {
      this.events.forEach(function (event) {
        window.addEventListener(event, this.resetTimers)
      }, this)

      this.setTimers()
    },
    destroyed () {
      this.events.forEach(function (event) {
        window.removeEventListener(event, this.resetTimers)
      }, this)

      this.resetTimers()
    },
    methods: {
      ...mapActions('auth', ['sendLogoutRequest']),
      logoutUser () {
        this.sendLogoutRequest()
        this.$router.push({name:'login'})
      },
      setTimers () {
        this.warningTimer = setTimeout(this.warningMessage, 59 * 60 * 1000)
        this.logoutTimer = setTimeout(this.logoutUser, 60 * 60 * 1000)
        this.warningZone = false
      },
      warningMessage () {
        this.warningZone = true
      },

      resetTimers () {
        clearTimeout(this.warningTimer)
        clearTimeout(this.logoutTimer)
        this.setTimers()
      },
    },
  }
</script>
