import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '../../data/widget-catalog';
import { WidgetDefinition } from '../../data/widget.model';

const severeWeatherWidgetDefinition: WidgetDefinition = {
  id: 'severe-weather',
  title: 'Severe Weather Warnings',
  icon: 'alert-triangle',
  defaultSize: { w: 2, h: 2 },
  loadComponent: () => import('./severe-weather-widget').then((m) => m.SevereWeatherWidget),
};

export function provideSevereWeatherWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: severeWeatherWidgetDefinition },
  ]);
}
