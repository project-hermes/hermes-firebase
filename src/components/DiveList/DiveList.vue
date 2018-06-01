<template>
  <div class="card-list">
    <CardItem
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :on-click="onClick">
      <div>
        <strong>Dive</strong>
      </div>
      <div>{{ item.id }}</div>
      <div>{{ item.label }}</div>
      <div>{{ item.data.sampleCount }} samples</div>
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
<style>
.card-list {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: 100%;
}
</style>
