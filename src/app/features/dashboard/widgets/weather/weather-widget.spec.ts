import { TestBed } from '@angular/core/testing';
import { WeatherWidget } from './weather-widget';
import { BrightSkyApi, BrightSkyWeatherRecord } from './bright-sky-api';

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
    TestBed.configureTestingModule({
      imports: [WeatherWidget],
      providers: [{ provide: BrightSkyApi, useValue: { fetchDay } }],
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
