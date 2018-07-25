<template>
  <div class="demo">
    <main class="demo__main">
      <div class="container">
        <CoordinatePicker v-model="value"/>
      </div>
      <div>{{ value }}</div>
    </main>
  </div>
</template>
<script>
import {RangePicker, CoordinatePicker} from '~/components';
export default {
    components: {
        RangePicker,
        CoordinatePicker
    },
    data() {
        return {
            value: {
                coordinates: undefined,
                range: 500
            }
        };
    }
};
</script>
<style lang="scss" scoped>
</style>
