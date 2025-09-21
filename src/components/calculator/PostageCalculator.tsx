'use client';

import { useState } from 'react';
import { Package, PriceQuote } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageForm } from './PackageForm';
import { DestinationSelect } from './DestinationSelect';
import { ServiceSelect } from './ServiceSelect';
import { QuoteResults } from './QuoteResults';
import { calculateShipping } from '@/lib/calculator';
import { Button } from '@/components/ui/button';
import { Calculator, Package as PackageIcon } from 'lucide-react';

export function PostageCalculator() {
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
      const results = calculateShipping(packageData, destination, selectedServices);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <PackageIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Royal Mail Postage Finder</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate Royal Mail international postage costs for your yarn business.
          Get accurate pricing for small parcels with or without tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Package Details
              </CardTitle>
              <CardDescription>
                Enter the dimensions and weight of your package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PackageForm
                packageData={packageData}
                onChange={setPackageData}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destination</CardTitle>
              <CardDescription>
                Select the country you're shipping to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DestinationSelect
                value={destination}
                onChange={setDestination}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Options</CardTitle>
              <CardDescription>
                Choose the shipping services to compare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceSelect
                selectedServices={selectedServices}
                onChange={setSelectedServices}
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleCalculate}
            disabled={!canCalculate || isCalculating}
            className="w-full"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Calculate Postage'}
          </Button>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Postage Quotes</CardTitle>
              <CardDescription>
                Shipping options and pricing for your package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteResults quotes={quotes} isLoading={isCalculating} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}