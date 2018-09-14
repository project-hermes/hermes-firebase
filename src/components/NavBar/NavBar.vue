<template>
  <nav class="navbar is-white has-shadow">
    <div class="navbar-brand">
      <div class="navbar-item">
        <router-link :to="{name: 'main'}">
          <a>
            <h1 class="title">
              Project Hermes
            </h1>
          </a>
        </router-link>
      </div>
      <a
        :class="{'is-active': isToggled}"
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        @click="toggle()">
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
      </a>
      <UserButton class="navbar-item is-hidden-desktop" />
    </div>
    <div
      :class="{'is-active': isToggled}"
      class="navbar-menu">
      <div class="navbar-start">
        <!-- <router-link
          :to="{name: 'dives'}"
          :class="{'is-active': $route.name === 'dives'}"
          class="navbar-item">
          <ListIcon class="navbar__icon" />
          Dives
        </router-link> -->
      </div>
      <div class="navbar-end">
        <UserButton class="navbar-item is-hidden-touch" />
      </div>
    </div>
  </nav>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
import {UserButton} from '~/components';
import ListIcon from 'vue-feather-icons/icons/ListIcon';
export default {
    components: {
        UserButton,
        ListIcon
    },
    computed: {
        ...mapGetters({
            isToggled: 'nav/isToggled'
        })
    },
    methods: {
        ...mapActions({
            toggle: 'nav/toggle'
        })
    }
};
</script>
<style lang="scss" scoped>
@import '~/styles/vars.scss';

.navbar {
    opacity: 0.9;

    &.is-white .navbar-start .navbar-item,
    &.is-white .navbar-start .navbar-item.is-active,
    &.is-white .navbar-start .navbar-item:hover {
        color: $mainBlue;
    }
}

.navbar-brand {
    .title {
        color: $mainBlue;

        background: -webkit-linear-gradient(
            60deg,
            $softestBlue,
            $mainBlue,
            $softBlue,
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 1800% 1800%;
        animation: flow 20s ease infinite;
    }
}

.navbar__icon {
    margin-right: 8px;
    vertical-align: middle;
}

@keyframes flow {
    0% {
        background-position: 0% 82%;
    }
    50% {
        background-position: 100% 19%;
    }
    100% {
        background-position: 0% 82%;
    }
}
</style>
