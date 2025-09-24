'use client';

import { CalculatorService } from '@/lib/calculatorService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DestinationSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationSelect({ value, onChange }: DestinationSelectProps) {
  const countries = CalculatorService.getAvailableCountries();

  // Group countries by zone
  const groupedCountries = countries.reduce((acc, country) => {
    const zoneKey = country.zone === 1 ? 'Europe (Zone 1)' : 'Rest of World (Zone 2)';
    if (!acc[zoneKey]) {
      acc[zoneKey] = [];
    }
    acc[zoneKey].push(country);
    return acc;
  }, {} as Record<string, typeof countries>);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select destination country" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedCountries).map(([zone, countryList]) => (
            <div key={zone}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {zone}
              </div>
              {countryList.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-400 ml-2">Zone {country.zone}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <p><strong>Zone 1:</strong> European countries with faster delivery. <strong>Zone 2:</strong> Rest of world destinations.</p>
      </div>
    </div>
  );
}