import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { BrightSkyApi, BrightSkyWeatherRecord } from './bright-sky-api';
import { WeatherIcon } from './weather-icon';
import { ProgressBar } from '@shared/ui/progress-bar/progress-bar';

export interface WeatherWidgetConfig {
  city: string;
  lat: number;
  lon: number;
}

const FOOTER_HOURS = [4, 8, 12, 16, 20];
const ESTIMATED_LOAD_MS = 1200;
const REGULAR_REFRESH_MS = 2 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const headerDateFormat = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: '2-digit',
});
const shortDateFormat = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' });
const hourFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.html',
  imports: [WeatherIcon, ProgressBar],
})
export class WeatherWidget {
  private readonly api = inject(BrightSkyApi);

  readonly config = input<WeatherWidgetConfig>();

  private readonly today = new Date();
  private readonly nowHour = new Date().getHours();

  protected readonly dayOffset = signal(0);
  protected readonly canGoNext = computed(() => this.dayOffset() < 5);
  protected readonly isDaytime = this.nowHour >= 8 && this.nowHour < 18;

  private readonly earliestDayBackOffset = signal<number | null>(null);
  protected readonly canGoPrevious = computed(() => {
    const earliest = this.earliestDayBackOffset();
    return earliest === null || this.dayOffset() > earliest;
  });

  protected readonly city = computed(() => this.config()?.city ?? 'Hamburg St. Pauli');
  private readonly lat = computed(() => this.config()?.lat ?? 53.558);
  private readonly lon = computed(() => this.config()?.lon ?? 9.962);

  protected readonly selectedDate = computed(() => addDays(this.today, this.dayOffset()));
  protected readonly dateLabel = computed(() => headerDateFormat.format(this.selectedDate()));
  protected readonly previousDateLabel = computed(() =>
    shortDateFormat.format(addDays(this.selectedDate(), -1)),
  );
  protected readonly nextDateLabel = computed(() =>
    shortDateFormat.format(addDays(this.selectedDate(), 1)),
  );

  protected readonly weatherResource = resource({
    params: () => ({
      date: toDateParam(this.selectedDate()),
      lat: this.lat(),
      lon: this.lon(),
    }),
    loader: ({ params }) => this.api.fetchDay(params.lat, params.lon, params.date),
  });

  private readonly records = computed<BrightSkyWeatherRecord[]>(
    () => this.weatherResource.value() ?? [],
  );

  protected readonly maxTemp = computed(() => {
    const temperatures = this.records()
      .map((record) => record.temperature)
      .filter((value): value is number => value != null);
    return temperatures.length ? Math.max(...temperatures) : null;
  });

  protected readonly minTemp = computed(() => {
    const temperatures = this.records()
      .map((record) => record.temperature)
      .filter((value): value is number => value != null);
    return temperatures.length ? Math.min(...temperatures) : null;
  });

  protected readonly sunshineLabel = computed(() => {
    const records = this.records();
    if (!records.length) {
      return null;
    }
    const totalMinutes = records.reduce((sum, record) => sum + (record.sunshine ?? 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${String(minutes).padStart(2, '0')} h`;
  });

  private readonly representative = computed<BrightSkyWeatherRecord | null>(() => {
    const records = this.records();
    if (!records.length) {
      return null;
    }
    return records.reduce((closest, record) => {
      const hour = new Date(record.timestamp).getHours();
      const closestHour = new Date(closest.timestamp).getHours();
      return Math.abs(hour - this.nowHour) < Math.abs(closestHour - this.nowHour)
        ? record
        : closest;
    });
  });

  protected readonly tempNow = computed(() => this.representative()?.temperature ?? null);
  protected readonly currentIcon = computed(() => this.representative()?.icon ?? null);
  protected readonly currentPrecipitation = computed(
    () => this.representative()?.precipitation ?? null,
  );
  protected readonly currentWindSpeed = computed(() => this.representative()?.windSpeed ?? null);
  protected readonly currentCloudCover = computed(() => this.representative()?.cloudCover ?? null);
  protected readonly currentPressure = computed(() => this.representative()?.pressureMsl ?? null);

  protected goToPreviousDay(): void {
    if (this.canGoPrevious()) {
      this.dayOffset.update((offset) => offset - 1);
    }
  }

  protected goToNextDay(): void {
    if (this.canGoNext()) {
      this.dayOffset.update((offset) => offset + 1);
    }
  }

  protected formatTemperature(value: number | null, fractionDigits = 1): string {
    return value == null ? '–' : `${value.toFixed(fractionDigits)} °C`;
  }

  protected formatRounded(value: number | null, unit: string): string {
    return value == null ? '–' : `${Math.round(value)} ${unit}`;
  }

  protected formatFixed(value: number | null, unit: string, fractionDigits = 1): string {
    return value == null ? '–' : `${value.toFixed(fractionDigits)} ${unit}`;
  }

  protected readonly footerHours = computed(() => {
    const records = this.records();
    return FOOTER_HOURS.map((hour) => {
      const record = records.find((entry) => new Date(entry.timestamp).getHours() === hour) ?? null;
      const hourDate = new Date(this.selectedDate());
      hourDate.setHours(hour, 0, 0, 0);
      return {
        label: hourFormat.format(hourDate),
        icon: record?.icon ?? null,
        temperature: record?.temperature ?? null,
      };
    });
  });

  protected readonly loadingProgress = signal(0);

  loadingEffect = effect((onCleanup) => {
    if (!this.weatherResource.isLoading()) {
      this.loadingProgress.set(100);
      return;
    }
    this.loadingProgress.set(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      this.loadingProgress.set(Math.min(90, (elapsed / ESTIMATED_LOAD_MS) * 90));
    }, 50);
    onCleanup(() => clearInterval(interval));
  });

  updateEffect = effect((onCleanup) => {
    const interval = setInterval(() => this.weatherResource.reload(), REGULAR_REFRESH_MS);
    onCleanup(() => clearInterval(interval));
  });

  // An empty (but successful) result means this day is outside the station's recorded
  // history - not an error, just the end of the line. Step back onto the last day that
  // did have data and remember the boundary so the button disables right there.
  boundaryEffect = effect(() => {
    const result = this.weatherResource.value();
    if (result && result.length === 0) {
      const emptyOffset = this.dayOffset();
      this.earliestDayBackOffset.set(emptyOffset + 1);
      this.dayOffset.set(emptyOffset + 1);
    }
  });
}
