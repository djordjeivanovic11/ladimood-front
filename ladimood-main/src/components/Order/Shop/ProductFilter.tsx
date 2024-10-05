import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface ProductFilterProps {
  selectedCategory: string[];
  setSelectedCategory: (category: string[]) => void;
  showNewestArrivals: boolean;
  setShowNewestArrivals: (show: boolean) => void;
  selectedPriceRange: [number, number];
  setSelectedPriceRange: (range: [number, number]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  selectedCategory,
  setSelectedCategory,

  selectedPriceRange,
  setSelectedPriceRange,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,

  sortBy,
  setSortBy,
}) => {
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categories = ['T-Shirts', 'Hoodies', 'Accessories'];
  const colors = ['#000000', '#FFFFFF', '#0097B2'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  const toggleCategory = (category: string) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter((cat) => cat !== category));
    } else {
      setSelectedCategory([...selectedCategory, category]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((col) => col !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((sz) => sz !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  return (
    <div className="md:w-1/4 lg:w-[100%] bg-white">
      {/* Mobile Filter Buttons */}
      <div className="md:hidden flex justify-between mt-10 mb-4">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="bg-[#0097B2] text-white px-4 py-2 rounded-lg"
        >
          Open Filters
        </button>
      </div>

      {/* Filters Panel */}
      <div
        className={`${
          isMobileFiltersOpen ? 'block' : 'hidden'
        } md:block fixed inset-0 md:static bg-white z-50 md:z-auto overflow-y-auto`}
      >
        <div className="w-full h-full md:h-auto p-6 bg-white shadow-xl rounded-lg text-gray-800 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0097B2] tracking-wide">Filters</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="md:hidden text-gray-600 text-xl"
            >
              Close
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <h3 className="font-semibold text-lg">Categories</h3>
              {isCategoryOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isCategoryOpen && (
              <div className="mt-4 space-y-3 pl-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategory.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="form-checkbox text-[#0097B2] rounded focus:ring-[#0097B2]"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsPriceOpen(!isPriceOpen)}
            >
              <h3 className="font-semibold text-lg">Price Range</h3>
              {isPriceOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isPriceOpen && (
              <div className="mt-4">
                <div className="flex flex-col space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedPriceRange[1]}
                    onChange={(e) => setSelectedPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0097B2]"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>€0</span>
                    <span>€{selectedPriceRange[1]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsColorOpen(!isColorOpen)}
            >
              <h3 className="font-semibold text-lg">Colors</h3>
              {isColorOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isColorOpen && (
              <div className="mt-4 flex space-x-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full border ${
                      selectedColors.includes(color) ? 'border-[#0097B2]' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => toggleColor(color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Size Filter */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsSizeOpen(!isSizeOpen)}
            >
              <h3 className="font-semibold text-lg">Sizes</h3>
              {isSizeOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isSizeOpen && (
              <div className="mt-4 space-y-3 pl-2">
                {sizes.map((size) => (
                  <label key={size} className="flex items-center space-x-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="form-checkbox text-[#0097B2] rounded focus:ring-[#0097B2]"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Filter */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-lg">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:border-[#0097B2] focus:ring-[#0097B2]"
            >
              <option value="relevance">Relevance</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Close Filters Button for Mobile */}
          <div className="md:hidden flex justify-end mt-4">
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="bg-[#0097B2] text-white px-4 py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
