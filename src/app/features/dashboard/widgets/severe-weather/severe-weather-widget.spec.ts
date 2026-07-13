import { TestBed } from '@angular/core/testing';
import { SevereWeatherWidget } from './severe-weather-widget';
import { DwdWarningsApi, DwdWarningsResponse } from './dwd-warnings-api';

function warningsAt(time: number): DwdWarningsResponse {
  return { time, warnings: [] };
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
    fetchWarnings.mockResolvedValue(warningsAt(Date.now()));

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reloads the warnings one minute after the estimated next report, and keeps rescheduling', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T19:23:00+02:00'));
    fetchWarnings.mockImplementation(async () => warningsAt(Date.now()));

    const fixture = TestBed.createComponent(SevereWeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchWarnings).toHaveBeenCalledTimes(1);

    // Next report is estimated as the next full hour (20:00); the refresh is scheduled
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
