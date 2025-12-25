# Test Suite - Dienstplan Bonusrechner

Automatische Test Suite für die Web-App.

## Schnellstart

1. **Server starten** (falls noch nicht gestartet):
   ```bash
   cd webapp
   python3 -m http.server 8000
   ```

2. **Test-Seite öffnen**:
   ```
   http://localhost:8000/test.html
   ```

3. **Tests ausführen**:
   - Klicken Sie auf "Alle Tests ausführen"
   - Warten Sie auf die Ergebnisse
   - ✅ = Test bestanden
   - ❌ = Test fehlgeschlagen

## Was wird getestet?

### 1. Holiday Provider (NRW-Feiertage)
- ✅ Feiertage werden korrekt erkannt
- ✅ Normale Tage werden nicht als Feiertage erkannt
- ✅ Tag vor Feiertag wird erkannt
- ✅ Spezifische Feiertage (Fronleichnam, etc.)

### 2. Calculator - Tag-Klassifizierung
- ✅ Freitag ist qualifizierend
- ✅ Samstag ist qualifizierend
- ✅ Sonntag ist qualifizierend
- ✅ Normale Wochentage (Mo-Do) sind nicht qualifizierend
- ✅ Feiertage sind qualifizierend
- ✅ Tag vor Feiertag ist qualifizierend

### 3. Calculator - Bonusberechnung
**Schwellenwert-Tests:**
- ✅ Unter Schwellenwert (1.0 WE-Tag) → 0€
- ✅ Genau Schwellenwert (2.0 WE-Tage) → 0€
- ✅ Über Schwellenwert (3.0 WE-Tage) → 450€

**Gemischte Dienste:**
- ✅ Normale Tage + WE-Tage korrekt berechnet
- ✅ Halbe Dienste korrekt berechnet
- ✅ Feiertag + Vortag-Kombination

**Spezialfälle:**
- ✅ Keine Dienste → 0€
- ✅ 2x halbe Samstage zählen als 1 ganzer Tag

### 4. Storage (Datenverwaltung)
- ✅ Mitarbeiter hinzufügen
- ✅ Doppelte Mitarbeiter werden abgelehnt
- ✅ Mitarbeiter entfernen
- ✅ Dienste hinzufügen und abrufen
- ✅ Dienste aktualisieren (gleicher Tag)
- ✅ Mehrere Mitarbeiter verwalten
- ✅ Export und Import von Daten

### 5. Edge Cases
- ✅ Rundungsfehler bei Schwellenwert
- ✅ Performance bei vielen Diensten (30+ Tage)
- ✅ Schaltjahre (29. Februar)

## Test-Statistiken

Nach dem Durchlauf sehen Sie:
- **Gesamt**: Anzahl aller Tests
- **Bestanden**: Anzahl erfolgreicher Tests
- **Fehlgeschlagen**: Anzahl fehlgeschlagener Tests

## Testfälle im Detail

### Beispiel 1: Schwellenwert genau erreicht
```javascript
Dienste:
- 1× Samstag (1.0)
- 1× Sonntag (1.0)

Erwartung:
- Qualifizierende Tage: 2.0
- Schwellenwert: ✅ Erreicht
- Abzug: -2.0
- Bezahlt: 0.0 × 450€ = 0€
```

### Beispiel 2: Gemischte Dienste
```javascript
Dienste:
- 2× Montag (2.0 normale Tage)
- 2× Samstag (2.0 qualifizierende Tage)

Erwartung:
- Normale Tage: 2.0 × 250€ = 500€
- Qualifizierende Tage: (2.0 - 2.0) × 450€ = 0€
- Gesamt: 500€
```

### Beispiel 3: Halbe Dienste
```javascript
Dienste:
- 1× Montag halber Dienst (0.5)
- 1× Samstag halber Dienst (0.5)
- 1× Sonntag ganzer Dienst (1.0)
- 1× Freitag ganzer Dienst (1.0)

Erwartung:
- Normale Tage: 0.5 × 250€ = 125€
- Qualifizierende Tage: (2.5 - 2.0) × 450€ = 225€
- Gesamt: 350€
```

## Tests erweitern

Um einen neuen Test hinzuzufügen, bearbeiten Sie `test-suite.js`:

```javascript
runner.test('Testname', (t) => {
    // Setup
    const calculator = new BonusCalculator(new HolidayProvider());

    const duties = [
        { date: new Date('2025-11-22T12:00:00'), share: 1.0 }
    ];

    // Ausführung
    const result = calculator.calculateMonthlyBonus(duties);

    // Assertions
    t.assertEqual(result.totalBonus, 0, 'Erwarteter Bonus');
    t.assertTrue(result.thresholdReached, 'Schwelle erreicht');
});
```

### Verfügbare Assertions

- `assertEqual(actual, expected, message)` - Exakte Gleichheit
- `assertAlmostEqual(actual, expected, tolerance, message)` - Ungefähre Gleichheit (für Fließkommazahlen)
- `assertTrue(value, message)` - Wert sollte true sein
- `assertFalse(value, message)` - Wert sollte false sein

## Troubleshooting

### Tests schlagen fehl
1. Prüfen Sie die Fehlermeldung (wird rot angezeigt)
2. Überprüfen Sie die erwarteten vs. erhaltenen Werte
3. Testen Sie die Funktion manuell in der Haupt-App

### Performance-Probleme
- Die Test Suite sollte in < 1 Sekunde durchlaufen
- Bei Verzögerungen: Browser-Konsole prüfen (F12)

### LocalStorage-Konflikte
- Tests verwenden die gleiche LocalStorage-Instanz wie die Haupt-App
- Bei Problemen: LocalStorage im Browser löschen
- Oder: Tests in Inkognito-Modus ausführen

## Continuous Integration

Die Tests können auch automatisiert mit Headless-Browsern ausgeführt werden:

```bash
# Mit Playwright
npx playwright test

# Mit Puppeteer
node run-tests-headless.js
```

(Erfordert zusätzliche Setup-Schritte)

## Test-Abdeckung

Aktuelle Abdeckung:
- **Feiertage**: 100% (alle NRW-Feiertage getestet)
- **Tag-Klassifizierung**: 100% (alle Wochentage + Feiertage)
- **Bonusberechnung**: ~95% (Hauptszenarien + Edge Cases)
- **Storage**: ~90% (CRUD-Operationen)
- **UI**: 0% (keine UI-Tests, nur Logik)

## Bekannte Limitierungen

1. **Keine UI-Tests**: Nur Logik-Tests, keine Interaktions-Tests
2. **Browser-abhängig**: LocalStorage-Tests funktionieren nur im Browser
3. **Keine Netzwerk-Tests**: Kein Server-seitiger Code
4. **Zeitzone**: Tests gehen von deutscher Zeitzone aus

## Best Practices

1. **Tests vor Änderungen ausführen**: Sicherstellen, dass alles funktioniert
2. **Nach Änderungen erneut testen**: Regression verhindern
3. **Neue Features = Neue Tests**: Test-first development
4. **Tests dokumentieren**: Klare Namen und Kommentare

## Lizenz

MIT (wie Hauptprojekt)
