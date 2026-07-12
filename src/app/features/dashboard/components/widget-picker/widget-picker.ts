import { Component, input, output } from '@angular/core';

export interface WidgetPickerItem {
  id: string;
  title: string;
  icon: string;
  config: unknown;
}

@Component({
  selector: 'app-widget-picker',
  templateUrl: './widget-picker.html',
})
export class WidgetPicker {
  readonly items = input<WidgetPickerItem[]>([]);
  readonly pick = output<WidgetPickerItem>();
}
