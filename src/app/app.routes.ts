import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { provideWeatherWidget } from './features/dashboard/widgets/weather/weather-widget.provider';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
    providers: [provideWeatherWidget()],
  },
];
