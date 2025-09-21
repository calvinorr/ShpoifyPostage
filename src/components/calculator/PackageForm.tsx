'use client';

import { Package } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PackageFormProps {
  packageData: Package;
  onChange: (data: Package) => void;
}

export function PackageForm({ packageData, onChange }: PackageFormProps) {
  const handleInputChange = (field: keyof Package, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      ...packageData,
      [field]: numValue
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="length">Length (cm)</Label>
          <Input
            id="length"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={packageData.length || ''}
            onChange={(e) => handleInputChange('length', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width">Width (cm)</Label>
          <Input
            id="width"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={packageData.width || ''}
            onChange={(e) => handleInputChange('width', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            value={packageData.height || ''}
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Weight (grams)</Label>
        <Input
          id="weight"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={packageData.weight || ''}
          onChange={(e) => handleInputChange('weight', e.target.value)}
        />
        <p className="text-sm text-gray-500">
          Enter weight in grams (e.g., 500g = 500)
        </p>
      </div>

      {/* Package size guidance */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Royal Mail Size Limits</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Small Parcel (≤2kg):</strong> Max 45cm × 35cm × 16cm</p>
          <p><strong>Medium Parcel (≤20kg):</strong> Max 61cm × 46cm × 46cm</p>
          <p><strong>Large Parcel (≤30kg):</strong> Max combined dimensions 150cm</p>
        </div>
      </div>
    </div>
  );
}