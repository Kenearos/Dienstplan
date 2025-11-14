# Android Dienstplan NRW App

Android mobile app for managing duty rosters (Dienstplan) with automatic payroll calculations according to NRW rules (Variante 2 - streng).

## Features

- ✅ Month selection interface
- ✅ Simple duty entry with employee name and share (Anteil)
- ✅ Automatic payroll calculation
- ✅ NRW holiday recognition
- ✅ Weekend/Holiday shift classification
- ✅ Threshold-based WE compensation (Variante 2 - streng)
- ✅ Results display with detailed breakdown

## Business Rules (Variante 2 - streng)

Same as the Python/Excel implementation:

- **WE-Tag** (Weekend/Holiday): Friday, Saturday, Sunday, public holidays, day before public holiday
- **WT-Tag** (Weekday): All other days
- **WT compensation**: Always 250€ per unit
- **WE compensation**: Only paid if monthly total ≥ 2.0 WE units
  - If threshold reached: 450€ per WE unit, then deduct exactly 1.0 WE unit
  - Deduction priority: Friday first, then other WE days
  - Below threshold: 0€ for WE shifts

## Requirements

- Android Studio Arctic Fox or later
- Android SDK 24+ (Android 7.0 Nougat)
- Kotlin 1.9.10
- Gradle 8.1.4

## Installation

### Option 1: Android Studio

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to the `android-app` directory
4. Wait for Gradle sync to complete
5. Click "Run" or press Shift+F10

### Option 2: Command Line

```bash
cd android-app
./gradlew build
./gradlew installDebug
```

## Usage

1. **Select Month**: Choose year and month from the dropdowns on the main screen
2. **Enter Duties**: Click "Dienste eintragen" to add duty entries
   - Select a date from the month
   - Enter employee name
   - Enter share/portion (Anteil) between 0.0 and 1.0
   - Save the duty
3. **View Results**: Click "Auswertung anzeigen" to see payroll calculations
   - Shows breakdown per employee
   - Displays WT units, WE units, threshold status, and payouts

## Project Structure

```
android-app/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/dienstplan/nrw/
│   │   │   │   ├── MainActivity.kt           # Main screen with month selection
│   │   │   │   ├── DutyEntryActivity.kt      # Duty entry screen
│   │   │   │   ├── ResultsActivity.kt        # Results/Auswertung screen
│   │   │   │   ├── model/
│   │   │   │   │   ├── DutyEntry.kt          # Duty entry data model
│   │   │   │   │   ├── Holiday.kt            # Holiday data model
│   │   │   │   │   └── PayrollResult.kt      # Payroll calculation result
│   │   │   │   └── data/
│   │   │   │       ├── DutyDataStore.kt      # In-memory data storage
│   │   │   │       ├── HolidayProvider.kt    # NRW holidays data
│   │   │   │       └── PayrollCalculator.kt  # Business logic engine
│   │   │   ├── res/                          # Resources (layouts, strings, colors)
│   │   │   └── AndroidManifest.xml
│   │   └── test/                             # Unit tests
│   └── build.gradle.kts                      # App build configuration
├── build.gradle.kts                          # Project build configuration
├── settings.gradle.kts                       # Project settings
└── README.md                                 # This file
```

## Data Storage

Currently uses in-memory storage (`DutyDataStore`). Data is lost when the app is closed.

For production use, this should be replaced with:
- Room database for persistent local storage
- Or backend API integration for cloud storage

## Testing

### Unit Tests

Run unit tests with:

```bash
./gradlew test
```

### UI Tests

Run instrumented tests with:

```bash
./gradlew connectedAndroidTest
```

## Customization

### Changing Payroll Rules

Edit `PayrollCalculator.kt` and modify the constants:
- `RATE_WT`: Weekday rate (default 250€)
- `RATE_WE`: Weekend rate (default 450€)
- `WE_THRESHOLD`: Threshold for WE compensation (default 2.0)
- `DEDUCTION_AFTER_THRESHOLD`: Deduction amount (default 1.0)

### Adding Holidays

Edit `HolidayProvider.kt` and add entries to the holiday lists for additional years.

## Known Limitations

- Data is not persisted (in-memory only)
- No data export/import functionality
- No multi-user support
- Only NRW holidays (2025-2026)
- German language only

## Future Enhancements

- [ ] Room database for data persistence
- [ ] Export to Excel/PDF
- [ ] Import from Excel
- [ ] Multi-Bundesland support
- [ ] Data backup/restore
- [ ] Dark mode support
- [ ] Tablet layout optimization

## License

MIT

## Credits

Based on the Python/Excel Dienstplan Generator implementation by Kenearos.
