<template>
  <nav class="navbar is-dark">
    <div class="navbar-brand">
      <div class="navbar-item">
        <router-link :to="{name: 'main'}">
          <a>
            <h1 class="title has-text-white">
              Project Hermes
            </h1>
          </a>
        </router-link>
      </div>
      <a
        :class="{'is-active': isToggled}"
        role="button"
        class="navbar-burger has-text-white"
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
      class="navbar-menu"
    >
      <div class="navbar-start">
        <router-link
          :to="{name: 'dives'}"
          :class="{'is-active': $route.name === 'dives'}"
          class="navbar-item">
          <ListIcon class="navbar__icon" />
          Dives
        </router-link>
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
.navbar {
    z-index: 500; // to beat leaflet
}

.navbar__icon {
    margin-right: 8px;
    vertical-align: middle;
}

// .navbar-brand {
//     display: flex;
//     justify-content: space-between;
//     width: 100%;
// }
//
// .user-button {
//     flex: none;
// }
</style>
