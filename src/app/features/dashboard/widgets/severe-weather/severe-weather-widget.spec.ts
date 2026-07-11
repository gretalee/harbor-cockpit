import { TestBed } from '@angular/core/testing';
import { SevereWeatherWidget } from './severe-weather-widget';

describe('SevereWeatherWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SevereWeatherWidget],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SevereWeatherWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
