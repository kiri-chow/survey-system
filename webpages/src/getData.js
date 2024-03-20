import {hkAreas} from "./hkDistricts"


async function getData(surveyId, questionId, groupBy = null) {
    // set params
    const params = [];
    if (groupBy) {
        params.push(`group_by=${groupBy}`);
    }

    // build url
    let url = `/api/responses/result/${surveyId}/${questionId}`;
    if (params.length) {
        url += `?${params}`;
    }

    // fetch data
    const response = await fetch(url);
    const data = await response.json();
    data.data = data.data.sort(sortResult);
    return data;
}

function sortResult(x, y, groupBy) {
    if (groupBy) {
        const gb = groupBy;
        return [x.option, x[gb]] < [y.option, y[gb]] ? -1 : 1;
    }
    return x.option < y.option ? -1 : 1;
}


function adjustGroup(x, groupBy=null) {
    if (groupBy === 'area') {
        for (let obj of hkAreas) {
            if (obj.id === x) {
                return obj.name;
            }
        }
    }
    return x;
}


function convertSeries(data, groupBy = null) {
    let groups = {};
    if (groupBy) {
        // group the data
        for (let obj of data.data) {
            let area = adjustGroup(obj[groupBy], groupBy);
            if (!groups[area]) {
                groups[area] = {};
            }
            let row = groups[area];
            row[obj.option] = obj.count;
        }
    } else {
        groups[data.title] = {};
        data.data.forEach((x) => groups[data.title][x.option] = x.count)
    }

    // build series
    const series = [];
    for (let [groupName, groupResult] of Object.entries(groups)) {
        let obj = {
            name: groupName,
            data: [],
        };
        for (let ind of data.options.keys()) {
            obj.data.push(groupResult[ind] ? groupResult[ind] : 0);
        }
        series.push(obj);
    }
    return series;
}

export default getData;
export { getData, convertSeries }