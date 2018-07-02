<template>
  <nav class="navbar is-dark">
    <div class="navbar-brand">
      <div class="navbar-item">
        <h1 class="title has-text-white">Hermes</h1>
      </div>
      <a
        v-if="showToggle"
        :class="{'is-active': isToggled}"
        role="button"
        class="navbar-burger has-text-white is-hidden-tablet"
        aria-label="menu"
        aria-expanded="false"
        @click="toggle()">
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
        <span aria-hidden="true"/>
      </a>
      <UserButton class="navbar-item" />
    </div>
  </nav>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
import {UserButton} from '~/components';
export default {
    components: {
        UserButton
    },
    props: {
        showToggle: {
            type: Boolean,
            default: false,
            required: false
        }
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
.navbar-brand {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.user-button {
    flex: none;
}
</style>
