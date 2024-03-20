<script setup>
import { onMounted, ref, defineProps } from 'vue';
import getData from '../getData';

const props = defineProps({
  surveyId: {
    type: String,
    required: true,
  },
  questionId: {
    type: Number,
    required: true,
  },
  groupBy: {
    type: String,
  }
});

const options = ref({});
const series = ref([]);

async function setChart() {
  const data = await getData(props.surveyId, props.questionId, props.groupBy);

  // set series
  series.value = [];
  data.data.forEach((x) => { series.value.push(x.count) });

  // set options
  options.value = {
    title: { text: data.title },
    labels: data.options,
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              color: '#373737',
              fontSize: '25px',
            }
          }
        }
      }
    }
  };
}

onMounted(async () => {
  await setChart();
});

</script>

<template>
  <div>
    <apexchart type="donut" :options="options" :series="series" />
  </div>
</template>