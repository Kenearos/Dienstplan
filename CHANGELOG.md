# Changelog

## 2025-11-14 - Android App Implementation

### Feature
Added native Android mobile app for duty roster management with the same NRW Variante 2 (streng) payroll calculation logic as the Python/Excel version.

### Details

**New Android App:**
- Location: `android-app/` directory
- Language: Kotlin
- Min SDK: Android 7.0 (API 24)
- Target SDK: Android 14 (API 34)

**Features:**
- Month selection interface (2025-2030)
- Duty entry with employee name and share (Anteil)
- Automatic payroll calculation
- Results display with detailed breakdown per employee
- In-memory data storage

**Business Logic:**
- Same NRW holidays (2025-2026)
- Same WE-Tag detection (Friday, Saturday, Sunday, holidays, day before holiday)
- Same WT-Tag classification
- Same compensation rates (WT: 250€, WE: 450€)
- Same threshold logic (≥ 2.0 WE units)
- Same deduction rules (2.0 units, Friday priority)
- Same Variante 2 behavior (no WE compensation below threshold)

**Testing:**
- Comprehensive unit tests for PayrollCalculator
- All test cases passed (under threshold, at threshold, over threshold, Friday priority, multiple employees)

**Documentation:**
- Android-specific README with setup instructions
- Main README updated to mention Android app
- .gitignore updated for Android build artifacts

### Usage

See [android-app/README.md](android-app/README.md) for detailed Android setup and usage instructions.

### Known Limitations
- Data is not persisted (in-memory only)
- No data export/import functionality
- German language only

---

## 2025-11-14 - Fix Excel Formula Syntax Error

### Issue
Fixed a syntax error in the Checks sheet that would cause Excel formula errors.

### Details
The nested WENN (IF) formula in the Checks sheet Status column was missing a semicolon between the empty string result and the second WENN function.

**File:** `src/build_template.py`, line 264

**Before:**
```excel
=WENN(A2="";""WENN(ABS(B2-1)<=0,0001;"OK";"FEHLER"))
```

**After:**
```excel
=WENN(A2="";"";WENN(ABS(B2-1)<=0,0001;"OK";"FEHLER"))
```

### Impact
This fix ensures that the Checks sheet Status column works correctly to validate that daily shift totals sum to 1.0, displaying "OK" or "FEHLER" as appropriate.

### Testing
- Template rebuilt successfully
- November 2025 file generated without errors
- All formulas verified syntactically correct
- No security issues found (CodeQL scan: 0 alerts)

### How to Use
To generate a corrected November 2025 file:

```bash
# 1. Rebuild the template with the fix
python src/build_template.py

# 2. Generate November 2025
python src/fill_plan_dates.py 2025 11

# 3. Open output/Dienstplan_2025_11_NRW.xlsx in Excel
```

The file will now work correctly with all formulas calculating as expected according to the Variante 2 (streng) rules specified in SPECIFICATION.md.
