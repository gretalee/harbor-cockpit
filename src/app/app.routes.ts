import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { provideWeatherWidget } from './features/dashboard/widgets/weather/weather-widget.provider';
import { provideTideWidget } from './features/dashboard/widgets/tide/tide-widget.provider';
import { provideSevereWeatherWidget } from './features/dashboard/widgets/severe-weather/severe-weather-widget.provider';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
    providers: [provideWeatherWidget(), provideTideWidget(), provideSevereWeatherWidget()],
  },
];
