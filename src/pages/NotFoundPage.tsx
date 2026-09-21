import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-6">
        <FileQuestion className="h-8 w-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The document, route, or resource you are seeking could not be found or may have been relocated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Return Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
