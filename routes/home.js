const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', function(req, res, next) {
  let orderby = ``;
  let queryMap = {
    names: 'host',
    trackers: 'beacons',
    asc: 'ASC',
    desc: 'DESC'
  }
  if (req.query?.sort && req.query?.order) {
    const type = queryMap[req.query.sort];
    const order = queryMap[req.query.order];
  
    if (type && order) {
      orderby = `order by ${type} ${order}`
    }
  }

  db.all(`
    select host,
    count(distinct beacon) beacons,
    round(avg(fingerprinting), 0) as fingerprinting_average from reports
    where host is not ''
    group by host
    ${orderby}
`, (err, rows) => {
    if (err) {
        console.error(err);
        res.status(500).json({
            error: true
        });
    }
    res.render('index', { title: 'Stealth Scan', data: rows, umami: process.env.SS_UMAMI_ID});
  });
});

module.exports = router;
