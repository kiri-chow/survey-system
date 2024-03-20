<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { hkAreas, hkAreas2Districts } from '../hkDistricts';
import PieChart from '../components/PieChart.vue'


const route = useRoute();
const router = useRouter();

const survey = ref({});
const questions = ref({});
const questionTypes = ref(["Radio", "Slider", "Checkbox", "Switch"]);
const options = ref({});

onMounted(async () => {

})

function addQuestion() {
    const ind = Object.keys(questions.value).length;
    questions.value[ind] = {};
    options.value[ind] = [];
}

function deleteQuestion(ind) {
    delete questions.value[ind];
    delete options.value[ind];
}

async function submit() {
    survey.value.questions = [];
    for (let ind of Object.keys(questions.value)) {
        const question = questions.value[ind];
        const opt = options.value[ind];
        question.options = opt;
        survey.value.questions.push(question);
    }
    await fetch(`/api/surveys`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(survey.value),
    });
    alert("Survey created!!!");
}

</script>
<template>
    <main>
        <section class="survey-info">
            <o-field label="Title">
                <o-input v-model="survey.title" />
            </o-field>
            <o-field label="Description">
                <o-input v-model="survey.description" type="textarea" />
            </o-field>
            <o-field label="Named">
                <o-switch v-model="survey.named">{{ survey.named ? "Yes" : "No" }}</o-switch>
            </o-field>
        </section>
        <section class="survey-questions">
            <div v-for="[qid, question] in Object.entries(questions)" class="question">
                <div class="row">
                    <h5 class="float-start">{{ `Question ${qid}` }}</h5>
                    <o-button @click="deleteQuestion(qid)">Delete</o-button>
                </div>

                <o-field label="Title">
                    <o-input v-model="questions[qid].title" />
                </o-field>
                <o-field label="Description">
                    <o-input v-model="questions[qid].description" type="textarea" />
                </o-field>
                <o-field label="Required or not">
                    <o-switch v-model="questions[qid].required">{{ questions[qid].required ? "Yes" : "No" }}</o-switch>
                </o-field>
                <o-field label="Question types">
                    <o-select v-model="questions[qid].type" placeholder="Select a Type">
                        <option v-for="type in questionTypes" :value="type.toLowerCase()">{{ type }}</option>
                    </o-select>
                </o-field>
                <o-field label="Add some options">
                    <o-taginput v-model="options[qid]" icon="tag" placeholder="Add an option"
                        aria-close-label="Delete this option" />
                </o-field>
            </div>
        </section>
        <button @click="addQuestion()">add</button>
        <button @click="submit()" type="submit">Submit</button>
    </main>
</template>