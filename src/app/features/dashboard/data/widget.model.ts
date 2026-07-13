import { Type } from '@angular/core';

export interface WidgetDefinition {
  id: string;
  title: string;
  icon: string;
  defaultConfig: unknown;
  loadComponent: () => Promise<Type<unknown>>;
  /** Number of grid columns this widget should span on the dashboard. Defaults to 1. */
  columnSpan?: number;
}

export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  config: unknown;
}
