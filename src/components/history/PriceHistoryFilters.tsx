'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, Calendar } from 'lucide-react';

export interface PriceHistoryFilters {
  services: string[];
  destinations: string[];
  zones: number[];
  dateFrom?: Date;
  dateTo?: Date;
  changeType?: 'increase' | 'decrease' | 'all';
  minChangePercent?: number;
}

interface FilterOptions {
  services: string[];
  destinations: string[];
  zones: number[];
}

interface PriceHistoryFiltersProps {
  filters: PriceHistoryFilters;
  onFiltersChange: (filters: PriceHistoryFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  showChangeFilters?: boolean;
}

const serviceLabels = {
  standard: 'Standard',
  tracked: 'Tracked',
  signed: 'Signed',
  'tracked-signed': 'Tracked & Signed'
};

export default function PriceHistoryFiltersComponent({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  showChangeFilters = false
}: PriceHistoryFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    services: [],
    destinations: [],
    zones: []
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/prices?action=filter-options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    const newServices = checked
      ? [...filters.services, service]
      : filters.services.filter(s => s !== service);
    
    onFiltersChange({ ...filters, services: newServices });
  };

  const handleDestinationToggle = (destination: string, checked: boolean) => {
    const newDestinations = checked
      ? [...filters.destinations, destination]
      : filters.destinations.filter(d => d !== destination);
    
    onFiltersChange({ ...filters, destinations: newDestinations });
  };

  const handleZoneToggle = (zone: number, checked: boolean) => {
    const newZones = checked
      ? [...filters.zones, zone]
      : filters.zones.filter(z => z !== zone);
    
    onFiltersChange({ ...filters, zones: newZones });
  };

  const handleDateFromChange = (value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({ ...filters, dateTo: date });
  };

  const hasActiveFilters = 
    filters.services.length > 0 ||
    filters.destinations.length > 0 ||
    filters.zones.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    (showChangeFilters && (
      (filters.changeType && filters.changeType !== 'all') ||
      (filters.minChangePercent && filters.minChangePercent > 0)
    ));

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Services Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Services</Label>
              <div className="space-y-2">
                {filterOptions.services.map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service}`}
                      checked={filters.services.includes(service)}
                      onCheckedChange={(checked) => 
                        handleServiceToggle(service, checked as boolean)
                      }
                    />
                    <Label htmlFor={`service-${service}`} className="text-sm">
                      {serviceLabels[service as keyof typeof serviceLabels] || service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Zones Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Zones</Label>
              <div className="space-y-2">
                {filterOptions.zones.map(zone => (
                  <div key={zone} className="flex items-center space-x-2">
                    <Checkbox
                      id={`zone-${zone}`}
                      checked={filters.zones.includes(zone)}
                      onCheckedChange={(checked) => 
                        handleZoneToggle(zone, checked as boolean)
                      }
                    />
                    <Label htmlFor={`zone-${zone}`} className="text-sm">
                      Zone {zone}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="dateFrom" className="text-xs text-gray-500">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom ? formatDate(filters.dateFrom) : ''}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-xs text-gray-500">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo ? formatDate(filters.dateTo) : ''}
                    onChange={(e) => handleDateToChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destinations Filter - Full Width */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-medium">
              Destinations ({filterOptions.destinations.length} available)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {filterOptions.destinations.map(destination => (
                <div key={destination} className="flex items-center space-x-2">
                  <Checkbox
                    id={`destination-${destination}`}
                    checked={filters.destinations.includes(destination)}
                    onCheckedChange={(checked) => 
                      handleDestinationToggle(destination, checked as boolean)
                    }
                  />
                  <Label htmlFor={`destination-${destination}`} className="text-xs">
                    {destination}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Change Filters - Only show if requested */}
          {showChangeFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Change Type</Label>
                <Select
                  value={filters.changeType || 'all'}
                  onValueChange={(value) => 
                    onFiltersChange({ 
                      ...filters, 
                      changeType: value as 'increase' | 'decrease' | 'all' 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Changes</SelectItem>
                    <SelectItem value="increase">Price Increases</SelectItem>
                    <SelectItem value="decrease">Price Decreases</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Minimum Change %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g., 5.0"
                  value={filters.minChangePercent || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minChangePercent: e.target.value ? parseFloat(e.target.value) : undefined
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onApplyFilters} className="flex-1">
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      )}

      {/* Collapsed view showing active filters */}
      {!expanded && hasActiveFilters && (
        <CardContent className="pt-0">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {filters.services.length > 0 && (
              <span className="ml-2">{filters.services.length} service(s)</span>
            )}
            {filters.destinations.length > 0 && (
              <span className="ml-2">{filters.destinations.length} destination(s)</span>
            )}
            {filters.zones.length > 0 && (
              <span className="ml-2">{filters.zones.length} zone(s)</span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="ml-2">Date range</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}