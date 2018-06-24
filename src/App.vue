<template>
  <div class="app__container">
    <NavBar :show-toggle="showToggle"/>
    <router-view/>
  </div>
</template>

<script>
import {NavBar} from '~/components';
export default {
    components: {
        NavBar
    },
    data() {
        return {
            showToggle: false
        };
    },
    watchers: {
        $route() {
            this.showToggle = this.$route.path === '/dives';
        }
    },
    mounted() {
        this.showToggle = this.$route.path === '/dives';
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
.app__container {
    height: 100%;
}
</style>
