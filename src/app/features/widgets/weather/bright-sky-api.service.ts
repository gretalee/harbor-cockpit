import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type BrightSkyIcon =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'fog'
  | 'wind'
  | 'rain'
  | 'sleet'
  | 'snow'
  | 'hail'
  | 'thunderstorm';

export interface BrightSkyWeatherRecord {
  timestamp: string;
  temperature: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
  pressureMsl: number | null;
  sunshine: number | null;
  icon: BrightSkyIcon | null;
}

interface BrightSkyApiRecord {
  timestamp: string;
  temperature: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  cloud_cover: number | null;
  pressure_msl: number | null;
  sunshine: number | null;
  icon: BrightSkyIcon | null;
}

interface BrightSkyApiResponse {
  // Absent (with a "No sources match your criteria" detail instead) once a date falls
  // outside the station's recorded history - not an error, just no data for that day.
  weather?: BrightSkyApiRecord[];
}

@Service({ autoProvided: false })
export class BrightSkyApiService {
  private readonly http = inject(HttpClient);

  async fetchDay(lat: number, lon: number, date: string): Promise<BrightSkyWeatherRecord[]> {
    const response = await firstValueFrom(
      this.http.get<BrightSkyApiResponse>('https://api.brightsky.dev/weather', {
        params: { lat, lon, date, tz: 'Europe/Berlin' },
      }),
    );
    return (response.weather ?? []).map((record) => ({
      timestamp: record.timestamp,
      temperature: record.temperature,
      precipitation: record.precipitation,
      windSpeed: record.wind_speed,
      cloudCover: record.cloud_cover,
      pressureMsl: record.pressure_msl,
      sunshine: record.sunshine,
      icon: record.icon,
    }));
  }
}
