<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";


const route = useRoute();
const router = useRouter();

const survey = ref({questions: [], charts: []});
const questionTypes = ref(["Radio", "Checkbox", "Switch"]);
const chartTypes = ref(["Bar", "Donut", "Line"]);
const creating = ref(true);
let submitting = false;

onMounted(async () => {
    if (route.query.surveyId) {
        fetch(
            '/api/surveys/' + route.query.surveyId
        ).then(
            (res) => res.json()
        ).then((data) => {
            survey.value = data;
            creating.value = false;
        }).catch(err => { console.error(err) });
    }
});

function addQuestion() {
    let q = { options: [] };
    survey.value.questions.push(q);
}

function deleteQuestion() {
    survey.value.questions.pop();
}

function addChart() {
    let c = { title: {} };
    survey.value.charts.push(c);
}

function deleteChart() {
    survey.value.charts.pop();
}


async function submitData() {
    if (submitting) {
        alert("Submitting, please wait......");
        return;
    }

    submitting = true;
    let url = '/api/surveys';
    let method = "POST";
    let message = 'Survey created!!!';
    if (!creating.value) {
        url = `/api/surveys/${survey.value._id}`;
        method = "PUT";
        message = 'Survey updated!!!';
    }

    const res = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(survey.value),
    });
    const json = await res.json();
    submitting = false;

    // message
    if (!res.ok) {
        alert(json.message);
    } else {
        alert(message);
        // route
        if (creating.value) {
            router.push(`/survey/${json.id}`);
        } else {
            router.push(`/survey/${survey.value._id}`);
        }
    }
}

</script>
<template>
    <main class="row d-flex justify-content-center">
        <form id="survey" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5" @submit.prevent="submitData">
            <section class="survey-info">
                <h6>Survey Title<span class="text-danger">*</span></h6>
                <o-field>
                    <o-input class="form-control" required v-model="survey.title" placeholder="The title of the survey..." />
                </o-field>
                <h6>Description<span class="text-danger">*</span></h6>
                <o-field>
                    <o-input v-model="survey.description" type="textarea" required
                        placeholder="Please describe your survey..." />
                </o-field>
                <h6>Named</h6>
                <o-field label="Do you want to record their email?">
                    <o-switch v-model="survey.named">{{ survey.named ? "Yes" : "No" }}</o-switch>
                </o-field>
                <hr />
            </section>
            <section class="survey-questions">
                <div v-for="[qid, question] in survey.questions.entries()" class="question mb-2">
                    <div class="d-flex justify-content-between mb-2">
                        <h5>{{ `Question ${qid + 1}` }}</h5>
                    </div>

                    <h6>Question Title<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-input v-model="question.title" required placeholder="The title of the question" />
                    </o-field>
                    <h6>Question Description<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-input v-model="question.description" required type="textarea"
                            placeholder="Please describe your question..." />
                    </o-field>
                    <h6>Required</h6>
                    <o-field label="Is it a required question?">
                        <o-switch v-model="question.required">{{ question.required ? "Yes" : "No" }}</o-switch>
                    </o-field>
                    <h6>Question Types<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-select v-model="question.type" placeholder="Select a Type" required>
                            <option v-for="type in questionTypes" :value="type.toLowerCase()">{{ type }}</option>
                        </o-select>
                    </o-field>
                    <h6>Question Options<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-taginput v-model="question.options" icon="tag"
                            aria-close-label="Delete this option"/>
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
                <div v-for="[cid, chart] in survey.charts.entries()" class="question mb-2">
                    <div class="d-flex justify-content-between mb-2">
                        <h5>{{ `Chart ${cid + 1}` }}</h5>
                    </div>
                    <h6>Based on<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-select v-model="chart.question" required>
                            <option v-for="qid in Array(survey.questions.length).keys()" :value="qid">Question {{ qid + 1 }}
                            </option>
                        </o-select>
                    </o-field>
                    <h6>Chart Title</h6>
                    <o-field class="row d-flex justify-content-bwtween" v-slot="title = chart.title ? chart.title : {}">
                        <input class="col-12 col-lg-4 form-control" v-model="title.prefix" placeholder="Prefix" />
                        <p class="col-12 col-lg-4 text-center">{{ survey.questions[chart.question] ?
                            survey.questions[chart.question].title : "Question Title" }}</p>
                        <input class="col-12 col-lg-4 form-control" v-model="title.postfix"
                            placeholder="Postfix" />
                    </o-field>
                    <h6>Chart Type<span class="text-danger">*</span></h6>
                    <o-field>
                        <o-select v-model="chart.type" required>
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
            <o-button type='submit' class="w-100 mb-2" variant="success">{{creating ? "Submit" : "Update"}}</o-button>
        </form>
    </main>
</template>chartTypes