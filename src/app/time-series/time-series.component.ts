import { Component, ElementRef } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { ChartService } from '../shared/chart.service';
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval } from 'rxjs/observable/interval';
import { switchMap } from 'rxjs/operators/switchMap';
import { tap } from 'rxjs/operators/tap';
import { zip } from 'rxjs/operators/zip';
import * as io from 'socket.io-client';

const wsUrl = 'http://localhost:4301';
const wsEvent = 'metric:eeg';

@Component({
  selector: 'time-series',
  templateUrl: 'time-series.component.html',
  styleUrls: ['time-series.component.css'],
})
export class TimeSeriesComponent implements OnInit, OnDestroy {

  constructor(private view: ElementRef, private chartService: ChartService) {}
  
  plotDelay = 1000;
  channels = 8;
  amplitudes = [];
  socket = io(wsUrl);
  options = this.chartService.getChartSmoothieDefaults({ millisPerPixel: 8 });
  colors = this.chartService.getColors();
  canvases = Array(this.channels).fill(0).map(() => new SmoothieChart(this.options));
  lines = Array(this.channels).fill(0).map(() => new TimeSeries());
  stream$ = fromEvent(this.socket, wsEvent)
    .pipe(
      switchMap(x => (x as any)),
      zip(interval(4), sample => sample),
      tap(sample => this.draw(sample))
    );
  
  ngAfterViewInit () {
    const channels = this.view.nativeElement.querySelectorAll('canvas');
    this.canvases.forEach((canvas, index) => {
      canvas.streamTo(channels[index], this.plotDelay);
    });
  }

  ngOnInit () {
    this.addTimeSeries();
    this.stream$.subscribe();
  }

  addTimeSeries () {
    this.lines.forEach((line, index) => {
      this.canvases[index].addTimeSeries(line, { 
        lineWidth: 2,
        strokeStyle: this.colors[index].borderColor
      });
    });
  }

  draw (sample) {
    sample.data.forEach((amplitude, index) => {
      this.lines[index].append(new Date().getTime(), amplitude);
      this.amplitudes[index] = amplitude.toFixed(2);
    });
  }

  ngOnDestroy () {
    this.socket.removeListener(wsEvent);
  }

}
