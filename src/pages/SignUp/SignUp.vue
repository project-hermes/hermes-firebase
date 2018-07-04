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
        <div class="sign-up">
          <form @submit="createdByUser">
            <div
              :class="{'is-valid': validDisplayName}"
              class="field">
              <p class="control has-icons-left">
                <input
                  v-model="displayName"
                  class="input"
                  type="text"
                  placeholder="Display Name">
                <span class="icon is-small is-left">
                  <UserIcon />
                </span>
              </p>
            </div>
            <div
              :class="{'is-valid': validEmail}"

              class="field">
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
            <div
              :class="{'is-valid': validPassword}"

              class="field">
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
            </div>
            <div class="field">
              <p class="control">
                <button class="button is-link">
                  Sign Up
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
import MailIcon from 'vue-feather-icons/icons/MailIcon';
import LockIcon from 'vue-feather-icons/icons/LockIcon';
import UserIcon from 'vue-feather-icons/icons/UserIcon';
import {mapActions} from 'vuex';

// TODO: check bulma class for validation on input
// TODO: determine what I want to make valid for each input.
// TODO: do I need to explicitly sign in after creating a user?
// Email validation?
export default {
    components: {
        MailIcon,
        LockIcon,
        UserIcon
    },
    data() {
        return {
            form: {
                displayName: '',
                email: '',
                password: ''
            },
            error: ''
        };
    },
    computed: {
        validDisplayName() {
            return this.form.displayName.length > 0;
        },
        validEmail() {
            return this.form.email.length > 0;
        },
        validPassword() {
            return this.form.password.length > 0;
        }
    },
    methods: {
        ...mapActions({
            authCreateUser: 'auth/createUser',
            authSignInWithEmailAndPassword: 'auth/signInWithEmailAndPassword'
        }),
        createUser() {
            if (this.isValid()) {
                return this.authCreateUser(this.form)
                    .then(() => {
                        return this.authSignInWithEmailAndPassword(this.form);
                    })
                    .catch(err => {
                        this.error = err.message;
                    });
            }
        },
        isValid() {
            const {validDisplayName, validEmail, validPassword} = this;
            return validDisplayName && validEmail && validPassword;
        }
    }
};
</script>
<style lang="scss" scoped>
input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px white inset;
}

.sign-up {
    margin: 2rem;
}
</style>
