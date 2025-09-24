'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, TrendingUp, AlertTriangle, CheckCircle, XCircle, FileText, Upload, Clock, Activity } from 'lucide-react';

interface PriceUpdate {
  updateId: string;
  extractedAt: string;
  sourceUrl?: string;
  sourceType: 'pdf' | 'web' | 'manual';
  totalEntries: number;
  newEntries: number;
  changedEntries: number;
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
}

interface DestinationZone {
  destination: string;
  zone: number;
}

interface AdminStats {
  totalPriceEntries: number;
  lastUpdateTime: string;
  successfulUpdates: number;
  failedUpdates: number;
  avgResponseTime: number;
}


export default function AdminDashboard() {
  const [updates, setUpdates] = useState<PriceUpdate[]>([]);
  const [zones, setZones] = useState<DestinationZone[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch recent updates
      const updatesResponse = await fetch('/api/prices?action=updates&limit=10');
      const updatesData = await updatesResponse.json();
      setUpdates(updatesData.updates || []);

      // Fetch destination zones
      const zonesResponse = await fetch('/api/prices?action=zones');
      const zonesData = await zonesResponse.json();
      setZones(zonesData.zones || []);


      // Calculate stats from updates
      const recentUpdates = updatesData.updates || [];
      const successful = recentUpdates.filter((u: PriceUpdate) => u.status === 'success').length;
      const failed = recentUpdates.filter((u: PriceUpdate) => u.status === 'failed').length;
      const totalEntries = recentUpdates.reduce((sum: number, u: PriceUpdate) => sum + u.totalEntries, 0);
      const lastUpdate = recentUpdates.length > 0 ? recentUpdates[0].extractedAt : 'Never';

      setStats({
        totalPriceEntries: totalEntries,
        lastUpdateTime: lastUpdate,
        successfulUpdates: successful,
        failedUpdates: failed,
        avgResponseTime: 0 // Would need to track this separately
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSeed = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert('Database seeded successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error seeding database');
    }
  };

  const clearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all data from the database? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/clear-database', { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        alert(`Database cleared successfully!\nDeleted ${result.deletedPriceEntries} price entries and ${result.deletedPriceUpdates} update records.`);
        fetchData(); // Refresh data
      } else {
        alert('Failed to clear database');
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Error clearing database');
    }
  };



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePdfUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const methodInfo = result.scraping.processingMethod ? ` (${result.scraping.processingMethod} processing)` : '';
        alert(`PDF upload successful!${methodInfo}\nExtracted ${result.scraping.totalPricesScraped} prices from ${result.file.name}.\nDatabase updated: ${result.database.newEntries} new, ${result.database.changedEntries} changed entries.`);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchData(); // Refresh data
      } else {
        alert(`PDF upload failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error during PDF upload process');
      console.error('PDF upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    setLastRefresh(new Date());
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600">Manage price data via PDF uploads and monitor system status</p>
          </div>
          <div className="flex flex-wrap gap-2">
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={triggerManualSeed}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Seed DB
              </Button>
              <Button
                onClick={clearDatabase}
                variant="destructive"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear DB
              </Button>
            </div>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading...'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Price Entries</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPriceEntries || 0}</div>
              <p className="text-xs text-muted-foreground">Across all destinations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.lastUpdateTime && stats.lastUpdateTime !== 'Never'
                  ? getTimeAgo(stats.lastUpdateTime)
                  : 'Never'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.lastUpdateTime && stats.lastUpdateTime !== 'Never'
                  ? formatDate(stats.lastUpdateTime)
                  : 'No updates yet'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Updates</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.successfulUpdates || 0}</div>
              <p className="text-xs text-muted-foreground">Recent success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Updates</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.failedUpdates || 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Price Updates</CardTitle>
              <CardDescription>Latest price update activity and status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No updates found</p>
                  <p className="text-sm">Database may need seeding</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.updateId} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {getStatusIcon(update.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusBadge(update.status)}>
                            {update.status}
                          </Badge>
                          <Badge variant="outline">
                            {update.sourceType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(update.extractedAt)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900">
                          {update.totalEntries} entries • {update.newEntries} new • {update.changedEntries} changed
                        </div>
                        {update.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            Error: {update.errorMessage}
                          </div>
                        )}
                        {update.sourceUrl && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            Source: {update.sourceUrl}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destination Zones */}
          <Card>
            <CardHeader>
              <CardTitle>Destination Coverage</CardTitle>
              <CardDescription>Available shipping zones and destinations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No destination zones found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div key={`${zone.destination}-${zone.zone}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{zone.destination}</div>
                        <div className="text-xs text-gray-500">Zone {zone.zone}</div>
                      </div>
                      <Badge variant="outline">
                        Zone {zone.zone}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PDF Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF Price Guide
            </CardTitle>
            <CardDescription>
              Upload Royal Mail PDF files to extract and store pricing data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Royal Mail PDF File
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum file size: 10MB. Only PDF files are accepted.
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button
                onClick={handlePdfUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing PDF...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Extract Prices
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Database</div>
                  <div className="text-xs text-gray-500">Connected</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Upload API</div>
                  <div className="text-xs text-gray-500">Operational</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}