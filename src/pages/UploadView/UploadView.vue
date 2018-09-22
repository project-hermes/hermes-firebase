<template>
  <main class="upload-view">
    <div class="columns is-centered">
      <div class="upload-view--container">
        <div class="field">
          <div class="file is-medium is-boxed has-name is-primary">
            <label class="file-label">
              <input
                class="file-input"
                type="file"
                @change="onFileSelect">
              <span class="file-cta">
                <span class="file-icon">
                  <UploadCloudIcon />
                </span>
                <span class="file-label">
                  Upload dive
                </span>
              </span>
              <span
                :class="{'upload-view--file-name--empty': !fileName}"
                class="upload-view--file-name file-name">
                {{ fileName }}
              </span>
            </label>
          </div>
        </div>
        <progress v-if="status !== ''" class="progress is-success" :value="progress" max="100"></progress>
      </div>
    </div>
  </main>
</template>
<script>
import UploadCloudIcon from 'vue-feather-icons/icons/UploadCloudIcon';
import CheckIcon from 'vue-feather-icons/icons/CheckIcon';
import head from 'lodash/head';
import {mapGetters, mapActions} from 'vuex';

export default {
    components: {
        UploadCloudIcon,
        CheckIcon
    },
    data() {
        return {
            file: null
        };
    },
    computed: {
        ...mapGetters({
            progress: 'upload/progress',
            status: 'upload/status'
        }),
        fileName() {
            return this.file ? this.file.name : '';
        }
    },
    methods: {
        ...mapActions({
            uploadFile: 'upload/uploadFile'
        }),
        onFileSelect(event) {
            this.file = head(event.target.files);
            this.uploadFile({
                file: this.file
            });
        }
    }
};
</script>
<style lang="scss">
.upload-view {
    height: 100%;

    &--container {
        margin-top: 5rem;
    }
}
</style>
