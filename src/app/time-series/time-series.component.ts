import { Component, ElementRef } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { ChartService } from '../shared/chart.service';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval } from 'rxjs/observable/interval';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { zip } from 'rxjs/operators/zip';
import { tap } from 'rxjs/operators/tap';
import * as io from 'socket.io-client';

const wsUrl = 'http://localhost:4301';
const wsEvent = 'metric/eeg';

const channelsByBoard = {
  cyton: 8,
  ganglion: 4
};

@Component({
  selector: 'time-series',
  templateUrl: 'time-series.component.html',
  styleUrls: ['time-series.component.css'],
})
export class TimeSeriesComponent implements OnInit, OnDestroy {

  constructor(private view: ElementRef, private chartService: ChartService) {}
  
  boardName = 'ganglion';
  channels = channelsByBoard[this.boardName];
  plotDelay = 1000;
  amplitudes = [];
  socket = io(wsUrl);
  colors = this.chartService.getColors();
  options = this.chartService.getChartSmoothieDefaults();
  canvases = Array(this.channels).fill(0).map(() => new SmoothieChart(this.options));
  lines = Array(this.channels).fill(0).map(() => new TimeSeries());

  stream$ = fromEvent(this.socket, wsEvent);
  amplitudes$ = this.stream$
    .pipe(
      mergeMap(samples => (samples as any)),
      zip(interval(4), sample => sample)
    );
  
  ngAfterViewInit () {
    const channels = this.view.nativeElement.querySelectorAll('canvas');
    this.canvases.forEach((canvas, index) => {
      canvas.streamTo(channels[index], this.plotDelay);
    });
  }

  ngOnInit () {
    this.addTimeSeries();
    this.amplitudes$.subscribe(sample => this.updateAmplitude(sample));
    this.stream$.subscribe(buffer => {
      (buffer as any).forEach(sample => this.draw(sample));
    });
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
    });
  }

  updateAmplitude (sample) {
    sample.data.forEach((amplitude, index) => {
      this.amplitudes[index] = amplitude.toFixed(2);
    });
  }

  ngOnDestroy () {
    this.socket.removeListener(wsEvent);
  }

}
