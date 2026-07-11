import { Component, inject, input, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { WIDGET_CATALOG } from '../../data/widget-catalog';
import { WidgetSkeleton } from '../widget-skeleton/widget-skeleton';
import { WidgetError } from '../widget-error/widget-error';

@Component({
  selector: 'app-widget-loader',
  templateUrl: './widget-loader.html',
  imports: [NgComponentOutlet, WidgetSkeleton, WidgetError],
})
export class WidgetLoader {
  readonly widgetId = input.required<string>();
  readonly config = input<unknown>();

  private readonly catalog = inject(WIDGET_CATALOG);

  protected readonly componentType = resource({
    params: () => this.widgetId(),
    loader: ({ params }) => {
      const definition = this.catalog.find((widget) => widget.id === params);
      if (!definition) {
        return Promise.reject(new Error(`Unknown widget: ${params}`));
      }
      return definition.loadComponent();
    },
  });
}
