'use client';

import { getAvailableServices } from '@/lib/calculator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="flex items-start space-x-3">
          <Checkbox
            id={service.id}
            checked={selectedServices.includes(service.id)}
            onCheckedChange={(checked) =>
              handleServiceToggle(service.id, checked as boolean)
            }
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor={service.id}
              className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {getServiceIcon(service.id)}
              {service.name}
            </Label>
            <p className="text-xs text-gray-500">{service.description}</p>
            <div className="flex gap-4 text-xs">
              {service.tracking && (
                <span className="flex items-center gap-1 text-green-600">
                  <Truck className="h-3 w-3" />
                  Tracking
                </span>
              )}
              {service.signed && (
                <span className="flex items-center gap-1 text-blue-600">
                  <PenTool className="h-3 w-3" />
                  Signature Required
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Service Information</h4>
        <div className="text-xs text-amber-700 space-y-1">
          <p><strong>Standard:</strong> Basic service, no tracking or signature</p>
          <p><strong>Tracked:</strong> Online tracking available</p>
          <p><strong>Signed For:</strong> Signature required on delivery</p>
          <p><strong>Tracked & Signed:</strong> Both tracking and signature required</p>
        </div>
      </div>
    </div>
  );
}