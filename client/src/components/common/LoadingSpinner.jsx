export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="flex items-center justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  );

  if (!fullScreen) return spinner;

  return <div className="flex min-h-screen items-center justify-center bg-gray-50">{spinner}</div>;
}
