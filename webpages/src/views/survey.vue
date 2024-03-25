<script setup>
import { onMounted, onUpdated, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { hkAreas, hkAreas2Districts } from '../hkDistricts';
import DonutChart from '../components/DonutChart.vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import ResponsesTable from '../components/ResponsesTable.vue'


const route = useRoute();
const router = useRouter();

let submitting = false;
const submitted = ref(route.query.submitted == "true");
const showCharts = ref(true);

const survey = ref({});
const questions = ref([]);
const charts = ref([]);
const responseInfo = ref({});
const responseResult = ref([]);

async function getSurvey() {
    fetch(
        '/api/surveys/' + route.params.id
    ).then(
        (res) => res.json()
    ).then(
        (data) => {
            questions.value = data.questions.entries().toArray();
            survey.value = data;
            convertCharts(data);
            for (let [qid, question] of questions.value) {
                let response;
                if (question.type === 'checkbox') {
                    response = [];
                } else if (question.required) {

                } else if (question.type === 'switch' || question.type === 'slider') {
                    response = 0;
                }
                responseResult.value.push(response);
            }
        }
    ).catch((err) => { console.error(err); })
}

function convertCharts(data) {
    for (let [ind, chart] of data.charts.entries()) {
        let question = survey.value.questions[chart.question];
        if (chart.title) {
            chart.title = `${ind + 1}. ` + [chart.title.prefix, question.title, chart.title.postfix].filter(Boolean).map(x => x.toString()).join(' - ');
        } else {
            chart.title = `${ind + 1}. ${question.title}`;
        }
    }
    charts.value = data.charts;
    showCharts.value = Boolean(charts.value.length);
}

onMounted(async () => {
    if (route.params.id) {
        await getSurvey();
    }
})

onUpdated(() => {
    // scroll into result
    const result = document.getElementById('result');
    if ( result ) {
        result.scrollIntoView();
    }
})

function updateLocation(event) {
    const [areaId, districtId] = event.target.value.split('.');
    responseInfo.value.area = areaId;
    responseInfo.value.district = districtId;
};

async function submit() {
    if (submitting) {
        alert("Submitting, please wait...");
        return;
    }
    submitting = true;

    // build data to submit
    const toSubmit = Object.assign(responseInfo.value);
    toSubmit.survey_id = survey.value._id;
    for (let [qid, result] of responseResult.value.entries()) {
        toSubmit[qid] = result;
    }

    const res = await fetch(`/api/responses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(toSubmit),
    });
    submitting = false;
    if (!res.ok) {
        const json = await res.json();
        alert(json.message);
        return;
    }
    submitted.value = true;
    alert("Your response is submitted!");
}

function toggleResult() {
    showCharts.value = !showCharts.value;
}

</script>
<template>
    <main class="row d-flex justify-content-center">
        <form id="survey" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5" @submit.prevent="submit">
            <section class="survey-info row">
                <h4 class="">{{ survey.title }}</h4>
                <p class=""> {{ survey.description }}</p>
            </section>
            <section class="personal-info">
                <div v-if="survey.named">
                    <h6>Email<span class="text-danger">*</span></h6>
                    <o-field >
                        <o-input v-model="responseInfo.email" type="email" placeholder="nobody@nowhere.com"
                            :disabled="submitted" icon="email" required />
                    </o-field>
                </div>
                <h6>Place of Residence<span class="text-danger">*</span></h6>
                <o-field label="Please select a district">
                    <o-select @change="updateLocation" :disabled="submitted" required>
                        <optgroup v-for="area in hkAreas" :label="area.name">
                            <option v-for="district in hkAreas2Districts[area.id]" :value="`${area.id}.${district.id}`">
                                {{
                    district.name }}</option>
                        </optgroup>
                    </o-select>
                </o-field>
                <hr/>
            </section>
            <section class="survey-questions">
                <div v-for="[qid, question] in questions" class="question mt-1 mb-2">
                    <h6>{{ `${qid + 1}. ${question.title}` }}<span v-if="question.required" class="text-danger">*</span>
                    </h6>
                    <o-field :label="question.description">
                        <o-switch v-if="question.type === 'switch'" v-model="responseResult[qid]" true-value="1"
                            false-value="0" :disabled="submitted">
                            {{ responseResult[qid] === "1" ? question.options[1] : question.options[0] }}
                        </o-switch>
                        <!-- <o-slider v-if="question.type === 'slider'" v-model="responseResult[qid]" :rounded="true"
                            :min="0" :max="question.options.length - 1" :tooltip="false" :disabled="submitted"
                            :required="question.required">
                            <o-slider-tick v-for="[i, o] in question.options.entries()" :value="i">{{ o
                                }}</o-slider-tick>
                        </o-slider> -->
                        <div v-else-if="question.type === 'checkbox'">
                            <o-checkbox v-model="responseResult[qid]" v-for="[i, o] in question.options.entries()"
                                :native-value="i" :label="o" :disabled="submitted" />
                        </div>
                        <div v-else class="">
                            <o-radio :name="`question_${qid+1}`" v-for="[i, o] in question.options.entries()" :label="o" :native-value="i"
                                v-model="responseResult[qid]" :disabled="submitted" :required="question.required" />
                        </div>
                    </o-field>
                </div>
            </section>
            <div id="pre-result" class="d-flex justify-content-between">
                <o-button type="submit" :disabled="submitted" variant="success" class="mx-1 my-2">Submit</o-button>
            </div>
        </form>
        <div id="result" v-if="submitted" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5">
            <div class="row d-flex justify-content-between">
                <h4>Responses Summary</h4>
            </div>
            <o-tabs v-model="showCharts" :multiline="false" type="boxed" position="centered">
                <o-tab-item :value="true" label="Charts" icon="chart-areaspline">
                </o-tab-item>

                <o-tab-item :value="false" label="Table" icon="table">
                </o-tab-item>
            </o-tabs>
            <div v-if="showCharts" class="result-charts">
                <div v-for="chart in charts" class="mt-1 mb-2">
                    <h6>{{ chart.title }}</h6>
                    <DonutChart v-if="chart.type === 'donut'" :surveyId="survey._id" :questionId="chart.question"
                        :groupBy="chart.groupBy" />
                    <LineChart v-else-if="chart.type === 'line'" :surveyId="survey._id" :questionId="chart.question"
                        :groupBy="chart.groupBy" />
                    <BarChart v-else :surveyId="survey._id" :questionId="chart.question" :groupBy="chart.groupBy" />
                </div>
            </div>
            <div v-else class="result-table">
                <ResponsesTable :surveyId="survey._id"/>
            </div>

        </div>
    </main>
</template>