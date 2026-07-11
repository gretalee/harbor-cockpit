import { Component, input } from '@angular/core';

@Component({
  selector: 'app-widget-error',
  templateUrl: './widget-error.html',
})
export class WidgetError {
  readonly message = input<string>();
}
