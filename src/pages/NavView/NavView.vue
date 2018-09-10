<template>
  <div
    class="app__view">
    <NavBar
      v-if="isAuthorized"/>
      <router-view class="app__main" />
  </div>
</template>

<script>
import {NavBar} from '~/components';
import {mapGetters} from 'vuex';

export default {
    components: {
        NavBar
    },
    computed: {
        ...mapGetters({
            isAuthorized: 'auth/isAuthorized'
        })
    }
};
</script>

<style lang="scss">
body {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-overflow-scrolling: touch;
}

body,
html,
#app,
.app__view {
    height: 100%;

    .navbar {
        // opacity: 0.9;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
    }

    .app__main {
        padding-top: 52px;
        height: 100%;
        overflow-y: auto;
    }
}

</style>
