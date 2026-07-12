import { Type } from '@angular/core';

export interface WidgetDefinition {
  id: string;
  title: string;
  icon: string;
  defaultConfig: unknown;
  loadComponent: () => Promise<Type<unknown>>;
}

export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  config: unknown;
}
