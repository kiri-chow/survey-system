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
        (json) => {
            surveys.value = json.data;
        }
    ).catch((err) => { console.error(err); })
}


async function deleteSurvey(event) {
    let button = event.target;
    while (button.type !== "button") {
        button = button.parentNode;
    }
    const name = button.name;
    const id = button.id;
    if (confirm(`Do you really want to delete survey: ${name}?`)) {
        fetch(`/api/surveys/${id}`, { method: "DELETE" }).then(
            (res) => res.json
        ).then((json) => { alert(json.message); }
        ).catch((err) => { console.error(err); })
    }
}


onMounted(async () => {
    await getSurveys();
})

</script>
<template>
    <main>
        <div>
            <o-button><RouterLink :to="`/survey`">New</RouterLink></o-button>
        </div>
        <section v-for="survey in surveys" class="survey-info">
            <h2 class="card-title">
                <RouterLink :to="`/survey/${survey._id}`" :prop="survey">{{ survey.title }}</RouterLink>
            </h2>
            <p class="card-text"> {{ survey.description }}</p>
            <p>Created At {{ survey.created_at }}</p>
            <p>Modified At {{ survey.modified_at }}</p>
            <o-button @click="deleteSurvey" :id="survey._id" :name="survey.title" label="Delete" variant="danger" />
        </section>
    </main>
</template>