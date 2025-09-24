'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight,
  Package,
  MapPin,
  Calendar,
  PoundSterling
} from 'lucide-react';
import PriceChangeIndicator from './PriceChangeIndicator';

interface PriceEntry {
  _id: string;
  service: string;
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  sizeCategory: string;
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  price: number;
  currency: string;
  effectiveDate: string;
  extractedAt: string;
  sourceType: string;
}

interface PriceChange {
  _id: string;
  service: string;
  destination: string;
  zone: number;
  weightRangeKg: {
    min: number;
    max: number;
  };
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePercentage: number;
  effectiveDate: string;
  detectedAt: string;
}

interface PriceHistoryTableProps {
  data: PriceEntry[] | PriceChange[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showChanges?: boolean;
}

const serviceLabels = {
  standard: 'Standard',
  tracked: 'Tracked',
  signed: 'Signed',
  'tracked-signed': 'Tracked & Signed'
};

const sizeLabels = {
  small: 'Small',
  medium: 'Medium', 
  large: 'Large'
};

export default function PriceHistoryTable({
  data,
  total,
  loading,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
  showChanges = false
}: PriceHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeight = (weightRange: { min: number; max: number }) => {
    const minG = Math.round(weightRange.min * 1000);
    const maxG = Math.round(weightRange.max * 1000);
    return `${minG}g - ${maxG}g`;
  };

  const formatDimensions = (dimensions: { length: number; width: number; height: number }) => {
    return `${dimensions.length}×${dimensions.width}×${dimensions.height}cm`;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left">
      <Button
        variant="ghost"
        className="h-auto p-0 font-semibold text-gray-900 hover:text-blue-600"
        onClick={() => onSort(column)}
      >
        <div className="flex items-center gap-2">
          {children}
          {getSortIcon(column)}
        </div>
      </Button>
    </th>
  );

  const isPriceChange = (item: any): item is PriceChange => {
    return 'oldPrice' in item && 'newPrice' in item;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{showChanges ? 'Price Changes' : 'Price History'}</span>
          <Badge variant="outline">
            {total} record{total !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No {showChanges ? 'price changes' : 'price history'} found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <SortableHeader column="effectiveDate">
                      <Calendar className="h-4 w-4" />
                      Date
                    </SortableHeader>
                    <SortableHeader column="service">
                      Service
                    </SortableHeader>
                    <SortableHeader column="destination">
                      <MapPin className="h-4 w-4" />
                      Destination
                    </SortableHeader>
                    <SortableHeader column="zone">
                      Zone
                    </SortableHeader>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Weight Range
                    </th>
                    {showChanges ? (
                      <>
                        <SortableHeader column="oldPrice">
                          <PoundSterling className="h-4 w-4" />
                          Old Price
                        </SortableHeader>
                        <SortableHeader column="newPrice">
                          <PoundSterling className="h-4 w-4" />
                          New Price
                        </SortableHeader>
                        <SortableHeader column="changeAmount">
                          Change
                        </SortableHeader>
                      </>
                    ) : (
                      <SortableHeader column="price">
                        <PoundSterling className="h-4 w-4" />
                        Price
                      </SortableHeader>
                    )}
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {formatDate(item.effectiveDate)}
                        </div>
                        {showChanges && isPriceChange(item) && (
                          <div className="text-xs text-gray-500">
                            Detected: {formatDate(item.detectedAt)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {serviceLabels[item.service as keyof typeof serviceLabels] || item.service}
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{item.destination}</div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          Zone {item.zone}
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {formatWeight(item.weightRangeKg)}
                        </div>
                      </td>

                      {showChanges && isPriceChange(item) ? (
                        <>
                          <td className="px-4 py-3">
                            <div className="text-sm font-mono">
                              £{item.oldPrice.toFixed(2)}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm font-mono font-semibold">
                              £{item.newPrice.toFixed(2)}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <PriceChangeIndicator
                              oldPrice={item.oldPrice}
                              newPrice={item.newPrice}
                              changeAmount={item.changeAmount}
                              changePercentage={item.changePercentage}
                              showBadge
                              size="sm"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono font-semibold">
                            £{item.price.toFixed(2)}
                          </div>
                        </td>
                      )}
                      
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(item._id)}
                        >
                          {expandedRows.has(item._id) ? 'Hide' : 'Show'} Details
                        </Button>
                      </td>
                    </tr>

                    {expandedRows.has(item._id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={showChanges ? 9 : 7} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {!showChanges && (
                              <>
                                <div>
                                  <span className="font-medium text-gray-600">Size Category:</span>
                                  <div className="mt-1">
                                    {sizeLabels[(item as PriceEntry).sizeCategory as keyof typeof sizeLabels] || (item as PriceEntry).sizeCategory}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Max Dimensions:</span>
                                  <div className="mt-1">
                                    {formatDimensions((item as PriceEntry).maxDimensions)}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Extracted:</span>
                                  <div className="mt-1">
                                    {formatDateTime((item as PriceEntry).extractedAt)}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Source:</span>
                                  <div className="mt-1">
                                    <Badge variant="outline" className="capitalize">
                                      {(item as PriceEntry).sourceType}
                                    </Badge>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {showChanges && isPriceChange(item) && (
                              <>
                                <div>
                                  <span className="font-medium text-gray-600">Change Amount:</span>
                                  <div className="mt-1 font-mono">
                                    {item.changeAmount > 0 ? '+' : ''}£{item.changeAmount.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Change Percentage:</span>
                                  <div className="mt-1 font-mono">
                                    {item.changePercentage > 0 ? '+' : ''}{item.changePercentage.toFixed(1)}%
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Effective Date:</span>
                                  <div className="mt-1">
                                    {formatDateTime(item.effectiveDate)}
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-600">Detected At:</span>
                                  <div className="mt-1">
                                    {formatDateTime(item.detectedAt)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {startItem}-{endItem} of {total} records
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNumber = start + i;
                      if (pageNumber > end) return null;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  }).filter(Boolean)}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}