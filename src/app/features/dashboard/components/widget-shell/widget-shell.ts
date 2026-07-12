import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-widget-shell',
  templateUrl: './widget-shell.html',
})
export class WidgetShell {
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly remove = output<void>();
}
