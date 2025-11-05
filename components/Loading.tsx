export function Loading() {
  return (
    <div className="absolute w-screen h-screen flex items-center justify-center">
      <img
        src="https://liveblocks.io/loading.svg"
        alt="Loading"
        className="w-16 h-16 opacity-20"
      />
    </div>
  );
}