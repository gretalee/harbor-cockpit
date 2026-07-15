import { WaterLevelMeasurement } from './pegel-online-api.service';

export interface TideExtremum {
  type: 'high' | 'low';
  timestamp: string;
  value: number;
}

export interface EstimatedTide {
  type: 'high' | 'low';
  time: Date;
  value: number;
}

const BUCKET_SIZE = 10;
const MIN_PROMINENCE_CM = 40;
const FALLBACK_HALF_PERIOD_MS = 6.21 * 60 * 60 * 1000;

interface Bucket {
  timestamp: string;
  value: number;
}

function bucketize(measurements: WaterLevelMeasurement[]): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = 0; i < measurements.length; i += BUCKET_SIZE) {
    const chunk = measurements.slice(i, i + BUCKET_SIZE);
    const average = chunk.reduce((sum, m) => sum + m.value, 0) / chunk.length;
    buckets.push({ timestamp: chunk[Math.floor(chunk.length / 2)].timestamp, value: average });
  }
  return buckets;
}

/**
 * Detects alternating high/low tide turns from measured water levels using a
 * prominence-based zig-zag scan. Pegelonline exposes no tide-forecast timeseries
 * for this station, so "next high/low" is estimated (see estimateNextTides) from
 * this real, measured pattern rather than an official prediction.
 */
export function detectTideExtrema(measurements: WaterLevelMeasurement[]): TideExtremum[] {
  const buckets = bucketize(measurements);
  if (buckets.length < 3) {
    return [];
  }

  const extrema: TideExtremum[] = [];
  let direction: 'up' | 'down' | null = null;
  let candidateIndex = 0;
  let candidateValue = buckets[0].value;

  for (let i = 1; i < buckets.length; i++) {
    const value = buckets[i].value;
    if (direction !== 'down') {
      if (value > candidateValue) {
        candidateValue = value;
        candidateIndex = i;
      } else if (candidateValue - value >= MIN_PROMINENCE_CM) {
        if (candidateIndex > 0) {
          extrema.push({
            type: 'high',
            timestamp: buckets[candidateIndex].timestamp,
            value: candidateValue,
          });
        }
        direction = 'down';
        candidateValue = value;
        candidateIndex = i;
      }
    } else {
      if (value < candidateValue) {
        candidateValue = value;
        candidateIndex = i;
      } else if (value - candidateValue >= MIN_PROMINENCE_CM) {
        if (candidateIndex > 0) {
          extrema.push({
            type: 'low',
            timestamp: buckets[candidateIndex].timestamp,
            value: candidateValue,
          });
        }
        direction = 'up';
        candidateValue = value;
        candidateIndex = i;
      }
    }
  }

  return extrema;
}

function average(values: number[], fallback: number): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
}

export function estimateNextTides(
  extrema: TideExtremum[],
  now: Date,
): { nextHigh: EstimatedTide; nextLow: EstimatedTide } | null {
  if (extrema.length === 0) {
    return null;
  }

  const lowToHighGaps: number[] = [];
  const highToLowGaps: number[] = [];
  for (let i = 1; i < extrema.length; i++) {
    const prev = extrema[i - 1];
    const curr = extrema[i];
    const gapMs = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
    if (prev.type === 'low' && curr.type === 'high') {
      lowToHighGaps.push(gapMs);
    } else if (prev.type === 'high' && curr.type === 'low') {
      highToLowGaps.push(gapMs);
    }
  }

  const lowToHighDuration = average(lowToHighGaps, FALLBACK_HALF_PERIOD_MS);
  const highToLowDuration = average(highToLowGaps, FALLBACK_HALF_PERIOD_MS);

  const lastHigh = [...extrema].reverse().find((entry) => entry.type === 'high') ?? null;
  const lastLow = [...extrema].reverse().find((entry) => entry.type === 'low') ?? null;
  if (!lastHigh || !lastLow) {
    return null;
  }

  const last = extrema[extrema.length - 1];
  let cursorTime = new Date(last.timestamp).getTime();
  let cursorType: 'high' | 'low' = last.type;
  let nextHighTime: number | null = null;
  let nextLowTime: number | null = null;

  for (let i = 0; i < 8 && (nextHighTime === null || nextLowTime === null); i++) {
    const duration = cursorType === 'low' ? lowToHighDuration : highToLowDuration;
    cursorTime += duration;
    cursorType = cursorType === 'low' ? 'high' : 'low';
    if (cursorTime > now.getTime()) {
      if (cursorType === 'high' && nextHighTime === null) {
        nextHighTime = cursorTime;
      }
      if (cursorType === 'low' && nextLowTime === null) {
        nextLowTime = cursorTime;
      }
    }
  }

  if (nextHighTime == null || nextLowTime == null) {
    return null;
  }

  return {
    nextHigh: { type: 'high', time: new Date(nextHighTime), value: lastHigh.value },
    nextLow: { type: 'low', time: new Date(nextLowTime), value: lastLow.value },
  };
}
