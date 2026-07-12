import { makeEnvironmentProviders } from '@angular/core';
import { WIDGET_CATALOG } from '@app/features/dashboard/data/widget-catalog';
import { WidgetDefinition } from '@app/features/dashboard/data/widget.model';

const tideIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/><path d="M2 18c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/></svg>';

const tideWidgetDefinition: WidgetDefinition = {
  id: 'tide',
  title: 'Gezeiten',
  icon: `data:image/svg+xml;utf8,${encodeURIComponent(tideIconSvg)}`,
  defaultConfig: { location: 'Cuxhaven' },
  loadComponent: () => import('./tide-widget').then((m) => m.TideWidget),
};

export function provideTideWidget() {
  return makeEnvironmentProviders([
    { provide: WIDGET_CATALOG, multi: true, useValue: tideWidgetDefinition },
  ]);
}
