<template>
  <v-container id="dashboard" fluid tag="section">
    <v-row justify="start" align="start">
      <v-col cols="12" sm="8" md="12">
        <Carousel></Carousel>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Carousel from "../components/carousel";

export default {
  components: { Carousel },
  data() {
    return {    
      page: 1,     
      visible: false,
     };
  },
  mounted() {},
  methods: {

  },
};
</script>
