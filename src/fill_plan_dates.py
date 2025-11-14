"""
Füllt das Plan-Blatt automatisch mit allen Datumszeilen eines Monats vor.
Nutzer muss nur noch Namen + Anteile eintragen.
"""

from pathlib import Path
from datetime import date, timedelta
from openpyxl import load_workbook
import sys


def fill_plan_with_dates(template_path, output_path, year, month):
    """
    Lädt die Vorlage und füllt Spalte A (Datum) im Plan-Blatt
    mit allen Tagen des angegebenen Monats.
    """
    wb = load_workbook(template_path)
    
    # Regeln-Blatt: Monat_Auswahl setzen
    if "Regeln" in wb.sheetnames:
        regeln_ws = wb["Regeln"]
        # Zeile 7, Spalte B = Monat_Auswahl
        regeln_ws["B7"] = date(year, month, 1)
    
    # Plan-Blatt füllen
    if "Plan" not in wb.sheetnames:
        print("❌ Blatt 'Plan' nicht gefunden!")
        return
    
    plan_ws = wb["Plan"]
    
    # Startdatum
    start_date = date(year, month, 1)
    
    # Letzter Tag des Monats
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    # Alle Tage durchgehen
    current_date = start_date
    row = 2  # Zeile 2 = erste Datenzeile nach Header
    
    while current_date <= end_date:
        plan_ws[f"A{row}"] = current_date
        # Spalten B (Mitarbeiter) und C (Anteil) bleiben leer zum Ausfüllen
        current_date += timedelta(days=1)
        row += 1
    
    wb.save(output_path)
    print(f"✅ Plan-Blatt vorbefüllt für {month:02d}/{year}")
    print(f"   Ausgabe: {output_path}")
    print(f"   Trage jetzt nur noch in Spalte B (Mitarbeiter) und C (Anteil) die Namen ein!")


if __name__ == "__main__":
    template = Path("templates/Dienstplan_Vorlage_V2_NRW.xlsx")
    
    if len(sys.argv) >= 3:
        year = int(sys.argv[1])
        month = int(sys.argv[2])
    else:
        # Standard: November 2025
        year = 2025
        month = 11
    
    output = Path(f"output/Dienstplan_{year}_{month:02d}_NRW.xlsx")
    output.parent.mkdir(exist_ok=True)
    
    if not template.exists():
        print(f"❌ Vorlage nicht gefunden: {template}")
        print("   Führe erst 'python src/build_template.py' aus!")
        sys.exit(1)
    
    fill_plan_with_dates(template, output, year, month)
