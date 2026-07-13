import { Component, input, output } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  WIDGET_PICKER_DROP_LIST_ID,
  DASHBOARD_DROP_LIST_ID,
} from '@features/dashboard/data/drop-list-ids';
import { CommonModule } from '@angular/common';

export interface WidgetPickerItem {
  id: string;
  title: string;
  icon: string;
  config: unknown;
}

@Component({
  selector: 'app-widget-picker',
  templateUrl: './widget-picker.html',
  imports: [CommonModule, CdkDropList, CdkDrag],
})
export class WidgetPicker {
  readonly items = input<WidgetPickerItem[]>([]);
  readonly pick = output<WidgetPickerItem>();
  readonly droppedWithoutTarget = output<WidgetPickerItem>();
  readonly dropListId = WIDGET_PICKER_DROP_LIST_ID;
  readonly connectedTo = DASHBOARD_DROP_LIST_ID;

  protected onDropped(event: CdkDragDrop<WidgetPickerItem[]>): void {
    // Item never entered a connected drop zone (e.g. released above empty page area)
    // and landed back in this list -> treat it like a click and append it at the end.
    this.droppedWithoutTarget.emit(event.item.data as WidgetPickerItem);
  }
}
