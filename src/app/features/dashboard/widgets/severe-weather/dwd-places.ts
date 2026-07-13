export interface City {
  name: string;
  lat: number;
  lon: number;
}

/** Major German cities, used only to label the warning map for orientation. */
export const MAJOR_GERMAN_CITIES: City[] = [
  { name: 'Berlin', lat: 52.5437, lon: 13.3943 },
  { name: 'Bremen', lat: 53.0905, lon: 8.8377 },
  { name: 'Dortmund', lat: 51.4738, lon: 7.4664 },
  { name: 'Dresden', lat: 51.0274, lon: 13.7687 },
  { name: 'Düsseldorf', lat: 51.2177, lon: 6.8068 },
  { name: 'Erfurt', lat: 50.9713, lon: 11.0231 },
  { name: 'Frankfurt', lat: 50.0931, lon: 8.6609 },
  { name: 'Freiburg', lat: 47.978, lon: 7.8408 },
  { name: 'Hamburg', lat: 53.5746, lon: 10.0052 },
  { name: 'Hannover', lat: 52.3704, lon: 9.7457 },
  { name: 'Kassel', lat: 51.2846, lon: 9.4721 },
  { name: 'Kiel', lat: 54.3063, lon: 10.1457 },
  { name: 'Köln', lat: 50.9377, lon: 6.9405 },
  { name: 'Leipzig', lat: 51.3403, lon: 12.4048 },
  { name: 'Magdeburg', lat: 52.1133, lon: 11.6204 },
  { name: 'München', lat: 48.127, lon: 11.5491 },
  { name: 'Nürnberg', lat: 49.4135, lon: 11.0588 },
  { name: 'Passau', lat: 48.5536, lon: 13.4567 },
  { name: 'Rostock', lat: 54.1167, lon: 12.1131 },
  { name: 'Saarbrücken', lat: 49.2276, lon: 6.994 },
  { name: 'Schwerin', lat: 53.6003, lon: 11.4104 },
  { name: 'Stuttgart', lat: 48.7832, lon: 9.1957 },
];
