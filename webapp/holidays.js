/**
 * NRW Public Holidays Provider
 * Provides holidays for NRW (Nordrhein-Westfalen) from 2025-2030
 */
class HolidayProvider {
    constructor() {
        this.holidays = this.initializeHolidays();
    }

    initializeHolidays() {
        return {
            2025: [
                { date: '2025-01-01', name: 'Neujahr' },
                { date: '2025-04-18', name: 'Karfreitag' },
                { date: '2025-04-21', name: 'Ostermontag' },
                { date: '2025-05-01', name: 'Tag der Arbeit' },
                { date: '2025-05-29', name: 'Christi Himmelfahrt' },
                { date: '2025-06-09', name: 'Pfingstmontag' },
                { date: '2025-06-19', name: 'Fronleichnam' },
                { date: '2025-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2025-11-01', name: 'Allerheiligen' },
                { date: '2025-12-25', name: '1. Weihnachtstag' },
                { date: '2025-12-26', name: '2. Weihnachtstag' }
            ],
            2026: [
                { date: '2026-01-01', name: 'Neujahr' },
                { date: '2026-04-03', name: 'Karfreitag' },
                { date: '2026-04-06', name: 'Ostermontag' },
                { date: '2026-05-01', name: 'Tag der Arbeit' },
                { date: '2026-05-14', name: 'Christi Himmelfahrt' },
                { date: '2026-05-25', name: 'Pfingstmontag' },
                { date: '2026-06-04', name: 'Fronleichnam' },
                { date: '2026-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2026-11-01', name: 'Allerheiligen' },
                { date: '2026-12-25', name: '1. Weihnachtstag' },
                { date: '2026-12-26', name: '2. Weihnachtstag' }
            ],
            2027: [
                { date: '2027-01-01', name: 'Neujahr' },
                { date: '2027-03-26', name: 'Karfreitag' },
                { date: '2027-03-29', name: 'Ostermontag' },
                { date: '2027-05-01', name: 'Tag der Arbeit' },
                { date: '2027-05-06', name: 'Christi Himmelfahrt' },
                { date: '2027-05-17', name: 'Pfingstmontag' },
                { date: '2027-05-27', name: 'Fronleichnam' },
                { date: '2027-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2027-11-01', name: 'Allerheiligen' },
                { date: '2027-12-25', name: '1. Weihnachtstag' },
                { date: '2027-12-26', name: '2. Weihnachtstag' }
            ],
            2028: [
                { date: '2028-01-01', name: 'Neujahr' },
                { date: '2028-04-14', name: 'Karfreitag' },
                { date: '2028-04-17', name: 'Ostermontag' },
                { date: '2028-05-01', name: 'Tag der Arbeit' },
                { date: '2028-05-25', name: 'Christi Himmelfahrt' },
                { date: '2028-06-05', name: 'Pfingstmontag' },
                { date: '2028-06-15', name: 'Fronleichnam' },
                { date: '2028-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2028-11-01', name: 'Allerheiligen' },
                { date: '2028-12-25', name: '1. Weihnachtstag' },
                { date: '2028-12-26', name: '2. Weihnachtstag' }
            ],
            2029: [
                { date: '2029-01-01', name: 'Neujahr' },
                { date: '2029-03-30', name: 'Karfreitag' },
                { date: '2029-04-02', name: 'Ostermontag' },
                { date: '2029-05-01', name: 'Tag der Arbeit' },
                { date: '2029-05-10', name: 'Christi Himmelfahrt' },
                { date: '2029-05-21', name: 'Pfingstmontag' },
                { date: '2029-05-31', name: 'Fronleichnam' },
                { date: '2029-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2029-11-01', name: 'Allerheiligen' },
                { date: '2029-12-25', name: '1. Weihnachtstag' },
                { date: '2029-12-26', name: '2. Weihnachtstag' }
            ],
            2030: [
                { date: '2030-01-01', name: 'Neujahr' },
                { date: '2030-04-19', name: 'Karfreitag' },
                { date: '2030-04-22', name: 'Ostermontag' },
                { date: '2030-05-01', name: 'Tag der Arbeit' },
                { date: '2030-05-30', name: 'Christi Himmelfahrt' },
                { date: '2030-06-10', name: 'Pfingstmontag' },
                { date: '2030-06-20', name: 'Fronleichnam' },
                { date: '2030-10-03', name: 'Tag der Deutschen Einheit' },
                { date: '2030-11-01', name: 'Allerheiligen' },
                { date: '2030-12-25', name: '1. Weihnachtstag' },
                { date: '2030-12-26', name: '2. Weihnachtstag' }
            ]
        };
    }

    /**
     * Check if a given date is a public holiday
     * @param {Date} date - Date to check
     * @returns {boolean}
     */
    isHoliday(date) {
        const year = date.getFullYear();
        const dateStr = this.formatDate(date);

        if (!this.holidays[year]) return false;

        return this.holidays[year].some(h => h.date === dateStr);
    }

    /**
     * Check if a given date is the day before a public holiday
     * @param {Date} date - Date to check
     * @returns {boolean}
     */
    isDayBeforeHoliday(date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        return this.isHoliday(nextDay);
    }

    /**
     * Get holiday name for a given date (if it is a holiday)
     * @param {Date} date - Date to check
     * @returns {string|null}
     */
    getHolidayName(date) {
        const year = date.getFullYear();
        const dateStr = this.formatDate(date);

        if (!this.holidays[year]) return null;

        const holiday = this.holidays[year].find(h => h.date === dateStr);
        return holiday ? holiday.name : null;
    }

    /**
     * Format date as YYYY-MM-DD
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Get all holidays for a specific year
     * @param {number} year
     * @returns {Array}
     */
    getHolidaysForYear(year) {
        return this.holidays[year] || [];
    }
}

// Make it available globally
window.HolidayProvider = HolidayProvider;
