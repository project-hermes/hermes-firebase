<template>
  <main>
    <section class="hero">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title is-2">
            Project Hermes
          </h1>
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
              alt="Google logo"
              class="google-logo" >
            <span class="google-text">Sign in with Google</span>
          </button>
        </div>
        <div class="email-form">
          <form @submit.prevent="signInWithEmailAndPassword()">
            <div class="field">
              <label class="label">Email</label>
              <p class="control has-icons-left">
                <input
                  v-model="email"
                  class="input"
                  type="email"
                  placeholder="Email">
                <span class="icon is-small is-left">
                  <MailIcon />
                </span>
              </p>
            </div>
            <div class="field password-field">
              <label class="label">Password</label>
              <p class="control has-icons-left">
                <input
                  v-model="password"
                  class="input"
                  type="password"
                  placeholder="Password">
                <span class="icon is-small is-left">
                  <LockIcon />
                </span>
              </p>
              <p class="help is-pulled-right sign-up">
                <a
                  class="button is-text is-small"
                  @click="signUp">
                  Sign Up
                </a>
              </p>
            </div>
            <div class="field">
              <p class="control">
                <button
                  class="button is-link">
                  Login
                </button>
              </p>
              <p class="help is-danger">
                {{ error }}
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
            googleButton,
            error: ''
        };
    },
    computed: {
        ...mapGetters({
            isReady: 'auth/isReady'
        })
    },
    methods: {
        ...mapActions({
            authSignInWithEmailAndPassword: 'auth/signInWithEmailAndPassword',
            authSignInWithGoogle: 'auth/signInWithGoogle',
            signUp: 'auth/signUp'
        }),
        signInWithEmailAndPassword() {
            this.authSignInWithEmailAndPassword({
                email: this.email,
                password: this.password
            }).catch(err => {
                this.error = err.message;
            });
            this.resetError();
        },
        signInWithGoogle() {
            this.authSignInWithGoogle().catch(err => {
                this.error = err.message;
            });
            this.resetError();
        },
        resetError() {
            this.error = '';
        }
    }
};
</script>
<style lang="scss" scoped>
@import '~/styles/vars.scss';

.title {
    color: $mainBlue;

    background: -webkit-linear-gradient(
        60deg,
        $softestBlue,
        $mainBlue,
        $softBlue
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 1800% 1800%;
    animation: flow 20s ease infinite;
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
    color: #575757;
    font-size: 16px;
    line-height: 48px;
    font-family: Roboto, arial, sans-serif;
    font-weight: 500;
    letter-spacing: 0.21px;
    margin-left: 6px;
    margin-right: 6px;
    vertical-align: top;
}

.password-field,
.sign-up {
    z-index: 1;
    position: relative;
}
</style>
