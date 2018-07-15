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
          <form @submit.prevent="createUser">
            <!-- <div
              class="field">
              <p class="control has-icons-left">
                <input
                  v-model="form.displayName"
                  :class="{'is-danger': form.displayName.length && !validDisplayName}"

                  class="input"
                  type="text"
                  placeholder="Display Name">
                <span class="icon is-small is-left">
                  <UserIcon />
                </span>
              </p>
            </div> -->
            <div
              class="field">
              <label class="label">Email</label>
              <p class="control has-icons-left">
                <input
                  v-model="form.email"
                  :class="{'is-danger': form.email.length && !validEmail}"

                  class="input"
                  type="email"
                  placeholder="Email">
                <span class="icon is-small is-left">
                  <MailIcon />
                </span>
              </p>
            </div>
            <div
              class="field">
              <label class="label">Password</label>
              <p class="control has-icons-left">
                <input
                  v-model="form.password"
                  :class="{'is-danger': form.password.length && !validPassword}"
                  class="input"
                  type="password"
                  placeholder="Password">
                <span class="icon is-small is-left">
                  <LockIcon />
                </span>
              </p>
              <p
                v-if="form.password.length && !validPassword"
                class="help is-danger">
                Password must be at least 8 characters long and container 1 uppercase letter, 1 lowercase letter, and 1 number.
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
import {validateEmail, validateDisplayName, validatePassword} from '~/util';

// TODO email verification
// TODO username
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
            return validateDisplayName(this.form.displayName);
        },
        validEmail() {
            return validateEmail(this.form.email);
        },
        validPassword() {
            return validatePassword(this.form.password);
        },
        validForm() {
            return this.validEmail && this.validPassword;
        }
    },
    methods: {
        ...mapActions({
            authCreateUser: 'auth/createUser',
            authSignInWithEmailAndPassword: 'auth/signInWithEmailAndPassword'
        }),
        createUser() {
            if (this.validForm) {
                return this.authCreateUser(this.form)
                    .then(() => {
                        return this.authSignInWithEmailAndPassword(this.form);
                    })
                    .catch(err => {
                        this.error = err.message;
                    });
            }
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
