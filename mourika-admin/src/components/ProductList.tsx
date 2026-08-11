import React, { useState } from 'react';
import { Product } from '../types';
import { Edit2, Trash2, Code, Copy, Download, Check } from 'lucide-react';
import { generateProductSeedCode, downloadCodeFile } from '../utils/exportUtils';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function ProductList({ products, onEdit, onDelete, onClearAll }: ProductListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySingleCode = async (product: Product) => {
    const code = generateProductSeedCode([product], true);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert("Failed to copy snippet");
    }
  };

  const handleDownloadSingleCode = (product: Product) => {
    const code = generateProductSeedCode([product], true);
    downloadCodeFile(code, `${product.slug}-seed.ts`);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center text-slate-500">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-700">No products added yet</h3>
          <p className="text-xs text-slate-400">Use the form above to add products. They will auto-save to browser storage and appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Saved Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">{products.length} {products.length === 1 ? 'product' : 'products'} currently stored</p>
        </div>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear ALL products? This action cannot be undone.')) {
              onClearAll();
            }
          }}
          className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 font-semibold text-xs transition-colors"
        >
          Clear All Catalog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col group">
            <div className="h-48 bg-slate-100 relative overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images.find(img => img.isPrimary)?.url || product.images[0].url} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No Image
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                {product.isFeatured && <span className="bg-amber-400/90 backdrop-blur-sm text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Featured</span>}
                {product.isNewArrival && <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">New</span>}
                {product.isSale && <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Sale</span>}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">{product.categoryId}</span>
                <h3 className="font-bold text-slate-800 line-clamp-1 text-base mt-0.5" title={product.name}>{product.name}</h3>
              </div>
              
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-extrabold text-slate-900 text-lg">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="text-slate-400 line-through text-xs">₹{product.mrp}</span>
                )}
              </div>
              
              <div className="text-xs text-slate-500 mt-2 flex justify-between">
                <span>Stock: <strong className="text-slate-700">{product.stock}</strong></span>
                <span>Variants: <strong className="text-slate-700">{product.variants?.length || 0}</strong></span>
              </div>

              {product.tags && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.split(',').slice(0, 3).map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-1 mt-auto">
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleCopySingleCode(product)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copy TS seed snippet for this product"
                  >
                    {copiedId === product.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => handleDownloadSingleCode(product)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Download .ts file for this product"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => onEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        onDelete(product.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
