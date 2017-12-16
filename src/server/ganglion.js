
const { Ganglion } = require('openbci-observable');
const { voltsToMicrovolts, bufferTime } = require('eeg-pipes');
const io = require('socket.io')(4301);

(async function init () {
    const brain = new Ganglion({ verbose: true });
    await brain.connect();
    await brain.start();

    brain.stream
        .pipe(voltsToMicrovolts(), bufferTime(1000))
        .subscribe(eeg => {
            console.log(eeg);
            io.emit('metric/eeg', eeg);
        });
})();
