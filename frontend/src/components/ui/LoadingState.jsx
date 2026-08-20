export default function LoadingState({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 skeleton" />
              <div className="h-3 w-1/2 skeleton" />
            </div>
            <div className="h-8 w-20 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
