<template>
  <!-- <el-select
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
  </el-select> -->
  <div class="card-container">
      <el-card
        class="card"
        v-for="item in dives"
        :key="item.id">
        <div class="card-item" @click="click(item.value)">
          Dive
          <br/>
          {{item.label}}
        </div>
      </el-card>
  </div>
</template>

<script>
    export default {
        props: {
            dives: {
                type: Array,
                default: []
            },
            onClick: {
                type: Function
            }
        },
        data () {
            return {
                value: ''
            }
        },
        methods: {
            click (id) {
                this.onClick(id);
            }
        }
    }
</script>

<style>
    .card-container .el-card {
        margin: 4px;
        border: 1px solid #b9b9b9;
        background-color: #dfe5ea;
        border-radius: 1px;
    }

    .card-container .el-card:hover {
        background-color: #f3faff;
        cursor: pointer;
    }

    .el-card .el-card__body {
        padding: 0;
    }

    .card-item {
        height: 100%;
        padding: 10px;
    }
</style>
