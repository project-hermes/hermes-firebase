<template>
  <div class="demo">
    <main class="demo__main">
      <div class="container">
        <RangePicker
          v-model="value"
        />
      </div>
    </main>
  </div>
</template>
<script>
import {RangePicker} from '~/components';
export default {
    components: {
        RangePicker
    },
    data() {
        return {
            value: 50
        };
    }
};
</script>
<style lang="scss" scoped>
</style>
