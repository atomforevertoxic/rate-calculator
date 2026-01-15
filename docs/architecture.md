Strategy Pattern - Rate Calculation Algorithms
* Where: src/services/rate-calculators/
* Why: Different carriers have different rate calculation logic
* Interface: RateCalculationStrategy


Factory Method Pattern - Carrier Instance Creation
* Where: src/factories/carrier-factory.ts
* Why: Create appropriate carrier service based on carrier name
* Interface: CarrierFactory


Decorator Pattern - Additional Services/Fees
* Where: src/services/fee-decorators/
* Why: Stack additional fees (insurance, signature, etc.) dynamically
* Interface: RateDecorator


Adapter Pattern - External API Integration
* Where: src/adapters/carrier-adapters/
* Why: Normalize different carrier API response formats
* Interface: CarrierAdapter


Singleton Pattern - Configuration Management
* Where: src/config/carrier-config.ts
* Why: Single source of truth for carrier credentials and settings
* Class: CarrierConfigManager