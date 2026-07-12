import { Service, signal, TemplateRef } from '@angular/core';

@Service()
export class HeaderActions {
  private readonly _template = signal<TemplateRef<unknown> | null>(null);
  readonly template = this._template.asReadonly();

  set(template: TemplateRef<unknown> | null): void {
    this._template.set(template);
  }
}
