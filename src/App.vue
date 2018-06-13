<template>
  <Dives />
</template>

<script>
import Dives from './pages/Dives/Dives.vue';
export default {
    components: {
        Dives
    }
};
</script>

<style lang="scss">
@import 'bulma/bulma.sass';
body {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-overflow-scrolling: touch;
}

body,
html {
    height: 100%;
}
</style>
