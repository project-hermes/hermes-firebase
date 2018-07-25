<template>
  <div class="coord-picker">
    <div class="field has-addons">
      <p class="control">
        <RangePicker
          v-model="range"
          class="coord-picker__range" />
      </p>
      <p class="control">
        <input
          v-model="coordinates"
          :class="{'is-danger': coordinates.length && !validCoordinates}"
          class="input"
          type="text"
          placeholder="Coordinates (ex. 35.78022, -78.639)">
      </p>
      <p class="control">
        <a
          class="button is-primary"
          @click="onClick">
          <SearchIcon />
        </a>
      </p>
    </div>
  </div>
</template>
<script>
import SearchIcon from 'vue-feather-icons/icons/SearchIcon';
import {RangePicker} from '~/components';
import isFinite from 'lodash/isFinite';

const latLngRegex = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/;
export default {
    components: {
        SearchIcon,
        RangePicker
    },
    model: {
        event: 'change'
    },
    props: {
        value: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            range: 50,
            coordinates: ''
        };
    },
    computed: {
        validCoordinates() {
            return latLngRegex.test(this.coordinates);
        },
        validRange() {
            return isFinite(this.range);
        }
    },
    watcher: {
        value() {
            this.setValues(this.value || {});
        }
    },
    mounted() {
        this.setValues(this.value || {});
    },
    methods: {
        setValues({range, latitude, longitude}) {
            this.range = range;
            this.coordinates =
                latitude && longitude ? `${latitude}, ${longitude}` : '';
        },
        parseNumbers(string) {
            return string
                .match(/[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/g)
                .map(Number);
        },
        onClick() {
            if (this.validCoordinates && this.validRange) {
                const [latitude, longitude] = this.parseNumbers(
                    this.coordinates
                );
                this.$emit('change', {
                    range: this.range,
                    latitude,
                    longitude
                });
            }
        }
    }
};
</script>
<style scoped lang="scss">
.coord-picker {
    .input,
    .button {
        height: 40px;
    }

    .input {
        width: 300px;
    }
}

.coord-picker__range {
    width: 100px;
}
</style>
