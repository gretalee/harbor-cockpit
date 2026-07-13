import { Component, input } from '@angular/core';
import { BrightSkyIcon } from './bright-sky-api';

@Component({
  selector: 'app-weather-icon',
  templateUrl: './weather-icon.html',
})
export class WeatherIcon {
  readonly icon = input<BrightSkyIcon | null>(null);
  readonly size = input<number>(24);
}
