# Dienstplan Generator - NRW (Variante 2 "streng")

This is a Python project for automatically generating duty rosters (Dienstplan) with payroll calculations according to NRW (North Rhine-Westphalia, Germany) rules, specifically "Variante 2" which is the strict variant.

## Project Overview

**Purpose**: Automate creation of monthly duty rosters with automatic payroll calculations for weekend/holiday shifts with specific threshold-based compensation rules.

**Language**: Python 3.12+
**Key Library**: openpyxl (for Excel file manipulation)
**Output**: Excel workbooks (.xlsx) with multiple sheets including duty plans, rules, holidays, and automated payroll calculations

## Project Structure

```
.
├── src/
│   ├── build_template.py   # Creates the base Excel template with all formulas
│   ├── fill_plan_dates.py  # Fills the template with dates for a specific month
│   ├── read_excel.py       # Utility for reading Excel files
│   └── main.py             # Legacy demo script (not main entry point)
├── output/                 # Generated monthly duty rosters (gitignored)
├── templates/              # Base template files (gitignored, generated)
├── requirements.txt        # Python dependencies (openpyxl==3.1.2)
├── SPECIFICATION.md        # Complete business rules and Excel formulas (German)
└── README.md              # User documentation (German)
```

## Setup Instructions

1. **Create virtual environment** (if not exists):
   ```bash
   python -m venv .venv
   ```

2. **Activate virtual environment**:
   - Windows PowerShell: `.\.venv\Scripts\Activate.ps1`
   - Linux/Mac: `source .venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Creating Monthly Duty Rosters

1. **Build template** (first time or after template changes):
   ```bash
   python src/build_template.py
   ```
   This creates `templates/Dienstplan_Vorlage_V2_NRW.xlsx` with all formulas

2. **Generate a specific month**:
   ```bash
   python src/fill_plan_dates.py 2025 11  # November 2025
   python src/fill_plan_dates.py 2025 12  # December 2025
   ```
   This creates `output/Dienstplan_YYYY_MM_NRW.xlsx` pre-filled with all dates

3. **Manual data entry in Excel**:
   - Open the generated file
   - Go to "Plan" sheet
   - Enter employee names in column B
   - Enter work share (Anteil) in column C (0.5 = half shift, 1.0 = full shift)
   - Go to "Auswertung" sheet and list all employees in column A
   - All calculations happen automatically

## Domain-Specific Context

### Business Rules (Variante 2 - "streng")

**WE-Tag** (Weekend/Holiday shift) includes:
- Friday, Saturday, Sunday
- Public holidays (Bundesland-specific, currently NRW)
- Day before a public holiday ("Vortag")

**WT-Tag** (Weekday shift):
- All days that are NOT WE-Tag
- Always compensated at 250€ per unit

**WE Compensation (strict variant)**:
- Only paid if monthly total ≥ 2.0 WE units (threshold)
- If threshold reached: 450€ per WE unit
- After reaching threshold: subtract exactly 1.0 WE unit (priority: Friday first, then other WE days)
- Below threshold: 0€ for WE shifts (NOT converted to WT compensation)

### Excel Structure

The generated Excel workbooks contain these sheets:

1. **README**: Quick reference for users
2. **Regeln**: Parameters (rates, threshold, Bundesland selection, month selection)
3. **Feiertage**: Table of public holidays (tblFeiertage) with Date, Name, BL columns
4. **Plan**: Main data entry (tblPlan) - Date, Employee (Mitarbeiter), Share (Anteil)
5. **Auswertung**: Automatic payroll calculations per employee per month
6. **Checks**: Quality checks (e.g., daily shift shares should sum to 1.0)

### Key German Terms

- **Dienstplan** = Duty roster
- **Mitarbeiter** = Employee
- **Anteil** = Share/portion (0.5 = half shift, 1.0 = full shift)
- **WE** = Wochenende (Weekend/Holiday)
- **WT** = Werktag (Weekday)
- **Feiertag** = Public holiday
- **Vortag** = Day before
- **Schwelle** = Threshold
- **Abzug** = Deduction
- **Auszahlung** = Payout
- **Bundesland (BL)** = German federal state
- **NRW** = Nordrhein-Westfalen (North Rhine-Westphalia)

## Code Style

- Use German variable names in Excel formulas (matches SPECIFICATION.md)
- Use English in Python code with German terms in comments where needed
- Follow PEP 8 for Python code
- Use descriptive variable names
- Add docstrings to functions explaining business logic
- Comment complex Excel formula generation with business rule references

## Excel Formula Guidelines

- Use German Excel function names (e.g., `SUMMENPRODUKT`, `WENN`, `MONATSENDE`)
- Use semicolon `;` as argument separator (German Excel convention)
- Use comma `,` as decimal separator in Excel
- Prefer `SUMMENPRODUKT` over Office 365-specific functions for compatibility
- Always handle empty cells with `WENN` guards to avoid errors
- Use tolerance of 0.0001 for threshold comparisons (floating-point safety)

## Testing

Currently, the project has no automated tests. Manual testing involves:

1. **Template generation test**:
   ```bash
   python src/build_template.py
   # Check: templates/Dienstplan_Vorlage_V2_NRW.xlsx exists and opens
   ```

2. **Month generation test**:
   ```bash
   python src/fill_plan_dates.py 2025 11
   # Check: output/Dienstplan_2025_11_NRW.xlsx exists with November dates
   ```

3. **Business logic tests** (manual in Excel):
   - Enter test data according to test cases in SPECIFICATION.md
   - Verify calculations match expected results
   - Test edge cases: under threshold (< 2.0), exactly at threshold (2.0), over threshold

## Common Tasks

### Adding a New Holiday

Edit `src/build_template.py`:
- Add to `NRW_HOLIDAYS_2025` or `NRW_HOLIDAYS_2026` lists
- Rebuild template: `python src/build_template.py`

### Changing Payroll Rules

Edit `src/build_template.py` in `_populate_rules()`:
- Modify Satz_WT, Satz_WE, WE_Schwelle, or Abzug_nach_WE_Schwelle defaults
- Rebuild template: `python src/build_template.py`

### Supporting a New Bundesland

1. Add holiday data in `src/build_template.py`
2. Ensure BL_Auswahl dropdown includes the new state
3. The formulas already filter holidays by BL automatically

## Known Limitations

- No automated tests
- Template must be regenerated after code changes (not dynamic)
- Only NRW holidays pre-populated (2025-2026)
- Excel must support tables and formulas (no LibreOffice/Google Sheets tested)
- German Excel required (function names, argument separators)

## Important Files

- **SPECIFICATION.md**: Complete source of truth for business rules and Excel formulas (in German)
- **README.md**: User-facing documentation (in German)
- **src/build_template.py**: Main implementation of Excel template with all formulas
- **src/fill_plan_dates.py**: CLI tool for generating monthly files

## When Making Changes

1. **Business rule changes**: Update SPECIFICATION.md first, then implement in build_template.py
2. **Formula changes**: Test in Excel manually with edge cases before committing
3. **Python changes**: Ensure backwards compatibility with existing templates
4. **Always**: Regenerate template and test with a sample month after changes

## Dependencies

- Python 3.12+ (developed with 3.12.3)
- openpyxl 3.1.2 (Excel file manipulation)
- No other external dependencies

## File Encoding

- Python files: UTF-8
- Excel files: Binary .xlsx format
- All text content supports German umlauts (ä, ö, ü, ß)
