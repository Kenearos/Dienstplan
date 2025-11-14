package com.dienstplan.nrw.data

import com.dienstplan.nrw.model.Holiday
import java.text.SimpleDateFormat
import java.util.*

/**
 * Provides NRW public holidays for years 2025-2026.
 * This matches the holiday data in the Python implementation.
 */
object HolidayProvider {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY)
    
    private val nrwHolidays2025 = listOf(
        Holiday(parseDate("2025-01-01"), "Neujahr", "NRW"),
        Holiday(parseDate("2025-04-18"), "Karfreitag", "NRW"),
        Holiday(parseDate("2025-04-21"), "Ostermontag", "NRW"),
        Holiday(parseDate("2025-05-01"), "Tag der Arbeit", "NRW"),
        Holiday(parseDate("2025-05-29"), "Christi Himmelfahrt", "NRW"),
        Holiday(parseDate("2025-06-09"), "Pfingstmontag", "NRW"),
        Holiday(parseDate("2025-06-19"), "Fronleichnam", "NRW"),
        Holiday(parseDate("2025-10-03"), "Tag der Deutschen Einheit", "NRW"),
        Holiday(parseDate("2025-11-01"), "Allerheiligen", "NRW"),
        Holiday(parseDate("2025-12-25"), "1. Weihnachtstag", "NRW"),
        Holiday(parseDate("2025-12-26"), "2. Weihnachtstag", "NRW")
    )
    
    private val nrwHolidays2026 = listOf(
        Holiday(parseDate("2026-01-01"), "Neujahr", "NRW"),
        Holiday(parseDate("2026-04-03"), "Karfreitag", "NRW"),
        Holiday(parseDate("2026-04-06"), "Ostermontag", "NRW"),
        Holiday(parseDate("2026-05-01"), "Tag der Arbeit", "NRW"),
        Holiday(parseDate("2026-05-14"), "Christi Himmelfahrt", "NRW"),
        Holiday(parseDate("2026-05-25"), "Pfingstmontag", "NRW"),
        Holiday(parseDate("2026-06-04"), "Fronleichnam", "NRW"),
        Holiday(parseDate("2026-10-03"), "Tag der Deutschen Einheit", "NRW"),
        Holiday(parseDate("2026-11-01"), "Allerheiligen", "NRW"),
        Holiday(parseDate("2026-12-25"), "1. Weihnachtstag", "NRW"),
        Holiday(parseDate("2026-12-26"), "2. Weihnachtstag", "NRW")
    )
    
    private val allHolidays = nrwHolidays2025 + nrwHolidays2026
    
    /**
     * Get all NRW holidays.
     */
    fun getAllHolidays(): List<Holiday> = allHolidays
    
    /**
     * Check if a date is a public holiday.
     */
    fun isHoliday(date: Date): Boolean {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val normalizedDate = calendar.time
        
        return allHolidays.any { 
            val holidayCalendar = Calendar.getInstance()
            holidayCalendar.time = it.date
            holidayCalendar.set(Calendar.HOUR_OF_DAY, 0)
            holidayCalendar.set(Calendar.MINUTE, 0)
            holidayCalendar.set(Calendar.SECOND, 0)
            holidayCalendar.set(Calendar.MILLISECOND, 0)
            
            normalizedDate.equals(holidayCalendar.time)
        }
    }
    
    /**
     * Check if a date is the day before a public holiday.
     */
    fun isDayBeforeHoliday(date: Date): Boolean {
        val calendar = Calendar.getInstance()
        calendar.time = date
        calendar.add(Calendar.DAY_OF_MONTH, 1)
        return isHoliday(calendar.time)
    }
    
    private fun parseDate(dateString: String): Date {
        return dateFormat.parse(dateString) ?: throw IllegalArgumentException("Invalid date: $dateString")
    }
}
