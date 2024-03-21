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


function addDays(date, days){
    return new Date(Date.parse(date) + days * 3600 * 24 * 1000);
}


function getColumn(data, groups, column){
    if (data[column]) return data[column];
    let cols = new Set();
    for (let group of Object.values(groups)) {
        cols = cols.union(new Set(Object.keys(group)));
    }
    cols = cols.values().toArray().sort();

    if (column == 'date') {
        let date = new Date(cols[0]);
        let stopDate = new Date(cols[cols.length - 1]);
        cols = [cols[0]]
        while (date < stopDate) {
            date = addDays(date, 1);
            cols.push(date.toISOString().split('T')[0]);
        }
    }

    return cols
}


function convertSeries(data, {column, groupBy} = {}) {
    if (!column) column = 'option';
    let groups = {};
    if (groupBy) {
        // group the data
        for (let obj of data.data) {
            let area = adjustGroup(obj[groupBy], groupBy);
            if (!groups[area]) {
                groups[area] = {};
            }
            let row = groups[area];
            row[obj[column]] = obj.count;
        }
    } else {
        groups[data.title] = {};
        data.data.forEach((x) => groups[data.title][x[column]] = x.count)
    }

    // build series
    const series = [];
    const categories = getColumn(data, groups, column);
    for (let [groupName, groupResult] of Object.entries(groups)) {
        let obj = {
            name: groupName,
            data: [],
        };
        if (column === 'option') {
            for (let ind of categories.keys()) {
                obj.data.push(groupResult[ind] ? groupResult[ind] : 0);
            }
        } else {
            obj.name = data[groupBy][obj.name];
            for (let ind of categories) {
                obj.data.push(groupResult[ind] ? groupResult[ind] : 0)
            }
        }
        series.push(obj);
    }
    return [series, categories];
}

export default getData;
export { getData, convertSeries }