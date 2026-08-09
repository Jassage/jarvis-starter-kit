'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ 
        background: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Animation d'entrée */}
      <div
        className="w-full max-h-[90vh] overflow-hidden flex flex-col animate-modal-in"
        style={{ 
          maxWidth,
          borderRadius: '24px',
          background: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec dégradé subtil */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
            <h3 
              id="modal-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              {title}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Fermer"
          >
            <div className="absolute inset-0 rounded-xl bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            <X className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Contenu avec scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>

        {/* Ombre de défilement */}
        <div className="h-2 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-modal-in {
          animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
      `}</style>
    </div>
  );
}