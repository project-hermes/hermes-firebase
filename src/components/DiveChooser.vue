<template>
  <el-select
    v-model="value"
    placeholder="Select"
    @change="onChange"
    >
    <el-option
      v-for="item in dives"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
    export default {
        props: {
            dives: {
                type: Array,
                default: []
            },
            onChange: {
                type: Function
            }
        },
        data () {
            return {
                value: ''
            }
        }
    }
</script>
