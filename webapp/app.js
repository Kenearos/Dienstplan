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
