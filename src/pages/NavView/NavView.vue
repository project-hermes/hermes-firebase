<template>
  <div
    class="app__view">
    <NavBar
      v-if="isAuthorized"/>
    <main class="app__main">
      <router-view/>
    </main>
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
@import 'bulma/bulma.sass';
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
}

.app__main {
    height: calc(100% - 52px);
    overflow-y: auto;
}
</style>
