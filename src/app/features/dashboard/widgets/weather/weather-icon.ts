import { Component, computed, input } from '@angular/core';
import { BrightSkyIcon } from './bright-sky-api';
import { cn } from '@app/shared/utils/cn';

@Component({
  selector: 'app-weather-icon',
  templateUrl: './weather-icon.html',
})
export class WeatherIcon {
  readonly icon = input<BrightSkyIcon | null>(null);
  readonly iconClass = input<string>('');

  protected cssClasses = computed(() => cn('h-8 w-8', this.iconClass()));
}
