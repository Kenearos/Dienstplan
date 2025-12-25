/**
 * Data Storage Manager
 * Manages employee and duty data using localStorage
 */
class DataStorage {
    constructor() {
        this.STORAGE_KEY_EMPLOYEES = 'dienstplan_employees';
        this.STORAGE_KEY_DUTIES = 'dienstplan_duties';
    }

    /**
     * Get all employees
     * @returns {Array} Array of employee names
     */
    getEmployees() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY_EMPLOYEES);
            if (!data) {
                return [];
            }
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
                console.error('Fehler: Mitarbeiter-Daten sind kein Array. Zurücksetzen auf leeres Array');
                return [];
            }
            return parsed;
        } catch (e) {
            console.error('Fehler beim Laden der Mitarbeiter-Daten:', e);
            return [];
        }
    }

    /**
     * Save employees list
     * @param {Array} employees - Array of employee names
     */
    saveEmployees(employees) {
        try {
            if (!Array.isArray(employees)) {
                console.error('Fehler: employees muss ein Array sein');
                throw new TypeError('employees muss ein Array sein');
            }
            localStorage.setItem(this.STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
        } catch (e) {
            console.error('Fehler beim Speichern der Mitarbeiter-Daten:', e);
            throw e;
        }
    }

    /**
     * Add a new employee
     * @param {string} employeeName
     * @returns {boolean} Success status
     */
    addEmployee(employeeName) {
        const employees = this.getEmployees();

        if (employees.includes(employeeName)) {
            return false; // Already exists
        }

        employees.push(employeeName);
        this.saveEmployees(employees.sort());
        return true;
    }

    /**
     * Remove an employee and all their duties
     * @param {string} employeeName
     */
    removeEmployee(employeeName) {
        // Remove from employees list
        const employees = this.getEmployees();
        const filtered = employees.filter(e => e !== employeeName);
        this.saveEmployees(filtered);

        // Remove all duties for this employee
        const allDuties = this.getAllDuties();
        delete allDuties[employeeName];
        this.saveAllDuties(allDuties);
    }

    /**
     * Get all duties data (all employees, all months)
     * @returns {Object} Object with structure: {employeeName: {year-month: [duties]}}
     */
    getAllDuties() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY_DUTIES);
            if (!data) {
                return {};
            }
            const parsed = JSON.parse(data);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                console.error('Fehler: Dienst-Daten sind kein gültiges Objekt. Zurücksetzen auf leeres Objekt');
                return {};
            }
            return parsed;
        } catch (e) {
            console.error('Fehler beim Laden der Dienst-Daten:', e);
            return {};
        }
    }

    /**
     * Save all duties data
     * @param {Object} duties
     */
    saveAllDuties(duties) {
        try {
            if (typeof duties !== 'object' || duties === null || Array.isArray(duties)) {
                console.error('Fehler: duties muss ein gültiges Objekt sein');
                throw new TypeError('duties muss ein gültiges Objekt sein');
            }
            localStorage.setItem(this.STORAGE_KEY_DUTIES, JSON.stringify(duties));
        } catch (e) {
            console.error('Fehler beim Speichern der Dienst-Daten:', e);
            throw e;
        }
    }

    /**
     * Get duties for a specific employee and month
     * @param {string} employeeName
     * @param {number} year
     * @param {number} month (1-12)
     * @returns {Array} Array of duty objects
     */
    getDutiesForMonth(employeeName, year, month) {
        try {
            const allDuties = this.getAllDuties();
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;

            if (!allDuties[employeeName] || !allDuties[employeeName][monthKey]) {
                return [];
            }

            // Convert date strings back to Date objects
            return allDuties[employeeName][monthKey].map(duty => {
                try {
                    const dateObj = new Date(duty.date);
                    if (isNaN(dateObj.getTime())) {
                        console.error(`Fehler: Ungültiges Datum für Dienst: ${duty.date}`);
                        return null;
                    }
                    return {
                        ...duty,
                        date: dateObj
                    };
                } catch (e) {
                    console.error('Fehler beim Konvertieren des Datums:', e);
                    return null;
                }
            }).filter(duty => duty !== null); // Filter out invalid entries
        } catch (e) {
            console.error('Fehler beim Laden der Dienste für Monat:', e);
            return [];
        }
    }

    /**
     * Save duties for a specific employee and month
     * @param {string} employeeName
     * @param {number} year
     * @param {number} month (1-12)
     * @param {Array} duties - Array of duty objects
     */
    saveDutiesForMonth(employeeName, year, month, duties) {
        try {
            if (!Array.isArray(duties)) {
                console.error('Fehler: duties muss ein Array sein');
                throw new TypeError('duties muss ein Array sein');
            }

            const allDuties = this.getAllDuties();
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;

            if (!allDuties[employeeName]) {
                allDuties[employeeName] = {};
            }

            // Convert Date objects to strings for storage
            allDuties[employeeName][monthKey] = duties.map(duty => {
                if (!duty.date || !(duty.date instanceof Date)) {
                    console.error('Fehler: Dienst hat kein gültiges Datum:', duty);
                    throw new TypeError('Dienst muss ein gültiges Date-Objekt haben');
                }
                return {
                    ...duty,
                    date: duty.date.toISOString()
                };
            });

            this.saveAllDuties(allDuties);
        } catch (e) {
            console.error('Fehler beim Speichern der Dienste für Monat:', e);
            throw e;
        }
    }

    /**
     * Add a duty for an employee
     * @param {string} employeeName
     * @param {number} year
     * @param {number} month (1-12)
     * @param {Date} date
     * @param {number} share (1.0 or 0.5)
     */
    addDuty(employeeName, year, month, date, share) {
        const duties = this.getDutiesForMonth(employeeName, year, month);

        // Check if duty already exists for this date
        const existingIndex = duties.findIndex(d =>
            d.date.toDateString() === date.toDateString()
        );

        if (existingIndex >= 0) {
            // Update existing duty
            duties[existingIndex].share = share;
        } else {
            // Add new duty
            duties.push({ date, share });
        }

        // Sort by date
        duties.sort((a, b) => a.date - b.date);

        this.saveDutiesForMonth(employeeName, year, month, duties);
    }

    /**
     * Remove a duty
     * @param {string} employeeName
     * @param {number} year
     * @param {number} month (1-12)
     * @param {Date} date
     */
    removeDuty(employeeName, year, month, date) {
        const duties = this.getDutiesForMonth(employeeName, year, month);
        const filtered = duties.filter(d =>
            d.date.toDateString() !== date.toDateString()
        );
        this.saveDutiesForMonth(employeeName, year, month, filtered);
    }

    /**
     * Get all duties for all employees in a specific month
     * @param {number} year
     * @param {number} month (1-12)
     * @returns {Object} Object with employee names as keys
     */
    getAllEmployeeDutiesForMonth(year, month) {
        const employees = this.getEmployees();
        const result = {};

        employees.forEach(employee => {
            result[employee] = this.getDutiesForMonth(employee, year, month);
        });

        return result;
    }

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY_EMPLOYEES);
        localStorage.removeItem(this.STORAGE_KEY_DUTIES);
    }

    /**
     * Export data as JSON
     * @returns {string} JSON string
     */
    exportData() {
        try {
            return JSON.stringify({
                employees: this.getEmployees(),
                duties: this.getAllDuties()
            }, null, 2);
        } catch (e) {
            console.error('Fehler beim Exportieren der Daten:', e);
            throw new Error('Fehler beim Exportieren der Daten: ' + e.message);
        }
    }

    /**
     * Import data from JSON
     * @param {string} jsonString
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.employees) {
                this.saveEmployees(data.employees);
            }

            if (data.duties) {
                this.saveAllDuties(data.duties);
            }

            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

// Make it available globally
window.DataStorage = DataStorage;
