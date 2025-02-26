import colors from 'vuetify/es5/util/colors'

export default {
  env: {
  
    baseURL: process.env.BASE_URL  || 'https://backbenediction.onrender.com/api/' 
    // : 'https://base.ddne.net/api/'
  },

  
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Bénédictions',
    title: 'Bénédictions de l\'Eternel',
    htmlAttrs: {
      lang: 'en'
    },

  

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
      'leaflet/dist/leaflet.css'
  ],
  script: [
    {
   
    //  src: '/./static/ckeditor'
    }
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/jsonExcel.js',
    '~plugins/moment.js',
    '~plugins/apex.js',
    '~plugins/notifier.js',
    { src: '~/plugins/socket.js', ssr: false }, // Désactiver SSR pour Socket.IO
   
      { src: '@/plugins/vue-html2pdf', mode: 'client' },
    '~plugins/geolocalisation.js',
    '~plugins/vuetify-mask.js',
    { src: '~/plugins/leaflet.js', mode: 'client' },
   
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/moment',

    ['@nuxtjs/moment',{}],
    
  ],
  moment : {
    locales : ['fr'],

  },

  // Modules: https://go.nuxtjs.dev/config-modules
 
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
   

   // 'cookie-universal-nuxt'
    
   // '@nuxtjs/proxy'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
 
   axios: {
      // baseURL : 'http://192.168.0.109:3000/api/',
      //  baseURL : 'http://192.168.1.45:3000/api/',
      // baseURL : 'http://172.20.10.3:3000/api/',
        baseURL : 'https://backbenediction.onrender.com/api/',
      // //credentials: false,
      // proxy: true           
  },
  
  
//   proxy: {
//    "/api/":{
//   target: "http://base.suped-ddne.com/",    
//    pathRewrite: {"^/api/": ""}
//    }  
// },
   
   // '/api/': { target: 'https://base.suped-ddne.com/', pathRewrite: {'^/api/': ''}, changeOrigin: true }
  
  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#FFD700', // Or
          secondary: '#000000', // Noir
          accent: '#FFFFFF', // Blanc
          background: '#F5F5F5', // Gris clair
         
          // accent: colors.grey.darken3,
          // secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    
  }
}
