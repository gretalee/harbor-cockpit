import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.html',
})
export class ProgressBar {
  readonly percent = input<number | null>(null);
}
