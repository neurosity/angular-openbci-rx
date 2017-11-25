import { Component, ElementRef } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { ChartService } from '../shared/chart.service';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { tap } from 'rxjs/operators/tap';
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
  
  plotDelay = 3000;
  channels = 8;
  amplitudes = [];
  socket = io(wsUrl);
  options = this.chartService.getChartSmoothieDefaults({ millisPerPixel: 3 });
  colors = this.chartService.getColors();
  canvases = Array(this.channels).fill(0).map(() => new SmoothieChart(this.options));
  lines = Array(this.channels).fill(0).map(() => new TimeSeries());
  stream$ = fromEvent(this.socket, wsEvent)
    .pipe(
      mergeMap(sample => (sample as any)),
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
      this.lines[index].append(sample.timestamp, amplitude);
      this.amplitudes[index] = amplitude.toFixed(2);
    });
  }

  ngOnDestroy () {
    this.socket.removeListener(wsEvent);
  }

}
