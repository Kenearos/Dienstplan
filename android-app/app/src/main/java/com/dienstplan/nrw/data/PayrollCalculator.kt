package com.dienstplan.nrw.data

import com.dienstplan.nrw.model.DutyEntry
import com.dienstplan.nrw.model.PayrollResult
import java.util.*
import kotlin.math.max
import kotlin.math.min

/**
 * Payroll calculator implementing NRW Variante 2 (streng) rules.
 * 
 * Business rules:
 * - WE-Tag (Weekend/Holiday): Friday, Saturday, Sunday, public holiday, day before public holiday
 * - WT-Tag (Weekday): All other days
 * - WT compensation: 250€ per unit (only if threshold reached)
 * - WE compensation: Only paid if monthly total >= 2.0 WE units (threshold)
 *   - If threshold reached: 450€ per WE unit, then deduct exactly 1.0 WE unit
 *   - Deduction priority: Friday first, then other WE days
 *   - Below threshold: 0€ for all shifts (neither WT nor WE)
 */
class PayrollCalculator {
    
    companion object {
        private const val RATE_WT = 250.0  // Satz_WT
        private const val RATE_WE = 450.0  // Satz_WE
        private const val WE_THRESHOLD = 2.0  // WE_Schwelle
        private const val DEDUCTION_AFTER_THRESHOLD = 1.0  // Abzug_nach_WE_Schwelle
        private const val TOLERANCE = 0.0001  // For floating-point comparisons
    }
    
    /**
     * Calculate payroll results for all employees in the given month.
     */
    fun calculatePayroll(duties: List<DutyEntry>, year: Int, month: Int): List<PayrollResult> {
        // Group duties by employee
        val dutiesByEmployee = duties.groupBy { it.employeeName }
        
        return dutiesByEmployee.map { (employeeName, employeeDuties) ->
            calculateForEmployee(employeeName, employeeDuties)
        }.sortedBy { it.employeeName }
    }
    
    /**
     * Calculate payroll result for a single employee.
     */
    private fun calculateForEmployee(employeeName: String, duties: List<DutyEntry>): PayrollResult {
        var wtUnits = 0.0
        var weFriday = 0.0
        var weOther = 0.0
        
        for (duty in duties) {
            val date = duty.date
            
            if (isWETag(date)) {
                if (isFriday(date)) {
                    weFriday += duty.share
                } else {
                    weOther += duty.share
                }
            } else {
                // WT-Tag (weekday, not weekend)
                wtUnits += duty.share
            }
        }
        
        val weTotal = weFriday + weOther
        
        // Check if threshold is reached
        val thresholdReached = weTotal >= (WE_THRESHOLD - TOLERANCE)
        
        // Calculate deduction (only if threshold reached)
        val deductionTotal = if (thresholdReached) DEDUCTION_AFTER_THRESHOLD else 0.0
        val deductionFriday = min(deductionTotal, weFriday)
        val deductionOther = max(0.0, deductionTotal - deductionFriday)
        
        // Calculate paid WE units (Variante 2: only if threshold reached)
        val wePaid = if (weTotal < (WE_THRESHOLD - TOLERANCE)) {
            0.0  // Below threshold: no WE compensation
        } else {
            (weFriday - deductionFriday) + (weOther - deductionOther)
        }
        
        // Calculate payouts
        val payoutWT = wtUnits * RATE_WT
        val payoutWE = wePaid * RATE_WE
        val payoutTotal = payoutWT + payoutWE
        
        return PayrollResult(
            employeeName = employeeName,
            wtUnits = wtUnits,
            weFriday = weFriday,
            weOther = weOther,
            weTotal = weTotal,
            thresholdReached = thresholdReached,
            deductionTotal = deductionTotal,
            deductionFriday = deductionFriday,
            deductionOther = deductionOther,
            wePaid = wePaid,
            payoutWT = payoutWT,
            payoutWE = payoutWE,
            payoutTotal = payoutTotal
        )
    }
    
    /**
     * Check if a date is a WE-Tag (Weekend/Holiday).
     * WE-Tag = Friday, Saturday, Sunday, public holiday, or day before public holiday.
     */
    private fun isWETag(date: Date): Boolean {
        val calendar = Calendar.getInstance()
        calendar.time = date
        val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)
        
        // Friday, Saturday, Sunday (Calendar.FRIDAY = 6, SATURDAY = 7, SUNDAY = 1)
        val isWeekend = dayOfWeek == Calendar.FRIDAY || 
                       dayOfWeek == Calendar.SATURDAY || 
                       dayOfWeek == Calendar.SUNDAY
        
        val isHoliday = HolidayProvider.isHoliday(date)
        val isDayBeforeHoliday = HolidayProvider.isDayBeforeHoliday(date)
        
        return isWeekend || isHoliday || isDayBeforeHoliday
    }
    
    /**
     * Check if a date is a Friday.
     */
    private fun isFriday(date: Date): Boolean {
        val calendar = Calendar.getInstance()
        calendar.time = date
        return calendar.get(Calendar.DAY_OF_WEEK) == Calendar.FRIDAY
    }
}
