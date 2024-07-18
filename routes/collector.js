const express = require('express');
const router = express.Router();
const {fork} = require('child_process');
const child = fork(`${__dirname}/../child.js`);
const jobs = {};
let jobId = 0;

function addJob(data, callback) {
    const id = jobId++;
    jobs[id] = callback;
    child.send({id, data});
};

child.on('message', function(message) {
    jobs[message.id](message.data);
});

router.get('/', (req, res) => {
    addJob({
        baseCmd: `website-evidence-collector`,
        flags: ['--no-output', '--json', req.query.url, '--', '--no-sandbox']
    }, (result) => {
        if (result?.error === true) {
            res.status(500).send();
        } else if (result === null) {
            res.status(204).send();
        } else {
            res.json(result);
        }
    });
});

module.exports = router;