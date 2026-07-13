import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface DwdWarningRegion {
  polygonGeometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface DwdWarning {
  warnId: string;
  type: number;
  level: number;
  start: number;
  end: number;
  event: string;
  headLine: string;
  description: string;
  instruction?: string;
  regions: DwdWarningRegion[];
}

export interface DwdWarningsResponse {
  time: number;
  warnings: DwdWarning[];
}

@Service()
export class DwdWarningsApi {
  private readonly http = inject(HttpClient);

  async fetchWarnings(): Promise<DwdWarningsResponse> {
    return firstValueFrom(
      this.http.get<DwdWarningsResponse>(
        'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/gemeinde_warnings_v2.json',
      ),
    );
  }
}
