<template>
  <div class="demo">
    <main class="demo__main">
      <div class="container">
        <el-date-picker
          v-model="value"
          type="date"
          placeholder="Pick a day"/>
      </div>
    </main>
  </div>
</template>
<script>
export default {
    data() {
        return {
            value: ''
        };
    }
};
</script>
<style lang="scss" scoped>
</style>
