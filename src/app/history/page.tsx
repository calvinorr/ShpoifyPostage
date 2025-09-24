'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, TrendingDown, History, Activity } from 'lucide-react';
import PriceHistoryFilters, { PriceHistoryFilters as Filters } from '@/components/history/PriceHistoryFilters';
import PriceHistoryTable from '@/components/history/PriceHistoryTable';
import PriceChangeIndicator from '@/components/history/PriceChangeIndicator';

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

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('history');
  const [filters, setFilters] = useState<Filters>({
    services: [],
    destinations: [],
    zones: [],
    dateFrom: undefined,
    dateTo: undefined,
    changeType: 'all',
    minChangePercent: undefined
  });

  // History state
  const [historyData, setHistoryData] = useState<PriceEntry[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Changes state
  const [changesData, setChangesData] = useState<PriceChange[]>([]);
  const [changesTotal, setChangesTotal] = useState(0);
  const [changesLoading, setChangesLoading] = useState(false);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('effectiveDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Statistics
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalChanges: 0,
    recentIncreases: 0,
    recentDecreases: 0
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, sortBy, sortOrder, activeTab]);

  const fetchData = async () => {
    if (activeTab === 'history') {
      await fetchHistoryData();
    } else {
      await fetchChangesData();
    }
  };

  const fetchHistoryData = async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'history-filtered',
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString(),
        sortBy,
        sortOrder
      });

      if (filters.services.length > 0) {
        params.append('services', filters.services.join(','));
      }
      if (filters.destinations.length > 0) {
        params.append('destinations', filters.destinations.join(','));
      }
      if (filters.zones.length > 0) {
        params.append('zones', filters.zones.join(','));
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }

      const response = await fetch(`/api/prices?${params}`);
      const data = await response.json();

      setHistoryData(data.data || []);
      setHistoryTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch history data:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchChangesData = async () => {
    setChangesLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'changes',
        limit: pageSize.toString(),
        offset: ((currentPage - 1) * pageSize).toString()
      });

      if (filters.services.length > 0) {
        params.append('services', filters.services.join(','));
      }
      if (filters.destinations.length > 0) {
        params.append('destinations', filters.destinations.join(','));
      }
      if (filters.zones.length > 0) {
        params.append('zones', filters.zones.join(','));
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }
      if (filters.changeType && filters.changeType !== 'all') {
        params.append('changeType', filters.changeType);
      }
      if (filters.minChangePercent && filters.minChangePercent > 0) {
        params.append('minChangePercent', filters.minChangePercent.toString());
      }

      const response = await fetch(`/api/prices?${params}`);
      const data = await response.json();

      setChangesData(data.data || []);
      setChangesTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch changes data:', error);
    } finally {
      setChangesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch basic counts
      const [historyResponse, changesResponse] = await Promise.all([
        fetch('/api/prices?action=history-filtered&limit=1'),
        fetch('/api/prices?action=changes&limit=1')
      ]);

      const historyData = await historyResponse.json();
      const changesData = await changesResponse.json();

      // Fetch recent changes for increase/decrease counts
      const recentChangesResponse = await fetch('/api/prices?action=changes&limit=100');
      const recentChangesData = await recentChangesResponse.json();

      const recentIncreases = (recentChangesData.data || []).filter((change: PriceChange) => change.changeAmount > 0).length;
      const recentDecreases = (recentChangesData.data || []).filter((change: PriceChange) => change.changeAmount < 0).length;

      setStats({
        totalEntries: historyData.total || 0,
        totalChanges: changesData.total || 0,
        recentIncreases,
        recentDecreases
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      services: [],
      destinations: [],
      zones: [],
      dateFrom: undefined,
      dateTo: undefined,
      changeType: 'all',
      minChangePercent: undefined
    });
    setCurrentPage(1);
    setTimeout(() => fetchData(), 100);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSortBy('effectiveDate');
    setSortOrder('desc');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price History</h1>
          <p className="mt-2 text-gray-600">
            Track Royal Mail pricing trends and historical changes over time.
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Price Entries</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Historical records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChanges.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Price adjustments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Increases</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.recentIncreases}</div>
              <p className="text-xs text-muted-foreground">In last 100 changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Decreases</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.recentDecreases}</div>
              <p className="text-xs text-muted-foreground">In last 100 changes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <PriceHistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          showChangeFilters={activeTab === 'changes'}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Price History
            </TabsTrigger>
            <TabsTrigger value="changes" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Price Changes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <PriceHistoryTable
              data={historyData}
              total={historyTotal}
              loading={historyLoading}
              currentPage={currentPage}
              pageSize={pageSize}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showChanges={false}
            />
          </TabsContent>

          <TabsContent value="changes" className="mt-6">
            <PriceHistoryTable
              data={changesData}
              total={changesTotal}
              loading={changesLoading}
              currentPage={currentPage}
              pageSize={pageSize}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showChanges={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}