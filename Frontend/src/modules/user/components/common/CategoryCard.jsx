import React, { useRef, memo, useEffect } from 'react';
import { gsap } from 'gsap';
import { themeColors } from '../../../../theme';

// Pre-defined agriculture colors for the mockup
const bgColors = [
  '#A0B788', // Olive green (Tractor Rental)
  '#F4C365', // Mustard Yellow (JCB Excavation)
  '#C97658', // Terracotta/Brown (Seed Sowing)
  '#D78A7A', // Salmon/Peach (Pest Control)
  '#F5C563', // Mustard Yellow (Harvester)
  '#B89B77', // Light Brown (Soil)
  '#CAE0CD', // Pale Mint Green (Irrigation)
  '#A0B788'  // Olive green (Spares)
];

const CategoryCard = memo(({ icon, title, onClick, hasSaleBadge = false, index = 0 }) => {
  const cardRef = useRef(null);

  // Simple entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: index * 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [index]);

  const bgColor = bgColors[index % bgColors.length];

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center justify-between p-2 pb-2.5 cursor-pointer relative category-card-container group transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-95 w-[85px] h-[95px] rounded-[18px]"
      onClick={onClick}
      style={{
        opacity: 0, // Start hidden for GSAP
        backgroundColor: bgColor,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div className="flex-1 w-full flex items-center justify-center p-1.5 pt-2 relative">
        {icon || (
          <svg
            className="w-8 h-8 text-[#2c3e21] transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {hasSaleBadge && (
          <div
            className="absolute -top-1 -right-1 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10 border border-white"
            style={{
              background: themeColors.gradient,
              boxShadow: `0 4px 12px ${themeColors.brand.orange}4D`
            }}
          >
            SALE
          </div>
        )}
      </div>
      <span
        className="text-[9.5px] sm:text-[10px] text-center font-bold leading-tight tracking-tight mt-auto w-full line-clamp-2 px-0.5 text-[#2c3e21]"
        style={{
          wordWrap: 'break-word',
        }}
      >
        {title}
      </span>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

