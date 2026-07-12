import { Component, computed, input } from '@angular/core';

interface WeatherWidgetConfig {
  city: string;
}

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.html',
})
export class WeatherWidget {
  readonly config = input<WeatherWidgetConfig>();

  protected readonly city = computed(() => this.config()?.city ?? null);
}
