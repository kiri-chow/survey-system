var express = require('express');
var router = express.Router();

const { connectToDB, ObjectId, getDate } = require('../utils/db');

function adjustField(field) {
    if (field === 'date') {
        return {
            $dateToString: {
                date: {
                    $toDate: "$created_at"
                },
                format: "%Y-%m-%d"
            }
        };
    }
    return "$" + field;
}

// get responses
router.get('/all', async function (req, res) {
    const db = await connectToDB();
    try {
        const sort = {};
        const query = {};
        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;
        delete req.query.page;
        delete req.query.perPage

        // handle sort_by
        if (req.query.sort_by) {
            let sortBy = req.query.sort_by.split(".");
            if (sortBy.length > 1) {
                sort[sortBy[0]] = sortBy[1] == "desc" ? -1 : 1;
            }
            delete req.query.sort_by;
        }

        // query conditions
        for (let [k, v] of Object.entries(req.query)) {
            let vInt = parseInt(v);
            if (vInt.toString() === v){
                v = vInt;
            }
            query[k] = v;
        }
        console.log(query);
        // retrieve result
        let result = await db.collection("responses").find(query).sort(sort).skip(skip).limit(perPage).toArray();
        let total = await db.collection("responses").countDocuments(query);
        res.status(200).json({
            data: result,
            total: total,
            page: page,
            perPage: perPage
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        db.client.close();
    }
});

// get a response
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        const result = await db.collection('responses').findOne({
            _id: new ObjectId(req.params.id)
        });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "response not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        db.client.close();
    }
});

// create a response
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
        // insert
        req.body.created_at = getDate();
        req.body.modified_at = req.body.created_at;
        const result = await db.collection("responses").insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// convert data format
function convert(item) {
    item._id.count = item.count;
    return item._id;
}

// get result of a question
router.get('/result/:sid/:qid', async function (req, res) {
    const db = await connectToDB();
    try {
        // set id
        const surverId = req.params.sid;
        const questionId = Number(req.params.qid);
        let groups = req.query.group_by;

        // extract data from survey
        const survey = await db.collection('surveys').findOne({
            _id: new ObjectId(surverId)
        });

        // set field to get
        const question = survey.questions[questionId];
        const qTitle = question.title.toLowerCase().replaceAll(" ", "_");
        const qOptions = question.options;

        // group by options
        const projection = { opt: { $toString: "$" + questionId } };
        const groupId = { option: "$opt" };
        if (groups) {
            groups = groups.split(',');
            for (let field of groups) {
                projection[field] = adjustField(field);
                groupId[field] = "$" + field;
            }
        }

        // build pipeline
        const pipeline = [
            { $match: { survey_id: surverId } },
        ];
        if (question.type === 'checkbox') {
            pipeline.push({ $unwind: "$" + questionId })
        }
        pipeline.push({ $project: projection });
        pipeline.push({ $group: { _id: groupId, count: { $count: {} } } });

        // collect result
        let result = await db.collection('responses').aggregate(pipeline).toArray();
        result = result.map(convert);

        if (result) {
            res.status(200).json({
                title: question.title,
                surveyTitle: survey.title,
                data: result,
                option: qOptions,
            });
        } else {
            res.status(404).json({ message: "Page not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;
