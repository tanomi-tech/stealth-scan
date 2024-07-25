const express = require('express');
const router = express.Router();
const {
    Worker,
} = require("worker_threads");

function addWorker(data, callback) {
    const worker = new Worker(`${__dirname}/../worker.js`, {
        workerData: {data}
    });
    worker.on('message', callback);
    worker.on('error', (err) => {
        console.error(err);
        callback({
                error: true,
                message: err
        })
    });
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
};

router.get('/', (req, res) => {
    addWorker({
        baseCmd: `website-evidence-collector`,
        flags: [
            '--no-output', 
            '--json', 
            req.query.url, 
            '--', 
            '--no-sandbox', 
            '--headless',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-session-crashed-bubble',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--noerrdialogs',
            '--disable-gpu'
        ]
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