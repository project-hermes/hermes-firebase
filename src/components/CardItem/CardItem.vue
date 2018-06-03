<template>
  <div
    class="card-container"
    @click="_onClick(item)">
    <el-card shadow="hover">
      <slot />
    </el-card>
  </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            required: false,
            default: () => ({})
        },
        onClick: {
            required: true,
            type: Function
        }
    },
    methods: {
        _onClick(item) {
            this.onClick(item);
        }
    }
};
</script>
<style>
.card-container:hover {
    cursor: pointer;
}
</style>
