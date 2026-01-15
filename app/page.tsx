import RateCalculatorForm from './components/forms/RateCalculatorForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Multi-Carrier Shipping Rate Calculator
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Compare shipping rates across multiple carriers. Get the best price for your package
            delivery needs.
          </p>
        </header>

        <RateCalculatorForm />
      </div>
    </main>
  );
}
