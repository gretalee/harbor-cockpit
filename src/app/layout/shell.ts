import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  imports: [RouterOutlet, CommonModule],
})
export class Shell {}
