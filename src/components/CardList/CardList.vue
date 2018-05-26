<template>
  <div class="item-container">
    <CardItem
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :on-click="onClick">
      {{ item.label }}
    </CardItem>
  </div>
</template>
<script>
import CardItem from '../CardItem/CardItem.vue';
export default {
    components: {
        CardItem
    },
    props: {
        items: {
            type: Array,
            required: true
        },
        onClick: {
            type: Function,
            required: true
        }
    }
};
</script>
