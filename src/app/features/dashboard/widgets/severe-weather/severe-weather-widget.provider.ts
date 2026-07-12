import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '@app/features/dashboard/data/widget-catalog';
import { WidgetDefinition } from '@app/features/dashboard/data/widget.model';

const severeWeatherIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

const severeWeatherWidgetDefinition: WidgetDefinition = {
  id: 'severe-weather',
  title: 'Unwetterwarnungen',
  icon: `data:image/svg+xml;utf8,${encodeURIComponent(severeWeatherIconSvg)}`,
  defaultConfig: { region: 'North Sea' },
  loadComponent: () => import('./severe-weather-widget').then((m) => m.SevereWeatherWidget),
};

export function provideSevereWeatherWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: severeWeatherWidgetDefinition },
  ]);
}
