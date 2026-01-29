'use client';

import { CarrierName, ServiceSpeed, ShippingOptions, carrierNames } from '@/src/types/domain';
import { useEffect, useState } from 'react';
import { ServiceSpeedSelector } from './forms/ServiceSpeedSelector';

interface ShippingOptionsStepProps {
  data: ShippingOptions;
  carriersFilter?: CarrierName[]; // ← Новый проп
  onChange: (data: Partial<ShippingOptions>) => void;
  onCarriersFilterChange?: (carriers: CarrierName[] | undefined) => void;
}

export function ShippingOptionsStep({
  data,
  carriersFilter = [], // ← значение по умолчанию
  onChange,
  onCarriersFilterChange,
}: ShippingOptionsStepProps) {
  const [localData, setLocalData] = useState<ShippingOptions>(data);
  const [showCarrierFilter, setShowCarrierFilter] = useState(false);
  const [selectedCarriers, setSelectedCarriers] = useState<CarrierName[]>(carriersFilter || []);

  useEffect(() => {
    // Only update if carriersFilter actually changed
    setSelectedCarriers((prev) => {
      if (
        carriersFilter &&
        (prev.length !== carriersFilter.length ||
          !prev.every((carrier, idx) => carrier === carriersFilter[idx]))
      ) {
        return carriersFilter;
      }
      return prev;
    });
  }, [carriersFilter]);

  const additionalServices = [
    {
      id: 'signature',
      label: 'Signature Required',
      field: 'signatureRequired' as const,
      description: 'Recipient must sign for delivery',
    },
    {
      id: 'insurance',
      label: 'Insurance',
      field: 'insurance' as const,
      description: 'Additional insurance coverage',
    },
    {
      id: 'fragile',
      label: 'Fragile Handling',
      field: 'fragileHandling' as const,
      description: 'Special handling for fragile items',
    },
    {
      id: 'saturday',
      label: 'Saturday Delivery',
      field: 'saturdayDelivery' as const,
      description: 'Delivery available on Saturdays',
    },
  ];

  const handleSpeedChange = (speed: ServiceSpeed) => {
    const updated = { ...localData, speed };
    setLocalData(updated);
    onChange({ speed });
  };

  const handleServiceToggle = (
    field: keyof Pick<
      ShippingOptions,
      'signatureRequired' | 'insurance' | 'fragileHandling' | 'saturdayDelivery'
    >
  ) => {
    const updated = {
      ...localData,
      [field]: !localData[field],
      ...(field === 'insurance' && !localData[field] ? { insuredValue: undefined } : {}),
    };
    setLocalData(updated);
    onChange({ [field]: updated[field] });
  };

  const handleInsuredValueChange = (value: number) => {
    const updated = { ...localData, insuredValue: value };
    setLocalData(updated);
    onChange({ insuredValue: value });
  };

  const handleCarrierToggle = (carrier: CarrierName) => {
    const updatedCarriers = selectedCarriers.includes(carrier)
      ? selectedCarriers.filter((c) => c !== carrier)
      : [...selectedCarriers, carrier];

    setSelectedCarriers(updatedCarriers);

    if (onCarriersFilterChange) {
      onCarriersFilterChange(updatedCarriers.length > 0 ? updatedCarriers : undefined);
    }
  };

  const handleSelectAllCarriers = () => {
    const allCarriers = [...carrierNames];
    setSelectedCarriers(allCarriers);
    if (onCarriersFilterChange) {
      onCarriersFilterChange(allCarriers);
    }
  };

  const handleClearAllCarriers = () => {
    setSelectedCarriers([]);
    if (onCarriersFilterChange) {
      onCarriersFilterChange(undefined);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Step 3: Shipping Options</h2>

      <ServiceSpeedSelector value={localData.speed} onChange={handleSpeedChange} />

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Services</h3>
        <div className="space-y-3">
          {additionalServices.map((service) => (
            <div key={service.id} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={service.id}
                  type="checkbox"
                  checked={localData[service.field]}
                  onChange={() => handleServiceToggle(service.field)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor={service.id} className="font-medium text-gray-900">
                  {service.label}
                </label>
                <p className="text-sm text-gray-500">{service.description}</p>

                {service.field === 'insurance' && localData.insurance && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Value ($)
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={localData.insuredValue || ''}
                        onChange={(e) => handleInsuredValueChange(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Enter value"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Minimum $100 coverage recommended
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Carrier Filter (Optional)</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCarrierFilter(!showCarrierFilter)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showCarrierFilter ? 'Hide' : 'Filter by carrier'}
            </button>
            {showCarrierFilter && selectedCarriers.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllCarriers}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {showCarrierFilter && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-600">
                Select specific carriers to compare. Leave empty to compare all available carriers.
              </p>
              <button
                type="button"
                onClick={handleSelectAllCarriers}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select all
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              {carrierNames.map((carrier) => (
                <div key={carrier} className="flex items-center">
                  <input
                    id={`carrier-${carrier}`}
                    type="checkbox"
                    checked={selectedCarriers.includes(carrier)}
                    onChange={() => handleCarrierToggle(carrier)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`carrier-${carrier}`}
                    className="ml-2 text-sm font-medium text-gray-900"
                  >
                    {carrier}
                  </label>
                </div>
              ))}
            </div>

            {selectedCarriers.length > 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Selected: {selectedCarriers.join(', ')}</p>
                <p className="text-sm text-gray-500">
                  {selectedCarriers.length} of {carrierNames.length} carriers selected
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No carriers selected. Rates from all available carriers will be shown.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Pricing Note</h4>
        <p className="text-sm text-blue-700">
          • Additional services may incur extra charges
          <br />
          • Saturday delivery typically costs 20-30% more
          <br />
          • Insurance rates vary by carrier and declared value
          <br />• Final rates will be calculated in the next step
        </p>
      </div>
    </div>
  );
}
