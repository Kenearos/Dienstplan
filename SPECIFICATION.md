# README.txt — Monatsplan mit automatischer Vergütung (Variante 2 „streng")

Stand: 14.11.2025 (Deutschland)

## Ziel

Diese README beschreibt vollständig, wie eine Excel-Arbeitsmappe aufgebaut wird, die Monatsdienste erfasst und automatisch die Vergütung ermittelt – inkl. Erkennung von Wochenend-/Feiertagsdiensten (inkl. Vortag), Schwellenlogik und Abzug 1,0 WE-Einheit. Variante 2 (streng) ist aktiv: WE-Dienste werden nur vergütet, wenn im Monat mindestens 2,0 WE-Einheiten erreicht werden; sonst 0 €. Wochentage (kein WE) werden stets vergütet.

Hinweise:
- Region: Deutschland, Bundesland wählbar (steuert Feiertage).
- Excel-Region: deutsches Excel (Funktionsargumente „;", Dezimal „,").
- Monatsbezug: Regeln!Monat_Auswahl (erster Tag des Monats).

## Fachliche Regeln (Single Source of Truth)

### Begriffe

- **WE-Tag** (Wochenend-/Feiertagsdienst) ist jeder:
  - Freitag, Samstag, Sonntag
  - gesetzlicher Feiertag des gewählten Bundeslands
  - der Tag vor einem gesetzlichen Feiertag (Vortag)
- **WT-Tag** (Wochentag): jeder Tag, der kein WE-Tag ist.

### Vergütung

- **Schwelle**: Gesamter Bonus (WT + WE) wird nur gezahlt, wenn Monats-Summe WE-Einheiten je Person ≥ 2,0.
- **WT** (kein WE-Tag):
  - Wenn WE-Schwelle erreicht: 250 € pro 1,0 Einheit (Splits anteilig).
  - Wenn WE-Schwelle nicht erreicht: 0 € (kein Bonus).
- **WE** (WE-Tag):
  - Wenn Monats-Summe WE-Einheiten < 2,0 → Auszahlung 0 € für alle WE-Einheiten.
  - Wenn Monats-Summe WE-Einheiten ≥ 2,0 → Auszahlung 450 €/WE-Einheit,
    anschließend Abzug genau 1,0 WE-Einheit (max. 1× pro Person/Monat).
  - Abzugs-Priorität: zuerst aus Freitag-WE-Einheiten, Rest aus den übrigen WE-Einheiten (Sa/So/Feiertag/Vortag). Chronologie muss nicht nachgebildet werden; es genügt die Priorität nach Kategorie.

### Splits/Anteile

- Pro Dienst Eintrag mit Anteil in (0,0 … 1,0]; mehrere Einträge pro Datum möglich.
- Summe der Anteile je Datum soll 1,0 sein (Ampel-/Plausibilitätscheck).

### Grenzen und Klarstellungen

- Schwelle gilt je Person und Kalendermonat.
- Abzug wird nur angewandt, wenn Schwelle erreicht (≥ 2,0).
- **Gesamter Bonus (WT + WE) wird nur gezahlt, wenn WE-Schwelle (≥ 2,0) erreicht wird.**
- Unterhalb der Schwelle: Auszahlung = 0 € (weder WT noch WE werden vergütet).
- Rundung: Bei Schwellenprüfung Toleranz 1e-4 (z. B. 1,99995 ≈ 2,0).

## Parameter (Blatt „Regeln")

- Satz_WT = 250
- Satz_WE = 450
- WE_Schwelle = 2,0
- Abzug_nach_WE_Schwelle = 1,0
- BL_Auswahl = Dropdown (z. B. BW, BY, BE, …)
- Monat_Auswahl = Datum (erster Tag des Zielmonats, z. B. 01.11.2025)
- Variante = 2  (fix auf „streng")

Optional dokumentieren:
- Version, Autor, Änderungsdatum, Kurzregeln.

## Datei-/Blattstruktur

### 1) Regeln
- Parameter s. oben
- Kurzbeschreibung (Was/Wie/Stand)

### 2) Feiertage
Tabelle „tblFeiertage" mit Spalten:
- Datum  (Datum)
- Name   (Text)
- BL     (Text, Kürzel des Bundeslandes)

Beispiel-CSV-Schema: Datum;Name;BL

### 3) Plan (Erfassung)
Tabelle „tblPlan" (Eingabe durch Nutzer):
- Datum      (Datum, Pflicht)
- Mitarbeiter (Text, Pflicht)
- Anteil     (Zahl, 0<Anteil≤1; Summe je Datum ≈ 1,0)

Hilfsspalten (Formeln, verborgen oder am Rand):
- Ist_FEIERTAG, Ist_VORTAG, Ist_Freitag, Ist_WE_Tag, Ist_WT_Tag
- MonatKey (YYYYMM-Marker für Monat_Auswahl)

### 4) Auswertung (je Person, je Monat)
Tabelle „tblAuswertung":
- Mitarbeiter
- WT_Einheiten
- WE_Freitag
- WE_Andere
- WE_Gesamt
- WE_Schwelle_erreicht (JA/NEIN)
- Abzug_gesamt, Abzug_von_Freitag, Abzug_von_Andere
- WE_bezahlt
- Auszahlung_WT, Auszahlung_WE, Auszahlung_Gesamt

### 5) Checks (Qualität/Prüfungen)
- Ampel „Summe Anteile je Datum = 1,0"
- Liste Unstimmigkeiten (z. B. fehlender Mitarbeiter, Datum außerhalb Monat)

## Benannte Bereiche (empfohlen)

- Regeln!Satz_WT, Regeln!Satz_WE, Regeln!WE_Schwelle, Regeln!Abzug_nach_WE_Schwelle
- Regeln!BL_Auswahl, Regeln!Monat_Auswahl, Regeln!Variante
- Feiertage_Termine (dynamisch gefilterte Feiertage des gewählten BL)

## Formeln (deutsches Excel)

Hinweis: Funktionsargumente mit „;". Für Office 365 werden FILTER/LET/XLOOKUP verwendet. Für Nicht‑365 stehen SUMMENPRODUKT‑Alternativen weiter unten.

### A) Feiertage_Termine (benannter Bereich, Office 365)
In Namen-Manager:
```
=FILTER(tblFeiertage[Datum];tblFeiertage[BL]=Regeln!BL_Auswahl)
```

### B) Erkennung im Blatt Plan (je Zeile der tblPlan)

1. MonatKey (hilft beim Filtern auf den Zielmonat):
   ```
   =TEXT([@Datum];"YYYYMM")
   ```

2. Ist_FEIERTAG:
   ```
   =ISTZAHL(VERGLEICH([@Datum];Feiertage_Termine;0))
   ```

3. Ist_VORTAG (Tag vor einem Feiertag):
   ```
   =ISTZAHL(VERGLEICH([@Datum]+1;Feiertage_Termine;0))
   ```

4. Ist_Freitag:
   ```
   =WOCHENTAG([@Datum];2)=5
   ```

5. Ist_WE_Tag:
   ```
   =ODER([@Ist_Freitag];WOCHENTAG([@Datum];2)=6;WOCHENTAG([@Datum];2)=7;[@Ist_FEIERTAG];[@Ist_VORTAG])
   ```

6. Ist_WT_Tag:
   ```
   =NICHT([@Ist_WE_Tag])
   ```

### C) Aggregation je Mitarbeiter im Blatt Auswertung (Office 365)

Voraussetzungen:
- In tblAuswertung steht in [@Mitarbeiter] der Name.
- Monat_Auswahl ist der 1. des Zielmonats.
- StartMonat = Regeln!Monat_Auswahl
- EndeMonat = EOMONAT(Regeln!Monat_Auswahl;0)

Für bessere Lesbarkeit hier als Zeilenformeln mit SUMMEWENNS + Filterkriterien:

1. WT_Einheiten:
   ```
   =SUMMEWENNS(tblPlan[Anteil];
               tblPlan[Mitarbeiter];[@Mitarbeiter];
               tblPlan[Datum];">="&Regeln!Monat_Auswahl;
               tblPlan[Datum];"<="&EOMONAT(Regeln!Monat_Auswahl;0);
               tblPlan[Ist_WT_Tag];WAHR)
   ```

2. WE_Freitag:
   ```
   =SUMMEWENNS(tblPlan[Anteil];
               tblPlan[Mitarbeiter];[@Mitarbeiter];
               tblPlan[Datum];">="&Regeln!Monat_Auswahl;
               tblPlan[Datum];"<="&EOMONAT(Regeln!Monat_Auswahl;0);
               tblPlan[Ist_WE_Tag];WAHR;
               tblPlan[Ist_Freitag];WAHR)
   ```

3. WE_Andere (WE außer Freitag):
   ```
   =SUMMEWENNS(tblPlan[Anteil];
               tblPlan[Mitarbeiter];[@Mitarbeiter];
               tblPlan[Datum];">="&Regeln!Monat_Auswahl;
               tblPlan[Datum];"<="&EOMONAT(Regeln!Monat_Auswahl;0);
               tblPlan[Ist_WE_Tag];WAHR;
               tblPlan[Ist_Freitag];FALSCH)
   ```

4. WE_Gesamt:
   ```
   =[@WE_Freitag]+[@WE_Andere]
   ```

5. Abzug_gesamt:
   ```
   =WENN([@WE_Gesamt]>=Regeln!WE_Schwelle-0,0001;Regeln!Abzug_nach_WE_Schwelle;0)
   ```

6. Abzug_von_Freitag:
   ```
   =MIN([@Abzug_gesamt];[@WE_Freitag])
   ```

7. Abzug_von_Andere:
   ```
   =MAX(0;[@Abzug_gesamt]-[@Abzug_von_Freitag])
   ```

8. WE_bezahlt (Gate durch Schwelle):
   ```
   =WENN([@WE_Gesamt]<Regeln!WE_Schwelle-0,0001;0;
        ([@WE_Freitag]-[@Abzug_von_Freitag]) + ([@WE_Andere]-[@Abzug_von_Andere]))
   ```

9. Auszahlung_WE:
   ```
   =[@WE_bezahlt]*Regeln!Satz_WE
   ```

10. Auszahlung_WT:
    ```
    =[@WT_Einheiten]*Regeln!Satz_WT
    ```

11. Auszahlung_Gesamt:
    ```
    =[@Auszahlung_WE]+[@Auszahlung_WT]
    ```

12. WE_Schwelle_erreicht (JA/NEIN):
    ```
    =WENN([@WE_Gesamt]>=Regeln!WE_Schwelle-0,0001;"JA";"NEIN")
    ```

### D) Nicht‑365‑Alternativen (ohne FILTER)

1. Ist_FEIERTAG (im Plan):
   ```
   =SUMMENPRODUKT((tblFeiertage[Datum]=[@Datum])*(tblFeiertage[BL]=Regeln!BL_Auswahl))>0
   ```

2. Ist_VORTAG:
   ```
   =SUMMENPRODUKT((tblFeiertage[Datum]=[@Datum]+1)*(tblFeiertage[BL]=Regeln!BL_Auswahl))>0
   ```

Die übrigen Aggregationen lassen sich mit SUMMENPRODUKT statt SUMMEWENNS abbilden, z. B. WT_Einheiten:
```
=SUMMENPRODUKT((tblPlan[Mitarbeiter]=[@Mitarbeiter])*
               (tblPlan[Datum]>=Regeln!Monat_Auswahl)*
               (tblPlan[Datum]<=EOMONAT(Regeln!Monat_Auswahl;0))*
               (tblPlan[Ist_WT_Tag]=WAHR)*
               (tblPlan[Anteil]))
```

## Eingabe- und Validierungsregeln

### Plan-Eingabe (tblPlan)
- Erforderlich: Datum, Mitarbeiter, Anteil (0<Anteil≤1).
- Pro Datum muss Summe der Anteile ≈ 1,0 sein.

### Ampel (Checks-Blatt oder bedingte Formatierung im Plan)
- Regel: Für jedes Datum D gilt |SUMME(Anteil an D) − 1,0| ≤ 0,0001 → grün; sonst rot.

Beispiel-Formel (als hilfsweise Matrix in Checks):
```
=ABS(SUMMEWENNS(tblPlan[Anteil];tblPlan[Datum];D2)-1)<=0,0001
```

### Fehlerliste
- Datensätze außerhalb des ausgewählten Monats
- Anteil ≤ 0 oder > 1
- Leerer Mitarbeiter
- Doppelte Einträge, wenn nicht beabsichtigt

## Testfälle (sollten „grün" durchlaufen)

1) **Unter Schwelle**:
   A hat 1,75 WE und 1,0 WT → Auszahlung_WE = 0 €; Auszahlung_WT = 0 €; Auszahlung_Gesamt = 0 €.

2) **Genau Schwelle**:  
   A hat 2,0 WE (Fr 1,0 + Sa 1,0) → Abzug 1,0 (zuerst Fr) → WE_bezahlt = 1,0 → 450 €.

3) **Über Schwelle ohne Freitag**:  
   A hat 2,0 WE (nur Sa+So) → Abzug 1,0 aus „Andere" → WE_bezahlt = 1,0 → 450 €.

4) **Starke Überdeckung**:  
   A hat 3,5 WE → Abzug 1,0 → WE_bezahlt = 2,5 → 2,5×450 €.

5) **Splits rund um 2,0**:  
   A hat Fr 0,4 + Sa 0,6 + So 1,0 → Summe 2,0 → Abzug 1,0  
   (0,4 von Fr, 0,6 von Andere) → WE_bezahlt = 1,0 → 450 €.

6) **Unter Schwelle, nur WE-Tage**:  
   A hat 1,0 WE, 0 WT → Auszahlung_WE = 0 €; Auszahlung_Gesamt = 0 €.

7) **Vortag-Feiertag**:
   Feiertag Dienstag; Montag ist Vortag (WE). A: Mo(Vortag) 1,0 + Mi (WT) 1,0.
   WE_Gesamt = 1,0 < 2,0 → Auszahlung_WE = 0 €; Auszahlung_WT = 0 €; Auszahlung_Gesamt = 0 €.

## Edge-Cases und Präzisierungen

- Abzug nur einmal pro Person/Monat (fix 1,0), und nur wenn Schwelle erreicht.
- Der Vortag eines Feiertags ist WE-Tag – unabhängig davon, welcher Wochentag er ist.
- Wenn WE_Freitag < 1,0, wird der restliche Abzug (bis 1,0) von WE_Andere genommen.
- Monatswechsel: Daten genau per >=Monat_Auswahl und <=EOMONAT(Monat_Auswahl;0) filtern.
- Rundungstoleranz 1e-4 bei Schwelle und Datumssummen (Splits wie 0,33/0,67).
- Tabellen-Namen („tblPlan", „tblFeiertage", „tblAuswertung") konsequent verwenden.

## Pflege und Handover

- Bundesland wählen: Regeln!BL_Auswahl.
- Feiertage pflegen: In „tblFeiertage" neue Jahre ergänzen (Datum/Name/BL). Keine Formeländerung nötig.
- Sätze/Schwelle/Abzug anpassbar in „Regeln".
- Versionierung: In „Regeln" Versionsinfo führen (Datum, Autor, Änderung).

Lieferumfang (empfohlen):
- Vorlage (.xltx) + Beispielmappe mit ausgefülltem Muster-Monat,
- CSV-Schablone für Feiertage (Spalten: Datum;Name;BL),
- Screenshot/Notiz der Datenvalidierungen und bedingten Formatierungen.

## Mini-Changelog

- 18.11.2025: Korrektur Variante 2: **Gesamter Bonus (WT + WE) wird nur gezahlt, wenn WE_Summe ≥ 2,0**.
  Unter Schwelle: Auszahlung_Gesamt = 0 € (weder WT noch WE).
- 14.11.2025: Umstellung auf Variante 2 (streng). WE-Vergütung nur bei WE_Summe ≥ 2,0,
  anschließend Abzug 1,0 (Freitag zuerst). Unterhalb der Schwelle: WE-Auszahlung = 0 €.
- 13.11.2025: Vorversion (Variante 1) mit WE-Auszahlung ab erstem WE-Dienst und Abzug nach Schwelle (ersetzt).

## Kurztext (für Blatt „Regeln" als Readme-Hinweis)

„WE-Tag = Fr/Sa/So/Feiertag/Vortag (BL-abhängig). Variante 2 (streng): Gesamter Bonus (WT + WE) wird nur gezahlt, wenn im Monat ≥ 2,0 WE-Einheiten erreicht werden. Bei Erreichen der Schwelle: WT 250 €/Einheit, WE 450 €/Einheit mit Abzug 1,0 (Freitag zuerst). Unter Schwelle: 0 € Auszahlung. Splits anteilig. Monat und Bundesland oben wählen."

— Ende der README —
