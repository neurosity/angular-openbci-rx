import { Component, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import * as io from 'socket.io-client';

const wsUrl = 'http://localhost:4301';
const wsEvent = 'metric/eeg';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Brainwaves!';
  
  socket = io(wsUrl);
  stream$ = fromEvent(this.socket, wsEvent);

  ngOnDestroy () {
    this.socket.removeListener(wsEvent);
  }
}
