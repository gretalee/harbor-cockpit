import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '@app/features/dashboard/data/widget-catalog';
import { WidgetDefinition } from '@app/features/dashboard/data/widget.model';

const weatherIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5Z"/></svg>';

const weatherWidgetDefinition: WidgetDefinition = {
  id: 'weather',
  title: 'Wetter',
  icon: `data:image/svg+xml;utf8,${encodeURIComponent(weatherIconSvg)}`,
  defaultConfig: { city: 'Hamburg' },
  loadComponent: () => import('./weather-widget').then((m) => m.WeatherWidget),
};

export function provideWeatherWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: weatherWidgetDefinition },
  ]);
}
