<template>
  <div
    class="user-button">
    <div
      :class="{'is-active': isActive}"
      tabindex="0"
      class="dropdown is-right"
      @click="toggle"
      @blur="toggle(false)"
      @keyup.enter="toggle">
      <div class="dropdown-trigger">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          class="user-button__icon"
          aria-haspopup="true"
          aria-controls="dropdown-menu2">
        <div
          v-else
          class="user-button__icon">
          <UserIcon />
        </div>
      </div>
      <div
        id="dropdown-menu2"
        class="dropdown-menu"
        role="menu">
        <div class="dropdown-content">
          <div class="dropdown-item">
            <div v-if="!user.isAnonymous">
              <p v-if="user.displayName"><strong>{{ user.displayName }}</strong></p>
              <p>{{ user.email }}</p>
            </div>
            <div v-else>
              <p><em>Anonymous User</em></p>
            </div>
          </div>
          <hr class="dropdown-divider">
          <a
            class="dropdown-item"
            tabindex="0"
            @blur="toggle(false)"
            @focus="toggle(true)"
            @click="signOut"
            @keyup.enter="signOut">
            Sign out
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
import UserIcon from 'vue-feather-icons/icons/UserIcon';
import isUndefined from 'lodash/isUndefined';

export default {
    components: {
        UserIcon
    },
    data() {
        return {
            isActive: false
        };
    },
    computed: {
        ...mapGetters({
            user: 'auth/user'
        })
    },
    methods: {
        ...mapActions({
            signOut: 'auth/signOut'
        }),
        toggle(override) {
            this.isActive = isUndefined(override) ? !this.isActive : override;
        }
    }
};
</script>
<style lang="scss" scoped>
.dropdown-trigger {
    height: 28px;
    width: 28px;
}

.user-button__icon {
    border-radius: 50%;
    cursor: pointer;
    height: 28px;
    width: 28px;
    color: #363636;
    background-color: whitesmoke;

    > svg {
        height: 28px;
        width: 28px;
    }
}

.dropdown,
.dropdown-menu {
    // outline: none;
}
</style>
