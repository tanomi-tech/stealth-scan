const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    db.all(`select * from reports`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: true
            });
        }
        res.send(rows);
    });
});

router.get('/host/:host', (req, res) => {
    db.all(`
        select * from reports
        where host = ?
        group by beacon`, req.params.host, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: true
            });
        }
        res.json(rows);
    });
});

module.exports = router;