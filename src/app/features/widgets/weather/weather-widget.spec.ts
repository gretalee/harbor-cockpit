import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WeatherWidget } from './weather-widget';
import { BrightSkyApiService, BrightSkyWeatherRecord } from './bright-sky-api.service';

function recordsFor(date: string): BrightSkyWeatherRecord[] {
  return [
    {
      timestamp: `${date}T12:00:00+02:00`,
      temperature: 20,
      precipitation: 0,
      windSpeed: 10,
      cloudCover: 0,
      pressureMsl: 1015,
      sunshine: 60,
      icon: 'clear-day',
    },
  ];
}

describe('WeatherWidget', () => {
  let fetchDay: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchDay = vi.fn();
    TestBed.configureTestingModule({ imports: [WeatherWidget] });
    // BrightSkyApiService is provided on the component itself (a widget-internal
    // dependency, not part of the app-facing widget-provider interface), so a module-level
    // provider in configureTestingModule can't reach it - it must be overridden here instead.
    TestBed.overrideComponent(WeatherWidget, {
      set: { providers: [{ provide: BrightSkyApiService, useValue: { fetchDay } }] },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    fetchDay.mockResolvedValue(recordsFor('2026-07-13'));

    const fixture = TestBed.createComponent(WeatherWidget);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps allowing the user to go further back as long as the station has data, past what used to be a fixed 5-day limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T10:00:00+02:00'));
    fetchDay.mockImplementation(async (_lat: number, _lon: number, date: string) =>
      recordsFor(date),
    );

    const fixture = TestBed.createComponent(WeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    const previousButton = fixture.debugElement.queryAll(By.css('button'))[0]
      .nativeElement as HTMLButtonElement;

    for (let day = 0; day < 8; day++) {
      previousButton.click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    }

    // Would have been stuck after 5 clicks under the old fixed limit.
    expect(fetchDay).toHaveBeenCalledTimes(9);
    expect(previousButton.disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('5. Juli');
  });

  it('stops and disables the button once the station runs out of history, snapping back to the last day that had data', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T10:00:00+02:00'));
    const earliestAvailableDate = '2026-07-11';
    fetchDay.mockImplementation(async (_lat: number, _lon: number, date: string) =>
      date >= earliestAvailableDate ? recordsFor(date) : [],
    );

    const fixture = TestBed.createComponent(WeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    const previousButton = fixture.debugElement.queryAll(By.css('button'))[0]
      .nativeElement as HTMLButtonElement;

    // 07-12 and 07-11 have data; 07-10 doesn't, so the 3rd click must trigger the bounce.
    for (let day = 0; day < 3; day++) {
      previousButton.click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      // Let any bounce-back reload settle before the next click.
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    }

    expect(previousButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('11. Juli');

    // Clicking again at the boundary must not trigger another fetch.
    const callsAtBoundary = fetchDay.mock.calls.length;
    previousButton.click();
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchDay).toHaveBeenCalledTimes(callsAtBoundary);
  });

  it('refetches the selected day every 2 minutes, since Bright Sky gives no update hint', async () => {
    vi.useFakeTimers();
    fetchDay.mockImplementation(async () => recordsFor('2026-07-13'));

    const fixture = TestBed.createComponent(WeatherWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchDay).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2 * 60 * 1000 - 1);
    fixture.detectChanges();
    expect(fetchDay).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(fetchDay).toHaveBeenCalledTimes(2);

    // Keeps repeating for as long as the widget stays on the dashboard.
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
    fixture.detectChanges();
    expect(fetchDay).toHaveBeenCalledTimes(3);
  });
});
