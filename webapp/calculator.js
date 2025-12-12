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
        this.DEDUCTION_AMOUNT = 2.0; // Deduction after reaching threshold
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

        // Separate qualifying days (Friday separate from others) and non-qualifying days
        let qualifyingDaysFriday = 0;
        let qualifyingDaysOther = 0;
        let normalDays = 0;
        const dutyDetails = [];

        duties.forEach(duty => {
            const isQualifying = this.isQualifyingDay(duty.date);
            const dayType = this.getDayTypeLabel(duty.date);
            const isFriday = duty.date.getDay() === 5;

            if (isQualifying) {
                if (isFriday) {
                    qualifyingDaysFriday += duty.share;
                } else {
                    qualifyingDaysOther += duty.share;
                }
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

        const qualifyingDaysTotal = qualifyingDaysFriday + qualifyingDaysOther;

        // Check if threshold is reached
        const thresholdReached = qualifyingDaysTotal >= this.MIN_QUALIFYING_DAYS;

        let bonus = 0;
        let normalDaysPaid = 0;
        let qualifyingDaysPaid = 0;
        let deductionFromFriday = 0;
        let deductionFromOther = 0;
        let totalDeduction = 0;

        if (thresholdReached) {
            // Deduct qualifying days with Friday priority
            totalDeduction = this.DEDUCTION_AMOUNT;

            // First deduct from Friday
            deductionFromFriday = Math.min(totalDeduction, qualifyingDaysFriday);

            // Remaining deduction from other qualifying days
            deductionFromOther = Math.max(0, totalDeduction - deductionFromFriday);

            // Calculate paid days
            const qualifyingDaysFridayPaid = Math.max(0, qualifyingDaysFriday - deductionFromFriday);
            const qualifyingDaysOtherPaid = Math.max(0, qualifyingDaysOther - deductionFromOther);

            qualifyingDaysPaid = qualifyingDaysFridayPaid + qualifyingDaysOtherPaid;
            normalDaysPaid = normalDays;

            // Calculate bonus
            bonus = (normalDaysPaid * this.RATE_NORMAL) + (qualifyingDaysPaid * this.RATE_WEEKEND);
        }
        // If threshold not reached: no bonus paid (neither WT nor WE)

        return {
            totalDuties: duties.length,
            totalDaysWorked: qualifyingDaysTotal + normalDays,
            normalDays: normalDays,
            qualifyingDaysFriday: qualifyingDaysFriday,
            qualifyingDaysOther: qualifyingDaysOther,
            qualifyingDays: qualifyingDaysTotal,
            thresholdReached: thresholdReached,
            deductionFromFriday: deductionFromFriday,
            deductionFromOther: deductionFromOther,
            qualifyingDaysDeducted: totalDeduction,
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
            qualifyingDaysFriday: 0,
            qualifyingDaysOther: 0,
            qualifyingDays: 0,
            thresholdReached: false,
            deductionFromFriday: 0,
            deductionFromOther: 0,
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
