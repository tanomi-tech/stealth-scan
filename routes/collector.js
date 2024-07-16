const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');

router.get('/', (req, res, next) => {
    const collector = spawn('website-evidence-collector', ['--no-output', '--json', req.query.url], {
        stdio: ['ignore', 'pipe', 'ignore']
    });
    collector.stdout.pipe(res);
});

module.exports = router;