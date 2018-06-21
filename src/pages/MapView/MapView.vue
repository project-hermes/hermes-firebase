<template>
  <div class="map">
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
