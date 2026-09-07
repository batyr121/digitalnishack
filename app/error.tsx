'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page-body">
      <div className="page-intro">
        <span className="eyebrow">CONNECTION INTERRUPTED</span>
        <h1>Let’s try that again.</h1>
        <p>We couldn’t load this part of the forum. Please try again.</p>
      </div>
      <button className="button" onClick={reset}>
        Try again ↗
      </button>
    </div>
  );
}
