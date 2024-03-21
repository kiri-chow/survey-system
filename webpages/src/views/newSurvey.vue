<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";


const route = useRoute();
const router = useRouter();

const survey = ref({});
const questions = ref([]);
const questionTypes = ref(["Radio", "Slider", "Checkbox", "Switch"]);
const charts = ref([]);
const chartTypes = ref(["Bar", "Donut", "Line"]);

onMounted(async () => {
    if (route.query.surveyId) {
        fetch(
            '/api/surveys/' + route.query.surveyId
        ).then(
            (res) => res.json()
        ).then((data) => {
            survey.value = data;
            questions.value = survey.value.questions;
            charts.value = survey.value.charts;
        }).catch(err => { console.error(err) });
    }
});

function addQuestion() {
    let q = { options: [] };
    questions.value.push(q);
}

function deleteQuestion(ind) {
    questions.value.pop();
}

function addChart() {
    let c = { title: {} };
    charts.value.push(c);
}

function deleteChart() {
    charts.value.pop();
}

async function submit() {
    survey.value.questions = questions.value;
    survey.value.charts = charts.value;
    const res = await fetch(`/api/surveys`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(survey.value),
    });
    const json = await res.json();
    alert("Survey created!!!");
    router.push(`/survey/${json.id}`);
}

async function update() {
    const res = await fetch(`/api/surveys/${survey.value._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(survey.value),
    });
    const json = await res.json();
    alert("Survey updated!!!");
    router.push(`/survey/${survey.value._id}`);
}

</script>
<template>
    <main class="row d-flex justify-content-center">
        <div id="#survey" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5">
            <section class="survey-info">
                <h6>Survey Title</h6>
                <o-field>
                    <o-input v-model="survey.title" placeholder="The title of the survey..." />
                </o-field>
                <h6>Description</h6>
                <o-field>
                    <o-input v-model="survey.description" type="textarea"
                        placeholder="Please describe your survey..." />
                </o-field>
                <h6>Named</h6>
                <o-field label="Do you want to record their email?">
                    <o-switch v-model="survey.named">{{ survey.named ? "Yes" : "No" }}</o-switch>
                </o-field>
                <hr />
            </section>
            <section class="survey-questions">
                <div v-for="[qid, question] in questions.entries()" class="question mb-2">
                    <div class="d-flex justify-content-between mb-2">
                        <h5>{{ `Question ${qid + 1}` }}</h5>
                    </div>

                    <h6>Question Title</h6>
                    <o-field>
                        <o-input v-model="question.title" placeholder="The title of the question" />
                    </o-field>
                    <h6>Question Description</h6>
                    <o-field>
                        <o-input v-model="question.description" type="textarea"
                            placeholder="Please describe your question..." />
                    </o-field>
                    <h6>Required</h6>
                    <o-field label="Is it a required question?">
                        <o-switch v-model="question.required">{{ question.required ? "Yes" : "No" }}</o-switch>
                    </o-field>
                    <h6>Question Types</h6>
                    <o-field>
                        <o-select v-model="question.type" placeholder="Select a Type">
                            <option v-for="type in questionTypes" :value="type.toLowerCase()">{{ type }}</option>
                        </o-select>
                    </o-field>
                    <h6>Question Options</h6>
                    <o-field>
                        <o-taginput v-model="question.options" icon="tag" placeholder="Add an option"
                            aria-close-label="Delete this option" />
                    </o-field>
                    <hr />
                </div>
                <div class="row justify-content-center">
                    <o-button class="col-5 ms-1" @click="addQuestion" variant="primary">Add Question</o-button>
                    <o-button class="col-5 me-1" @click="deleteQuestion" variant="danger">Delete Question</o-button>
                </div>

            </section>
            <hr />
            <section class="survey-charts">
                <div v-for="[cid, chart] in charts.entries()" class="question mb-2">
                    <div class="d-flex justify-content-between mb-2">
                        <h5>{{ `Chart ${cid + 1}` }}</h5>
                    </div>
                    <h6>Based on</h6>
                    <o-field>
                        <o-select v-model="chart.question" placeholder="Select a question">
                            <option v-for="qid in Array(questions.length).keys()" :value="qid">Question {{ qid + 1 }}
                            </option>
                        </o-select>
                    </o-field>
                    <h6>Chart Title</h6>
                    <o-field class="row d-flex justify-content-bwtween">
                        <input class="col-12 col-lg-4 form-control" v-model="chart.title.prefix" placeholder="Prefix" />
                        <p class="col-12 col-lg-4 text-center">{{ questions[chart.question] ?
                        questions[chart.question].title : "Question Title" }}</p>
                        <input class="col-12 col-lg-4 form-control" v-model="chart.title.postfix"
                            placeholder="Postfix" />
                    </o-field>
                    <h6>Chart Type</h6>
                    <o-field>
                        <o-select v-model="chart.type" placeholder="Select a type">
                            <option v-for="type in chartTypes" :value="type.toLowerCase()">{{ type }}</option>
                        </o-select>
                    </o-field>
                    <h6>Group By</h6>
                    <o-field>
                        <o-select v-model="chart.groupBy" placeholder="Select a type">
                            <option v-for="type in ['Area', 'District', 'Date']" :value="type.toLowerCase()">{{ type }}
                            </option>
                        </o-select>
                    </o-field>
                </div>
                <div class="row justify-content-center">
                    <o-button class="col-5 ms-1" @click="addChart" variant="info">Add Chart</o-button>
                    <o-button class="col-5 me-1" @click="deleteChart" variant="danger">Delete Chart</o-button>
                </div>
            </section>
            <hr />
            <o-button v-if="!route.query.surveyId" class="w-100 mb-2" @click="submit()" variant="success">Submit</o-button>
            <o-button v-else class="w-100 mb-2" @click="update()" variant="success">Edit</o-button>
        </div>
    </main>
</template>chartTypes