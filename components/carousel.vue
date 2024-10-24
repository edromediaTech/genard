<template>
  <v-carousel cycle height="600" hide-delimiter-background show-arrows-on-hover>
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
          src: "images/empire.png",
        },
        {
          src: "images/1.jpeg",
        },
        {
          src: "images/2.jpeg",
        },
        {
          src: "images/3.jpeg",
        },

        {
          src: "images/4.jpeg",
        },
      ],
    };
  },
};
</script>
