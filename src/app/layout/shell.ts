import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderActions } from './header-actions';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  imports: [RouterOutlet, CommonModule],
})
export class Shell {
  protected readonly headerActions = inject(HeaderActions);
}
