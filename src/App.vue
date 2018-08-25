<template>
  <div
    class="app__container">
    <router-view/>
  </div>
</template>
<script>
export default {
    name: 'App'
};
</script>
<style lang="scss">
@import '~/styles/vars.scss';
$navbar-z: 1001;
$navbar-item-color: $mainBlue;
// $navbar-burger-color: $mainBlue;
$navbar-item-hover-color: $mainBlue;
// $navbar-item-active-color: $darkOcean;
$navbar-box-shadow-color: rgba(0, 0, 0, 0.75);
$navbar-box-shadow-size: 0px 3px 20px -10px;
@import 'bulma/bulma.sass';

body {
    margin: 0;
    -webkit-overflow-scrolling: touch;
}

* {
    font-family: 'Lato', sans-serif;
}

body,
html,
#app,
.app__container {
    height: 100%;
}
</style>
