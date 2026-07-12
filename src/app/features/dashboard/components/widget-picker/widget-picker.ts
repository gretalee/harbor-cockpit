import { Component, input, output } from '@angular/core';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
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
  readonly dropListId = WIDGET_PICKER_DROP_LIST_ID;
  readonly connectedTo = DASHBOARD_DROP_LIST_ID;
}
