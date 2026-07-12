import { Component, inject, input, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { WIDGET_CATALOG } from '@features/dashboard/data/widget-catalog';
import { WidgetSkeleton } from '@app/features/dashboard/components/widget-skeleton/widget-skeleton';
import { WidgetError } from '@app/features/dashboard/components/widget-error/widget-error';

@Component({
  selector: 'app-widget-loader',
  templateUrl: './widget-loader.html',
  imports: [NgComponentOutlet, WidgetSkeleton, WidgetError],
})
export class WidgetLoader {
  readonly widgetId = input.required<string>();
  readonly config = input<unknown>();

  private readonly _catalog = inject(WIDGET_CATALOG);

  protected readonly loadingResource = resource({
    params: () => this.widgetId(),
    loader: ({ params }) => {
      const definition = this._catalog.find((widget) => widget.id === params);

      // Widget not found
      if (!definition) {
        return Promise.reject(new Error(`Widget "${params}" konnte nicht geladen werden.`));
      }

      // Load widget component
      return definition.loadComponent();
    },
  });
}
