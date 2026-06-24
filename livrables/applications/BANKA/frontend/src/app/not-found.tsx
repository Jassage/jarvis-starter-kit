import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f8fc' }}>
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" style={{ color: 'white' }}>
            <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-6xl font-black mb-2" style={{ color: '#e7eaf3' }}>404</p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#0b1733' }}>Page introuvable</h1>
        <p className="text-sm mb-8" style={{ color: '#8b94b0' }}>
          Cette page n'existe pas ou vous n'avez pas les droits nécessaires pour y accéder.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
