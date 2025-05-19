
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your personalized dashboard...</p>
      </div>
    </div>
  );
}
