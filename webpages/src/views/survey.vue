<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { hkAreas, hkAreas2Districts } from '../hkDistricts';
import PieChart from '../components/PieChart.vue'
import ColumnChart from '../components/ColumnChart.vue'


const route = useRoute();
const router = useRouter();

const survey = ref({});
const surveyInfo = ref({});
const surveyResponse = ref([]);
const submitted = ref(true );

async function getSurvey() {
    fetch(
        '/api/surveys/' + route.params.id
    ).then(
        (res) => res.json()
    ).then(
        (json) => {
            json.questions = json.questions.entries().toArray();
            survey.value = json;
            for (let [qid, question] of json.questions) {
                let response;
                if (question.type === 'checkbox') {
                    response = [];
                } else if (question.required) {

                } else if (question.type === 'switch' || question.type === 'slider') {
                    response = 0;
                }
                surveyResponse.value.push(response);
            }
        }
    ).catch((err) => { console.error(err); })
}

onMounted(async () => {
    if (route.params.id) {
        await getSurvey();
    }
})

async function checkEmail() {

}

function updateLocation(event) {
    const [areaId, districtId] = event.target.value.split('.');
    surveyInfo.value.area = areaId;
    surveyInfo.value.district = districtId;
};

async function submit() {
    // check required
    console.log(surveyResponse.value);
    for (let result of surveyResponse.value) {
        if (result == null) {
            alert("Please answer all required questions!");
            return;
        }
    }

    // build data to submit
    const toSubmit = Object.assign(surveyInfo.value);
    toSubmit.survey_id = survey.value._id;
    for (let [qid, result] of surveyResponse.value.entries()) {
        toSubmit[qid] = result;
    }

    await fetch(`/api/responses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(toSubmit),
    });
    alert("Your response is submitted!");
    submitted.value = true;
}

</script>
<template>
    <main>
        <section class="survey-info">
            <h2 class="card-title">{{ survey.title }}</h2>
            <p class="card-text"> {{ survey.description }}</p>
            <p>{{ surveyInfo }}</p>
            <p>{{ surveyResponse }}</p>
        </section>
        <section class="personal-info">
            <o-field v-if="survey.named" label="Email">
                <o-input v-model="surveyInfo.email" name="email" type="email" placeholder="nobody@nowhere.com"
                    icon="email" required/>
            </o-field>
            <o-field label="Place of Residence">
                <o-select @change="updateLocation" placeholder="Select a district" required>
                    <optgroup v-for="area in hkAreas" :label="area.name">
                        <option v-for="district in hkAreas2Districts[area.id]" :value="`${area.id}.${district.id}`">{{
                district.name }}</option>
                    </optgroup>
                </o-select>
            </o-field>
        </section>
        <section class="survey-questions">
            <div v-for="[qid, question] in survey.questions" class="question">
                <o-field :label="question.title">
                    <p>{{ question.description }}</p>
                    <div v-if="question.type === 'radio'">
                        <o-radio v-for="[i, o] in question.options.entries()" :label="o" :native-value="i" v-model="surveyResponse[qid]" />
                    </div>
                    <o-switch v-if="question.type === 'switch'" 
                        v-model="surveyResponse[qid]"
                        true-value="1"
                        false-value="0">
                        {{ surveyResponse[qid] === "1" ? question.options[1] : question.options[0] }}
                    </o-switch>
                    <o-slider v-if="question.type === 'slider'" v-model="surveyResponse[qid]" :rounded="true" :min="0"
                        :max="question.options.length - 1" :tooltip="false">
                        <o-slider-tick v-for="[i, o] in question.options.entries()" :value="i">{{ o }}</o-slider-tick>
                    </o-slider>
                    <div v-if="question.type === 'checkbox'">
                        <o-checkbox v-model="surveyResponse[qid]" v-for="[i, o] in question.options.entries()"
                            :native-value="i" :label="o" :required="question.required"/>
                    </div>
                </o-field>
            </div>
        </section>
        <button @click="submit" type="submit">Submit</button>
        <section v-if="submitted" class="survey-result">
            <ColumnChart :surveyId="route.params.id" questionId="0" groupBy="area"/>
            <PieChart :surveyId="route.params.id" questionId="1" />
            <ColumnChart :surveyId="route.params.id" questionId="2" />
        </section>
    </main>
</template>