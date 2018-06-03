<template>
  <div class="dive-list">
    <el-alert
      v-if="pendingDives.length && showPopup"
      title="Want to see new dives?"
      type="info"
      show-icon>
      <p>
        <el-button
          size="mini"
          round
          type="success"
          @click="seeNewDives()">Yes</el-button>
        <el-button
          size="mini"
          round
          type="danger"
          @click="closePopup()">No</el-button>
      </p>
    </el-alert>
    <div class="card-list">
      <CardItem
        v-for="dive in dives"
        :key="dive.id"
        :item="dive"
        :on-click="onClick">
        <div>
          <strong>Dive</strong>
        </div>
        <div>{{ dive.id }}</div>
        <div>{{ dive.dateString }}</div>
        <div>{{ dive.data.sampleCount }} samples</div>
      </CardItem>
    </div>
  </div>
</template>
<script>
import sortBy from 'lodash/sortBy';
import CardItem from '../CardItem/CardItem.vue';
import {listenForDives} from '~/api';

export default {
    components: {
        CardItem
    },
    props: {
        onClick: {
            type: Function,
            required: false,
            default: () => {}
        }
    },
    data() {
        return {
            dives: [],
            pendingDives: [],
            showPopup: true
        };
    },
    mounted() {
        listenForDives(snapshot => {
            const newDives = [...snapshot.docs];
            const oldDives = this.dives;

            if (newDives.length === oldDives.length) return;
            if (oldDives.length > 0) {
                this.pendingDives = newDives;
            } else {
                this.dives = this.buildDivesFromDocs(newDives);
            }
        });
    },
    methods: {
        buildDivesFromDocs(dives) {
            const divesList = dives.map(diveDoc => {
                const data = diveDoc.data();
                const date = data.timeEnd.toDate();
                const id = diveDoc.id;
                data.id = id;
                return {
                    data,
                    id,
                    dateValue: date.valueOf(),
                    dateString: date.toLocaleString()
                };
            });

            return sortBy(divesList, ({dateValue}) => -dateValue);
        },
        seeNewDives() {
            this.dives = this.buildDivesFromDocs(this.pendingDives);
            this.pendingDives.length = 0;
        },
        closePopup() {
            this.pendingDives.length = 0;
            this.showPopup = false;
        }
    }
};
</script>
<style>
.dive-list {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: 100%;
}
</style>
