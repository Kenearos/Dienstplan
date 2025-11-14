package com.dienstplan.nrw.model

import java.util.Date

/**
 * Represents a single duty entry in the plan.
 * Maps to the tblPlan in the Excel implementation.
 */
data class DutyEntry(
    val id: Long = 0,
    val date: Date,
    val employeeName: String,
    val share: Double, // Anteil (0.0 - 1.0)
    val monthKey: String // YYYYMM format
) {
    /**
     * Check if this entry is valid.
     */
    fun isValid(): Boolean {
        return employeeName.isNotBlank() && share in 0.0..1.0
    }
}
