import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container error-page">
      <div>
        <div className="eyebrow">404 · Page not found</div>
        <h1 className="page-title">This page isn&apos;t here.</h1>
        <p className="section-intro">The page may have moved, or the link may be incorrect.</p>
        <Link className="button" href="/">Return home</Link>
      </div>
    </main>
  );
}
