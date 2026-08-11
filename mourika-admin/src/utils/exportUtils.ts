import { Product } from '../types';

export const generateProductSeedCode = (products: Product[], isSingle = false) => {
  const codeObj = products.map(p => ({
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    category: p.categoryId,
    isFeatured: p.isFeatured,
    isNewArrival: p.isNewArrival,
    isSale: p.isSale,
    material: p.material || null,
    occasion: p.occasion || null,
    careInstructions: p.careInstructions || null,
    shippingInfo: p.shippingInfo || null,
    tags: p.tags || null,
    images: (p.images || []).map(img => ({
      url: img.url,
      alt: img.alt || null,
      isPrimary: img.isPrimary,
      order: img.order
    })),
    variants: (p.variants || []).map(v => ({
      name: v.name,
      value: v.value,
      stock: v.stock,
      priceAdj: v.priceAdj
    }))
  }));

  if (isSingle && codeObj.length === 1) {
    let objStr = JSON.stringify(codeObj[0], null, 2);
    objStr = objStr.replace(/"([^"]+)":/g, '$1:');
    return `{\n  ${objStr.split('\n').join('\n  ').trim()}\n}`;
  }

  let codeStr = `const products = [\n`;
  codeObj.forEach((p, index) => {
    let objStr = JSON.stringify(p, null, 2);
    objStr = objStr.replace(/"([^"]+)":/g, '$1:');
    codeStr += `  ${objStr.split('\n').join('\n  ')}`;
    if (index < codeObj.length - 1) codeStr += `,`;
    codeStr += `\n`;
  });
  codeStr += `];\n\nexport default products;`;
  
  return codeStr;
};

export const downloadCodeFile = (code: string, filename: string) => {
  const blob = new Blob([code], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
