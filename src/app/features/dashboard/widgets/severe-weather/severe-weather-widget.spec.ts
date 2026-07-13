import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SevereWeatherWidget } from './severe-weather-widget';
import { DwdWarningsApi, DwdWarningsFetchResult } from './dwd-warnings-api';
import { ProgressBar } from '@shared/ui/progress-bar/progress-bar';

function resultAt(time: number, nextRefresh: Date | null = null): DwdWarningsFetchResult {
  return { data: { time, warnings: [] }, nextRefresh };
}

describe('SevereWeatherWidget', () => {
  let fetchWarnings: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchWarnings = vi.fn();
    TestBed.configureTestingModule({
      imports: [SevereWeatherWidget],
      providers: [{ provide: DwdWarningsApi, useValue: { fetchWarnings } }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    fetchWarnings.mockResolvedValue(resultAt(Date.now()));

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reflects real download progress reported by the loader callback', async () => {
    let resolveFetch!: (value: DwdWarningsFetchResult) => void;
    fetchWarnings.mockImplementation(
      (onProgress?: (fraction: number) => void) =>
        new Promise<DwdWarningsFetchResult>((resolve) => {
          onProgress?.(0.42);
          resolveFetch = resolve;
        }),
    );

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const progressBar = fixture.debugElement.query(By.directive(ProgressBar))
      .componentInstance as ProgressBar;
    expect(progressBar.percent()).toBe(42);

    resolveFetch(resultAt(Date.now()));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(ProgressBar))).toBeNull();
  });

  it('prefers the real "Expires" next-refresh time over the next-full-hour fallback', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T19:23:00+02:00'));
    fetchWarnings.mockResolvedValue(
      resultAt(Date.now(), new Date('2026-07-13T19:28:00+02:00')),
    );

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchWarnings).toHaveBeenCalledTimes(1);

    // Scheduled refresh = 19:28 + 1 min = 19:29 -> 6 minutes after the initial fetch.
    // If the fallback (next full hour, ~38 min away) were used instead, this would fail.
    await vi.advanceTimersByTimeAsync(6 * 60 * 1000 - 1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(2);
  });

  it('falls back to the next full hour when no next-refresh time is available, and keeps rescheduling', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T19:23:00+02:00'));
    fetchWarnings.mockImplementation(async () => resultAt(Date.now()));

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchWarnings).toHaveBeenCalledTimes(1);

    // Next report falls back to the next full hour (20:00); the refresh is scheduled
    // for one minute after that (20:01) -> 38 minutes after the initial 19:23 fetch.
    // Advances land exactly on the firing instant (down to the ms) so no drift builds
    // up between checkpoints.
    const minutesUntilRefresh = 38;
    await vi.advanceTimersByTimeAsync(minutesUntilRefresh * 60 * 1000 - 1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(2);

    // The cycle must keep repeating: from 20:01:00.000, the next report is 21:00, so
    // the following refresh is scheduled for 21:01 (60 minutes later).
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 - 1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(fetchWarnings).toHaveBeenCalledTimes(3);
  });
});
