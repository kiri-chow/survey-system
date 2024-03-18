var express = require('express');
var router = express.Router();

const { connectToDB, ObjectId, getDate } = require('../utils/db');


// get surveys
router.get('/all', async function (req, res) {
    const db = await connectToDB();
    try {
        const sort = {};
        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;
        delete req.query.page;
        delete req.query.perPage;

        // handle sort_by
        if (req.query.sort_by) {
            let sortBy = req.query.sort_by.split(".");
            if (sortBy.length > 1) {
                sort[sortBy[0]] = sortBy[1] == "desc" ? -1 : 1;
            }
            delete req.query.sort_by;
        }

        // query conditions
        let query = req.query;

        // retrieve result
        let result = await db.collection("surveys").find(query).sort(sort).skip(skip).limit(perPage).toArray();
        let total = await db.collection("surveys").countDocuments(query);
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

// get a survey
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        const result = await db.collection('surveys').findOne({
            _id: new ObjectId(req.params.id)
        });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "survey not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        db.client.close();
    }
});

// create a survey
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.created_at = getDate();
        req.body.modified_at = req.body.created_at;
        const result = await db.collection("surveys").insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// update a survey
router.put('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        delete req.body.created_at;
        delete req.body._id;
        req.body.modified_at = getDate();
        const result = await db.collection('surveys').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
        );
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "survey updated" });
        } else {
            res.status(404).json({ message: "survey not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// delete a survey
router.delete('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        await db.collection('responses').deleteMany(
            { survey_id: req.params.id}
        );
        const result = await db.collection('surveys').deleteOne(
            { _id: new ObjectId(req.params.id) },
        );
        if (result.deletedCount > 0) {
            res.status(200).json({ message: "survey deleted" });
        } else {
            res.status(404).json({ message: "survey not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;
