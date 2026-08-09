'use client';
import { useEffect, useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Edit2, Archive, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle2, Barcode, Hash, Tag, Layers,
  Filter, SlidersHorizontal, Grid3X3, List, Download, Upload,
  ChevronDown, Sparkles, Zap, Gauge
} from 'lucide-react';
import { useProduitStore, Produit } from '@/stores/produitStore';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Banner from '@/components/ui/Banner';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ProduitForm from '@/components/produits/ProduitForm';

function formatMontant(value: string | number) {
  return new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(Number(value));
}

type ViewMode = 'table' | 'cards';

export default function ProduitsPage() {
  const { produits, isLoading, fetchProduits, archiveProduit } = useProduitStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | undefined>(undefined);
  const [toArchive, setToArchive] = useState<Produit | null>(null);
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = produits.length;
    const lowStock = produits.filter(p => (p.stockTotal ?? 0) <= p.seuilAlerte).length;
    const totalValue = produits.reduce((sum, p) => sum + ((p.stockTotal ?? 0) * Number(p.prixVenteDetail)), 0);
    return { total, lowStock, totalValue };
  }, [produits]);

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(produits.map(p => p.categorie).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [produits]);

  const handleSearch = async (value: string) => {
    setSearch(value);
    await fetchProduits(value || undefined);
  };

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (p: Produit) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleArchive = async () => {
    if (!toArchive) return;
    try {
      await archiveProduit(toArchive.id);
      setBanner({ message: `Produit "${toArchive.nom}" archivé avec succès.`, type: 'success' });
      setToArchive(null);
    } catch (err: any) {
      setBanner({ message: err.response?.data?.error || 'Erreur lors de l\'archivage', type: 'error' });
    }
  };

  // Filtrer et trier les produits
  const filteredProducts = useMemo(() => {
    let filtered = [...produits];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categorie === selectedCategory);
    }

    switch (sortBy) {
      case 'stock':
        filtered.sort((a, b) => (b.stockTotal ?? 0) - (a.stockTotal ?? 0));
        break;
      case 'price':
        filtered.sort((a, b) => Number(b.prixVenteDetail) - Number(a.prixVenteDetail));
        break;
      default:
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [produits, selectedCategory, sortBy]);

  // Calculer le niveau de stock
  const getStockLevel = (product: Produit) => {
    const stock = product.stockTotal ?? 0;
    const seuil = product.seuilAlerte;
    if (stock === 0) return 'critical';
    if (stock <= seuil) return 'low';
    if (stock <= seuil * 2) return 'warning';
    return 'good';
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'low': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStockIcon = (level: string) => {
    switch (level) {
      case 'critical': return AlertTriangle;
      case 'low': return TrendingDown;
      case 'warning': return Gauge;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Bannière de notification */}
      {banner && (
        <Banner 
          message={banner.message} 
          type={banner.type} 
          onClose={() => setBanner(null)}
          className="animate-slideDown"
        />
      )}

      {/* Header avec stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Produits</h1>
                  <p className="text-blue-200/70 text-sm">Gérez votre catalogue produits</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Nouveau produit
            </button>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Total produits', value: stats.total, icon: Package, color: 'bg-blue-500/20 text-blue-200' },
              { label: 'Stock faible', value: stats.lowStock, icon: AlertTriangle, color: 'bg-orange-500/20 text-orange-200' },
              { label: 'Valeur stock', value: `${formatMontant(stats.totalValue)} HTG`, icon: TrendingUp, color: 'bg-green-500/20 text-green-200' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-200/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre d'outils avancée */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, référence ou code-barres..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            {/* Filtre par catégorie */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Tri */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="name">Trier par nom</option>
                <option value="stock">Trier par stock</option>
                <option value="price">Trier par prix</option>
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Vue */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState 
          icon={Package} 
          title="Aucun produit trouvé"
          description="Commencez par créer votre premier produit ou modifiez vos filtres."
          action={
            <button onClick={openCreate} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Créer un produit
            </button>
          }
        />
      ) : viewMode === 'cards' ? (
        /* Vue en cartes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => {
            const stockLevel = getStockLevel(product);
            const StockIcon = getStockIcon(stockLevel);
            const isExpanded = expandedProduct === product.id;
            
            return (
              <div
                key={product.id}
                className="card p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer animate-fadeInUp border border-transparent hover:border-blue-200"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
              >
                {/* En-tête carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {product.reference}
                      </span>
                      {product.codeBarres && (
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {product.codeBarres}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate">{product.nom}</h3>
                    {product.categorie && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Tag className="w-3 h-3" />
                        {product.categorie}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock et prix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getStockColor(stockLevel)}`}>
                      <StockIcon className="w-4 h-4" />
                      <span>{product.stockTotal ?? 0} {product.unite}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">
                        {formatMontant(product.prixVenteDetail)} HTG
                      </div>
                      {product.prixVenteGros && (
                        <div className="text-xs text-slate-400">
                          Gros: {formatMontant(product.prixVenteGros)} HTG
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barre de progression stock */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stockLevel === 'critical' ? 'bg-red-500' :
                        stockLevel === 'low' ? 'bg-orange-500' :
                        stockLevel === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(((product.stockTotal ?? 0) / (product.seuilAlerte * 3)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions (visible au survol ou en mode expanded) */}
                <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2 
                  transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(product); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setToArchive(product); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Archiver"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue en table */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Produit</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Catégorie</th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Stock</th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-400 uppercase">Prix détail</th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-400 uppercase">Prix gros</th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockLevel = getStockLevel(product);
                  const StockIcon = getStockIcon(stockLevel);
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-slate-800">{product.nom}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-slate-400">{product.reference}</span>
                            {product.codeBarres && (
                              <span className="text-xs font-mono text-slate-400">• {product.codeBarres}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {product.categorie || '—'}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${getStockColor(stockLevel)}`}>
                          <StockIcon className="w-3 h-3" />
                          {product.stockTotal ?? 0} {product.unite}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-800">
                        {formatMontant(product.prixVenteDetail)} HTG
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        {product.prixVenteGros ? `${formatMontant(product.prixVenteGros)} HTG` : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToArchive(product)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal pour créer/éditer */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editing ? 'Modifier le produit' : 'Nouveau produit'} 
        maxWidth={560}
      >
        <ProduitForm produit={editing} onDone={() => setModalOpen(false)} />
      </Modal>

      {/* Dialogue de confirmation */}
      <ConfirmDialog
        open={!!toArchive}
        title="Archiver le produit"
        message={toArchive ? `Êtes-vous sûr de vouloir archiver "${toArchive.nom}" ? Il ne sera plus disponible à la vente.` : ''}
        confirmLabel="Archiver"
        danger
        onConfirm={handleArchive}
        onClose={() => setToArchive(null)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}