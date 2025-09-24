'use client';

import { useState } from 'react';
import { Package, PriceQuote } from '@/types';
import { PackageForm } from './PackageForm';
import { DestinationSelect } from './DestinationSelect';
import { ServiceSelect } from './ServiceSelect';
import { CalculatorService } from '@/lib/calculatorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  Package as PackageIcon,
  MapPin,
  Clock,
  Truck,
  PenTool,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Info
} from 'lucide-react';

export function PostageCalculatorModern() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
      setStep(3);
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

  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return packageData.weight > 0 && packageData.length > 0 && packageData.width > 0 && packageData.height > 0;
      case 2:
        return destination && selectedServices.length > 0;
      default:
        return false;
    }
  };

  const getServiceIcon = (service: PriceQuote['service']) => {
    if (service.tracking && service.signed) return <Shield className="h-4 w-4" />;
    if (service.tracking) return <Truck className="h-4 w-4" />;
    if (service.signed) return <PenTool className="h-4 w-4" />;
    return <PackageIcon className="h-4 w-4" />;
  };

  const StepIndicator = ({ stepNum, title, completed, active }: {
    stepNum: number,
    title: string,
    completed: boolean,
    active: boolean
  }) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
        completed
          ? 'bg-green-500 border-green-500 text-white'
          : active
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'border-gray-300 text-gray-400'
      }`}>
        {completed ? <CheckCircle className="h-4 w-4" /> : stepNum}
      </div>
      <div className="ml-2">
        <div className={`text-sm font-medium ${
          completed ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'
        }`}>
          {title}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <PackageIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Calculator</h1>
        </div>
        <p className="text-gray-600">Get accurate Royal Mail international shipping costs in seconds</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <StepIndicator
              stepNum={1}
              title="Package Details"
              completed={isStepComplete(1)}
              active={step === 1}
            />
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <StepIndicator
              stepNum={2}
              title="Destination & Service"
              completed={isStepComplete(2)}
              active={step === 2}
            />
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <StepIndicator
              stepNum={3}
              title="Results"
              completed={quotes.length > 0}
              active={step === 3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Package Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-blue-500" />
              Package Details
            </CardTitle>
            <CardDescription>
              Enter the dimensions and weight of your package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PackageForm
              packageData={packageData}
              onChange={setPackageData}
            />

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStepComplete(1)}
                className="flex items-center gap-2"
              >
                Next: Destination
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Destination & Services */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Destination
              </CardTitle>
              <CardDescription>
                Where are you sending your package?
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
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                Shipping Services
              </CardTitle>
              <CardDescription>
                Choose the services you want to compare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceSelect
                selectedServices={selectedServices}
                onChange={setSelectedServices}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate || isCalculating}
              className="flex items-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Shipping
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div className="space-y-6">
          {quotes.length > 0 && (
            <>
              {/* Summary Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Shipping to {quotes[0].destination.name}
                        </span>
                        <Badge variant="secondary">Zone {quotes[0].destination.zone}</Badge>
                      </div>
                      <p className="text-sm text-blue-700">
                        Package: {packageData.length}×{packageData.width}×{packageData.height}cm, {packageData.weight}g
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-medium">{quotes.filter(q => q.available).length} options available</span>
                      </div>
                      {quotes[0]?.delivery?.cutoffTime && (
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Clock className="h-3 w-3" />
                          {quotes[0].delivery.cutoffTime}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quote Results */}
              <div className="grid gap-4">
                {quotes.map((quote, index) => (
                  <Card key={`${quote.service.id}-${index}`} className={`transition-all duration-200 ${
                    quote.available
                      ? 'hover:shadow-md border-gray-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              quote.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {getServiceIcon(quote.service)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{quote.service.name}</h3>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {quote.delivery?.businessDaysText || quote.estimatedDays}
                                </div>
                                {quote.delivery?.estimatedDateText && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium">
                                      Expected: {quote.delivery.estimatedDateText}
                                    </span>
                                    {quote.delivery.isGuaranteed && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        Guaranteed
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {quote.delivery?.processingDelay && (
                                  <div className="flex items-center gap-2 text-xs text-amber-600">
                                    <Info className="h-3 w-3" />
                                    {quote.delivery.processingDelay}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {quote.service.tracking && (
                              <Badge variant="outline" className="text-xs">
                                <Truck className="h-3 w-3 mr-1" />
                                Tracked
                              </Badge>
                            )}
                            {quote.service.signed && (
                              <Badge variant="outline" className="text-xs">
                                <PenTool className="h-3 w-3 mr-1" />
                                Signed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {quote.available ? (
                            <div className="text-2xl font-bold text-green-600">
                              £{quote.price.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              Not Available
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Savings Alert */}
              {quotes.filter(q => q.available).length > 1 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Save £{(Math.max(...quotes.filter(q => q.available).map(q => q.price)) -
                                Math.min(...quotes.filter(q => q.available).map(q => q.price))).toFixed(2)}
                      </span>
                      <span>by choosing the most economical option</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Modify Details
                </Button>
                <Button
                  onClick={() => {
                    setStep(1);
                    setQuotes([]);
                    setPackageData({ length: 0, width: 0, height: 0, weight: 0 });
                    setDestination('');
                    setSelectedServices(['standard', 'tracked']);
                  }}
                  variant="outline"
                >
                  New Calculation
                </Button>
              </div>

              {/* Footer */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-gray-500">
                    Prices based on Royal Mail 2025 rates. Additional customs fees may apply for international shipments.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}