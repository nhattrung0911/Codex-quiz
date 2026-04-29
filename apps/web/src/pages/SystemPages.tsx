import { Link } from 'react-router-dom';

export function LoadingPage({ label = 'Loading...' }: { label?: string }) {
  return <div className="loading">{label}</div>;
}

export function ErrorPage({ message }: { message: string }) {
  return (
    <section className="card system-page">
      <p className="eyebrow">Error</p>
      <h2>Something needs attention</h2>
      <p className="muted">{message}</p>
    </section>
  );
}

export function UnauthorizedPage() {
  return (
    <section className="card system-page">
      <p className="eyebrow">Unauthorized</p>
      <h2>You do not have access to this area.</h2>
      <p className="muted">Ask an administrator to grant the right role for this workspace.</p>
      <Link className="btn btn-secondary button-link" to="/dashboard">
        Go to dashboard
      </Link>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <section className="card system-page">
      <p className="eyebrow">404</p>
      <h2>Page not found.</h2>
      <p className="muted">This quiz module supports direct links, but this route is not registered.</p>
      <Link className="btn btn-secondary button-link" to="/dashboard">
        Go to dashboard
      </Link>
    </section>
  );
}
