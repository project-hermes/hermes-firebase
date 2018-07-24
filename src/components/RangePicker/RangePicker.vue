<template>
  <el-select
    v-model="model"
    class="range-picker"
    placeholder="Select"
    filterable
    allow-create
    @change="onSelect">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
      <span class="range-picker__label">{{ item.label }}</span>
    </el-option>
  </el-select>
</template>
<script>
import isFinite from 'lodash/isFinite';
export default {
    props: {
        value: {
            type: Number,
            default: 50
        },
        options: {
            type: Array,
            default: () => [
                {value: 5, label: '5 km'},
                {value: 50, label: '50 km'},
                {value: 500, label: '500 km'}
            ]
        }
    },
    data() {
        return {
            model: undefined
        };
    },
    watchers: {
        value() {
            this.model = this.value;
        }
    },
    mounted() {
        this.model = this.value;
    },
    methods: {
        onSelect(value) {
            if (isFinite(value)) {
                this.$emit('input', value);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
/deep/ .range-picker__label {
    &::after {
        // content: '';
    }
}
</style>
