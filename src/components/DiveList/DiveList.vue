<template>
  <div
    class="dl-container">
    <div
      v-if="pendingDives.length"

      class="dl-new-dives">
      <div class="control">
        <div class="tags has-addons">
          <a
            class="tag is-link"
            @click="seeNewDives()">New Dives!</a>
          <a
            class="tag is-delete"
            @click="closePopup()"/>
        </div>
      </div>
    </div>
    <div class="menu">
      <ul class="menu-list">
        <li
          v-for="dive in dives"
          :key="dive.id"
        >
          <CardItem
            :class="{selected: selectedDiveId === dive.id}"
            @click.native="onDiveSelect(dive)">
            <div class="hp-card-title">
              <strong>Dive</strong>
            </div>
            <div class="hp-card-text">{{ dive.id }}</div>
            <div>{{ dive.dateString }}</div>
            <div>{{ dive.data.sampleCount }} samples</div>
          </CardItem>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import sortBy from 'lodash/sortBy';
import CardItem from '../CardItem/CardItem.vue';
import {mapGetters, mapActions, mapMutations} from 'vuex';

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
            selectedDiveId: null,
            pendingDives: []
        };
    },
    computed: {
        ...mapGetters({
            dives: 'dives/list'
        }),
        dives() {
            const dives = this.$store.getters['dives/list'].map(dive => {
                const date = dive.timeEnd.toDate();
                return {
                    data: dive,
                    id: dive.id,
                    dateValue: date.valueOf(),
                    dateString: date.toLocaleString()
                };
            });

            return sortBy(dives, ({dateValue}) => -dateValue);
        }
    },
    mounted() {
        this.listenForDives();
    },
    destroyed() {
        this.unsubscribe();
    },
    methods: {
        ...mapActions({
            listenForDives: 'dives/listenForDives'
        }),
        ...mapMutations({
            unsubscribe: 'dives/unsubscribe'
        }),
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
        },
        onDiveSelect(dive) {
            this.selectedDiveId = dive.id;
            this.onClick(dive);
        }
    }
};
</script>
<style lang="scss" scoped>
.dl-container {
    height: 100%;
}

.menu {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: 100%;
}

.dl-new-dives {
    .control {
        margin: 0.25rem;
    }
}

.selected {
    background-color: #ededed;
    box-shadow: none;
}
</style>
