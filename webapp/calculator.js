/**
 * Duty Schedule Bonus Calculator
 * Calculates bonuses based on weekend and holiday duty shifts
 */
class BonusCalculator {
    constructor(holidayProvider) {
        this.holidayProvider = holidayProvider;
        this.RATE_NORMAL = 250;  // Normal day rate (not weekend/holiday)
        this.RATE_WEEKEND = 450; // Weekend/holiday rate
        this.MIN_QUALIFYING_DAYS = 2.0; // Minimum qualifying days to trigger bonus
    }

    /**
     * Check if a date is a qualifying day (weekend or holiday related)
     * Qualifying days: Friday, Saturday, Sunday, Public Holiday, Day before public holiday
     * @param {Date} date
     * @returns {boolean}
     */
    isQualifyingDay(date) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday

        // Weekend: Friday (5), Saturday (6), Sunday (0)
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

        // Public holiday
        const isHoliday = this.holidayProvider.isHoliday(date);

        // Day before public holiday
        const isDayBeforeHoliday = this.holidayProvider.isDayBeforeHoliday(date);

        return isWeekend || isHoliday || isDayBeforeHoliday;
    }

    /**
     * Get day type label for display
     * @param {Date} date
     * @returns {string}
     */
    getDayTypeLabel(date) {
        const dayOfWeek = date.getDay();
        const isHoliday = this.holidayProvider.isHoliday(date);
        const holidayName = this.holidayProvider.getHolidayName(date);
        const isDayBefore = this.holidayProvider.isDayBeforeHoliday(date);

        if (isHoliday) {
            return `Feiertag (${holidayName})`;
        }
        if (isDayBefore) {
            return 'Tag vor Feiertag';
        }
        if (dayOfWeek === 5) return 'Freitag';
        if (dayOfWeek === 6) return 'Samstag';
        if (dayOfWeek === 0) return 'Sonntag';

        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        return days[dayOfWeek];
    }

    /**
     * Calculate bonus for a single employee for a given month
     * @param {Array} duties - Array of duty objects: {date: Date, share: number (1.0 or 0.5)}
     * @returns {Object} Calculation result
     */
    calculateMonthlyBonus(duties) {
        if (!duties || duties.length === 0) {
            return this.getEmptyResult();
        }

        // Separate qualifying and non-qualifying days
        let qualifyingDays = 0;
        let normalDays = 0;
        const dutyDetails = [];

        duties.forEach(duty => {
            const isQualifying = this.isQualifyingDay(duty.date);
            const dayType = this.getDayTypeLabel(duty.date);

            if (isQualifying) {
                qualifyingDays += duty.share;
            } else {
                normalDays += duty.share;
            }

            dutyDetails.push({
                date: duty.date,
                share: duty.share,
                isQualifying: isQualifying,
                dayType: dayType
            });
        });

        // Check if threshold is reached
        const thresholdReached = qualifyingDays >= this.MIN_QUALIFYING_DAYS;

        let bonus = 0;
        let normalDaysPaid = 0;
        let qualifyingDaysPaid = 0;
        let qualifyingDaysDeducted = 0;

        if (thresholdReached) {
            // Deduct 1.0 qualifying day
            qualifyingDaysDeducted = 1.0;
            qualifyingDaysPaid = Math.max(0, qualifyingDays - qualifyingDaysDeducted);
            normalDaysPaid = normalDays;

            // Calculate bonus
            bonus = (normalDaysPaid * this.RATE_NORMAL) + (qualifyingDaysPaid * this.RATE_WEEKEND);
        }

        return {
            totalDuties: duties.length,
            totalDaysWorked: qualifyingDays + normalDays,
            normalDays: normalDays,
            qualifyingDays: qualifyingDays,
            thresholdReached: thresholdReached,
            qualifyingDaysDeducted: qualifyingDaysDeducted,
            normalDaysPaid: normalDaysPaid,
            qualifyingDaysPaid: qualifyingDaysPaid,
            bonusNormalDays: normalDaysPaid * this.RATE_NORMAL,
            bonusQualifyingDays: qualifyingDaysPaid * this.RATE_WEEKEND,
            totalBonus: bonus,
            dutyDetails: dutyDetails
        };
    }

    /**
     * Calculate bonuses for all employees
     * @param {Object} employeeDuties - Object with employee names as keys and duty arrays as values
     * @returns {Object} Results for all employees
     */
    calculateAllEmployees(employeeDuties) {
        const results = {};

        for (const [employeeName, duties] of Object.entries(employeeDuties)) {
            results[employeeName] = this.calculateMonthlyBonus(duties);
        }

        return results;
    }

    /**
     * Get empty result structure
     * @returns {Object}
     */
    getEmptyResult() {
        return {
            totalDuties: 0,
            totalDaysWorked: 0,
            normalDays: 0,
            qualifyingDays: 0,
            thresholdReached: false,
            qualifyingDaysDeducted: 0,
            normalDaysPaid: 0,
            qualifyingDaysPaid: 0,
            bonusNormalDays: 0,
            bonusQualifyingDays: 0,
            totalBonus: 0,
            dutyDetails: []
        };
    }

    /**
     * Format currency for display
     * @param {number} amount
     * @returns {string}
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
}

// Make it available globally
window.BonusCalculator = BonusCalculator;
