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
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="length" className="text-xs">Length (cm)</Label>
          <Input
            id="length"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            className="h-7 text-xs"
            value={packageData.length || ''}
            onChange={(e) => handleInputChange('length', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="width" className="text-xs">Width (cm)</Label>
          <Input
            id="width"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            className="h-7 text-xs"
            value={packageData.width || ''}
            onChange={(e) => handleInputChange('width', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="height" className="text-xs">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            className="h-7 text-xs"
            value={packageData.height || ''}
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="weight" className="text-xs">Weight (g)</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className="h-7 text-xs"
            value={packageData.weight || ''}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
        </div>
      </div>

      {/* Compact size guidance */}
      <div className="p-2 bg-blue-50 rounded text-xs">
        <p className="text-blue-700"><strong>Small (≤2kg):</strong> 45×35×16cm</p>
      </div>
    </div>
  );
}