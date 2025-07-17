import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    onItemsPerPageChange(newItemsPerPage);
  };

  if (totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <div className="text-sm text-gray-600">
        {totalItems > 0 ? (
          `Showing ${startItem} to ${endItem} of ${totalItems} results`
        ) : (
          'No results found'
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">
          Rows per page:
        </div>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="text-sm border rounded px-2 py-1 bg-white"
          aria-label="Items per page"
        >
          {[10, 20, 30, 40, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalItems === 0}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm px-2">
            {totalItems > 0 ? `Page ${currentPage} of ${totalPages}` : '0 of 0'}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages || totalItems === 0}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
