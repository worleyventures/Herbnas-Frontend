import React from 'react';
import { HiChevronRight } from 'react-icons/hi2';
import { StatCard } from '../common';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon,
  action,
  actions, 
  breadcrumbs,
  stats 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.name} className="flex items-center">
                    {index > 0 && (
                      <HiChevronRight
                        className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2"
                        aria-hidden="true"
                      />
                    )}
                    {breadcrumb.href ? (
                      <a
                        href={breadcrumb.href}
                        className={`text-sm font-medium ${
                          breadcrumb.current
                            ? 'text-gray-900 cursor-default'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-current={breadcrumb.current ? 'page' : undefined}
                      >
                        {breadcrumb.name}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {breadcrumb.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))'}}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-gray-600 max-w-4xl">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action */}
            {action && (
              <div className="flex items-center space-x-3">
                {action}
              </div>
            )}
            
            {/* Actions */}
            {actions && (
              <div className="flex items-center space-x-3">
                {actions.map((action, index) => (
                  <div key={index}>
                    {action}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                // Define gradient colors based on stat type
                const getGradientColors = (statName) => {
                  const name = statName.toLowerCase();
                  if (name.includes('lead')) return 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))';
                  if (name.includes('product')) return 'bg-gradient-to-br from-blue-500 to-blue-600';
                  if (name.includes('branch')) return 'bg-gradient-to-br from-purple-500 to-purple-600';
                  if (name.includes('conversion') || name.includes('rate')) return 'bg-gradient-to-br from-amber-500 to-amber-600';
                  if (name.includes('inventory') || name.includes('stock')) return 'bg-gradient-to-br from-blue-500 to-blue-600';
                  if (name.includes('health')) return 'bg-gradient-to-br from-red-500 to-red-600';
                  return 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))';
                };

                const gradientStyle = getGradientColors(stat.name).includes('linear-gradient') ? 
                  { background: getGradientColors(stat.name) } : {};

                return (
                  <StatCard
                    key={index}
                    title={stat.name}
                    value={stat.value}
                    icon={stat.icon}
                    iconBg={getGradientColors(stat.name).includes('linear-gradient') ? '' : getGradientColors(stat.name)}
                    style={gradientStyle}
                    change={stat.change}
                    changeType={stat.changeType}
                    className="h-full"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
