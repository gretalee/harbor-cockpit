import { InjectionToken } from '@angular/core';
import { WidgetDefinition } from './widget.model';

export const WIDGET_CATALOG = new InjectionToken<WidgetDefinition[]>('WIDGET_CATALOG');
