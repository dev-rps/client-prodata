import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Product } from '../types';
import { generateProductSeedCode, downloadCodeFile } from '../utils/exportUtils';
import { Download, Code, Copy, X } from 'lucide-react';

interface ExportToolsProps {
  products: Product[];
}

export function ExportTools({ products }: ExportToolsProps) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExcelExport = () => {
    if (products.length === 0) {
      alert("No products to export!");
      return;
    }

    const exportData = products.map((p) => {
      // Summarize variants
      const variantsObj: Record<string, string[]> = {};
      (p.variants || []).forEach(v => {
        if (!variantsObj[v.name]) {
          variantsObj[v.name] = [];
        }
        variantsObj[v.name].push(`${v.value} (+${v.priceAdj})`);
      });
      const variantsStr = Object.entries(variantsObj)
        .map(([name, values]) => `${name}: ${values.join(', ')}`)
        .join(' | ');

      // Summarize images
      const imagesStr = (p.images || []).sort((a,b) => a.order - b.order).map(img => img.url).join(';');

      return {
        Name: p.name,
        Slug: p.slug,
        Description: p.description,
        Price: p.price,
        MRP: p.mrp,
        Stock: p.stock,
        Category: p.categoryId,
        Featured: p.isFeatured ? 'Yes' : 'No',
        'New Arrival': p.isNewArrival ? 'Yes' : 'No',
        Sale: p.isSale ? 'Yes' : 'No',
        Material: p.material || '',
        Occasion: p.occasion || '',
        'Care Instructions': p.careInstructions || '',
        'Shipping Info': p.shippingInfo || '',
        Tags: p.tags || '',
        Images: imagesStr,
        Variants: variantsStr
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `products-export-${dateStr}.xlsx`);
  };

  const handleCopyCode = async () => {
    const code = generateProductSeedCode(products);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy text!");
    }
  };

  const handleDownloadCode = () => {
    const code = generateProductSeedCode(products);
    downloadCodeFile(code, 'seed.ts');
  };

  const handleDownloadLatestCode = () => {
    if (products.length === 0) return;
    const latest = products[0]; // first product in list is the latest saved
    const code = generateProductSeedCode([latest], true);
    downloadCodeFile(code, `${latest.slug}-seed.ts`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Export Tools</h2>
        <p className="text-xs text-slate-500 mt-0.5">Export product catalog to Excel or generate Prisma-ready TypeScript seed code.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button 
          onClick={handleDownloadLatestCode}
          disabled={products.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Download seed snippet for the most recently added product"
        >
          <Code size={15} /> Download Latest (.ts)
        </button>
        <button 
          onClick={handleExcelExport}
          disabled={products.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} /> Download Excel
        </button>
        <button 
          onClick={() => setShowCodeModal(true)}
          disabled={products.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Code size={15} /> Bulk Code Generator
        </button>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Generated Seed Code</h3>
              <button onClick={() => setShowCodeModal(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto flex-1 text-sm font-mono whitespace-pre-wrap">
                {generateProductSeedCode(products)}
              </pre>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium bg-white"
              >
                <Copy size={18} /> {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button 
                onClick={handleDownloadCode}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                <Download size={18} /> Download .ts file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
