import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';

/**
 * Signale la perte de réseau. Sans ce bandeau, l'application continuerait de fonctionner
 * normalement grâce au cache Firestore, sans que l'utilisateur sache que ses saisies ne
 * sont pas encore parties : sur une connexion instable, mieux vaut le dire.
 */
export function BandeauHorsLigne() {
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);

  useEffect(() => {
    const enLigne = () => setHorsLigne(false);
    const deconnecte = () => setHorsLigne(true);
    window.addEventListener('online', enLigne);
    window.addEventListener('offline', deconnecte);
    return () => {
      window.removeEventListener('online', enLigne);
      window.removeEventListener('offline', deconnecte);
    };
  }, []);

  if (!horsLigne) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-[var(--color-gold-dark)] px-4 py-2 text-xs font-medium text-white">
      <CloudOff size={14} />
      Hors ligne. Tu peux continuer à travailler, tes saisies partiront à la reconnexion.
    </div>
  );
}
