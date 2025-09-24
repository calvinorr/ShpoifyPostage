'use client';

import { getAvailableServices } from '@/lib/calculator';
import { Package, Truck, PenTool, Shield } from 'lucide-react';

interface ServiceSelectProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

export function ServiceSelect({ selectedServices, onChange }: ServiceSelectProps) {
  const services = getAvailableServices();

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedServices, serviceId]);
    } else {
      onChange(selectedServices.filter(id => id !== serviceId));
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'standard':
        return <Package className="h-4 w-4" />;
      case 'tracked':
        return <Truck className="h-4 w-4" />;
      case 'signed':
        return <PenTool className="h-4 w-4" />;
      case 'tracked-signed':
        return <Shield className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <label
          key={service.id}
          className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedServices.includes(service.id)}
            onChange={(e) => handleServiceToggle(service.id, e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {getServiceIcon(service.id)}
              {service.name}
            </div>
            <div className="flex gap-3 text-xs text-gray-500 mt-1">
              {service.tracking && (
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Tracked
                </span>
              )}
              {service.signed && (
                <span className="flex items-center gap-1">
                  <PenTool className="h-3 w-3" />
                  Signed
                </span>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}