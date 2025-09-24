'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriceChangeIndicatorProps {
  oldPrice?: number;
  newPrice: number;
  changeAmount?: number;
  changePercentage?: number;
  showBadge?: boolean;
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceChangeIndicator({
  oldPrice,
  newPrice,
  changeAmount,
  changePercentage,
  showBadge = false,
  showIcon = true,
  showPercentage = true,
  size = 'md',
  className = ''
}: PriceChangeIndicatorProps) {
  // Calculate change if not provided
  const calculatedChangeAmount = changeAmount ?? (oldPrice ? newPrice - oldPrice : 0);
  const calculatedChangePercentage = changePercentage ?? (
    oldPrice && oldPrice > 0 
      ? ((newPrice - oldPrice) / oldPrice) * 100 
      : 0
  );

  const isIncrease = calculatedChangeAmount > 0;
  const isDecrease = calculatedChangeAmount < 0;
  const isUnchanged = Math.abs(calculatedChangeAmount) < 0.01;

  // Styling based on change direction
  const getColorClasses = () => {
    if (isIncrease) {
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badgeVariant: 'bg-red-100 text-red-800' as const
      };
    } else if (isDecrease) {
      return {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badgeVariant: 'bg-green-100 text-green-800' as const
      };
    } else {
      return {
        text: 'text-gray-500',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badgeVariant: 'bg-gray-100 text-gray-600' as const
      };
    }
  };

  const colors = getColorClasses();

  const getIcon = () => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    if (isIncrease) {
      return <TrendingUp className={`${iconSize} ${colors.text}`} />;
    } else if (isDecrease) {
      return <TrendingDown className={`${iconSize} ${colors.text}`} />;
    } else {
      return <Minus className={`${iconSize} ${colors.text}`} />;
    }
  };

  const formatChange = () => {
    const absChange = Math.abs(calculatedChangeAmount);
    const absPercentage = Math.abs(calculatedChangePercentage);
    
    const sign = isIncrease ? '+' : isDecrease ? '-' : '';
    const changeText = `${sign}£${absChange.toFixed(2)}`;
    const percentageText = showPercentage ? ` (${sign}${absPercentage.toFixed(1)}%)` : '';
    
    return `${changeText}${percentageText}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-base px-3 py-1.5';
      default:
        return 'text-sm px-2 py-1';
    }
  };

  // If showing as badge
  if (showBadge) {
    return (
      <Badge className={`${colors.badgeVariant} ${getSizeClasses()} ${className}`}>
        <div className="flex items-center gap-1">
          {showIcon && getIcon()}
          <span>{formatChange()}</span>
        </div>
      </Badge>
    );
  }

  // Regular inline display
  return (
    <div className={`inline-flex items-center gap-1 ${colors.text} ${className}`}>
      {showIcon && getIcon()}
      <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {formatChange()}
      </span>
    </div>
  );
}

// Utility component for price comparison
export function PriceComparison({
  oldPrice,
  newPrice,
  showLabels = false,
  vertical = false,
  className = ''
}: {
  oldPrice: number;
  newPrice: number;
  showLabels?: boolean;
  vertical?: boolean;
  className?: string;
}) {
  const changeAmount = newPrice - oldPrice;
  const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;

  const containerClass = vertical 
    ? 'flex flex-col items-start gap-1'
    : 'flex items-center gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex items-center gap-2">
        {showLabels && (
          <span className="text-xs text-gray-500">Was:</span>
        )}
        <span className="text-gray-600 line-through">£{oldPrice.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {showLabels && (
          <span className="text-xs text-gray-500">Now:</span>
        )}
        <span className="font-semibold">£{newPrice.toFixed(2)}</span>
      </div>
      
      <PriceChangeIndicator
        oldPrice={oldPrice}
        newPrice={newPrice}
        changeAmount={changeAmount}
        changePercentage={changePercentage}
        size="sm"
        showBadge
      />
    </div>
  );
}

// Utility component for price trend over time
export function PriceTrendIndicator({
  prices,
  showCount = true,
  className = ''
}: {
  prices: { price: number; date: Date }[];
  showCount?: boolean;
  className?: string;
}) {
  if (prices.length < 2) {
    return (
      <span className={`text-xs text-gray-500 ${className}`}>
        Insufficient data
      </span>
    );
  }

  const sortedPrices = [...prices].sort((a, b) => a.date.getTime() - b.date.getTime());
  const oldestPrice = sortedPrices[0].price;
  const newestPrice = sortedPrices[sortedPrices.length - 1].price;
  
  const overallChange = newestPrice - oldestPrice;
  const overallChangePercentage = ((newestPrice - oldestPrice) / oldestPrice) * 100;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PriceChangeIndicator
        oldPrice={oldestPrice}
        newPrice={newestPrice}
        changeAmount={overallChange}
        changePercentage={overallChangePercentage}
        size="sm"
        showBadge
      />
      {showCount && (
        <span className="text-xs text-gray-500">
          ({prices.length} records)
        </span>
      )}
    </div>
  );
}