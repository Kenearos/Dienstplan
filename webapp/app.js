/**
 * Main Application
 * Manages UI interactions and coordinates between components
 */
class DienstplanApp {
    constructor() {
        this.storage = new DataStorage();
        this.holidayProvider = new HolidayProvider();
        this.calculator = new BonusCalculator(this.holidayProvider);

        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateYearSelects();
        this.setCurrentMonthYear();
        this.loadEmployeeSelects();
        this.loadEmployeeList();
        this.switchTab('duties');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Employee management
        document.getElementById('add-employee-btn').addEventListener('click', () => this.addEmployee());
        document.getElementById('new-employee-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEmployee();
        });

        // Duty management
        document.getElementById('add-duty-btn').addEventListener('click', () => this.addDuty());
        document.getElementById('employee-select-duty').addEventListener('change', () => this.loadDutiesForSelectedEmployee());
        document.getElementById('month-select').addEventListener('change', () => this.loadDutiesForSelectedEmployee());
        document.getElementById('year-select').addEventListener('change', () => this.loadDutiesForSelectedEmployee());

        // Calculation
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateBonuses());

        // Settings
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportCSV());
        document.getElementById('export-report-btn').addEventListener('click', () => this.exportBonusReport());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => this.importData());
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAllData());
    }

    /**
     * Populate year select dropdowns
     */
    populateYearSelects() {
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = currentYear - 1; year <= currentYear + 5; year++) {
            years.push(year);
        }

        const yearSelects = ['year-select', 'calc-year-select'];
        yearSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '';
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                select.appendChild(option);
            });
        });
    }

    /**
     * Set current month and year in selects
     */
    setCurrentMonthYear() {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        document.getElementById('month-select').value = currentMonth;
        document.getElementById('year-select').value = currentYear;
        document.getElementById('calc-month-select').value = currentMonth;
        document.getElementById('calc-year-select').value = currentYear;

        // Set date input to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('duty-date').value = today;
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Refresh data when switching to certain tabs
        if (tabName === 'employees') {
            this.loadEmployeeList();
        } else if (tabName === 'duties') {
            this.loadDutiesForSelectedEmployee();
        }
    }

    /**
     * Load employee select dropdowns
     */
    loadEmployeeSelects() {
        const employees = this.storage.getEmployees();
        const selects = ['employee-select-duty'];

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Mitarbeiter auswählen --</option>';

            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee;
                option.textContent = employee;
                select.appendChild(option);
            });

            // Restore previous selection if still valid
            if (employees.includes(currentValue)) {
                select.value = currentValue;
            }
        });
    }

    /**
     * Add a new employee
     */
    addEmployee() {
        const input = document.getElementById('new-employee-name');
        const name = input.value.trim();

        if (!name) {
            this.showToast('Bitte geben Sie einen Namen ein.', 'error');
            return;
        }

        const success = this.storage.addEmployee(name);

        if (success) {
            this.showToast(`Mitarbeiter "${name}" wurde hinzugefügt.`, 'success');
            input.value = '';
            this.loadEmployeeList();
            this.loadEmployeeSelects();
        } else {
            this.showToast(`Mitarbeiter "${name}" existiert bereits.`, 'error');
        }
    }

    /**
     * Remove an employee
     */
    removeEmployee(employeeName) {
        if (!confirm(`Möchten Sie "${employeeName}" wirklich löschen? Alle Dienste werden ebenfalls gelöscht.`)) {
            return;
        }

        this.storage.removeEmployee(employeeName);
        this.showToast(`Mitarbeiter "${employeeName}" wurde gelöscht.`, 'success');
        this.loadEmployeeList();
        this.loadEmployeeSelects();
        this.loadDutiesForSelectedEmployee();
    }

    /**
     * Load and display employee list
     */
    loadEmployeeList() {
        const employees = this.storage.getEmployees();
        const container = document.getElementById('employee-list-display');

        if (employees.length === 0) {
            container.innerHTML = '<p class="text-muted">Keine Mitarbeiter vorhanden.</p>';
            return;
        }

        container.innerHTML = '';
        employees.forEach(employee => {
            const item = document.createElement('div');
            item.className = 'employee-item';
            item.innerHTML = `
                <span class="employee-name">${employee}</span>
                <button class="btn btn-danger btn-small" onclick="app.removeEmployee('${employee}')">Löschen</button>
            `;
            container.appendChild(item);
        });
    }

    /**
     * Add a duty
     */
    addDuty() {
        const employeeSelect = document.getElementById('employee-select-duty');
        const dateInput = document.getElementById('duty-date');
        const shareSelect = document.getElementById('duty-share');

        const employeeName = employeeSelect.value;
        const dateStr = dateInput.value;
        const share = parseFloat(shareSelect.value);

        if (!employeeName) {
            this.showToast('Bitte wählen Sie einen Mitarbeiter aus.', 'error');
            return;
        }

        if (!dateStr) {
            this.showToast('Bitte wählen Sie ein Datum aus.', 'error');
            return;
        }

        const date = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        this.storage.addDuty(employeeName, year, month, date, share);
        this.showToast('Dienst wurde hinzugefügt.', 'success');
        this.loadDutiesForSelectedEmployee();

        // Update month/year selects to match the added duty
        document.getElementById('month-select').value = month;
        document.getElementById('year-select').value = year;
    }

    /**
     * Remove a duty
     */
    removeDuty(employeeName, year, month, date) {
        this.storage.removeDuty(employeeName, year, month, date);
        this.showToast('Dienst wurde gelöscht.', 'success');
        this.loadDutiesForSelectedEmployee();
    }

    /**
     * Load duties for the selected employee and month
     */
    loadDutiesForSelectedEmployee() {
        const employeeSelect = document.getElementById('employee-select-duty');
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const container = document.getElementById('duties-display');

        const employeeName = employeeSelect.value;
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);

        if (!employeeName) {
            container.innerHTML = '<p class="text-muted">Wählen Sie einen Mitarbeiter aus, um Dienste anzuzeigen.</p>';
            return;
        }

        const duties = this.storage.getDutiesForMonth(employeeName, year, month);

        if (duties.length === 0) {
            const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                              'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
            container.innerHTML = `<p class="text-muted">Keine Dienste für ${monthNames[month - 1]} ${year}.</p>`;
            return;
        }

        container.innerHTML = '';
        duties.forEach(duty => {
            const isQualifying = this.calculator.isQualifyingDay(duty.date);
            const dayType = this.calculator.getDayTypeLabel(duty.date);
            const dateStr = duty.date.toLocaleDateString('de-DE', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const item = document.createElement('div');
            item.className = `duty-item ${isQualifying ? 'qualifying' : ''}`;
            item.innerHTML = `
                <div class="duty-info">
                    <div class="duty-date">${dateStr}</div>
                    <div class="duty-meta">
                        ${dayType}
                        <span class="badge ${isQualifying ? 'badge-qualifying' : 'badge-normal'}">
                            ${isQualifying ? 'WE/Feiertag' : 'Normal'}
                        </span>
                    </div>
                </div>
                <div class="duty-share">${duty.share === 1 ? 'Ganzer Dienst' : 'Halber Dienst'}</div>
                <button class="btn btn-danger btn-small"
                        onclick="app.removeDuty('${employeeName}', ${year}, ${month}, new Date('${duty.date.toISOString()}'))">
                    Löschen
                </button>
            `;
            container.appendChild(item);
        });
    }

    /**
     * Calculate bonuses for all employees
     */
    calculateBonuses() {
        const monthSelect = document.getElementById('calc-month-select');
        const yearSelect = document.getElementById('calc-year-select');
        const resultsContainer = document.getElementById('calculation-results');

        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);

        const employeeDuties = this.storage.getAllEmployeeDutiesForMonth(year, month);
        const results = this.calculator.calculateAllEmployees(employeeDuties);

        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

        resultsContainer.innerHTML = `<h3>Ergebnisse für ${monthNames[month - 1]} ${year}</h3>`;

        const employees = Object.keys(results);
        if (employees.length === 0) {
            resultsContainer.innerHTML += '<p class="text-muted">Keine Daten verfügbar.</p>';
            return;
        }

        employees.forEach(employeeName => {
            const result = results[employeeName];
            const resultCard = this.createResultCard(employeeName, result);
            resultsContainer.appendChild(resultCard);
        });

        this.showToast('Berechnung abgeschlossen.', 'success');
    }

    /**
     * Create a result card for an employee
     */
    createResultCard(employeeName, result) {
        const card = document.createElement('div');
        card.className = 'result-card';

        let content = `<h3>${employeeName}</h3>`;

        if (!result.thresholdReached) {
            content += `
                <div class="threshold-warning">
                    <h4>Schwellenwert nicht erreicht</h4>
                    <p>Es wurden nur ${result.qualifyingDays.toFixed(1)} qualifizierende Tage gearbeitet.
                    Mindestens ${this.calculator.MIN_QUALIFYING_DAYS} Tage erforderlich.</p>
                    <p><strong>Keine Bonuszahlung</strong></p>
                </div>
            `;
        } else {
            content += `
                <div class="result-summary">
                    <div class="result-item">
                        <div class="result-label">Normale Tage</div>
                        <div class="result-value">${result.normalDays.toFixed(1)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">WE/Feiertag Tage</div>
                        <div class="result-value">${result.qualifyingDays.toFixed(1)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Abzug</div>
                        <div class="result-value danger">-${result.qualifyingDaysDeducted.toFixed(1)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Normale Tage (bezahlt)</div>
                        <div class="result-value success">${result.normalDaysPaid.toFixed(1)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">WE/Feiertag (bezahlt)</div>
                        <div class="result-value success">${result.qualifyingDaysPaid.toFixed(1)}</div>
                    </div>
                </div>

                <div class="result-summary">
                    <div class="result-item">
                        <div class="result-label">Normale Tage (250€)</div>
                        <div class="result-value">${this.calculator.formatCurrency(result.bonusNormalDays)}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">WE/Feiertag (450€)</div>
                        <div class="result-value">${this.calculator.formatCurrency(result.bonusQualifyingDays)}</div>
                    </div>
                </div>

                <div class="bonus-total">
                    <h4>Gesamtbonus</h4>
                    <div class="amount">${this.calculator.formatCurrency(result.totalBonus)}</div>
                </div>
            `;
        }

        card.innerHTML = content;
        return card;
    }

    /**
     * Export data as JSON
     */
    exportData() {
        const data = this.storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `dienstplan-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Daten wurden exportiert.', 'success');
    }

    /**
     * Export data as CSV (Excel-compatible) - Beginner-friendly format
     * Exports all duties and monthly summary for the selected month
     */
    exportCSV() {
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        
        const month = parseInt(document.getElementById('calc-month-select').value);
        const year = parseInt(document.getElementById('calc-year-select').value);
        
        // Helper function to escape CSV values (handles semicolons, quotes, newlines)
        const escapeCSV = (value) => {
            const str = String(value);
            if (str.includes(';') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };
        
        // Build CSV content with BOM for Excel UTF-8 support
        let csv = '\uFEFF'; // UTF-8 BOM for Excel
        
        // === Sheet 1: Dienste (All Duties for the month) ===
        csv += `DIENSTE ${monthNames[month - 1]} ${year}\n`;
        csv += 'Datum;Wochentag;Mitarbeiter;Anteil;Tagestyp\n';
        
        const employees = this.storage.getEmployees();
        const allDuties = [];
        
        // Collect all duties for the selected month from all employees
        employees.forEach(employee => {
            const duties = this.storage.getDutiesForMonth(employee, year, month);
            duties.forEach(duty => {
                allDuties.push({
                    ...duty,
                    employee: employee
                });
            });
        });
        
        // Sort by date
        allDuties.sort((a, b) => a.date - b.date);
        
        allDuties.forEach(duty => {
            const isQual = this.calculator.isQualifyingDay(duty.date);
            const dateStr = duty.date.toLocaleDateString('de-DE');
            const weekday = weekdays[duty.date.getDay()];
            const dayType = isQual ? 'WE-Tag' : 'Werktag (WT)';
            
            csv += `${dateStr};${weekday};${escapeCSV(duty.employee)};${duty.share.toFixed(1).replace('.', ',')};${dayType}\n`;
        });
        
        csv += '\n\n';
        
        // === Sheet 2: Monatliche Auswertung ===
        csv += `AUSWERTUNG ${monthNames[month - 1]} ${year}\n`;
        csv += 'Mitarbeiter;Normale Tage;WE/Feiertag Tage;Abzug;Normale Tage (bezahlt);WE/Feiertag (bezahlt);Schwelle erreicht;Bonus Normal;Bonus WE;Gesamtbonus (EUR)\n';
        
        const employeeDuties = this.storage.getAllEmployeeDutiesForMonth(year, month);
        const results = this.calculator.calculateAllEmployees(employeeDuties);
        
        let totalBonus = 0;
        
        for (const [employeeName, result] of Object.entries(results)) {
            const threshold = result.thresholdReached ? 'JA' : 'NEIN';
            
            totalBonus += result.totalBonus;
            
            csv += `${escapeCSV(employeeName)};`;
            csv += `${result.normalDays.toFixed(1).replace('.', ',')};`;
            csv += `${result.qualifyingDays.toFixed(1).replace('.', ',')};`;
            csv += `${result.qualifyingDaysDeducted.toFixed(1).replace('.', ',')};`;
            csv += `${result.normalDaysPaid.toFixed(1).replace('.', ',')};`;
            csv += `${result.qualifyingDaysPaid.toFixed(1).replace('.', ',')};`;
            csv += `${threshold};`;
            csv += `${result.bonusNormalDays.toFixed(2).replace('.', ',')};`;
            csv += `${result.bonusQualifyingDays.toFixed(2).replace('.', ',')};`;
            csv += `${result.totalBonus.toFixed(2).replace('.', ',')}\n`;
        }
        
        csv += `\nGESAMT;;;;;;;;;${totalBonus.toFixed(2).replace('.', ',')}\n`;
        
        csv += '\n\n';
        csv += 'LEGENDE\n';
        csv += 'Normale Tage;Montag-Donnerstag ohne Feiertag/Vortag\n';
        csv += 'WE/Feiertag Tage;"Freitag, Samstag, Sonntag, Feiertag oder Tag vor Feiertag"\n';
        csv += 'Schwelle;"Mindestens 2,0 WE-Einheiten für Bonuszahlung erforderlich"\n';
        csv += 'Sätze;"Normale Tage = 250 EUR/Einheit, WE/Feiertag = 450 EUR/Einheit"\n';
        csv += 'Abzug;"Bei Erreichen der Schwelle werden 2,0 WE-Einheiten abgezogen"\n';
        
        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dienstplan_${year}_${String(month).padStart(2, '0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('CSV wurde exportiert. Öffnen Sie die Datei mit Excel oder LibreOffice.', 'success');
    }

    /**
     * Export a formal bonus report in HTML format
     * Opens in a new window for printing or saving as PDF
     */
    exportBonusReport() {
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        
        const month = parseInt(document.getElementById('calc-month-select').value);
        const year = parseInt(document.getElementById('calc-year-select').value);
        
        // Calculate next month for payout date
        const payoutMonth = month % 12;
        const payoutYear = month === 12 ? year + 1 : year;
        
        const employeeDuties = this.storage.getAllEmployeeDutiesForMonth(year, month);
        const employees = Object.keys(employeeDuties);
        
        if (employees.length === 0) {
            this.showToast('Keine Dienste für diesen Monat vorhanden.', 'error');
            return;
        }
        
        // Escape HTML function
        const escapeHtml = (str) => {
            return String(str).replace(/[&<>"']/g, c => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[c]));
        };
        
        // Group duties by employee and weekday
        const employeeData = {};
        for (const [name, duties] of Object.entries(employeeDuties)) {
            employeeData[name] = {
                duties: duties,
                byWeekday: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
                wt: 0,
                we_fr: 0,
                we_other: 0
            };
            
            duties.forEach(duty => {
                const dayOfWeek = duty.date.getDay();
                const isQualifying = this.calculator.isQualifyingDay(duty.date);
                const isFriday = dayOfWeek === 5;
                
                employeeData[name].byWeekday[dayOfWeek].push({
                    ...duty,
                    isQual: isQualifying,
                    dayType: this.calculator.getDayTypeLabel(duty.date)
                });
                
                if (!isQualifying) {
                    employeeData[name].wt += duty.share;
                } else if (isFriday) {
                    employeeData[name].we_fr += duty.share;
                } else {
                    employeeData[name].we_other += duty.share;
                }
            });
        }
        
        // Build HTML report
        let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Bonuszahlungen ${monthNames[month - 1]} ${year}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.6;
        }
        h3 {
            color: #4472C4;
            border-bottom: 2px solid #4472C4;
            padding-bottom: 10px;
        }
        h5 {
            color: #666;
            margin-bottom: 20px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px 8px;
            text-align: center;
        }
        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .employee-name {
            text-align: left;
            font-weight: bold;
        }
        .bonus-amount {
            font-weight: bold;
            color: #28a745;
        }
        .no-bonus {
            color: #dc3545;
        }
        .duty-cell {
            font-size: 0.85em;
        }
        .duty-cell .we-tag {
            background: #d4edda;
            color: #155724;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        .duty-cell .wt-tag {
            background: #e7e7e7;
            color: #666;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        .duty-cell .deducted-tag {
            background: #fff3cd;
            color: #856404;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
            border: 1px dashed #856404;
        }
        .employee-note {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-left: 3px solid #4472C4;
        }
        .employee-note b {
            color: #4472C4;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background: #e7f3ff;
            border-radius: 8px;
        }
        .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #4472C4;
        }
        @media print {
            body { margin: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
<div class="no-print" style="margin-bottom: 20px; padding: 10px; background: #fff3cd; border-radius: 5px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #4472C4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">🖨️ Drucken / Als PDF speichern</button>
    <span style="color: #666;">Tipp: Beim Drucken "Als PDF speichern" wählen für eine PDF-Datei.</span>
</div>

<h3>Bonuszahlungen</h3>
<h5>Monat ${monthNames[month - 1]} ${year} mit Auszahlung Ende ${monthNames[payoutMonth]} ${payoutYear}</h5>

<p>Für die im ${monthNames[month - 1]} ${year} geleisteten Bereitschaftsdienste ergeben sich folgende Bonuszahlungen:</p>

<table>
    <thead>
        <tr>
            <th>Mitarbeiter</th>
            <th>Mo</th>
            <th>Di</th>
            <th>Mi</th>
            <th>Do</th>
            <th>Fr</th>
            <th>Sa</th>
            <th>So</th>
            <th>Bonus (€)</th>
        </tr>
    </thead>
    <tbody>`;
        
        let totalBonus = 0;
        const employeeNotes = [];
        
        for (const [name, data] of Object.entries(employeeData)) {
            const we_total = data.we_fr + data.we_other;
            const thresholdReached = we_total >= this.calculator.MIN_QUALIFYING_DAYS - 0.0001;
            
            let bonus = 0;
            let deductedFrom = '';
            let deduct_fr = 0;
            let deduct_other = 0;
            
            if (thresholdReached) {
                const wt_pay = data.wt * this.calculator.RATE_NORMAL;
                let deduct = this.calculator.DEDUCTION_AMOUNT;
                deduct_fr = Math.min(deduct, data.we_fr);
                deduct_other = Math.max(0, deduct - deduct_fr);
                const paid_fr = Math.max(0, data.we_fr - deduct_fr);
                const paid_other = Math.max(0, data.we_other - deduct_other);
                const we_pay = (paid_fr + paid_other) * this.calculator.RATE_WEEKEND;
                bonus = wt_pay + we_pay;
                
                if (deduct_fr > 0 && deduct_other > 0) {
                    deductedFrom = 'Freitag und weiterer WE-Tag';
                } else if (deduct_fr > 0) {
                    deductedFrom = 'Freitag';
                } else {
                    deductedFrom = 'WE-Tag (Sa/So/Feiertag)';
                }
            }
            
            totalBonus += bonus;
            
            // Generate note - cleaner, more professional format
            const safeName = escapeHtml(name);
            let note = '';
            
            if (!thresholdReached) {
                note = `<b>${safeName}</b> erreicht die Mindestschwelle nicht (${we_total.toFixed(1)} von ${this.calculator.MIN_QUALIFYING_DAYS.toFixed(1)} WE-Einheiten) und erhält daher keine Bonuszahlung.`;
            } else {
                const paid_we = we_total - this.calculator.DEDUCTION_AMOUNT;
                let breakdown = [];
                if (data.wt > 0) breakdown.push(`${data.wt.toFixed(1)} WT-Einheiten à ${this.calculator.RATE_NORMAL} €`);
                if (paid_we > 0) breakdown.push(`${paid_we.toFixed(1)} WE-Einheiten à ${this.calculator.RATE_WEEKEND} €`);
                
                note = `<b>${safeName}</b> erhält eine Bonuszahlung von <span style="color: #28a745; font-weight: bold;">${this.calculator.formatCurrency(bonus)}</span>`;
                if (breakdown.length > 0) {
                    note += ` (${breakdown.join(' + ')})`;
                }
                note += '.';
            }
            employeeNotes.push(note);
            
            // Track remaining deduction for each duty (Friday first, then others)
            let remainingDeductFr = deduct_fr;
            let remainingDeductOther = deduct_other;
            
            // Build table row
            html += `
        <tr>
            <td class="employee-name">${safeName}</td>`;
            
            // Days: Mo(1), Di(2), Mi(3), Do(4), Fr(5), Sa(6), So(0)
            const dayOrder = [1, 2, 3, 4, 5, 6, 0];
            
            for (const dayIdx of dayOrder) {
                const dayDuties = data.byWeekday[dayIdx];
                if (dayDuties.length === 0) {
                    html += `<td></td>`;
                } else {
                    let cellContent = '';
                    dayDuties.forEach(duty => {
                        const dateStr = duty.date.getDate() + '.';
                        const shareStr = duty.share === 0.5 ? '½' : '';
                        const isFriday = duty.date.getDay() === 5;
                        const isHoliday = this.holidayProvider.isHoliday(duty.date);
                        const isDayBefore = this.holidayProvider.isDayBeforeHoliday(duty.date);
                        const extraInfo = isHoliday ? ' (Feiertag)' : isDayBefore ? ' (Vor Feiertag)' : '';
                        
                        // Determine if this duty is deducted
                        let deductedAmount = 0;
                        let paidAmount = duty.share;
                        
                        if (thresholdReached && duty.isQual) {
                            if (isFriday && remainingDeductFr > 0) {
                                deductedAmount = Math.min(duty.share, remainingDeductFr);
                                remainingDeductFr -= deductedAmount;
                            } else if (!isFriday && remainingDeductOther > 0) {
                                deductedAmount = Math.min(duty.share, remainingDeductOther);
                                remainingDeductOther -= deductedAmount;
                            }
                            paidAmount = duty.share - deductedAmount;
                        }
                        
                        const isFullyDeducted = thresholdReached && duty.isQual && deductedAmount >= duty.share - 0.0001;
                        
                        // Calculate euro amount only for paid portion
                        const rate = duty.isQual ? this.calculator.RATE_WEEKEND : this.calculator.RATE_NORMAL;
                        const amountStr = `${Math.round(paidAmount * rate)}€`;
                        
                        // Determine tag style
                        let tag = duty.isQual ? 'we-tag' : 'wt-tag';
                        if (isFullyDeducted) {
                            tag = 'deducted-tag';
                        }
                        
                        // Build cell content
                        cellContent += `<span class="${tag}">${shareStr}X${extraInfo}</span><br>`;
                        
                        // Only show euro amount for non-deducted or partially-paid days
                        if (!isFullyDeducted && (paidAmount > 0 || !duty.isQual)) {
                            cellContent += `<small>${amountStr}</small><br>`;
                        }
                    });
                    html += `<td class="duty-cell">${cellContent}</td>`;
                }
            }
            
            html += `
            <td class="${bonus > 0 ? 'bonus-amount' : 'no-bonus'}">${bonus > 0 ? this.calculator.formatCurrency(bonus) : '-'}</td>
        </tr>`;
        }
        
        html += `
    </tbody>
</table>

<div class="summary">
    <p class="total">Gesamtsumme: ${this.calculator.formatCurrency(totalBonus)}</p>
</div>

<h4>Erläuterungen zu den einzelnen Mitarbeitern:</h4>
`;
        
        employeeNotes.forEach(note => {
            html += `<div class="employee-note">${note}</div>\n`;
        });
        
        html += `
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
    <p><strong>Berechnungsregeln (Variante 2 - Streng):</strong></p>
    <ul>
        <li><strong>WE-Tage:</strong> Freitag, Samstag, Sonntag, Feiertage und Tage vor Feiertagen</li>
        <li><strong>Schwelle:</strong> Mindestens 2,0 WE-Einheiten für Bonuszahlung erforderlich</li>
        <li><strong>Vergütung bei Erreichen der Schwelle:</strong>
            <ul>
                <li>Werktage (WT): 250 € pro Einheit</li>
                <li>WE-Tage: 450 € pro Einheit (abzüglich 2,0 Einheiten Abzug, Freitag zuerst)</li>
            </ul>
        </li>
        <li><strong>Unter Schwelle:</strong> Keine Bonuszahlung (weder WT noch WE)</li>
    </ul>
</div>

<p style="margin-top: 30px; color: #666; font-size: 0.9em;">
    Erstellt am: ${new Date().toLocaleDateString('de-DE')} | Dienstplan NRW (Variante 2 - Streng)
</p>

</body>
</html>`;
        
        // Open in new window
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(html);
            reportWindow.document.close();
            this.showToast('Bonus-Bericht wurde in einem neuen Fenster geöffnet.', 'success');
        } else {
            this.showToast('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.', 'error');
        }
    }

    /**
     * Import data from JSON file
     */
    importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) {
            this.showToast('Bitte wählen Sie eine Datei aus.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = this.storage.importData(e.target.result);

            if (success) {
                this.showToast('Daten wurden erfolgreich importiert.', 'success');
                this.loadEmployeeList();
                this.loadEmployeeSelects();
                this.loadDutiesForSelectedEmployee();
            } else {
                this.showToast('Import fehlgeschlagen. Bitte überprüfen Sie die Datei.', 'error');
            }
        };

        reader.readAsText(file);
        fileInput.value = ''; // Reset file input
    }

    /**
     * Clear all data
     */
    clearAllData() {
        if (!confirm('Möchten Sie wirklich ALLE Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
            return;
        }

        this.storage.clearAll();
        this.showToast('Alle Daten wurden gelöscht.', 'info');
        this.loadEmployeeList();
        this.loadEmployeeSelects();
        this.loadDutiesForSelectedEmployee();
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DienstplanApp();
});
