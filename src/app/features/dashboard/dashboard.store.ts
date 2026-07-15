import { Service, signal } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { WidgetInstance } from './data/widget.model';

const STORAGE_KEY = 'harbor-cockpit.widget-instances';

function loadFromStorage(): WidgetInstance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WidgetInstance[]) : [];
  } catch {
    return [];
  }
}

@Service({ autoProvided: false })
export class DashboardStore {
  private readonly _widgets = signal<WidgetInstance[]>(loadFromStorage());
  readonly widgets = this._widgets.asReadonly();

  add(widgetId: string, config: unknown = {}, index?: number): void {
    if (this._widgets().some((instance) => instance.widgetId === widgetId)) {
      console.warn(`Widget "${widgetId}" is already added.`);
      return;
    }
    const newWidget: WidgetInstance = { instanceId: crypto.randomUUID(), widgetId, config };
    this._widgets.update((list) => {
      const insertAt = index ?? list.length;
      return [...list.slice(0, insertAt), newWidget, ...list.slice(insertAt)];
    });
    this._persist();
  }

  move(previousIndex: number, currentIndex: number): void {
    this._widgets.update((list) => {
      const reordered = list.slice();
      moveItemInArray(reordered, previousIndex, currentIndex);
      return reordered;
    });
    this._persist();
  }

  remove(widgetId: string): void {
    this._widgets.update((list) => list.filter((instance) => instance.instanceId !== widgetId));
    this._persist();
  }

  private _persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._widgets()));
  }
}
