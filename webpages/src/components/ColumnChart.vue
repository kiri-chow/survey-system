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
  }
});

const options = ref({});
const series = ref([]);


async function setChart() {
  const data = await getData(props.surveyId, props.questionId, props.groupBy);

  series.value = convertSeries(data, props.groupBy);
  options.value = {
    chart: {
      type: 'bar',
    },
    title: {
      text: data.title,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        distributed: props.groupBy? false : true,
      },
    },
    xaxis: {
      categories: data.options,
    },
  };
}

onMounted(async () => {
  await setChart();
  console.log(series.value);
});

</script>

<template>
  <div>
    <apexchart type="bar" :options="options" :series="series" />
  </div>
</template>