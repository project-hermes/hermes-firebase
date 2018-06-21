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
    </div>
  </nav>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
export default {
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
