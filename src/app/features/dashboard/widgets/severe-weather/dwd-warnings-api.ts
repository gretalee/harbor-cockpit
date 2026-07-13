import { Service, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

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

export interface DwdWarningsFetchResult {
  data: DwdWarningsResponse;
  /** From the response's "Expires" header - when the DWD feed will next be regenerated. */
  nextRefresh: Date | null;
}

const FEED_URL =
  'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/gemeinde_warnings_v2.json';

@Service()
export class DwdWarningsApi {
  private readonly http = inject(HttpClient);

  fetchWarnings(onProgress?: (fraction: number) => void): Promise<DwdWarningsFetchResult> {
    return new Promise((resolve, reject) => {
      this.http
        .get<DwdWarningsResponse>(FEED_URL, { observe: 'events', reportProgress: true })
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.DownloadProgress) {
              if (event.total) {
                onProgress?.(event.loaded / event.total);
              }
            } else if (event.type === HttpEventType.Response) {
              if (!event.body) {
                reject(new Error('DWD-Warnungen: Antwort ohne Inhalt.'));
                return;
              }
              const expiresHeader = event.headers.get('Expires');
              resolve({
                data: event.body,
                nextRefresh: expiresHeader ? new Date(expiresHeader) : null,
              });
            }
          },
          error: reject,
        });
    });
  }
}
