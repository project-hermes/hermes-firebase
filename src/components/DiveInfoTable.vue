<template>
    <el-table
      :data="info"
      style="width: 100%">
      <el-table-column
        prop="prop"
        label="Parameter"
        width="180">
      </el-table-column>
      <el-table-column
        prop="max"
        label="Max"
        width="180">
      </el-table-column>
      <el-table-column
        prop="min"
        label="Min">
      </el-table-column>
      <el-table-column
        prop="avg"
        label="Avg">
      </el-table-column>
    </el-table>
</template>

<script>
    export default {
        props: {
            info: {
                type: Array
            }
        }
    }
</script>
