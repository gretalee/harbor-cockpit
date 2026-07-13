import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WeatherWidget } from './weather-widget';

describe('WeatherWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherWidget],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WeatherWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
