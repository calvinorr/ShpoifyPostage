'use client';

import { useState } from 'react';
import { Package, PriceQuote } from '@/types';
import { PackageForm } from './PackageForm';
import { DestinationSelect } from './DestinationSelect';
import { ServiceSelect } from './ServiceSelect';
import { CalculatorService } from '@/lib/calculatorService';
import { Button } from '@/components/ui/button';
import { Calculator, Package as PackageIcon, MapPin, Clock, Truck, PenTool, Shield } from 'lucide-react';

export function PostageCalculatorCompact() {
  const [packageData, setPackageData] = useState<Package>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0
  });
  const [destination, setDestination] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['standard', 'tracked']);
  const [quotes, setQuotes] = useState<PriceQuote[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCalculate = async () => {
    if (!destination) {
      setError('Please select a destination');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Please select at least one service option');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const results = await CalculatorService.calculateShipping(packageData, destination, selectedServices);
      setQuotes(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating shipping');
      setQuotes([]);
    } finally {
      setIsCalculating(false);
    }
  };

  const canCalculate = packageData.weight > 0 &&
                      packageData.length > 0 &&
                      packageData.width > 0 &&
                      packageData.height > 0 &&
                      destination &&
                      selectedServices.length > 0;

  const getServiceIcon = (service: PriceQuote['service']) => {
    if (service.tracking && service.signed) return <Shield className="h-3 w-3" />;
    if (service.tracking) return <Truck className="h-3 w-3" />;
    if (service.signed) return <PenTool className="h-3 w-3" />;
    return <PackageIcon className="h-3 w-3" />;
  };

  return (
    <div className="h-screen bg-white flex flex-col p-4 overflow-hidden">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <PackageIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-light text-gray-900">Royal Mail Postage Calculator</h1>
        </div>
        <p className="text-xs text-gray-500">Calculate international shipping costs instantly</p>
      </div>

      {/* Main Content - Single Row Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

        {/* Input Panel - 4 columns */}
        <div className="col-span-4 flex flex-col space-y-3 overflow-y-auto">

          {/* Package Details - Horizontal Layout */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
              <PackageIcon className="h-3 w-3" />
              Package
            </h3>
            <PackageForm
              packageData={packageData}
              onChange={setPackageData}
            />
          </div>

          {/* Destination */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Destination
            </h3>
            <DestinationSelect
              value={destination}
              onChange={setDestination}
            />
          </div>

          {/* Services */}
          <div className="bg-gray-50 rounded-lg p-3 flex-1 min-h-0">
            <h3 className="text-xs font-medium text-gray-900 mb-2">Services</h3>
            <div className="overflow-y-auto">
              <ServiceSelect
                selectedServices={selectedServices}
                onChange={setSelectedServices}
              />
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={handleCalculate}
            disabled={!canCalculate || isCalculating}
            className="w-full h-8 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm"
          >
            <Calculator className="h-3 w-3 mr-1" />
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Results Panel - 8 columns */}
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg flex flex-col min-h-0">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-900">Shipping Quotes</h3>
          </div>

          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            {isCalculating && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {quotes.length === 0 && !isCalculating && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <PackageIcon className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-xs">Enter package details to see shipping options</p>
              </div>
            )}

            {quotes.length > 0 && (
              <div className="space-y-3">
                {/* Destination Info */}
                <div className="flex items-center gap-2 text-xs text-gray-600 pb-2 border-b">
                  <MapPin className="h-3 w-3" />
                  <span>Shipping to <strong>{quotes[0].destination.name}</strong> (Zone {quotes[0].destination.zone})</span>
                </div>

                {/* Quote Cards - Compact */}
                <div className="space-y-2">
                  {quotes.map((quote, index) => (
                    <div key={`${quote.service.id}-${index}`} className={`
                      border rounded-md p-3 transition-all duration-200
                      ${quote.available
                        ? 'bg-white border-gray-200 hover:border-blue-300'
                        : 'bg-gray-50 border-gray-100'
                      }
                    `}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getServiceIcon(quote.service)}
                            <span className="text-sm font-medium text-gray-900">{quote.service.name}</span>
                            <div className="flex gap-1 text-xs">
                              {quote.service.tracking && (
                                <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">Tracked</span>
                              )}
                              {quote.service.signed && (
                                <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">Signed</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {quote.estimatedDays}
                          </div>
                        </div>
                        <div className="text-right">
                          {quote.available ? (
                            <div className="text-lg font-semibold text-green-600">
                              £{quote.price.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">
                              Not Available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {quotes.some(q => q.available) && quotes.filter(q => q.available).length > 1 && (
                  <div className="mt-3 pt-3 border-t bg-green-50 rounded-lg p-2">
                    <div className="text-xs">
                      <span className="text-green-700 font-medium">
                        Save £{(Math.max(...quotes.filter(q => q.available).map(q => q.price)) -
                                Math.min(...quotes.filter(q => q.available).map(q => q.price))).toFixed(2)}
                      </span>
                      <span className="text-green-600"> by choosing the cheapest option</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t">
            <p className="text-xs text-gray-400 text-center">
              Prices based on Royal Mail 2025 rates. Additional customs fees may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}