package com.dienstplan.nrw.data

import com.dienstplan.nrw.model.DutyEntry
import java.text.SimpleDateFormat
import java.util.*

/**
 * Simple in-memory data store for duty entries.
 * In a production app, this would be replaced with a Room database.
 */
object DutyDataStore {
    
    private val duties = mutableListOf<DutyEntry>()
    private var nextId = 1L
    
    /**
     * Add a new duty entry.
     */
    fun addDuty(duty: DutyEntry): DutyEntry {
        val dutyWithId = duty.copy(id = nextId++)
        duties.add(dutyWithId)
        return dutyWithId
    }
    
    /**
     * Update an existing duty entry.
     */
    fun updateDuty(duty: DutyEntry) {
        val index = duties.indexOfFirst { it.id == duty.id }
        if (index >= 0) {
            duties[index] = duty
        }
    }
    
    /**
     * Delete a duty entry.
     */
    fun deleteDuty(dutyId: Long) {
        duties.removeAll { it.id == dutyId }
    }
    
    /**
     * Get all duties for a specific month.
     */
    fun getDutiesForMonth(year: Int, month: Int): List<DutyEntry> {
        val monthKey = getMonthKey(year, month)
        return duties.filter { it.monthKey == monthKey }
    }
    
    /**
     * Get all duties.
     */
    fun getAllDuties(): List<DutyEntry> = duties.toList()
    
    /**
     * Clear all duties.
     */
    fun clearAll() {
        duties.clear()
        nextId = 1L
    }
    
    /**
     * Get month key in YYYYMM format.
     */
    fun getMonthKey(year: Int, month: Int): String {
        return String.format("%04d%02d", year, month)
    }
    
    /**
     * Get all dates in a month.
     */
    fun getDatesInMonth(year: Int, month: Int): List<Date> {
        val calendar = Calendar.getInstance()
        calendar.set(year, month - 1, 1, 0, 0, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        
        val dates = mutableListOf<Date>()
        val maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
        
        for (day in 1..maxDay) {
            calendar.set(Calendar.DAY_OF_MONTH, day)
            dates.add(calendar.time)
        }
        
        return dates
    }
}
