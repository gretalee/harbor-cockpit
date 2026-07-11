import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '../../data/widget-catalog';
import { WidgetDefinition } from '../../data/widget.model';

const tideWidgetDefinition: WidgetDefinition = {
  id: 'tide',
  title: 'Tide',
  icon: 'waves',
  defaultSize: { w: 2, h: 2 },
  loadComponent: () => import('./tide-widget').then((m) => m.TideWidget),
};

export function provideTideWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: tideWidgetDefinition },
  ]);
}
