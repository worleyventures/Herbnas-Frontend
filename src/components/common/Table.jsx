import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  onRowClick,
  actions = [],
  pagination = null,
  className = "",
  rowClassName = "",
  headerClassName = "",
  bodyClassName = "",
  loadingComponent,
  emptyComponent,
  allowOverflow = false
}) => {
  const renderLoading = () => {
    if (loadingComponent) return loadingComponent;
    
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <div className="text-gray-500 font-medium">Loading data...</div>
          </div>
        </td>
      </tr>
    );
  };

  const renderEmpty = () => {
    if (emptyComponent) return emptyComponent;
    
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            {EmptyIcon && (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <EmptyIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</p>
              <p className="text-sm text-gray-500">No data available at the moment</p>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    // Support both formats: { currentPage, totalPages, onPageChange } and Redux format
    const currentPage = pagination.currentPage || pagination.page || 1;
    const totalPages = pagination.totalPages || 1;
    const totalItems = pagination.totalItems || pagination.total || data.length;
    const itemsPerPage = pagination.itemsPerPage || pagination.limit || 10;
    const onPageChange = pagination.onPageChange;

    if (totalPages <= 1) return null;

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startIndex}</span> to{' '}
          <span className="font-medium">{endIndex}</span> of{' '}
          <span className="font-medium">{totalItems}</span> {pagination.itemName || 'items'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-[#8bc34a] text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50" style={allowOverflow ? { overflow: 'visible' } : {}}>
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr className={headerClassName}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : ''
                  } ${column.className || ''} ${column.hiddenOnMobile ? 'hidden sm:table-cell' : ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200/30 ${bodyClassName}`}>
            {loading ? (
              renderLoading()
            ) : data.length === 0 ? (
              renderEmpty()
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || rowIndex}
                  className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer hover:shadow-sm' : ''
                  } ${rowClassName}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-3 sm:px-4 py-3 text-sm ${
                        column.hiddenOnMobile ? 'hidden sm:table-cell' : ''
                      } ${
                        column.align === 'center' ? 'text-center' : ''
                      } ${column.cellClassName || ''} ${
                        column.wrapText ? '' : 'whitespace-nowrap'
                      } group-hover:text-gray-900 transition-colors duration-200`}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row, rowIndex);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${action.className || 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            title={action.title}
                          >
                            <action.icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default Table;
