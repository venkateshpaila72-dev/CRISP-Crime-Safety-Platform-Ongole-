// Consistent error display with an optional retry action. Used across
// every data-fetching component so failures never render as a blank
// screen or an unstyled crash.
function ErrorMessage({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-red-700 underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;