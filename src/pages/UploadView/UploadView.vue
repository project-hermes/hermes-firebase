<template>
  <main class="upload-view">
      <div class="columns is-centered">
          <div class="column is-three-quarters">
              <vue-dropzone
                ref="myVueDropzone"
                id="dropzone"
                :options="dropzoneOptions"
                :use-custom-slot="true"
                :include-styling="true">
                <UploadCloudIcon />
                <div>Upload Dive</div>
            </vue-dropzone>
          </div>
      </div>
  </main>
</template>
<script>
import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import UploadCloudIcon from 'vue-feather-icons/icons/UploadCloudIcon';

export default {
    components: {
        UploadCloudIcon,
        vueDropzone: vue2Dropzone
    },
    data() {
        return {
            dropzoneOptions: {
                url: 'https://httpbin.org/post',
                thumbnailWidth: 150,
                // headers: {'header': 'header value'}
            }
        };
    }
};
</script>
<style lang="scss">
.upload-view {
    height: 100%;

    .dropzone {
        margin-top: 5rem;
    }
}
</style>
