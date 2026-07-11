import { Component, input } from '@angular/core';

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.html',
})
export class WeatherWidget {
  readonly config = input<unknown>();
}
