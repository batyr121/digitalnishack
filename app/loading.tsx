export default function Loading() {
  return (
    <div className="container loading-page" role="status" aria-label="Loading">
      <span className="eyebrow">CONNECTING YOU TO WHAT’S NEXT</span>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
