
const BrainObservable = require('openbci-rx').Cyton;
const io = require('socket.io')(4301);

const simulate = process.argv[2] === '--simulate';
const options = { verbose: true, simulate };

const brainwaves$ = BrainObservable(options)
    .toMicrovolts()
    .bufferCount(256)
    .groupByChannel()
    .subscribe(sendToBrowser);

function sendToBrowser (buffer) {
    console.log(buffer);
    io.emit('metric:eeg', buffer);
}
