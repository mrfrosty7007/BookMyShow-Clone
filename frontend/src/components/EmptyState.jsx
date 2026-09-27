import { Film } from 'lucide-react';

/**
 * Reusable empty state component
 */
export const EmptyState = ({
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  icon: Icon = Film,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-900/40 border border-gray-800/80 rounded-2xl max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-[#f84464] mb-4 shadow-lg shadow-black/40">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
