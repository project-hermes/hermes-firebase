<template>
  <main>
    <section class="hero is-dark is-bold">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">
            Project Hermes
          </h1>
          <h2 class="subtitle"/>
        </div>
      </div>
    </section>
    <div
      class="columns is-centered">
      <div class="column is-3">
        <div class="google-button-container">
          <button
            class="google-button"
            @click="signInWithGoogle">
            <img
              :src="googleButton"
              class="google-logo" >
            <span class="google-text">Sign in with Google</span>
          </button>
        </div>
        <div class="email-form">
          <form @submit="signInWithEmailAndPassword({email, password})">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  class="input"
                  type="email"
                  placeholder="Email">
                <span class="icon is-small is-left">
                  <MailIcon />
                </span>
              </p>
            </div>
            <div class="field">
              <p class="control has-icons-left">
                <input
                  class="input"
                  type="password"
                  placeholder="Password">
                <span class="icon is-small is-left">
                  <LockIcon />
                </span>
              </p>
            </div>
            <div class="field">
              <p class="control">
                <button class="button is-link">
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import googleButton from '~/img/google-sign-in-button.svg';
import MailIcon from 'vue-feather-icons/icons/MailIcon';
import LockIcon from 'vue-feather-icons/icons/LockIcon';
import {mapGetters, mapActions} from 'vuex';

export default {
    components: {
        MailIcon,
        LockIcon
    },
    data() {
        return {
            email: '',
            password: '',
            googleButton
        };
    },
    computed: {
        ...mapGetters({
            isReady: 'auth/isReady'
        })
    },
    methods: {
        ...mapActions({
            signInWithEmailAndPassword: 'auth/signInWithEmailAndPassword',
            signInWithGoogle: 'auth/signInWithGoogle'
        })
    }
};
</script>
<style lang="scss" scoped>
input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px white inset;
}

.email-form {
    margin: 2rem;
}

.google-button-container {
    margin: 2rem;
    display: flex;
    justify-content: center;
}

.google-button {
    padding: 0;
    border-radius: 2px;
    width: 100%;
    max-width: 220px;
    min-height: 40px;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    will-change: box-shadow;
    outline: 0;
    border-style: none;
}

.google-logo {
    cursor: pointer;
}

.google-text {
    color: #757575;
    font-size: 16px;
    line-height: 48px;
    font-family: Roboto, arial, sans-serif;
    font-weight: 500;
    letter-spacing: 0.21px;
    margin-left: 6px;
    margin-right: 6px;
    vertical-align: top;
}
</style>
