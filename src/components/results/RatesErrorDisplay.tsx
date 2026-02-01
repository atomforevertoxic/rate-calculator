'use client';

interface RatesErrorDisplayProps {
  errors: Array<{
    carrier: string;
    message: string;
  }>;
}

export default function RatesErrorDisplay({ errors }: RatesErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-red-900">Unable to Fetch Rates</h2>
        <p className="mt-1 text-sm text-red-800">
          We encountered errors while fetching shipping rates from the following carriers:
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {errors.map((error, idx) => (
          <div key={idx} className="rounded-lg bg-white p-3 border border-red-200">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-red-900">{error.carrier}</p>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
