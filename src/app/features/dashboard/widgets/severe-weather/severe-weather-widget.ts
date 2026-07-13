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

  protected readonly loadingProgress = signal(0);

  protected readonly warningsResource = resource({
    loader: () => {
      // Reset synchronously, before any download-progress events can arrive, so this
      // can never clobber a real in-flight percentage (see loadingProgress below).
      this.loadingProgress.set(0);
      return this.api.fetchWarnings((fraction) =>
        this.loadingProgress.set(Math.round(fraction * 100)),
      );
    },
  });

  protected readonly issuedAt = computed(() => {
    const result = this.warningsResource.value();
    return result ? dateTimeFormat.format(new Date(result.data.time)) : null;
  });

  // Prefers the feed's own "Expires" header (when the DWD server will next regenerate
  // it) over a guess, since it reflects the real publishing cadence rather than an
  // assumed hourly schedule. Only falls back to "next full hour" if that header is
  // ever missing from a response.
  private readonly nextReportDate = computed<Date | null>(() => {
    const result = this.warningsResource.value();
    if (!result) {
      return null;
    }
    if (result.nextRefresh) {
      return result.nextRefresh;
    }
    const fallback = new Date(result.data.time);
    fallback.setHours(fallback.getHours() + 1, 0, 0, 0);
    return fallback;
  });

  protected readonly nextReportEstimate = computed(() => {
    const next = this.nextReportDate();
    return next ? timeFormat.format(next) : null;
  });

  protected readonly matchingWarnings = computed(() => {
    const result = this.warningsResource.value();
    if (!result) {
      return [];
    }
    return findWarningsForPoint(result.data.warnings, this.lat(), this.lon()).sort(
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

  // Only handles the "done" edge - the reset to 0 lives in the loader itself (above) so
  // it can never run after a real in-flight percentage from the download progress events.
  loadingProgressEffect = effect(() => {
    if (!this.warningsResource.isLoading()) {
      this.loadingProgress.set(100);
    }
  });

  // Once the feed's own next-refresh time has passed (plus a small buffer), fetch fresh
  // data. The new response's nextRefresh re-derives nextReportDate, which re-runs this
  // effect and schedules the following refresh - so this keeps repeating on its own for
  // as long as the widget stays on the dashboard.
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
