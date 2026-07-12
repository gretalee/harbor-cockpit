import { Component, computed, inject, signal } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WIDGET_CATALOG } from '@features/dashboard/data/widget-catalog';
import { WidgetInstancesStore } from '@features/dashboard/data/widget-instances.store';
import {
  WIDGET_PICKER_DROP_LIST_ID,
  DASHBOARD_DROP_LIST_ID,
} from '@features/dashboard/data/drop-list-ids';
import { WidgetLoader } from '@features/dashboard/components/widget-loader/widget-loader';
import { WidgetShell } from '@features/dashboard/components/widget-shell/widget-shell';
import {
  WidgetPicker,
  WidgetPickerItem,
} from '@features/dashboard/components/widget-picker/widget-picker';
import { Flyout } from '@shared/ui/flyout/flyout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [WidgetLoader, WidgetShell, WidgetPicker, Flyout, CdkDropList, CdkDrag],
})
export class Dashboard {
  private readonly _catalog = inject(WIDGET_CATALOG);
  protected readonly store = inject(WidgetInstancesStore);

  protected readonly widgetPickerDropListId = WIDGET_PICKER_DROP_LIST_ID;
  protected readonly dashboardDropListId = DASHBOARD_DROP_LIST_ID;
  protected readonly isFlyoutOpen = signal(false);

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

  protected toggleFlyout(): void {
    this.isFlyoutOpen.update((open) => !open);
  }

  protected onWidgetDropped(event: CdkDragDrop<unknown>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.item.data as WidgetPickerItem;
    this.store.add(item.id, item.config, event.currentIndex);
    this.isFlyoutOpen.set(false);
  }

  protected removeWidget(instanceId: string): void {
    this.store.remove(instanceId);
  }
}
