package com.dienstplan.nrw.model

/**
 * Payroll calculation result for an employee for a specific month.
 * Maps to the Auswertung sheet in the Excel implementation.
 */
data class PayrollResult(
    val employeeName: String,
    val wtUnits: Double,          // WT_Einheiten (weekday units)
    val weFriday: Double,         // WE_Freitag (Friday weekend units)
    val weOther: Double,          // WE_Andere (other weekend units)
    val weTotal: Double,          // WE_Gesamt (total weekend units)
    val thresholdReached: Boolean, // Schwelle_erreicht
    val deductionTotal: Double,   // Abzug_gesamt
    val deductionFriday: Double,  // Abzug_Freitag
    val deductionOther: Double,   // Abzug_Andere
    val wePaid: Double,           // WE_bezahlt (paid weekend units after threshold check)
    val payoutWT: Double,         // Auszahlung_WT
    val payoutWE: Double,         // Auszahlung_WE
    val payoutTotal: Double       // Auszahlung_Gesamt
) {
    companion object {
        /**
         * Create an empty result for an employee with no duties.
         */
        fun empty(employeeName: String): PayrollResult {
            return PayrollResult(
                employeeName = employeeName,
                wtUnits = 0.0,
                weFriday = 0.0,
                weOther = 0.0,
                weTotal = 0.0,
                thresholdReached = false,
                deductionTotal = 0.0,
                deductionFriday = 0.0,
                deductionOther = 0.0,
                wePaid = 0.0,
                payoutWT = 0.0,
                payoutWE = 0.0,
                payoutTotal = 0.0
            )
        }
    }
}
