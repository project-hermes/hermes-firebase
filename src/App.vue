<template>
  <div
    class="app__container">
    <router-view/>
  </div>
</template>

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
