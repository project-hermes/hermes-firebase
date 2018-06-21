<template>
  <div class="demo">
    <nav class="navbar is-dark">
      <div class="navbar-brand">
        <div class="navbar-item">
          <h1 class="title has-text-white">Hermes</h1>
        </div>
      </div>
    </nav>
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
