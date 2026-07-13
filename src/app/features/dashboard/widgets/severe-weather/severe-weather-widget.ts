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

const MIN_REFRESH_INTERVAL_MS = 60_000;

const HAMBURG_DEFAULT_CONFIG: SevereWeatherWidgetConfig = {
  region: 'Hamburg St. Pauli',
  lat: 53.558,
  lon: 9.962,
};

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

  // Coordinates and region must come from the same source: a persisted config from an
  // older app version might carry a region without lat/lon, which would otherwise show a
  // mismatched label (saved region) next to data fetched for the Hamburg fallback
  // coordinates. So the whole config is only trusted once both coordinates are present.
  private readonly effectiveConfig = computed<SevereWeatherWidgetConfig>(() => {
    const config = this.config();
    if (config && typeof config.lat === 'number' && typeof config.lon === 'number') {
      return config;
    }
    return HAMBURG_DEFAULT_CONFIG;
  });

  protected readonly region = computed(() => this.effectiveConfig().region);
  protected readonly lat = computed(() => this.effectiveConfig().lat);
  protected readonly lon = computed(() => this.effectiveConfig().lon);

  protected readonly loadingProgress = signal(0);

  protected readonly warningsResource = resource({
    loader: () => {
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

  loadingProgressEffect = effect(() => {
    if (!this.warningsResource.isLoading()) {
      this.loadingProgress.set(100);
    }
  });

  nextReportEffect = effect((onCleanup) => {
    const next = this.nextReportDate();
    if (!next) {
      return;
    }
    const refreshAt = next.getTime() + MIN_REFRESH_INTERVAL_MS;
    const delay = Math.max(MIN_REFRESH_INTERVAL_MS, refreshAt - Date.now());
    const timeout = setTimeout(() => this.warningsResource.reload(), delay);
    onCleanup(() => clearTimeout(timeout));
  });
}
