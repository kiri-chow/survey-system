<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";


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
    <main class="row d-flex justify-content-center">
        <div id="#survey" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5">
            <section class="survey-info">
                <h6>Question Title</h6>
                <o-field>
                    <o-input v-model="survey.title" placeholder="The title of the survey..."/>
                </o-field>
                <h6>Description</h6>
                <o-field>
                    <o-input v-model="survey.description" type="textarea" placeholder="Please describe your survey..."/>
                </o-field>
                <h6>Named</h6>
                <o-field label="Do you want to record their email?">
                    <o-switch v-model="survey.named">{{ survey.named ? "Yes" : "No" }}</o-switch>
                </o-field>
                <hr/>
            </section>
            <section class="survey-questions">
                <div v-for="[qid, question] in Object.entries(questions)" class="question mb-2">
                    <div class="d-flex justify-content-between mb-2">
                        <h5>{{ `Question ${parseInt(qid) + 1}` }}</h5>
                        <o-button @click="deleteQuestion(qid)" variant="danger" disabled>Delete</o-button>
                    </div>
    
                    <h6>Question Title</h6>
                    <o-field>
                        <o-input v-model="questions[qid].title" placeholder="The title of the question"/>
                    </o-field>
                    <h6>Question Description</h6>
                    <o-field>
                        <o-input v-model="questions[qid].description" type="textarea" placeholder="Please describe your question..."/>
                    </o-field>
                    <h6>Required</h6>
                    <o-field label="Is it a required question?">
                        <o-switch v-model="questions[qid].required">{{ questions[qid].required ? "Yes" : "No" }}</o-switch>
                    </o-field>
                    <h6>Question Types</h6>
                    <o-field>
                        <o-select v-model="questions[qid].type" placeholder="Select a Type">
                            <option v-for="type in questionTypes" :value="type.toLowerCase()">{{ type }}</option>
                        </o-select>
                    </o-field>
                    <h6>Question Options</h6>
                    <o-field>
                        <o-taginput v-model="options[qid]" icon="tag" placeholder="Add an option"
                            aria-close-label="Delete this option" />
                    </o-field>
                    <hr/>
                </div>
            </section>
            <o-button class="w-100 mb-2" @click="addQuestion()" variant="primary">add</o-button>
            <hr/>
            <o-button class="w-100 mb-2" @click="submit()" variant="success">Submit</o-button>
        </div>
    </main>
</template>