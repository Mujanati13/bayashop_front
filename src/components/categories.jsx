import React, { useRef, useState, useEffect } from 'react';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const CategoriesSection = ({ categories, onCategorySelect }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState([]);

  // Update visible categories to show 4 at a time
  useEffect(() => {
    if (categories.length > 0) {
      setVisibleCategories(categories.slice(0, 4));
      checkScrollPosition();
    }
  }, [categories]);

  // Check scroll position and update scroll capabilities
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  // Initialize and add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [visibleCategories]);

  // Scroll function
  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemWidth = container.querySelector('div[data-category]')?.offsetWidth || 160;
    const scrollAmount = itemWidth * 2;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });

    // Update visible categories when scrolling
    const currentIndex = categories.findIndex(
      cat => cat.ID_CAT === visibleCategories[0].ID_CAT
    );

    if (direction === 'right') {
      const nextCategories = categories.slice(
        currentIndex + 4, 
        currentIndex + 8
      );
      setVisibleCategories(nextCategories.length > 0 ? nextCategories : visibleCategories);
    } else {
      const prevCategories = categories.slice(
        Math.max(0, currentIndex - 4), 
        currentIndex
      );
      setVisibleCategories(prevCategories.length > 0 ? prevCategories : visibleCategories);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className="
            absolute left-0 top-1/2 z-10 
            bg-white/70 hover:bg-white 
            rounded-full p-2 
            shadow-md 
            transform -translate-y-1/2
            transition-all duration-300
          "
        >
          <LeftOutlined className="text-gray-600" />
        </button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className="
            absolute right-0 top-1/2 z-10 
            bg-white/70 hover:bg-white 
            rounded-full p-2 
            shadow-md 
            transform -translate-y-1/2
            transition-all duration-300
          "
        >
          <RightOutlined className="text-gray-600" />
        </button>
      )}

      {/* Categories Container */}
      <div 
        ref={scrollContainerRef}
        className="
          flex space-x-4 w-full overflow-x-hidden 
          scroll-smooth py-4 px-8
        "
      >
        {visibleCategories.map((category) => (
          <div 
            key={category.ID_CAT}
            data-category="true"
            className={`
              flex-shrink-0 w-40 
              flex flex-col items-center
              ${selectedCategory?.ID_CAT === category.ID_CAT 
                ? 'ring-4 ring-blue-500 rounded-lg' 
                : ''}
            `}
          >
            <div
              className="
                bg-gray-200 rounded-full w-40 h-40 
                bg-cover bg-center shadow-md
                mb-2
              "
              style={{
                backgroundImage: `url(http://http://51.38.99.75:4004${category.img})`,
              }}
            ></div>
            <div className="
              mb-2 text-sm font-medium text-gray-700 
              text-center
            ">
              {category.Nom}
            </div>
            <button
              onClick={() => handleCategorySelect(category)}
              className="
                px-4 py-2 
                bg-blue-500 text-white 
                rounded-md 
                hover:bg-blue-600 
                transition-colors 
                text-xs
              "
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;