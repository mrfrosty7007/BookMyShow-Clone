/**
 * Sleek, centered loading spinner for BookMyShow Clone
 */
export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-gray-800 border-t-[#f84464] animate-spin`}
        />
        <div className="absolute inset-0 rounded-full blur-md bg-[#f84464]/20 animate-pulse pointer-events-none" />
      </div>
      {message && <p className="text-sm font-medium text-gray-400 animate-pulse">{message}</p>}
    </div>
  );
};

export default Loader;
