import { Service, signal } from '@angular/core';
import { WidgetInstance } from './widget.model';

const STORAGE_KEY = 'harbor-cockpit.widget-instances';

function loadFromStorage(): WidgetInstance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WidgetInstance[]) : [];
  } catch {
    return [];
  }
}

@Service()
export class WidgetInstancesStore {
  private readonly _instances = signal<WidgetInstance[]>(loadFromStorage());
  readonly instances = this._instances.asReadonly();

  add(widgetId: string): void {
    if (this._instances().some((instance) => instance.widgetId === widgetId)) {
      return;
    }
    this._instances.update((list) => [...list, { instanceId: crypto.randomUUID(), widgetId }]);
    this.persist();
  }

  remove(instanceId: string): void {
    this._instances.update((list) => list.filter((instance) => instance.instanceId !== instanceId));
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._instances()));
  }
}
