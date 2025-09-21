'use client';

import { getAvailableDestinations } from '@/lib/calculator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DestinationSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationSelect({ value, onChange }: DestinationSelectProps) {
  const destinations = getAvailableDestinations();

  // Group destinations by region
  const groupedDestinations = destinations.reduce((acc, dest) => {
    if (!acc[dest.region]) {
      acc[dest.region] = [];
    }
    acc[dest.region].push(dest);
    return acc;
  }, {} as Record<string, typeof destinations>);

  // Sort destinations within each region
  Object.keys(groupedDestinations).forEach(region => {
    groupedDestinations[region].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select destination country" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedDestinations).map(([region, dests]) => (
            <div key={region}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {region}
              </div>
              {dests.map((dest) => (
                <SelectItem key={dest.code} value={dest.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{dest.name}</span>
                    <span className="text-xs text-gray-400 ml-2">Zone {dest.zone}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <p><strong>Zones:</strong> Europe Zone 1 (nearby), Zone 2 (Eastern Europe), World Zone 1 (developed), Zone 2 (emerging), Zone 3 (developing)</p>
      </div>
    </div>
  );
}