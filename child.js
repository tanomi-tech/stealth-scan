const {spawn} = require('child_process');

process.on('message', function(message) {
    let jsonOutput = '';
    if (!message.data?.baseCmd && !message.data?.flags) {
        process.send({
            id: message.id,
            data: {
                error: true,
                message: null
            }
        })
    }
    const collector = spawn(message.data?.baseCmd, message.data?.flags, {
        stdio: ['ignore', 'pipe', 'ignore']
    });
    collector.stdout.on('data', function (stdoutData) {
        jsonOutput += stdoutData;
    }); 
    collector.on('close', function (code) {
        try {
            const data = JSON.parse(jsonOutput);
            process.send({id: message.id, data});
        } catch(err) {
            console.error('Error parsing output', err);
            process.send({
                id: message.id,
                data: {
                    error: true,
                    message: err
                }
            });
        }
    });
});