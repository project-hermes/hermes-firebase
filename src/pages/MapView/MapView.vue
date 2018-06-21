<template>
  <div class="map">
    <nav class="navbar is-dark">
      <div class="navbar-brand">
        <div class="navbar-item">
          <h1 class="title has-text-white">Hermes</h1>
        </div>
      </div>
    </nav>
    <main class="map__main">
      <div class="container">
        <SimpleMap
          style="height: 800px;"
        />
      </div>
    </main>
  </div>
</template>
<script>
import {SimpleMap} from '~/components';
export default {
    components: {
        SimpleMap
    }
};
</script>
<style lang="scss" scoped>
</style>
