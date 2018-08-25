<template>
  <main class="dive-list">
    <section class="section">
      <div class="container">
        <div class="level">
          <CoordinatePicker
            v-model="coords"
            @change="fetchFilteredDives"/>
          <el-date-picker
            v-model="dateRange"
            class="dive-list__date-picker"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            align="right"
            @change="fetchFilteredDives" />

        </div>
      </div>
    </section>
    <section
      v-loading="isLoading"
      class="dive-list section">
      <div class="container">
        <div
          v-for="dive in diveItems"
          :key="dive.id"
          class="dive-list__item">
          <router-link :to="{name: 'diveDetails', params: {id: dive.id}}">
            <DiveInfoTable
              :dive="dive"
              :props="cardProps"
            />
          </router-link>
        </div>
      </div>
      <div
        v-if="!diveItems.length && !isLoading"
        class="container">
        <h1 class="title has-text-centered">
          No dives found.
        </h1>
      </div>
    </section>
  </main>
</template>
<script>
import sortBy from 'lodash/sortBy';
import {CardItem, DiveInfoTable, CoordinatePicker} from '~/components';
import {mapActions} from 'vuex';

export default {
    components: {
        CardItem,
        DiveInfoTable,
        CoordinatePicker
    },
    data() {
        return {
            key: 'DiveList',
            cardProps: {
                Time: 'timeStart',
                Location: 'coordinateStart',
                'Sample Count': 'sampleCount'
            },
            isLoading: true,
            dateRange: null,
            coords: null
        };
    },
    computed: {
        diveItems() {
            const dives = this.$store.getters['dives/localList'](this.key).map(
                dive => {
                    const date = dive.timeStart.toDate();
                    return {
                        ...dive,
                        dateValue: date.valueOf()
                    };
                }
            );

            return sortBy(dives, ({dateValue}) => -dateValue);
        }
    },
    mounted() {
        this.fetchDives();
    },
    methods: {
        ...mapActions({
            fetchLocalDives: 'dives/fetchLocalDives'
        }),
        fetchDives(config = {}) {
            this.isLoading = true;
            this.fetchLocalDives({
                key: this.key,
                config: {
                    limit: 50,
                    ...config
                }
            }).then(() => {
                this.isLoading = false;
            });
        },
        fetchFilteredDives() {
            const [from, to] = this.dateRange || [];
            this.fetchDives({
                coordinates: this.coords,
                dateRange: {from, to}
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.dive-list {
    height: 100%;

    .section {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
}

.dive-list__date-picker {
    /deep/ .el-range-separator {
        width: 25px;
    }
}

.dive-list__item {
    margin-bottom: 1rem;

    /deep/ .card-content {
        padding: 0.75rem;
    }
}
</style>
