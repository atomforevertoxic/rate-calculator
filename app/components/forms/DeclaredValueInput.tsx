"use client";

interface DeclaredValueInputProps {
  value?: number;
  onChange: (value?: number) => void;
}

export function DeclaredValueInput({ value, onChange }: DeclaredValueInputProps) {
  return (
    <div className="pt-4 border-t border-gray-200">
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Declared Value (Optional)
      </label>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || undefined)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="0.00"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Used for insurance purposes. Most carriers provide $100 coverage by default.
      </p>
    </div>
  );
}
