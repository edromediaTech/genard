<template>
  <v-carousel cycle height="700" hide-delimiter-background show-arrows-on-hover>
    <v-carousel-item
      v-for="(item, i) in items"
      :key="i"
      :src="item.src"
    ></v-carousel-item>
  </v-carousel>
</template>
<script>
export default {
  data() {
    return {
      items: [
        {
          src: "images/market1.jpg",
        },
      
        {
          src: "images/market2.jpg",
        },
        {
          src: "images/resto3.jpg",
        },

        {
          src: "images/resto4.jpg",
        },
      ],
    };
  },
};
</script>
