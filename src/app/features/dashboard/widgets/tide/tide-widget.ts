import { Component, input } from '@angular/core';

interface TideEntry {
  type: 'high' | 'low';
  time: string;
  level: string;
}

@Component({
  selector: 'app-tide-widget',
  templateUrl: './tide-widget.html',
})
export class TideWidget {
  readonly config = input<unknown>();

  protected readonly tides: TideEntry[] = [
    { type: 'high', time: '06:12', level: '3.2 m' },
    { type: 'low', time: '12:34', level: '0.8 m' },
    { type: 'high', time: '18:47', level: '3.4 m' },
  ];
}
