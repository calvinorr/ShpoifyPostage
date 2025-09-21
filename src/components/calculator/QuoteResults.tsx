'use client';

import { PriceQuote } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, PenTool, Shield, Clock, MapPin, AlertTriangle } from 'lucide-react';

interface QuoteResultsProps {
  quotes: PriceQuote[];
  isLoading: boolean;
}

export function QuoteResults({ quotes, isLoading }: QuoteResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Enter package details and click "Calculate Postage" to see shipping options</p>
      </div>
    );
  }

  const getServiceIcon = (service: PriceQuote['service']) => {
    if (service.tracking && service.signed) return <Shield className="h-4 w-4" />;
    if (service.tracking) return <Truck className="h-4 w-4" />;
    if (service.signed) return <PenTool className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const getServiceBadgeVariant = (service: PriceQuote['service']) => {
    if (service.tracking && service.signed) return 'default';
    if (service.tracking) return 'secondary';
    if (service.signed) return 'outline';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      {/* Destination Info */}
      {quotes.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="h-4 w-4" />
          <span>Shipping to: <strong>{quotes[0].destination.name}</strong> (Zone {quotes[0].destination.zone})</span>
        </div>
      )}

      {/* Quote Cards */}
      <div className="space-y-3">
        {quotes.map((quote, index) => (
          <div key={`${quote.service.id}-${index}`} className={`border rounded-lg p-4 ${
            quote.available ? 'bg-white' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Service Header */}
                <div className="flex items-center gap-2 mb-2">
                  {getServiceIcon(quote.service)}
                  <h3 className="font-medium text-lg">{quote.service.name}</h3>
                  <Badge variant={getServiceBadgeVariant(quote.service)}>
                    {quote.service.tracking && quote.service.signed ? 'Premium' :
                     quote.service.tracking ? 'Tracked' :
                     quote.service.signed ? 'Signed' : 'Standard'}
                  </Badge>
                </div>

                {/* Service Features */}
                <div className="flex gap-3 text-sm text-gray-600 mb-2">
                  {quote.service.tracking && (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Online tracking
                    </span>
                  )}
                  {quote.service.signed && (
                    <span className="flex items-center gap-1">
                      <PenTool className="h-3 w-3" />
                      Signature required
                    </span>
                  )}
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  {quote.estimatedDays}
                </div>

                {/* Restrictions */}
                {quote.restrictions && quote.restrictions.length > 0 && (
                  <div className="mt-2 flex items-start gap-1 text-sm text-amber-600">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{quote.restrictions.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                {quote.available ? (
                  <div className="text-2xl font-bold text-green-600">
                    £{quote.price.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-lg font-medium text-gray-400">
                    Not Available
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {quotes.some(q => q.available) && (
        <>
          <Separator />
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Price Comparison:</strong></p>
            <div className="grid grid-cols-1 gap-1">
              {quotes.filter(q => q.available).map((quote, index) => (
                <div key={index} className="flex justify-between">
                  <span>{quote.service.name}:</span>
                  <span className="font-medium">£{quote.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {quotes.filter(q => q.available).length > 1 && (
              <div className="pt-2 text-xs text-green-600">
                Savings: £{(Math.max(...quotes.filter(q => q.available).map(q => q.price)) -
                          Math.min(...quotes.filter(q => q.available).map(q => q.price))).toFixed(2)}
                by choosing the cheapest option
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Note */}
      <div className="text-xs text-gray-500 pt-4 border-t">
        <p>Prices based on Royal Mail 2025 rates. Additional customs fees may apply for international shipments. Delivery times are estimates and may vary.</p>
      </div>
    </div>
  );
}