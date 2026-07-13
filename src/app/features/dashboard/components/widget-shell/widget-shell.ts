import { Component, input, output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-widget-shell',
  templateUrl: './widget-shell.html',
  imports: [CdkDragHandle],
})
export class WidgetShell {
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly remove = output<void>();
}
