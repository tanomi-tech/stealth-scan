const {spawn} = require('child_process');
const {workerData, parentPort} = require("worker_threads");
const {data} = workerData;

let jsonOutput = '';
if (!data?.baseCmd && !data?.flags) {
    process.send({
        id: id,
        data: {
            error: true,
            message: null
        }
    })
}
const collector = spawn(data?.baseCmd, data?.flags, {
    stdio: ['ignore', 'pipe', 'ignore']
});
collector.stdout.on('data', function (stdoutData) {
    jsonOutput += stdoutData;
}); 
collector.on('close', function (code) {
    try {
        const data = JSON.parse(jsonOutput);
        parentPort.postMessage(data);
    } catch(err) {
        console.error('Error parsing output', err);
        parentPort.postMessage({
            error: true,
            message: err
        });
    }
});