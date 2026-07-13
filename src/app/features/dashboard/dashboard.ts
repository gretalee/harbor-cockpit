import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WIDGET_CATALOG } from '@features/dashboard/data/widget-catalog';
import { WidgetInstancesStore } from '@features/dashboard/data/widget-instances.store';
import { DASHBOARD_DROP_LIST_ID } from '@features/dashboard/data/drop-list-ids';
import { WidgetLoader } from '@features/dashboard/components/widget-loader/widget-loader';
import { WidgetShell } from '@features/dashboard/components/widget-shell/widget-shell';
import {
  WidgetPicker,
  WidgetPickerItem,
} from '@features/dashboard/components/widget-picker/widget-picker';
import { Flyout } from '@shared/ui/flyout/flyout';
import { HeaderActions } from '@layout/header-actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [WidgetLoader, WidgetShell, WidgetPicker, Flyout, CdkDropList, CdkDrag],
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private readonly _catalog = inject(WIDGET_CATALOG);
  protected readonly store = inject(WidgetInstancesStore);
  private readonly headerActions = inject(HeaderActions);

  private readonly headerActionsTemplate =
    viewChild.required<TemplateRef<unknown>>('headerActionsTpl');

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
    this.store.instances().map((instance) => {
      const definition = this._catalog.find((widget) => widget.id === instance.widgetId);
      return {
        instance,
        definition,
        columnSpanClass:
          (definition?.columnSpan ?? 1) >= 2 ? 'col-span-1 sm:col-span-2 lg:col-span-2' : '',
      };
    }),
  );

  ngAfterViewInit(): void {
    this.headerActions.set(this.headerActionsTemplate());
  }

  ngOnDestroy(): void {
    this.headerActions.set(null);
  }

  protected onWidgetDropped(event: CdkDragDrop<unknown>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        this.store.move(event.previousIndex, event.currentIndex);
      }
      return;
    }
    const item = event.item.data as WidgetPickerItem;
    this.store.add(item.id, item.config, event.currentIndex);
    // this.isFlyoutOpen.set(false);
  }

  protected onWidgetPicked(item: WidgetPickerItem): void {
    this.store.add(item.id, item.config);
    // this.isFlyoutOpen.set(false);
  }

  protected removeWidget(instanceId: string): void {
    this.store.remove(instanceId);
  }
}
