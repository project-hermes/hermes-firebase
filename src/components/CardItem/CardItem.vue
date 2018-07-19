<template>
  <div
    class="card"
  >
    <slot />
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
.card {
    padding: 1em;
    margin: 4px;
    border: 1px solid #888;
    border-radius: 1px;
    overflow-x: hidden;

    &:hover {
        cursor: pointer;
    }

    .hp-card-text {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
