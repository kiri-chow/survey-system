<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { hkAreas2Districts } from '../hkDistricts';


const route = useRoute();
const router = useRouter();

const survey = ref({});
const surveyInfo = ref({});
const surveyResponse = ref({});

const getSurvey = async function () {
    fetch(
        '/api/surveys/' + route.params.id
    ).then(
        (res) => res.json()
    ).then(
        (json) => { 
            json.questions = json.questions.entries().toArray();
            survey.value = json;
        }
    ).catch((err) => { console.error(err); })
}

onMounted(async () => {
    if (route.params.id) {
        await getSurvey();
    }
})

const checkEmail = async function () {

}

</script>
<template>
    <main>
        <section class="survey-info">
            <h2 class="card-title">{{ survey.title }}</h2>
            <p class="card-text"> {{ survey.description }}</p>
            <p>{{surveyInfo}}</p>
            <p>{{surveyResponse}}</p>
        </section>
        <section class="personal-info">
            <o-field v-if="survey.named" label="Email">
                <o-input v-model="surveyInfo.email" name="email" type="email" placeholder="nobody@nowhere.com" icon="email" />
            </o-field>
            <o-field label="Place of Residence">
                <o-select v-model="surveyInfo.place_of_residence" placeholder="Select a district">
                    <optgroup v-for="[area, districts] in Object.entries(hkAreas2Districts)" :label="area">
                        <option v-for="district in districts" :value="district.id">{{ district.name }}</option>
                    </optgroup>
                </o-select>
            </o-field>
        </section>
        <section class="survey-questions">
            <div v-for="[qid, question] in survey.questions" class="question">
                <o-field :label="question.title">
                    <p>{{ question.description }}</p>
                    <o-slider v-model="surveyResponse[qid]" v-if="question.type === 'radio'" :rounded="true" :min="0" :max="question.options.length - 1"
                        :tooltip="false">
                        <o-slider-tick v-for="[i, o] in question.options.entries()" :value="i">{{ o }}</o-slider-tick>
                    </o-slider>
                    <div v-if="question.type === 'checkbox'">
                        <o-checkbox v-model="surveyResponse[qid]" v-for="[i, o] in question.options.entries()" :native-value="i" :label="o" />
                    </div>
                </o-field>
            </div>
        </section>
        <button type="submit">Submit</button>
    </main>
</template>