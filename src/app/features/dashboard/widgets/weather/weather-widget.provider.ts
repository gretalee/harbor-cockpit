import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '../../data/widget-catalog';
import { WidgetDefinition } from '../../data/widget.model';

const weatherWidgetDefinition: WidgetDefinition = {
  id: 'weather',
  title: 'Weather',
  icon: 'cloud',
  defaultSize: { w: 2, h: 2 },
  loadComponent: () => import('./weather-widget').then((m) => m.WeatherWidget),
};

export function provideWeatherWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: weatherWidgetDefinition },
  ]);
}
