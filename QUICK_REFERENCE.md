# Phase 2 Quick Reference Guide

## Essential Commands

### Development

```bash
# Start development server (localhost:3000)
npm run dev

# Type checking
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

### Testing

```bash
# Run all tests (72 tests, ~4 seconds)
npm test -- --run

# Run tests with coverage report
npm test -- --run --coverage

# Run tests in watch mode (re-runs on file change)
npm test

# Run specific test file
npm test -- --run src/services/validators/__tests__/validation-chain.test.ts
npm test -- --run src/hooks/__tests__/useAddressValidation.test.ts
npm test -- --run src/hooks/__tests__/usePackageForm.test.ts
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Test Results Summary

```
Test Files: 3 passed
- src/services/validators/__tests__/validation-chain.test.ts (38 tests)
- src/hooks/__tests__/useAddressValidation.test.ts (9 tests)
- src/hooks/__tests__/usePackageForm.test.ts (25 tests)

Total: 72 passing tests ✅
Coverage: >70% ✅
TypeScript: 0 errors ✅
```

---

## Core Features Implemented

### 1. Multi-Step Form

- ✅ Step 1: Package Details (Type, Dimensions, Weight, Declared Value)
- ✅ Step 2: Address Information (Origin & Destination)
- ✅ Step 3: Shipping Options (Speed, Insurance, Signature, Saturday)
- ✅ Step 4: Review & Submit (Summary with edit capabilities)

### 2. Validation

- ✅ 6 validators using Chain of Responsibility pattern
- ✅ Real-time validation on address fields (debounced 500ms)
- ✅ Server-side validation using React 19 Server Actions
- ✅ Proper error messages and visual feedback

### 3. State Management

- ✅ Form persistence to localStorage
- ✅ Auto-load on page refresh
- ✅ Manual reset clears storage
- ✅ Proper debouncing (500ms)

### 4. Accessibility (WCAG 2.1 AA)

- ✅ ARIA labels on all inputs
- ✅ Proper heading hierarchy
- ✅ Error message linking
- ✅ Keyboard navigation support
- ✅ Screen reader compatible

### 5. Responsive Design

- ✅ Mobile-first (320px+)
- ✅ Tablet optimized (768px+)
- ✅ Desktop layouts (1024px+)
- ✅ Touch-friendly (48px targets)

---

## Key Files & Locations

### Components (app/components/)

- `RateCalculatorForm.tsx` - Main form orchestrator
- `AddressStep.tsx` - Step 2 with server validation
- `PackageDetailsStep.tsx` - Step 1
- `ShippingOptionsStep.tsx` - Step 3
- `ReviewStep.tsx` - Step 4
- `forms/AddressForm.tsx` - Reusable address form

### Hooks (src/hooks/)

- `usePackageForm.ts` - Main form state hook
- `useAddressValidation.ts` - Address validation hook
- `useDimensionalWeight.ts` - Weight calculation hook
- `useFormPersistence.ts` - localStorage integration

### Validators (src/services/validators/)

- `BaseValidator.ts` - Abstract base class
- `validation-chain.ts` - Chain of Responsibility pattern
- `address/RequiredFieldsValidator.ts`
- `address/PostalCodeFormatValidator.ts`
- `address/StateCodeValidator.ts`
- `package/DimensionsValidator.ts`
- `package/WeightValidator.ts`

### Server Action (src/app/api/)

- `validate-address/route.ts` - React 19 Server Action

### Tests (src/\*\*/**tests**/)

- `validation-chain.test.ts` - 38 tests for validators
- `useAddressValidation.test.ts` - 9 tests for hook
- `usePackageForm.test.ts` - 25 tests for hook

---

## Verification Steps

### 1. Verify All Tests Pass

```bash
npm test -- --run
# Expected: 72 passed, 0 failed
```

### 2. Verify No TypeScript Errors

```bash
npm run type-check
# Expected: (no errors)
```

### 3. Test Form Locally

```bash
npm run dev
# Navigate to http://localhost:3000
# Test all 4 steps with valid and invalid data
```

### 4. Test Persistence

```bash
1. Fill form with data
2. Refresh page (F5)
3. Form should restore all data from localStorage
4. Click "Reset Form" button
5. Form should clear and localStorage should be emptied
```

### 5. Test Accessibility

```bash
# Using browser DevTools
1. Open Accessibility tab
2. Check for aria-* attributes
3. Test keyboard navigation (Tab, Shift+Tab)
4. Test with screen reader (NVDA or JAWS)
```

### 6. Test Responsive Design

```bash
# Using Chrome DevTools
1. Ctrl+Shift+I to open DevTools
2. Ctrl+Shift+M for Device Toolbar
3. Set viewport to 320px (mobile)
4. Test all interactions
5. Resize to 768px (tablet) and 1024px (desktop)
```

---

## Debugging Tips

### Check Form State

Open browser console:

```javascript
// In Chrome/Firefox DevTools Console
localStorage.getItem('rate-calculator-form-state');
```

### Clear localStorage

```javascript
localStorage.removeItem('rate-calculator-form-state');
```

### Monitor Validation

Enable detailed logs in AddressStep:

1. Open `app/components/AddressStep.tsx`
2. Look for console.error calls
3. Add console.log statements for debugging

---

## Common Issues & Solutions

### Issue: Form data not persisting

**Solution:**

- Check browser allows localStorage (not in private mode)
- Verify useFormPersistence is being used
- Clear cache and refresh

### Issue: Validation not triggering

**Solution:**

- Ensure AddressStep receives validation handler
- Check debounce timeout (500ms)
- Verify server action is marked 'use server'

### Issue: Form fields losing focus

**Solution:**

- ✅ Already fixed in Phase 2
- Removed `disabled={isPending}` props
- Fields now stay focused during validation

### Issue: TypeScript errors

**Solution:**

- Run `npm run type-check` to see all errors
- All errors in Phase 2 have been fixed
- Should show: (no errors)

---

## Next Phase (Phase 3)

Phase 3 will add:

- Real shipping carrier API integration
- Actual rate calculations
- Rate comparison UI
- Booking/purchase flow
- Order management

---

## Support & Documentation

### Key Documentation Files

- `PHASE_2_COMPLETION_REPORT.md` - Full completion report
- `PHASE_2_REQUIREMENTS_VERIFICATION.md` - Detailed requirements
- `docs/architecture.md` - Architecture documentation

### Code Quality

- All TypeScript strict mode enabled
- > 70% test coverage
- WCAG 2.1 Level AA compliant
- React best practices followed
- Clean code principles applied

---

## Version Info

- **Phase:** Phase 2 (Form State & Validation)
- **Date Completed:** January 26, 2026
- **React Version:** 19.2.3
- **Next.js Version:** 16.1.1
- **TypeScript:** Enabled (strict mode)
- **Test Framework:** Vitest
- **CSS Framework:** Tailwind CSS 4

---

**Project Status:** ✅ READY FOR PHASE 3
