'use client';

import React, { useState } from 'react';
import { ProductForm } from '../components/ProductForm';
import { ProductList } from '../components/ProductList';
import { ExportTools } from '../components/ExportTools';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product } from '../types';
import { Package } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useLocalStorage<Product[]>('mourika_products', []);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // A small state to force re-render of ProductForm when we cancel editing
  // so it resets to default empty state. Or we can just rely on key.
  const [formKey, setFormKey] = useState(Date.now());

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
      setEditingProduct(null);
    } else {
      setProducts([product, ...products]);
    }
    setFormKey(Date.now()); // Reset form
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormKey(Date.now());
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-lg text-white">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mourika Admin</h1>
            <p className="text-slate-500 font-medium">Standalone Product Entry Tool</p>
          </div>
        </header>

        {/* Export Tools */}
        <ExportTools products={products} />

        {/* Product Form */}
        <div className="scroll-mt-8" id="product-form">
          <ProductForm 
            key={formKey}
            initialProduct={editingProduct} 
            onSave={handleSaveProduct} 
            onCancel={editingProduct ? handleCancelEdit : undefined}
          />
        </div>

        {/* Product List */}
        <ProductList 
          products={products} 
          onEdit={(product) => {
            setEditingProduct(product);
            document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onDelete={handleDeleteProduct}
          onClearAll={handleClearAll}
        />

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400 py-8">
          Mourika Product Entry Tool &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
