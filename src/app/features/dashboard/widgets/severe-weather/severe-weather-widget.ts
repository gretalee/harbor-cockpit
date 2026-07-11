import { Component, input } from '@angular/core';

interface SevereWeatherWarning {
  severity: 'watch' | 'warning';
  title: string;
  validUntil: string;
}

@Component({
  selector: 'app-severe-weather-widget',
  templateUrl: './severe-weather-widget.html',
})
export class SevereWeatherWidget {
  readonly config = input<unknown>();

  protected readonly warnings: SevereWeatherWarning[] = [
    { severity: 'warning', title: 'Gale force winds', validUntil: '22:00' },
    { severity: 'watch', title: 'Thunderstorms', validUntil: 'tomorrow 06:00' },
  ];
}
