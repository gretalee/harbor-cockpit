import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface WaterLevelMeasurement {
  timestamp: string;
  value: number;
}

@Service({ autoProvided: false })
export class PegelOnlineApiService {
  private readonly http = inject(HttpClient);

  async fetchRecentLevels(uuid: string, hours: number): Promise<WaterLevelMeasurement[]> {
    return firstValueFrom(
      this.http.get<WaterLevelMeasurement[]>(
        `https://pegelonline.wsv.de/webservices/rest-api/v2/stations/${uuid}/W/measurements.json`,
        { params: { start: `PT${hours}H` } },
      ),
    );
  }
}
