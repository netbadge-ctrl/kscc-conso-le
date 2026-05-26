export type TimeRange = '1h' | '6h' | '24h' | '3d' | '7d' | '30d';

export interface TimeGranularity {
  unit: 'minute' | 'hour' | 'day';
  interval: number;
  format: (date: Date) => string;
  label: string;
}

export function getTimeGranularity(startTime: Date, endTime: Date): TimeGranularity {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24) {
    return {
      unit: 'minute',
      interval: 5,
      format: (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      label: '分钟'
    };
  } else if (diffDays <= 7) {
    return {
      unit: 'hour',
      interval: 1,
      format: (date: Date) => `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`,
      label: '小时'
    };
  } else {
    return {
      unit: 'day',
      interval: 1,
      format: (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`,
      label: '天'
    };
  }
}

export function generateTimePoints(startTime: Date, endTime: Date): string[] {
  const granularity = getTimeGranularity(startTime, endTime);
  const points: string[] = [];
  const current = new Date(startTime);

  while (current <= endTime) {
    points.push(granularity.format(current));

    switch (granularity.unit) {
      case 'minute':
        current.setMinutes(current.getMinutes() + granularity.interval);
        break;
      case 'hour':
        current.setHours(current.getHours() + granularity.interval);
        break;
      case 'day':
        current.setDate(current.getDate() + granularity.interval);
        break;
    }
  }

  return points;
}

export function getTimeRangeFromPreset(preset: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case '1h':
      start.setHours(start.getHours() - 1);
      break;
    case '6h':
      start.setHours(start.getHours() - 6);
      break;
    case '24h':
      start.setHours(start.getHours() - 24);
      break;
    case '3d':
      start.setDate(start.getDate() - 3);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}

export function createInitialTimeRange(preset: TimeRange): { preset: TimeRange | 'custom'; start: Date; end: Date } {
  const { start, end } = getTimeRangeFromPreset(preset);
  return { preset, start, end };
}

export function getGranularityLabel(startTime: Date, endTime: Date): string {
  const granularity = getTimeGranularity(startTime, endTime);
  const intervalLabel = granularity.interval > 1 ? `每${granularity.interval}` : '每';
  return `(${intervalLabel}${granularity.label})`;
}

export function formatTokens(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).replace(/\.?0+$/, '');
}

export function formatCredits(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.?0+$/, '');
}

export function formatDuration(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).replace(/\.?0+$/, '');
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
