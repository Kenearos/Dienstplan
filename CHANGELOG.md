# Changelog

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
