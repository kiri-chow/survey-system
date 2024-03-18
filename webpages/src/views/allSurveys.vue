<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";


const route = useRoute();
const router = useRouter();

const surveys = ref({});
const page = ref(1);
const perPage = ref(20);
const sortField = ref("created_at");
const sortOrder = ref("desc");


const getSurveys = async function () {
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
        (json) => { 
            surveys.value = json.data;
        }
    ).catch((err) => { console.error(err); })
}

onMounted(async () => {
    await getSurveys();
    console.log(surveys.value);
})

</script>
<template>
    <main>
        <section v-for="survey in surveys" class="survey-info">
            <h2 class="card-title">
                <RouterLink :to="`/survey/${survey._id}`">{{ survey.title }}</RouterLink>
            </h2>
            <p class="card-text"> {{ survey.description }}</p>
            <p>Created At {{ survey.created_at }}</p>
            <p>Modified At {{ survey.modified_at }}</p>
        </section>
    </main>
</template>