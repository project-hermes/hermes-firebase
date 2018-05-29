<template>
  <div
    class="card-container"
    @click="_onClick(id)">
    <el-card shadow="hover">
      <slot />
    </el-card>
  </div>
</template>
<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        onClick: {
            required: true,
            type: Function
        }
    },
    methods: {
        _onClick(id) {
            this.onClick(id);
        }
    }
};
</script>
<style>
.card-container:hover {
    cursor: pointer;
}
</style>
