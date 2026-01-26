"use client";

import { PackageDimensions } from "@/src/types/domain";

interface DimensionsInputProps {
  dimensions: PackageDimensions;
  onChange: (dimensions: PackageDimensions) => void;
}

export function DimensionsInput({ dimensions, onChange }: DimensionsInputProps) {
  const handleChange = (field: "length" | "width" | "height", value: number) => {
    onChange({
      ...dimensions,
      [field]: value,
    });
  };

  const handleUnitChange = (unit: "in" | "cm") => {
    onChange({
      ...dimensions,
      unit,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm font-medium text-gray-700">Unit:</label>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitChange("in")}
            className={`px-4 py-2 ${
              dimensions.unit === "in" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange("cm")}
            className={`px-4 py-2 ${
              dimensions.unit === "cm" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Centimeters
          </button>
        </div>
      </div>

      {(["length", "width", "height"] as const).map((dimension) => (
        <div key={dimension} className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 capitalize">{dimension}:</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="0.1"
              value={dimensions[dimension] || ""}
              onChange={(e) => handleChange(dimension, parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="0.0"
            />
            <span className="text-gray-500">{dimensions.unit === "in" ? "in" : "cm"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
