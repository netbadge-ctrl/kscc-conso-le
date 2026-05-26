import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date, end: Date) => void;
  onCancel: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = day.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

interface MonthGridProps {
  year: number;
  month: number;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  year, month, rangeStart, rangeEnd, hoverDate, onDateClick, onDateHover,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const effectiveEnd = rangeEnd || hoverDate;
  let displayStart = rangeStart;
  let displayEnd = effectiveEnd;
  if (displayStart && displayEnd && displayStart.getTime() > displayEnd.getTime()) {
    [displayStart, displayEnd] = [displayEnd, displayStart];
  }

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDays - firstDay + 1 + i;
    cells.push(
      <div key={`prev-${i}`} className="h-8 flex items-center justify-center text-xs text-slate-300">
        {day}
      </div>
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isStart = displayStart ? isSameDay(date, displayStart) : false;
    const isEnd = displayEnd ? isSameDay(date, displayEnd) : false;
    const inRange = isInRange(date, displayStart, displayEnd);
    const isSelected = isStart || isEnd;

    let cellBg = '';
    let textClass = 'text-slate-700';

    if (isSelected) {
      cellBg = 'bg-blue-600';
      textClass = 'text-white';
    } else if (inRange) {
      cellBg = 'bg-blue-50';
      textClass = 'text-blue-700';
    }

    const roundedClass =
      isStart && isEnd ? 'rounded-md' :
      isStart ? 'rounded-l-md' :
      isEnd ? 'rounded-r-md' : '';

    const rangeBg = inRange && !isSelected ? 'bg-blue-50' : '';

    cells.push(
      <div
        key={d}
        className={`relative h-8 flex items-center justify-center ${rangeBg}`}
      >
        <button
          onClick={() => onDateClick(date)}
          onMouseEnter={() => onDateHover(date)}
          className={`w-8 h-8 flex items-center justify-center text-xs font-medium transition-colors
            ${cellBg} ${textClass} ${roundedClass}
            ${!isSelected ? 'hover:bg-blue-100 hover:text-blue-700 rounded-md' : ''}
            ${isToday && !isSelected ? 'ring-1 ring-blue-400 ring-inset rounded-md' : ''}
          `}
        >
          {d}
        </button>
      </div>
    );
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    cells.push(
      <div key={`next-${i}`} className="h-8 flex items-center justify-center text-xs text-slate-300">
        {i}
      </div>
    );
  }

  return (
    <div className="w-[252px]">
      <div className="text-center text-sm font-semibold text-slate-800 mb-3">
        {year}年 {MONTH_NAMES[month]}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="h-7 flex items-center justify-center text-[11px] font-medium text-slate-400">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells}
      </div>
    </div>
  );
};

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  startDate, endDate, onSelect, onCancel,
}) => {
  const now = new Date();
  const initialMonth = startDate ? startDate.getMonth() : now.getMonth();
  const initialYear = startDate ? startDate.getFullYear() : now.getFullYear();

  const [leftYear, setLeftYear] = useState(initialYear);
  const [leftMonth, setLeftMonth] = useState(initialMonth);

  const [selStart, setSelStart] = useState<Date | null>(startDate);
  const [selEnd, setSelEnd] = useState<Date | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  const goPrev = () => {
    if (leftMonth === 0) {
      setLeftYear(leftYear - 1);
      setLeftMonth(11);
    } else {
      setLeftMonth(leftMonth - 1);
    }
  };

  const goNext = () => {
    if (leftMonth === 11) {
      setLeftYear(leftYear + 1);
      setLeftMonth(0);
    } else {
      setLeftMonth(leftMonth + 1);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!selectingEnd || !selStart) {
      setSelStart(date);
      setSelEnd(null);
      setSelectingEnd(true);
    } else {
      let s = selStart;
      let e = date;
      if (s.getTime() > e.getTime()) {
        [s, e] = [e, s];
      }
      setSelStart(s);
      setSelEnd(e);
      setSelectingEnd(false);
    }
  };

  const handleApply = () => {
    if (!selStart || !selEnd) return;
    const start = new Date(selStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selEnd);
    end.setHours(23, 59, 59, 999);
    onSelect(start, end);
  };

  const fmtDate = (d: Date | null) => {
    if (!d) return '--';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={goPrev}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={goNext}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-6" onMouseLeave={() => setHoverDate(null)}>
        <MonthGrid
          year={leftYear}
          month={leftMonth}
          rangeStart={selStart}
          rangeEnd={selEnd}
          hoverDate={selectingEnd ? hoverDate : null}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
        />
        <div className="w-px bg-slate-200 self-stretch" />
        <MonthGrid
          year={rightYear}
          month={rightMonth}
          rangeStart={selStart}
          rangeEnd={selEnd}
          hoverDate={selectingEnd ? hoverDate : null}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
        />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {fmtDate(selStart)} ~ {fmtDate(selEnd)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={!selStart || !selEnd}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeCalendar;
