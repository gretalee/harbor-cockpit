import { Component, output } from '@angular/core';

@Component({
  selector: 'app-widget-shell',
  templateUrl: './widget-shell.html',
})
export class WidgetShell {
  readonly remove = output<void>();
}
