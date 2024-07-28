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

router.get('/hosts', (req, res) => {
    db.all(`
        select host, count(host) as beacons, round(avg(fingerprinting), 0) as fingerprinting_average from reports
        where host IS NOT ''
        group by host
    `, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: true
            });
        }
        res.json(rows);
    });
});

router.get('/host/:host', (req, res) => {
    db.all(`
        select * from reports
        where host = ?`, req.params.host, (err, rows) => {
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