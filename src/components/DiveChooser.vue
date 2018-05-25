<template>
  <div class="card-container">
      <CardItem
        v-for="item in dives"
        :key="item.id"
        :id="item.id"
        :on-click="onClick"
        >
          Dive
          <br/>
          {{item.label}}
  </CardItem>
  </div>
</template>

<script>
    import CardItem from './CardItem/CardItem.vue';
    export default {
        components: {
            CardItem
        },
        props: {
            dives: {
                type: Array,
                default: []
            },
            onClick: {
                type: Function
            }
        }
    }
</script>

<style>
    .card-container .el-card {
        margin: 4px;
        border: 1px solid #b9b9b9;
        background-color: #dfe5ea;
        border-radius: 1px;
    }

    .card-container .el-card:hover {
        background-color: #f3faff;
    }
</style>
