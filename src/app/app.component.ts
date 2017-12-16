import { Component, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  template: `<time-series [stream$]="stream$"></time-series>`
})
export class AppComponent implements OnDestroy {
  wsEvent = 'metric/eeg';
  socket = io('http://localhost:4301');
  stream$ = fromEvent(this.socket, this.wsEvent);
  ngOnDestroy () {
    this.socket.removeListener(this.wsEvent);
  }
}

