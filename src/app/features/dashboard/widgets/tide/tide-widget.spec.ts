import { TestBed } from '@angular/core/testing';
import { TideWidget } from './tide-widget';

describe('TideWidget', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TideWidget],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TideWidget);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
