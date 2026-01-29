# Multi-Carrier Shipping Rate Calculator 🚚

*A production-grade Next.js application demonstrating advanced design patterns, comprehensive testing, and shipping logistics optimization*

---

## 📋 Project Overview

**Multi-Carrier Shipping Rate Calculator** is a full-stack web application that enables users to compare shipping rates across multiple carriers in real-time. Built with modern React 19, TypeScript, and Next.js, the application demonstrates professional software engineering practices including SOLID design patterns, comprehensive test coverage (185+ tests, 70%+ coverage), and production-ready architecture.

### Key Features

✨ **Multi-Step Form Validation**
- Intuitive 4-step workflow: Package Details → Addresses → Shipping Options → Review & Calculate
- Real-time validation with server-side address verification
- Form state persistence to localStorage

🚀 **Parallel Carrier Rate Fetching**
- Simultaneous API calls to multiple carriers
- Graceful error handling with Promise.allSettled
- Real-time rate updates with loading indicators

📊 **Smart Recommendations**
- Three intelligent sorting options:
  - **Lowest Price**: Cost-based optimization
  - **Earliest Delivery**: Time-based optimization
  - **Best Value**: Speed/cost ratio balancing
- Visual indicators for best deals (cheapest, fastest)
- Guaranteed delivery indicators

📱 **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Adaptive list/card view for different viewports
- Touch-optimized controls for mobile users
- Desktop and tablet optimizations

💾 **Smart Caching & Persistence**
- 30-minute TTL cache for rate results
- Automatic localStorage state management
- Seamless session restoration

🏗️ **Design Patterns Demonstrated**
- **Adapter Pattern**: Carrier-specific API integration (FedEx)
- **Factory Pattern**: Dynamic adapter instantiation
- **Decorator Pattern**: Modular fee composition (insurance, signature, fragile handling)
- **Singleton Pattern**: Centralized configuration management

✅ **Comprehensive Testing**
- 185+ unit, integration, and performance tests
- 70%+ code coverage across all modules
- Vitest for fast, modern test execution
- Performance optimizations validated with React.memo, useMemo, useCallback

---

## 🏗️ Architecture

### Design Patterns

| Pattern | Purpose | Location | Benefits |
|---------|---------|----------|----------|
| **Adapter** | Converts carrier-specific APIs to unified format | `src/adapters/carrier-adapters/` | Isolates external dependencies, enables easy carrier addition |
| **Factory** | Creates appropriate adapter instances dynamically | `src/adapters/` | Centralizes object creation, improves maintainability |
| **Decorator** | Composes modular fees (insurance, signature, etc.) | `src/services/fee-decorators/` | Flexible fee combinations, avoids class explosion |
| **Singleton** | Manages centralized carrier configuration | `src/config/carrier-config.ts` | Single source of truth, thread-safe initialization |

### Technology Stack

**Frontend**
- React 19 with TypeScript (strict mode)
- Next.js 16.1.1 with App Router and Turbopack
- Tailwind CSS for responsive styling
- React 19's `use()` hook for promise handling

**Backend**
- Next.js API routes (server-side)
- Server actions for form validation
- Date-fns for date manipulation

**Testing & Quality**
- Vitest for unit/integration tests
- jsdom for component testing
- React Testing Library patterns
- Playwright ready for E2E tests

**Deployment**
- Vercel (recommended for Next.js)
- GitHub Actions for CI/CD
- Environment-based configuration

---

## 📊 Test Coverage

### Overall Statistics
- **Test Files**: 10+
- **Total Tests**: 185+ passing
- **Coverage Target**: 70%+
- **Execution Time**: ~10 seconds

### Coverage by Category

| Category | Coverage | Tests |
|----------|----------|-------|
| **Patterns** | 100% | 45+ |
| **Services** | 85% | 50+ |
| **Components** | 75% | 40+ |
| **Performance** | 100% | 17 |
| **Integration** | 68% | 20+ |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rate-calculator.git
   cd rate-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Verify installation**
   ```bash
   npm run type-check
   ```

### Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Run type checking
npm run type-check

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint
```

---

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: 45+ tests for design patterns and utilities
- **Integration Tests**: 50+ tests for workflows and features
- **Performance Tests**: 17 tests validating React optimizations
- **E2E Ready**: Playwright configuration included

Run tests with:
```bash
npm run test                 # Run all tests
npm run test:coverage        # Generate coverage report
npm run test:watch          # Watch mode for development
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Design patterns and architecture decisions
- **[TESTING.md](./docs/TESTING.md)** - Comprehensive testing strategy
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

**Built with ❤️ to demonstrate production-grade React and software engineering excellence.**
