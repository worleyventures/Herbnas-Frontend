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
  emptyComponent
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
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, onPageChange } = pagination;

    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-6 flex items-center justify-between border-t border-gray-200/50">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Showing page <span className="font-bold text-blue-500">{currentPage}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <HiChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50">
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
