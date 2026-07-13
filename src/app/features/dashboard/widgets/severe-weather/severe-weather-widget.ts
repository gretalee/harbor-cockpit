import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { DwdWarningsApi, DwdWarning } from './dwd-warnings-api';
import { findWarningsForPoint, warningLevelLabel, warningLevelColorClass } from './dwd-warnings';
import { DwdWarningMap } from './dwd-warning-map';
import { ProgressBar } from '@shared/ui/progress-bar/progress-bar';

export interface SevereWeatherWidgetConfig {
  region: string;
  lat: number;
  lon: number;
}

const ESTIMATED_LOAD_MS = 900;
const REFRESH_DELAY_AFTER_REPORT_MS = 60_000;

const dateTimeFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

@Component({
  selector: 'app-severe-weather-widget',
  templateUrl: './severe-weather-widget.html',
  imports: [ProgressBar, DwdWarningMap],
})
export class SevereWeatherWidget {
  private readonly api = inject(DwdWarningsApi);

  readonly config = input<SevereWeatherWidgetConfig>();

  protected readonly region = computed(() => this.config()?.region ?? 'Hamburg St. Pauli');
  protected readonly lat = computed(() => this.config()?.lat ?? 53.558);
  protected readonly lon = computed(() => this.config()?.lon ?? 9.962);

  protected readonly warningsResource = resource({
    loader: () => this.api.fetchWarnings(),
  });

  protected readonly issuedAt = computed(() => {
    const data = this.warningsResource.value();
    return data ? dateTimeFormat.format(new Date(data.time)) : null;
  });

  private readonly nextReportDate = computed<Date | null>(() => {
    const data = this.warningsResource.value();
    if (!data) {
      return null;
    }
    const next = new Date(data.time);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  });

  protected readonly nextReportEstimate = computed(() => {
    const next = this.nextReportDate();
    return next ? timeFormat.format(next) : null;
  });

  protected readonly matchingWarnings = computed(() => {
    const data = this.warningsResource.value();
    if (!data) {
      return [];
    }
    return findWarningsForPoint(data.warnings, this.lat(), this.lon()).sort(
      (a, b) => b.level - a.level,
    );
  });

  protected readonly primaryWarning = computed<DwdWarning | null>(
    () => this.matchingWarnings()[0] ?? null,
  );

  protected readonly additionalWarningCount = computed(() =>
    Math.max(0, this.matchingWarnings().length - 1),
  );

  protected readonly statusText = computed(() =>
    this.primaryWarning()
      ? `Für ${this.region()} liegt eine amtliche Wetterwarnung vor.`
      : `Für ${this.region()} liegen aktuell keine amtlichen Wetterwarnungen vor.`,
  );

  protected formatWarningPeriod(warning: DwdWarning): string {
    return `${timeFormat.format(new Date(warning.start))}–${timeFormat.format(new Date(warning.end))} Uhr`;
  }

  protected levelLabel(level: number): string {
    return warningLevelLabel(level);
  }

  protected levelColorClass(level: number): string {
    return warningLevelColorClass(level);
  }

  protected readonly progress = signal(0);
  loadingProgress = effect((onCleanup) => {
    if (!this.warningsResource.isLoading()) {
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

  // Once the estimated next official report has passed (plus a small buffer), fetch
  // fresh data. The new response's "issued at" time re-derives nextReportDate, which
  // re-runs this effect and schedules the following refresh - so this keeps repeating
  // on its own for as long as the widget stays on the dashboard.
  nextReportEffect = effect((onCleanup) => {
    const next = this.nextReportDate();
    if (!next) {
      return;
    }
    const refreshAt = next.getTime() + REFRESH_DELAY_AFTER_REPORT_MS;
    const delay = Math.max(0, refreshAt - Date.now());
    const timeout = setTimeout(() => this.warningsResource.reload(), delay);
    onCleanup(() => clearTimeout(timeout));
  });
}
