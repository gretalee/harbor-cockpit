import { TestBed } from '@angular/core/testing';
import { TideWidget } from './tide-widget';
import { PegelOnlineApi, WaterLevelMeasurement } from './pegel-online-api';

// A clean semi-diurnal sine wave, well above the 40cm prominence threshold detectTideExtrema
// requires, so the widget has a real, alternating high/low pattern to project forward from.
function sineWaveMeasurements(
  startTime: Date,
  hours: number,
  intervalMinutes: number,
): WaterLevelMeasurement[] {
  const periodMs = 12.4 * 60 * 60 * 1000;
  const amplitudeCm = 150;
  const baselineCm = 200;
  const totalMinutes = hours * 60;
  const points: WaterLevelMeasurement[] = [];
  for (let minute = 0; minute <= totalMinutes; minute += intervalMinutes) {
    const timestamp = new Date(startTime.getTime() + minute * 60 * 1000).toISOString();
    const value = baselineCm + amplitudeCm * Math.sin((2 * Math.PI * minute * 60 * 1000) / periodMs);
    points.push({ timestamp, value });
  }
  return points;
}

describe('TideWidget', () => {
  let fetchRecentLevels: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchRecentLevels = vi.fn();
    TestBed.configureTestingModule({
      imports: [TideWidget],
      providers: [{ provide: PegelOnlineApi, useValue: { fetchRecentLevels } }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    fetchRecentLevels.mockResolvedValue([]);

    const fixture = TestBed.createComponent(TideWidget);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('derives the next high and low tide from real measured water levels', async () => {
    const now = new Date();
    fetchRecentLevels.mockResolvedValue(
      sineWaveMeasurements(new Date(now.getTime() - 30 * 60 * 60 * 1000), 30, 6),
    );

    const fixture = TestBed.createComponent(TideWidget);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nächstes Hochwasser');
    expect(fixture.nativeElement.textContent).toContain('Nächstes Niedrigwasser');
    expect(fixture.nativeElement.textContent).not.toContain('Keine Gezeitendaten verfügbar');
  });

  it('shows a fallback message when there is not enough of a tidal pattern to project from', async () => {
    // Flat water levels never swing by the 40cm prominence detectTideExtrema requires.
    fetchRecentLevels.mockResolvedValue([
      { timestamp: new Date().toISOString(), value: 150 },
      { timestamp: new Date().toISOString(), value: 151 },
      { timestamp: new Date().toISOString(), value: 150 },
    ]);

    const fixture = TestBed.createComponent(TideWidget);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Keine Gezeitendaten verfügbar');
  });

  it('refetches the water levels every 10 minutes, for as long as the widget stays on the dashboard', async () => {
    vi.useFakeTimers();
    fetchRecentLevels.mockImplementation(async () => []);

    const fixture = TestBed.createComponent(TideWidget);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(fetchRecentLevels).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(10 * 60 * 1000 - 1);
    fixture.detectChanges();
    expect(fetchRecentLevels).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    fixture.detectChanges();
    expect(fetchRecentLevels).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    fixture.detectChanges();
    expect(fetchRecentLevels).toHaveBeenCalledTimes(3);
  });
});
