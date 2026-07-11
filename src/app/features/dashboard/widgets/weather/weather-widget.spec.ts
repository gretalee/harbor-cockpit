import { TestBed } from '@angular/core/testing';
import { WeatherWidget } from './weather-widget';

describe('WeatherWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherWidget],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WeatherWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
