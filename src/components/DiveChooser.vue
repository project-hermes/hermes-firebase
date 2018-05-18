<template>
  <el-select v-model="value" placeholder="Select">
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
            }
        },
        data () {
            return {
                value: ''
            }
        }
    }
</script>
