import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderActionsService } from './header-actions.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  imports: [RouterOutlet, CommonModule],
})
export class Shell {
  protected readonly headerActions = inject(HeaderActionsService);
}
