
const { Cyton } = require('openbci-observable');
const { voltsToMicrovolts, groupByChannel } = require('eeg-pipes');
const { bufferCount } = require('rxjs/operators');
const io = require('socket.io')(4301);

const simulate = process.argv[2] === '--simulate';
const options = { verbose: true, simulate };

async function init () {
    const brain = new Cyton(options);
    await brain.connect();
    await brain.start();

    brain.stream.pipe(
        voltsToMicrovolts(),
        bufferCount(256),
        groupByChannel()
    ).subscribe(sendToBrowser);
}

function sendToBrowser (buffer) {
    console.log(buffer);
    io.emit('metric:eeg', buffer);
}

init();
