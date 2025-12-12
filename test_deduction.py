#!/usr/bin/env python3
"""
Test script to verify the weekend deduction change from 1.0 to 2.0 units.
"""

from datetime import date
import sys
sys.path.insert(0, 'src')
from calculate import calculate_verguetung

# Test case 1: Exactly 2.0 WE units (threshold reached)
# Expected: 2.0 WE - 2.0 deduction = 0.0 paid → 0€ for WE
print("=" * 60)
print("Test 1: Exactly 2.0 WE units (threshold reached)")
print("=" * 60)

holidays = set()
plan_data = [
    (date(2025, 11, 7), "Alice"),   # Friday (WE)
    (date(2025, 11, 8), "Alice"),   # Saturday (WE)
]

results = calculate_verguetung(plan_data, holidays)
alice = results[0]
print(f"Employee: {alice['mitarbeiter']}")
print(f"WE Friday: {alice['we_freitag']}")
print(f"WE Other: {alice['we_andere']}")
print(f"WE Total: {alice['we_gesamt']}")
print(f"Threshold reached: {alice['schwelle_erreicht']}")
print(f"WE paid: {alice['we_bezahlt']}")
print(f"Payout WE: {alice['auszahlung_we']}€")
print(f"Payout Total: {alice['auszahlung_gesamt']}€")

if alice['we_gesamt'] == 2.0 and alice['we_bezahlt'] == 0.0 and alice['auszahlung_we'] == 0:
    print("✅ PASS: Correctly deducts 2.0 WE units, resulting in 0€")
else:
    print(f"❌ FAIL: Expected 0€ for WE, got {alice['auszahlung_we']}€")

# Test case 2: 3.0 WE units
# Expected: 3.0 WE - 2.0 deduction = 1.0 paid → 450€
print("\n" + "=" * 60)
print("Test 2: 3.0 WE units")
print("=" * 60)

plan_data = [
    (date(2025, 11, 7), "Bob"),   # Friday (WE)
    (date(2025, 11, 8), "Bob"),   # Saturday (WE)
    (date(2025, 11, 9), "Bob"),   # Sunday (WE)
]

results = calculate_verguetung(plan_data, holidays)
bob = results[0]
print(f"Employee: {bob['mitarbeiter']}")
print(f"WE Friday: {bob['we_freitag']}")
print(f"WE Other: {bob['we_andere']}")
print(f"WE Total: {bob['we_gesamt']}")
print(f"Threshold reached: {bob['schwelle_erreicht']}")
print(f"WE paid: {bob['we_bezahlt']}")
print(f"Payout WE: {bob['auszahlung_we']}€")
print(f"Payout Total: {bob['auszahlung_gesamt']}€")

if bob['we_gesamt'] == 3.0 and bob['we_bezahlt'] == 1.0 and bob['auszahlung_we'] == 450:
    print("✅ PASS: Correctly deducts 2.0 WE units, resulting in 450€")
else:
    print(f"❌ FAIL: Expected 450€ for WE, got {bob['auszahlung_we']}€")

# Test case 3: 1.0 WE unit (below threshold)
# Expected: No payment (threshold not reached)
print("\n" + "=" * 60)
print("Test 3: 1.0 WE units (below threshold)")
print("=" * 60)

plan_data = [
    (date(2025, 11, 8), "Charlie"),   # Saturday (WE)
]

results = calculate_verguetung(plan_data, holidays)
charlie = results[0]
print(f"Employee: {charlie['mitarbeiter']}")
print(f"WE Total: {charlie['we_gesamt']}")
print(f"Threshold reached: {charlie['schwelle_erreicht']}")
print(f"WE paid: {charlie['we_bezahlt']}")
print(f"Payout WE: {charlie['auszahlung_we']}€")
print(f"Payout Total: {charlie['auszahlung_gesamt']}€")

if charlie['we_gesamt'] == 1.0 and charlie['we_bezahlt'] == 0.0 and charlie['auszahlung_we'] == 0:
    print("✅ PASS: Below threshold, no payment")
else:
    print(f"❌ FAIL: Expected 0€, got {charlie['auszahlung_we']}€")

# Test case 4: Mixed WT and WE (2 WT + 2 WE)
# Expected: WT always paid (500€), WE: 2.0 - 2.0 = 0 paid (0€), Total: 500€
print("\n" + "=" * 60)
print("Test 4: 2.0 WT + 2.0 WE units")
print("=" * 60)

plan_data = [
    (date(2025, 11, 3), "Diana"),   # Monday (WT)
    (date(2025, 11, 4), "Diana"),   # Tuesday (WT)
    (date(2025, 11, 7), "Diana"),   # Friday (WE)
    (date(2025, 11, 8), "Diana"),   # Saturday (WE)
]

results = calculate_verguetung(plan_data, holidays)
diana = results[0]
print(f"Employee: {diana['mitarbeiter']}")
print(f"WT units: {diana['wt_einheiten']}")
print(f"WE Total: {diana['we_gesamt']}")
print(f"Threshold reached: {diana['schwelle_erreicht']}")
print(f"WE paid: {diana['we_bezahlt']}")
print(f"Payout WT: {diana['auszahlung_wt']}€")
print(f"Payout WE: {diana['auszahlung_we']}€")
print(f"Payout Total: {diana['auszahlung_gesamt']}€")

if diana['wt_einheiten'] == 2.0 and diana['auszahlung_wt'] == 500 and diana['we_bezahlt'] == 0.0 and diana['auszahlung_we'] == 0 and diana['auszahlung_gesamt'] == 500:
    print("✅ PASS: WT paid (500€), WE deducted completely (0€), Total: 500€")
else:
    print(f"❌ FAIL: Expected total 500€, got {diana['auszahlung_gesamt']}€")

print("\n" + "=" * 60)
print("Test Summary")
print("=" * 60)
print("All tests verify that the deduction is now 2.0 WE units (not 1.0)")
print("This matches the business requirement from the issue.")
