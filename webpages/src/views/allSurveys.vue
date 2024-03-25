<script setup>
import { onMounted, ref } from 'vue';
import { routeLocationKey, useRoute, useRouter } from "vue-router";


const route = useRoute();
const router = useRouter();

const isAdmin = ref(route.query.admin === 'true');
const surveys = ref({});
const page = ref(1);
const perPage = ref(10);
const total = ref(1);
const sortField = ref("created_at");
const sortOrder = ref("desc");


async function getSurveys() {
    const params = [
        `page=${page.value}`,
        `perPage=${perPage.value}`,
        `sort_by=${sortField.value}.${sortOrder.value}`,
    ];
    fetch(
        `/api/surveys/all?${params}`
    ).then(
        (res) => res.json()
    ).then(
        (data) => {
            surveys.value = data.data;
            page.value = data.page;
            perPage.value = data.perPage;
            total.value = data.total;
        }
    ).catch((err) => { console.error(err); })
}

function getButton(event) {
    let button = event.target;
    while (button.type !== "button") {
        button = button.parentNode;
    }
    return button
}

async function deleteSurvey(event) {
    const button = getButton(event);
    const name = button.name;
    const id = button.id;
    if (confirm(`Do you really want to delete survey: ${name}?`)) {
        fetch(`/api/surveys/${id}`, { method: "DELETE" }).then(
            (res) => res.json
        ).then((json) => { "Survey deleted!" }
        ).catch((err) => { console.error(err); })
        surveys.value = surveys.value.filter(x => x._id !== id);
    }
}

function editSurvey(event) {
    const button = getButton(event);
    // const name = button.name;
    const id = button.id;
    router.push(`/survey?surveyId=${button.id}`);
}

function enterResult(event) {
    const button = getButton(event);
    // const name = button.name;
    const id = button.id;
    router.push(`/survey/${id}?submitted=true`);
}

const onPageChange = (p) => {
    page.value = p;
    getSurveys();
};


onMounted(async () => {
    await getSurveys();
})

</script>
<template>
    <main class="row justify-content-center">
        <div v-for="survey in surveys" class="survey-body mx-3 my-2 px-3 py-2 col-10 col-lg-5">
            <h2 class="card-title">
                <RouterLink :to="`/survey/${survey._id}`">{{ survey.title }}</RouterLink>
            </h2>
            <p class="card-text"> {{ survey.description }}</p>
            <div class="row col-12 d-flex justify-content-between align-items-center">
                <p class="col-12 col-lg-6 text-center text-lg-start">
                    <span class="fw-bold">Created At</span>
                    {{ new Date(survey.created_at).toLocaleString() }}
                </p>
                <p class="col-12 col-lg-6 text-center text-lg-end">
                    <span class="fw-bold">Modified At</span>
                    {{ new Date(survey.modified_at).toLocaleString() }}
                </p>
            </div>
            <div class="col-12 d-flex justify-content-evenly">
                <o-button class="mx-1" @click="editSurvey" :id="survey._id" :name="survey.title" label="Edit"
                    variant="primary" />
                <o-button class="mx-1" @click="enterResult" :id="survey._id" :name="survey.title" label="Result"
                    variant="success" />
                <o-button class="mx-1" @click="deleteSurvey" :id="survey._id" :name="survey.title" label="Delete"
                    variant="danger" :disabled="!isAdmin"/>
            </div>
        </div>
        <div class="justify-content-center d-flex">
            <o-pagination @change="onPageChange" class="d-flex-contain justify-content-center" v-model:current="page" :total="total"
            :range-before="1" :range-after="2" order="center" size="small" :simple="false" :per-page="perPage"
            icon-prev="chevron-left" icon-next="chevron-right" />
        </div>
    </main>
</template>