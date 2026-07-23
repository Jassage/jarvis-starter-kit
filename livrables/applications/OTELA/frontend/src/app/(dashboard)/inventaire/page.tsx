'use client';
import { useEffect, useState } from 'react';
import { Package, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { useInventaireStore, ArticleInventaire, CategorieInventaire } from '@/stores/inventaireStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import StatCard from '@/components/ui/StatCard';
import ArticleModal from '@/components/inventaire/ArticleModal';
import MouvementModal from '@/components/inventaire/MouvementModal';

const CATEGORIE_LABEL: Record<CategorieInventaire, string> = {
  LINGE: 'Linge',
  CONSOMMABLE: 'Consommable',
  PRODUIT_ENTRETIEN: "Produit d'entretien",
  AUTRE: 'Autre',
};

const ROLES_GESTION = ['ADMINISTRATEUR_ETABLISSEMENT', 'ADMINISTRATEUR_CHAINE'];

export default function InventairePage() {
  const { articles, isLoading, fetchArticles } = useInventaireStore();
  const { employe } = useAuthStore();
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [mouvementCible, setMouvementCible] = useState<ArticleInventaire | null>(null);

  const peutGererArticles = employe ? ROLES_GESTION.includes(employe.role) : false;
  const enAlerte = articles.filter((a) => a.quantiteStock <= a.seuilAlerte);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {articles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard compact icon={Package} theme="brand" label="ARTICLES SUIVIS" value={String(articles.length)} />
          <StatCard compact icon={AlertTriangle} theme="amber" label="STOCK BAS" value={String(enAlerte.length)} />
        </div>
      )}

      <div className="flex justify-end">
        {peutGererArticles && <PageToolbar actionLabel="Nouvel article" onAction={() => setArticleModalOpen(true)} />}
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : articles.length === 0 ? (
          <EmptyState icon={Package} title="Aucun article d'inventaire" hint="Ajoutez le linge, les consommables et produits d'entretien à suivre." />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Article</th><th>Catégorie</th><th>Stock</th><th>Seuil d'alerte</th><th></th></tr></thead>
            <tbody>
              {articles.map((a) => {
                const bas = a.quantiteStock <= a.seuilAlerte;
                return (
                  <tr key={a.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{a.nom}</td>
                    <td>{CATEGORIE_LABEL[a.categorie]}</td>
                    <td>{a.quantiteStock} {a.unite} {bas && <Badge tone="warning">Stock bas</Badge>}</td>
                    <td>{a.seuilAlerte} {a.unite}</td>
                    <td>
                      <button onClick={() => setMouvementCible(a)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Mouvement
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ArticleModal open={articleModalOpen} onClose={() => setArticleModalOpen(false)} />
      <MouvementModal open={!!mouvementCible} onClose={() => setMouvementCible(null)} article={mouvementCible} />
    </div>
  );
}
