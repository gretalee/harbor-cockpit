import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SevereWeatherWidget } from './severe-weather-widget';

describe('SevereWeatherWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SevereWeatherWidget],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SevereWeatherWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
