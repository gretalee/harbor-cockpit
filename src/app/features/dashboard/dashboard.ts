import { Component, computed, inject } from '@angular/core';
import { WIDGET_CATALOG } from './data/widget-catalog';
import { WidgetInstancesStore } from './data/widget-instances.store';
import { WidgetLoader } from './components/widget-loader/widget-loader';
import { WidgetShell } from './components/widget-shell/widget-shell';
import { WidgetPicker, WidgetPickerItem } from './components/widget-picker/widget-picker';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [WidgetLoader, WidgetShell, WidgetPicker],
})
export class Dashboard {
  private readonly catalog = inject(WIDGET_CATALOG);
  protected readonly store = inject(WidgetInstancesStore);

  protected readonly pickerItems = computed<WidgetPickerItem[]>(() =>
    this.catalog.map((widget) => ({ id: widget.id, title: widget.title, icon: widget.icon })),
  );

  protected addWidget(widgetId: string): void {
    this.store.add(widgetId);
  }

  protected removeWidget(instanceId: string): void {
    this.store.remove(instanceId);
  }
}
