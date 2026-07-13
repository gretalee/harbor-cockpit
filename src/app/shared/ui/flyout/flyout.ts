import { Component, computed, ElementRef, inject, input, model } from '@angular/core';
import { cn } from '@app/shared/utils/cn';

export type FlyoutPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

@Component({
  selector: 'app-flyout',
  templateUrl: './flyout.html',
  host: {
    class: 'relative inline-block',
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Flyout {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly open = model<boolean>(false);
  readonly position = input<FlyoutPosition>('bottom-right');
  readonly offset = input<number>(8);
  readonly ariaLabel = input<string>();
  readonly triggerClasses = input<string>();

  protected readonly triggerClss = computed(() =>
    cn(
      'h-9 w-9 rounded-full',
      'flex items-center justify-center',
      'text-xl font-bold leading-none hover:text-green-600',
      'border border-gray-300 bg-white text-gray-600 hover:bg-gray-100',
      this.triggerClasses(),
    ),
  );

  protected readonly positionClasses: Record<FlyoutPosition, string> = {
    'bottom-left': 'top-full left-0',
    'bottom-right': 'top-full right-0',
    'top-left': 'bottom-full left-0',
    'top-right': 'bottom-full right-0',
  };

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected onEscape(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (
      this.open() &&
      event.target instanceof Node &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.open.set(false);
    }
  }
}
