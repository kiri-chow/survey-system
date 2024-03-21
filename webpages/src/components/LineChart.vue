<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { getData, convertSeries } from '../getData';

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
  },
  accumulated: {
    default: true,
    type: Boolean,
  }
});

const options = ref({});
const series = ref([]);


function accumulate(array) {
  if (props.accumulated) {
    for (let i = 0; i < array.length - 1; i++) {
      array[i + 1] += array[i];
    }
  }
  return array;
}


async function setChart() {
  const data = await getData(props.surveyId, props.questionId, props.groupBy);
  const [newSeries, categories] = convertSeries(data, { column: props.groupBy, groupBy: 'option' });
  newSeries.forEach(x => { accumulate(x.data) });
  series.value = newSeries;
  options.value = {
    chart: {
      type: 'line',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        distributed: props.groupBy ? false : true,
      },
    },
    xaxis: {
      categories: categories,
    },
  };
}

onMounted(async () => {
  await setChart();
});

</script>

<template>
  <div>
    <apexchart type="line" :options="options" :series="series" />
  </div>
</template>