import { fmtDate } from '../utils/dates';

export default function DateNav({ startDate, endDate, weekOffset, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-3">
      <button
        onClick={onPrev}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-4 py-1.5 hover:bg-gray-50 transition-colors"
      >
        ← Previous 7 days
      </button>

      <span className="text-sm font-semibold text-gray-700">
        {fmtDate(startDate)} &nbsp;–&nbsp; {fmtDate(endDate)}
      </span>

      <button
        onClick={onNext}
        disabled={weekOffset === 0}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-4 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next 7 days →
      </button>
    </div>
  );
}
