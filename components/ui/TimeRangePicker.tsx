import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import type { TimeRange } from '../../utils/chartUtils';
import DateRangeCalendar from './DateRangeCalendar';

export interface TimeRangeValue {
  preset: TimeRange | 'custom';
  start: Date;
  end: Date;
}

interface TimeRangePickerProps {
  presets: TimeRange[];
  value: TimeRangeValue;
  onChange: (value: TimeRangeValue) => void;
  compact?: boolean;
}

const presetLabels: Record<TimeRange, string> = {
  '1h': '1小时',
  '6h': '6小时',
  '24h': '24小时',
  '3d': '3天',
  '7d': '7天',
  '30d': '30天',
};

function formatDisplayRange(start: Date, end: Date): string {
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${fmtDate(start)} ~ ${fmtDate(end)}`;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ presets, value, onChange, compact }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 580;
    let left = rect.right - popoverWidth;
    if (left < 8) left = 8;
    setPopoverPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!showCalendar) return;
    updatePosition();
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showCalendar, updatePosition]);

  const handlePresetClick = (preset: TimeRange) => {
    setShowCalendar(false);
    const end = new Date();
    const start = new Date();
    switch (preset) {
      case '1h': start.setHours(start.getHours() - 1); break;
      case '6h': start.setHours(start.getHours() - 6); break;
      case '24h': start.setHours(start.getHours() - 24); break;
      case '3d': start.setDate(start.getDate() - 3); break;
      case '7d': start.setDate(start.getDate() - 7); break;
      case '30d': start.setDate(start.getDate() - 30); break;
    }
    onChange({ preset, start, end });
  };

  const handleCalendarSelect = (start: Date, end: Date) => {
    onChange({ preset: 'custom', start, end });
    setShowCalendar(false);
  };

  return (
    <div className="flex gap-1 items-center flex-wrap">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => handlePresetClick(preset)}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            value.preset === preset
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {compact ? presetLabels[preset] : `最近 ${presetLabels[preset]}`}
        </button>
      ))}

      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setShowCalendar(!showCalendar)}
          className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
            value.preset === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {value.preset === 'custom'
            ? formatDisplayRange(value.start, value.end)
            : '自定义'}
        </button>

        {showCalendar && createPortal(
          <div
            ref={popoverRef}
            style={{ position: 'fixed', top: popoverPos.top, left: popoverPos.left }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl p-5 z-[100]"
          >
            <DateRangeCalendar
              startDate={value.start}
              endDate={value.preset === 'custom' ? value.end : null}
              onSelect={handleCalendarSelect}
              onCancel={() => setShowCalendar(false)}
            />
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default TimeRangePicker;
