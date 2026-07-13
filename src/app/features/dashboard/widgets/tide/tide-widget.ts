import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PegelOnlineApi } from './pegel-online-api';
import { detectTideExtrema, estimateNextTides } from './tide-extrema';
import { ProgressBar } from '@shared/ui/progress-bar/progress-bar';

export interface TideWidgetConfig {
  location: string;
  uuid: string;
}

const ESTIMATED_LOAD_MS = 1000;
const HISTORY_HOURS = 30;
const CHART_DAYS = 4;

const timeFormat = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-tide-widget',
  templateUrl: './tide-widget.html',
  imports: [ProgressBar],
})
export class TideWidget {
  private readonly api = inject(PegelOnlineApi);
  private readonly sanitizer = inject(DomSanitizer);

  readonly config = input<TideWidgetConfig>();

  protected readonly location = computed(() => this.config()?.location ?? 'Hamburg St. Pauli');
  private readonly uuid = computed(
    () => this.config()?.uuid ?? 'd488c5cc-4de9-4631-8ce1-0db0e700b546',
  );

  protected readonly levelsResource = resource({
    params: () => ({ uuid: this.uuid() }),
    loader: ({ params }) => this.api.fetchRecentLevels(params.uuid, HISTORY_HOURS),
  });

  protected readonly nextTides = computed(() => {
    const measurements = this.levelsResource.value();
    if (!measurements?.length) {
      return null;
    }
    const extrema = detectTideExtrema(measurements);
    return estimateNextTides(extrema, new Date());
  });

  protected readonly chartUrl = computed<SafeResourceUrl>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - CHART_DAYS);
    const params = new URLSearchParams({
      pegeluuid: this.uuid(),
      start: toDateParam(start),
      ende: toDateParam(now),
      eingebettet: 'ja',
      anzeigeEinzelwerte: 'nein',
    });
    const url = `https://pegelonline.wsv.de/webservices/zeitreihe/visualisierung?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly progress = signal(0);

  constructor() {
    effect((onCleanup) => {
      if (!this.levelsResource.isLoading()) {
        this.progress.set(100);
        return;
      }
      this.progress.set(0);
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        this.progress.set(Math.min(90, (elapsed / ESTIMATED_LOAD_MS) * 90));
      }, 50);
      onCleanup(() => clearInterval(interval));
    });
  }

  protected formatTime(date: Date): string {
    return timeFormat.format(date);
  }

  protected formatLevel(valueCm: number): string {
    return `${Math.round(valueCm)} cm`;
  }
}
