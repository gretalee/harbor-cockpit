import { Component, computed, inject } from '@angular/core';
import { WIDGET_CATALOG } from '@features/dashboard/data/widget-catalog';
import { WidgetInstancesStore } from '@features/dashboard/data/widget-instances.store';
import { WidgetLoader } from '@features/dashboard/components/widget-loader/widget-loader';
import { WidgetShell } from '@features/dashboard/components/widget-shell/widget-shell';
import {
  WidgetPicker,
  WidgetPickerItem,
} from '@features/dashboard/components/widget-picker/widget-picker';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [WidgetLoader, WidgetShell, WidgetPicker],
})
export class Dashboard {
  private readonly _catalog = inject(WIDGET_CATALOG);
  protected readonly store = inject(WidgetInstancesStore);

  protected readonly pickerItems = computed<WidgetPickerItem[]>(() => {
    const activeWidgetIds = new Set(this.store.instances().map((instance) => instance.widgetId));
    return this._catalog
      .filter((widget) => !activeWidgetIds.has(widget.id))
      .map((widget) => ({
        id: widget.id,
        title: widget.title,
        icon: widget.icon,
        config: widget.defaultConfig,
      }));
  });

  protected readonly dashboardWidgets = computed(() =>
    this.store.instances().map((instance) => ({
      instance,
      definition: this._catalog.find((widget) => widget.id === instance.widgetId),
    })),
  );

  protected addWidget(item: WidgetPickerItem): void {
    this.store.add(item.id, item.config);
  }

  protected removeWidget(instanceId: string): void {
    this.store.remove(instanceId);
  }
}
