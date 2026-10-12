import React from 'react';
import { ArrowLeft, Briefcase, Compass, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-xl text-center">
        <div className="mx-auto mb-10 flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            FreeLance<span className="text-indigo-400">Tracker</span>
          </span>
        </div>

        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
          <Compass className="h-10 w-10" strokeWidth={1.5} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          We can't find that page
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-400">
          The link may be outdated, or the page may have moved. Check the address
          or head back to your workspace.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(authenticated ? '/dashboard' : '/', { replace: true })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <House className="h-4 w-4" />
            {authenticated ? 'Go to dashboard' : 'Back to sign in'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
