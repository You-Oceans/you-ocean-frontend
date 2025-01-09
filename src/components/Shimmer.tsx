export default function Shimmer() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="col-span-2 space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
        </div>
      ))}
    </>
  );
}
