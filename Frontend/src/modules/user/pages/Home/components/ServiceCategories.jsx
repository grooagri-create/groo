import React from 'react';
import CategoryCard from '../../../components/common/CategoryCard';
const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const ServiceCategories = React.memo(({ categories, onCategoryClick, onSeeAllClick }) => {


  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const serviceCategories = categories.map((cat) => ({
    ...cat,
    icon: toAssetUrl(cat.icon || cat.image),
  }));

  return (
    <div className="px-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 tracking-tight flex items-center gap-2">
            Agriculture Seva Shreniyan
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-[0.14em] mt-0.5">PREMIUM AGRICULTURE SERVICES</p>
        </div>

      </div>

      {/* Professional Grid Layout */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-y-7 gap-x-3">
        {serviceCategories.map((category, index) => {
          const iconSrc = toAssetUrl(category.icon || category.image);
          return (
            <div key={category.id} className="flex justify-center h-full">
              <CategoryCard
                title={category.title}
                icon={
                  <img
                    src={iconSrc}
                    alt={category.title}
                    className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform duration-500 will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                }
                onClick={() => onCategoryClick?.(category)}
                hasSaleBadge={category.hasSaleBadge}
                index={index}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle Bottom Separator */}
      <div className="mt-10 h-[1px] w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
    </div>
  );
});

ServiceCategories.displayName = 'ServiceCategories';

export default ServiceCategories;

