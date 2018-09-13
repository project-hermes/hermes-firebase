<template>
  <div
    class="user-button">
    <div
      :class="{'is-active': isActive}"
      class="dropdown is-right"
    >
      <div
        class="dropdown-trigger"
        tabindex="0"
        @click="toggle"
        @blur="toggle(false)"
        @keyup.enter="toggle"
      >
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          class="user-button__icon"
          aria-haspopup="true"
          aria-controls="dropdown-menu  ">
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
    // transition: transform 200ms, box-shadow 200ms;
    // position: relative;
    border-radius: 50%;
    cursor: pointer;
    height: 28px;
    width: 28px;
    color: #363636;
    background-color: whitesmoke;

    // &:hover {
    //     transform: translateY(-1px);
    //     box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
    // }

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
