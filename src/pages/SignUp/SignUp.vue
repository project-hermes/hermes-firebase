<template>
  <main>
    <div
      class="columns is-centered">
      <div class="column is-4">
        <div class="card">
          <div class="card-content">
            <div class="has-text-centered">
              <h1 class="title is-2">
                Project Hermes
              </h1>
            </div>
            <div class="sign-up">
              <form @submit.prevent="createUser">
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
@import '~/styles/vars.scss';

.card {
    margin-top: 3rem;
}

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

.sign-up {
    margin: 2rem;
}
</style>
