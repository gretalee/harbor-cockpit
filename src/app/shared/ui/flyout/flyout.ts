import { Component, ElementRef, HostListener, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-flyout',
  templateUrl: './flyout.html',
})
export class Flyout {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (
      this.open() &&
      event.target instanceof Node &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closed.emit();
    }
  }
}
