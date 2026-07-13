import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TideWidget } from './tide-widget';

describe('TideWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TideWidget],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TideWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
