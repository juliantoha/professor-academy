import { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, Search, X, Filter, Download, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  mobileHidden?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: { column: string; options: FilterOption[] }[];
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  exportable?: boolean;
  onExport?: () => void;
  mobileCardRender?: (row: T) => React.ReactNode;
}

function SmartTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterOptions = [],
  selectable = false,
  onSelectionChange,
  onRowClick,
  pageSize = 10,
  emptyMessage = 'No data available',
  emptyIcon,
  exportable = false,
  onExport,
  mobileCardRender
}: SmartTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const value = row[col.key as keyof T];
          return value?.toString().toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([column, values]) => {
      if (values.length > 0) {
        result = result.filter(row => {
          const cellValue = row[column as keyof T];
          return values.includes(String(cellValue));
        });
      }
    });

    // Apply sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn as keyof T];
        const bVal = b[sortColumn as keyof T];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, sortColumn, sortDirection, activeFilters, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Reset page when filters change
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const toggleFilter = useCallback((column: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[column] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [column]: updated };
    });
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelection = new Set(paginatedData.map(row => row[keyField]));
      setSelectedRows(newSelection);
      onSelectionChange?.(paginatedData);
    }
  }, [paginatedData, selectedRows.size, keyField, onSelectionChange]);

  const toggleRowSelection = useCallback((row: T) => {
    const key = row[keyField];
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      const selectedData = data.filter(r => newSet.has(r[keyField]));
      onSelectionChange?.(selectedData);
      return newSet;
    });
  }, [keyField, data, onSelectionChange]);

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        alignItems: 'center'
      }}>
        {/* Search */}
        {searchable && (
          <div style={{
            position: 'relative',
            flex: '1 1 240px',
            maxWidth: '320px'
          }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '0.625rem 2.5rem 0.625rem 2.75rem',
                borderRadius: '10px',
                border: '2px solid #E2E8F0',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#004A69';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 74, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#F1F5F9',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        {filterOptions.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              border: `2px solid ${showFilters || activeFilterCount > 0 ? '#004A69' : '#E2E8F0'}`,
              background: showFilters || activeFilterCount > 0 ? '#EFF6FF' : 'white',
              color: showFilters || activeFilterCount > 0 ? '#004A69' : '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                background: '#004A69',
                color: 'white',
                fontSize: '11px',
                fontWeight: 600
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {Object.entries(activeFilters).map(([column, values]) =>
              values.map(value => (
                <span
                  key={`${column}-${value}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px 4px 12px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  {value}
                  <button
                    onClick={() => toggleFilter(column, value)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            )}
            <button
              onClick={clearFilters}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                background: 'white',
                color: '#64748B',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Export */}
        {exportable && (
          <button
            onClick={onExport}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              border: '2px solid #E2E8F0',
              background: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <Download size={16} />
            Export
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filterOptions.length > 0 && (
        <div style={{
          padding: '1rem',
          background: '#F8FAFC',
          borderRadius: '12px',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          {filterOptions.map(filter => (
            <div key={filter.column}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {columns.find(c => c.key === filter.column)?.header || filter.column}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {filter.options.map(option => {
                  const isActive = activeFilters[filter.column]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter(filter.column, option.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? '#004A69' : '#E2E8F0'}`,
                        background: isActive ? '#EFF6FF' : 'white',
                        color: isActive ? '#004A69' : '#374151',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isActive && <Check size={14} />}
                      {option.label}
                      {option.count !== undefined && (
                        <span style={{
                          fontSize: '11px',
                          color: '#94A3B8',
                          marginLeft: '2px'
                        }}>
                          ({option.count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Bar */}
      {selectable && selectedRows.size > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
          borderRadius: '10px',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
            {selectedRows.size} item{selectedRows.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              setSelectedRows(new Set());
              onSelectionChange?.([]);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div
        className="smart-table-desktop"
        style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                {selectable && (
                  <th style={{
                    width: '48px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                      onChange={toggleSelectAll}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.filter(c => !c.mobileHidden).map(column => (
                  <th
                    key={String(column.key)}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: column.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: column.width,
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {column.header}
                      {column.sortable && (
                        <span style={{
                          display: 'flex',
                          flexDirection: 'column',
                          opacity: sortColumn === column.key ? 1 : 0.3
                        }}>
                          <ChevronUp
                            size={12}
                            style={{
                              marginBottom: '-4px',
                              color: sortColumn === column.key && sortDirection === 'asc' ? '#004A69' : '#94A3B8'
                            }}
                          />
                          <ChevronDown
                            size={12}
                            style={{
                              color: sortColumn === column.key && sortDirection === 'desc' ? '#004A69' : '#94A3B8'
                            }}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    style={{ padding: '4rem', textAlign: 'center' }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      {emptyIcon || (
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Search size={28} color="#94A3B8" />
                        </div>
                      )}
                      <p style={{
                        fontSize: '15px',
                        color: '#64748B',
                        margin: 0
                      }}>
                        {emptyMessage}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const isSelected = selectedRows.has(row[keyField]);
                  return (
                    <tr
                      key={String(row[keyField])}
                      onClick={() => onRowClick?.(row)}
                      style={{
                        borderTop: index > 0 ? '1px solid #E2E8F0' : 'none',
                        background: isSelected ? '#EFF6FF' : 'white',
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'white';
                      }}
                    >
                      {selectable && (
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleRowSelection(row);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                      )}
                      {columns.filter(c => !c.mobileHidden).map(column => (
                        <td
                          key={String(column.key)}
                          style={{
                            padding: '1rem',
                            fontSize: '14px',
                            color: '#1E293B'
                          }}
                        >
                          {column.render
                            ? column.render(row[column.key as keyof T], row)
                            : String(row[column.key as keyof T] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      {mobileCardRender && (
        <div className="smart-table-mobile" style={{ display: 'none' }}>
          {paginatedData.map(row => (
            <div
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              style={{
                background: 'white',
                borderRadius: '12px',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                cursor: onRowClick ? 'pointer' : 'default'
              }}
            >
              {mobileCardRender(row)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '14px', color: '#64748B' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: 'white',
                color: currentPage === 1 ? '#CBD5E1' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: currentPage === pageNum ? 'none' : '1px solid #E2E8F0',
                    background: currentPage === pageNum
                      ? 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)'
                      : 'white',
                    color: currentPage === pageNum ? 'white' : '#374151',
                    fontSize: '14px',
                    fontWeight: currentPage === pageNum ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: 'white',
                color: currentPage === totalPages ? '#CBD5E1' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .smart-table-desktop {
            display: none !important;
          }
          .smart-table-mobile {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SmartTable;
