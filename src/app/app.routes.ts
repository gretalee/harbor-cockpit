import { Routes } from '@angular/router';
import { Dashboard } from '@features/dashboard/dashboard';
import { provideWeatherWidget } from '@features/widgets/weather/weather-widget.provider';
import { provideTideWidget } from '@features/widgets/tide/tide-widget.provider';
import { provideSevereWeatherWidget } from '@features/widgets/severe-weather/severe-weather-widget.provider';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    // loadComponent: () => import('@features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
    providers: [provideWeatherWidget(), provideTideWidget(), provideSevereWeatherWidget()],
  },
];
