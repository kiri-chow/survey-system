<script setup>
import { onMounted, ref } from 'vue';
import { routeLocationKey, useRoute, useRouter } from "vue-router";


const props = defineProps({
    surveyId: String,
});
const survey = ref({});
const questions = ref([]);
const data = ref([]);
const loading = ref(true);
const total = ref(1);
const perPage = ref(10);
const page = ref(1);
const defaultSortOrder = ref("asc");
const sortField = ref("created_at");
const sortOrder = ref("desc");
let queries = "";
let field2search = {};


onMounted(async () => {
    await getSurvey();
    await loadAsyncData();
});


async function getSurvey() {
    fetch(
        '/api/surveys/' + props.surveyId
    ).then(
        (res) => res.json()
    ).then(
        (json) => {
            survey.value = json;
            questions.value = json.questions.entries().toArray();
            field2search = {};
            for (let [qid, question] of questions.value) {
                field2search[question.title.toLowerCase()] = qid;
            }
        }
    ).catch((err) => { console.error(err); })
}

async function loadAsyncData() {
    let url = `/api/responses/all?survey_id=${props.surveyId}&page=${page.value}&perPage=${perPage.value}&sort_by=${sortField.value}.${sortOrder.value}`;
    if (queries) {
        url += '&' + queries;
    }
    loading.value = true;
    const response = await fetch(url);
    const newData = await response.json();
    data.value = newData.data;
    total.value = newData.total;
    page.value = newData.page;
    perPage.value = newData.perPage;
    loading.value = false;
}


const onPageChange = (p) => {
    page.value = p;
    loadAsyncData();
};

const onSort = (field, order) => {
    sortField.value = field.field;
    sortOrder.value = order;
    loadAsyncData();
};

function handleField(x, type = null, func = null) {
    if (!x) return 'unknown';
    if (type) x = new type(x);
    if (func) x = func(x);
    return x;
}

function updateQuery(event) {
    let params = [];
    const value = event.target.value;
    for (let query of value.split(',')) {
        let [k, v] = query.split('=').map(x => x.trim());
        k = getSearchField(k);
        console.log(k);
        if (typeof(k) === 'number'){
            v = survey.value.questions[k].options.indexOf(v);
        }
        params.push(`${k}=${v}`);
    }
    queries = params.join('&');
    loadAsyncData();
}

function getSearchField(k) {
    k = k.toLowerCase();
    return field2search[k] === undefined ? k : field2search[k];
}


</script>
<template>
    <section>
        <o-input class='mb-2' @change="updateQuery" placeholder="Search: field1=value1,field2=value2..."/>
        <o-table :data="data" :loading="loading" :total="total" :per-page="perPage" backend-sorting
            :default-sort-direction="defaultSortOrder" :default-sort="[sortField, sortOrder]"
            aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
            aria-current-label="Current page" @page-change="onPageChange" @sort="onSort">
            <o-table-column v-if="survey.named" v-slot="props" field="email" label="Email">
                {{ props.row.email }}
            </o-table-column>
            <o-table-column v-slot="props" field="created_at" label="Created At" sortable centered>
                {{ handleField(props.row.created_at, Date, x => x.toLocaleString()) }}
            </o-table-column>
            <o-table-column v-slot="props" field="area" label="Area">
                {{ handleField(props.row.area) }}
            </o-table-column>
            <o-table-column v-for="[qid, question] of questions" v-slot="props" :field="qid" :label="question.title">
                {{ question.options[props.row[qid]] }}
            </o-table-column>
        </o-table>
        <div class="justify-content-center d-flex">
            <o-pagination @change="onPageChange" class="d-flex-contain" v-model:current="page"
                :total="total" :range-before="1" :range-after="2" order="center" size="small" :simple="false"
                :per-page="perPage" icon-prev="chevron-left" icon-next="chevron-right" />
        </div>
    </section>
</template>