import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductImage, ProductVariant, CATEGORIES } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel?: () => void;
}

const defaultVariants = (): ProductVariant[] => {
  return ['1', '2', '3', '4', '5'].map(val => ({
    id: uuidv4(),
    name: 'Size',
    value: val,
    stock: 0,
    priceAdj: 0
  }));
};

const defaultProduct = (): Partial<Product> => ({
  name: '',
  description: '',
  price: 0,
  mrp: 0,
  stock: 0,
  categoryId: CATEGORIES[0],
  isFeatured: false,
  isNewArrival: false,
  isSale: false,
  material: '',
  occasion: '',
  careInstructions: 'Keep away from water and perfume',
  shippingInfo: 'Ships within 2-3 business days',
  tags: '',
  images: [],
  variants: defaultVariants(),
});

function SortableImageItem({ image, onRemove, onSetPrimary, onChange }: { image: ProductImage; onRemove: () => void; onSetPrimary: () => void; onChange: (field: string, value: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow mb-3">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 mt-2 p-1">
        <GripVertical size={20} />
      </div>
      
      <div className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
        {image.url ? (
          <img src={image.url} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="text-slate-400" />
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
          <input 
            type="text" 
            value={image.url} 
            onChange={(e) => onChange('url', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="https://images.unsplash.com/photo-..."
            required
          />
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alt Text (Optional)</label>
            <input 
              type="text" 
              value={image.alt || ''} 
              onChange={(e) => onChange('alt', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="E.g. Front view"
            />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input 
              type="radio" 
              checked={image.isPrimary} 
              onChange={onSetPrimary}
              name={`primary-image`}
              className="w-4 h-4 text-blue-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Set as primary</span>
          </div>
        </div>
      </div>
      <button 
        type="button" 
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 mt-1 transition-colors"
        title="Remove Image"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}


export function ProductForm({ initialProduct, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(initialProduct || defaultProduct());
  const [customCategory, setCustomCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
    } else {
      setFormData(defaultProduct());
    }
  }, [initialProduct]);

  // Auto suggest isSale when mrp > price
  useEffect(() => {
    if (formData.mrp && formData.price && formData.mrp > formData.price) {
      setFormData(prev => ({ ...prev, isSale: true }));
    }
  }, [formData.mrp, formData.price]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('tags', e.target.value);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = (formData.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const updated = currentTags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()).join(', ');
    handleChange('tags', updated);
  };

  // Image handlers
  const addImage = () => {
    const newImage: ProductImage = {
      id: uuidv4(),
      url: '',
      isPrimary: formData.images?.length === 0,
      order: formData.images?.length || 0
    };
    handleChange('images', [...(formData.images || []), newImage]);
  };

  const updateImage = (id: string, field: string, value: any) => {
    const newImages = (formData.images || []).map(img => 
      img.id === id ? { ...img, [field]: value } : img
    );
    handleChange('images', newImages);
  };

  const removeImage = (id: string) => {
    const newImages = (formData.images || []).filter(img => img.id !== id);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    handleChange('images', newImages);
  };

  const setPrimaryImage = (id: string) => {
    const newImages = (formData.images || []).map(img => ({
      ...img,
      isPrimary: img.id === id
    }));
    handleChange('images', newImages);
  };

  const handleImageDragEnd = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = (formData.images || []).findIndex((i) => i.id === active.id);
      const newIndex = (formData.images || []).findIndex((i) => i.id === over.id);
      
      const newImages = arrayMove(formData.images || [], oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index
      }));
      handleChange('images', newImages);
    }
  };

  // Variant handlers
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: uuidv4(),
      name: 'Color',
      value: '',
      stock: 0,
      priceAdj: 0
    };
    handleChange('variants', [...(formData.variants || []), newVariant]);
  };

  const updateVariant = (id: string, field: string, value: any) => {
    const newVariants = (formData.variants || []).map(v => 
      v.id === id ? { ...v, [field]: value } : v
    );
    handleChange('variants', newVariants);
  };

  const removeVariant = (id: string) => {
    handleChange('variants', (formData.variants || []).filter(v => v.id !== id));
  };

  const discountPercent = formData.mrp && formData.price && formData.mrp > formData.price 
    ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (!formData.images || formData.images.length === 0 || !formData.images.some(img => img.url.trim())) {
      alert('Please add at least one valid image URL before saving!');
      return;
    }

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const productToSave: Product = {
      ...formData,
      id: formData.id || uuidv4(),
      slug,
      createdAt: formData.createdAt || Date.now()
    } as Product;

    onSave(productToSave);
    if (!initialProduct) {
      setFormData(defaultProduct());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {initialProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Fill in product details to save into browser storage</p>
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => handleChange('name', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
              placeholder="e.g. Handmade Designer Rakhi"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <div className="flex gap-2">
              <select 
                value={formData.categoryId} 
                onChange={e => handleChange('categoryId', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="New category..." 
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="w-1/2 p-2.5 border border-slate-300 rounded-xl text-sm"
              />
              <button 
                type="button" 
                onClick={() => {
                  if (customCategory && !categoriesList.includes(customCategory)) {
                    setCategoriesList([...categoriesList, customCategory]);
                    handleChange('categoryId', customCategory);
                    setCustomCategory('');
                  }
                }}
                className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 text-sm whitespace-nowrap transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea 
              required
              value={formData.description} 
              onChange={e => handleChange('description', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
              placeholder="Write product features, specifications, and details..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
            <input 
              type="text" 
              value={formData.tags || ''} 
              onChange={handleTagsChange}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              placeholder="e.g. rakhi, festive, handmade, pearl"
            />
            {/* Tags preview */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(formData.tags || '').split(',').map(tag => tag.trim()).filter(Boolean).map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900 text-blue-400 font-bold ml-0.5">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.price} 
                  onChange={e => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.mrp} 
                  onChange={e => handleChange('mrp', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
          
          {discountPercent > 0 ? (
            <div className="inline-flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
              ⚡ Live Discount Preview: Customer saves {discountPercent}%!
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Enter MRP higher than Selling Price to show discount preview</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Base Stock *</label>
            <input 
              type="number" 
              required
              min="0"
              value={formData.stock} 
              onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Product Badges</h4>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={formData.isNewArrival} onChange={e => handleChange('isNewArrival', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm font-medium text-slate-700">Mark as New Arrival</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={formData.isSale} onChange={e => handleChange('isSale', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm font-medium text-slate-700">Mark as Sale</span>
            </label>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Additional Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Material</label>
            <input 
              type="text" 
              value={formData.material || ''} 
              onChange={e => handleChange('material', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              placeholder="e.g. Kundan, Meenakari, Brass"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Occasion</label>
            <input 
              type="text" 
              value={formData.occasion || ''} 
              onChange={e => handleChange('occasion', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              placeholder="e.g. Festive, Daily wear, Bridal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Care Instructions</label>
            <textarea 
              value={formData.careInstructions || ''} 
              onChange={e => handleChange('careInstructions', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl h-20 text-sm"
              placeholder="e.g. Keep away from water and perfume"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Info</label>
            <textarea 
              value={formData.shippingInfo || ''} 
              onChange={e => handleChange('shippingInfo', e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl h-20 text-sm"
              placeholder="e.g. Ships within 2-3 business days"
            />
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">Product Images</h3>
            <p className="text-xs text-slate-500">Drag rows using the handle icon to reorder images</p>
          </div>
          <button type="button" onClick={addImage} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
            <Plus size={14} /> Add Image
          </button>
        </div>
        
        {formData.images?.length === 0 && (
          <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
            No images added yet. Click "Add Image" above to provide image URLs.
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
          <SortableContext items={(formData.images || []).map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {(formData.images || []).map((img) => (
                <SortableImageItem 
                  key={img.id}
                  image={img}
                  onRemove={() => removeImage(img.id)}
                  onSetPrimary={() => setPrimaryImage(img.id)}
                  onChange={(f, v) => updateImage(img.id, f, v)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Variants Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">Variants</h3>
            <p className="text-xs text-slate-500">Default size rows pre-filled. Red dots indicate 0 stock requiring input.</p>
          </div>
          <button type="button" onClick={addVariant} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
            <Plus size={14} /> Add Variant Row
          </button>
        </div>

        <div className="space-y-2.5">
          {formData.variants?.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-3 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-36">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Variant Type</label>
                <select 
                  value={['Size', 'Color', 'Theme'].includes(v.name) ? v.name : 'Custom'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val !== 'Custom') {
                      updateVariant(v.id, 'name', val);
                    } else {
                      updateVariant(v.id, 'name', 'Custom');
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium text-slate-700"
                >
                  <option value="Size">Size</option>
                  <option value="Color">Color</option>
                  <option value="Theme">Theme</option>
                  <option value="Custom">Custom...</option>
                </select>
                {!['Size', 'Color', 'Theme'].includes(v.name) && (
                  <input 
                    type="text" 
                    value={v.name === 'Custom' ? '' : v.name}
                    onChange={e => updateVariant(v.id, 'name', e.target.value)}
                    className="w-full p-1.5 mt-1 border border-slate-300 rounded text-xs bg-white"
                    placeholder="Custom name..."
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Variant Value *</label>
                <input 
                  type="text" 
                  value={v.value} 
                  onChange={e => updateVariant(v.id, 'value', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  placeholder="e.g. Red & Gold, Small, 1"
                  required
                />
              </div>

              <div className="w-28">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-slate-500">Stock</label>
                  {v.stock === 0 && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping inline-block"></span> 0 stock
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  value={v.stock} 
                  onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-lg text-xs bg-white ${v.stock === 0 ? 'border-red-300 bg-red-50/50' : 'border-slate-300'}`}
                  placeholder="0"
                />
              </div>

              <div className="w-32">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Price Adj (₹)</label>
                <input 
                  type="number" 
                  value={v.priceAdj} 
                  onChange={e => updateVariant(v.id, 'priceAdj', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  placeholder="0"
                />
              </div>

              <div className="flex items-end pb-0.5">
                <button 
                  type="button" 
                  onClick={() => removeVariant(v.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                  title="Remove Variant"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {formData.variants?.length === 0 && (
            <div className="text-center p-4 text-slate-400 text-xs">No variants added.</div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold text-base shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
        >
          Save Product
        </button>
      </div>

    </form>
  );
}
