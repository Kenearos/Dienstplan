package com.dienstplan.nrw

import com.dienstplan.nrw.data.PayrollCalculator
import com.dienstplan.nrw.model.DutyEntry
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.text.SimpleDateFormat
import java.util.*

/**
 * Unit tests for PayrollCalculator.
 * Tests the business logic of Variante 2 (streng) payroll calculations.
 */
class PayrollCalculatorTest {
    
    private lateinit var calculator: PayrollCalculator
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY)
    
    @Before
    fun setup() {
        calculator = PayrollCalculator()
    }
    
    /**
     * Test Case 1: Under threshold (1.75 WE + 1.0 WT)
     * Expected: WE payout = 0€, WT payout = 250€
     */
    @Test
    fun testUnderThreshold() {
        val duties = listOf(
            // Weekday duty
            DutyEntry(date = parseDate("2025-11-03"), employeeName = "Test", share = 1.0, monthKey = "202511"), // Monday
            // Weekend duties (below threshold)
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "Test", share = 0.75, monthKey = "202511"), // Friday
            DutyEntry(date = parseDate("2025-11-08"), employeeName = "Test", share = 1.0, monthKey = "202511")  // Saturday
        )
        
        val results = calculator.calculatePayroll(duties, 2025, 11)
        assertEquals(1, results.size)
        
        val result = results[0]
        assertEquals("Test", result.employeeName)
        assertEquals(1.0, result.wtUnits, 0.001)
        assertEquals(1.75, result.weTotal, 0.001)
        assertFalse(result.thresholdReached)
        assertEquals(0.0, result.wePaid, 0.001)
        assertEquals(250.0, result.payoutWT, 0.001)
        assertEquals(0.0, result.payoutWE, 0.001)
        assertEquals(250.0, result.payoutTotal, 0.001)
    }
    
    /**
     * Test Case 2: Exactly at threshold (2.0 WE)
     * Expected: WE payout = 450€ (1.0 unit after deduction), threshold reached
     */
    @Test
    fun testExactlyAtThreshold() {
        val duties = listOf(
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "Test", share = 1.0, monthKey = "202511"), // Friday
            DutyEntry(date = parseDate("2025-11-08"), employeeName = "Test", share = 1.0, monthKey = "202511")  // Saturday
        )
        
        val results = calculator.calculatePayroll(duties, 2025, 11)
        assertEquals(1, results.size)
        
        val result = results[0]
        assertEquals(2.0, result.weTotal, 0.001)
        assertTrue(result.thresholdReached)
        assertEquals(1.0, result.deductionTotal, 0.001)
        assertEquals(1.0, result.wePaid, 0.001)
        assertEquals(450.0, result.payoutWE, 0.001)
    }
    
    /**
     * Test Case 3: Over threshold (3.5 WE)
     * Expected: WE payout = 1125€ (2.5 units after 1.0 deduction)
     */
    @Test
    fun testOverThreshold() {
        val duties = listOf(
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "Test", share = 1.0, monthKey = "202511"),  // Friday
            DutyEntry(date = parseDate("2025-11-08"), employeeName = "Test", share = 1.0, monthKey = "202511"),  // Saturday
            DutyEntry(date = parseDate("2025-11-09"), employeeName = "Test", share = 1.0, monthKey = "202511"),  // Sunday
            DutyEntry(date = parseDate("2025-11-14"), employeeName = "Test", share = 0.5, monthKey = "202511")   // Friday
        )
        
        val results = calculator.calculatePayroll(duties, 2025, 11)
        assertEquals(1, results.size)
        
        val result = results[0]
        assertEquals(3.5, result.weTotal, 0.001)
        assertTrue(result.thresholdReached)
        assertEquals(2.5, result.wePaid, 0.001)
        assertEquals(1125.0, result.payoutWE, 0.001)
    }
    
    /**
     * Test Case 4: Friday deduction priority
     * Expected: Deduction comes from Friday first
     */
    @Test
    fun testFridayDeductionPriority() {
        val duties = listOf(
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "Test", share = 0.4, monthKey = "202511"), // Friday
            DutyEntry(date = parseDate("2025-11-08"), employeeName = "Test", share = 0.6, monthKey = "202511"), // Saturday
            DutyEntry(date = parseDate("2025-11-09"), employeeName = "Test", share = 1.0, monthKey = "202511")  // Sunday
        )
        
        val results = calculator.calculatePayroll(duties, 2025, 11)
        assertEquals(1, results.size)
        
        val result = results[0]
        assertEquals(2.0, result.weTotal, 0.001)
        assertEquals(0.4, result.weFriday, 0.001)
        assertEquals(1.6, result.weOther, 0.001)
        assertEquals(0.4, result.deductionFriday, 0.001)  // All Friday deducted first
        assertEquals(0.6, result.deductionOther, 0.001)   // Rest from other (0.6 to reach 1.0 total)
        assertEquals(1.0, result.wePaid, 0.001)
        assertEquals(450.0, result.payoutWE, 0.001)
    }
    
    /**
     * Test Case 5: Multiple employees
     * Expected: Separate calculations for each employee
     */
    @Test
    fun testMultipleEmployees() {
        val duties = listOf(
            // Employee A: under threshold
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "A", share = 1.0, monthKey = "202511"),
            // Employee B: over threshold
            DutyEntry(date = parseDate("2025-11-07"), employeeName = "B", share = 1.5, monthKey = "202511"),
            DutyEntry(date = parseDate("2025-11-08"), employeeName = "B", share = 1.0, monthKey = "202511")
        )
        
        val results = calculator.calculatePayroll(duties, 2025, 11)
        assertEquals(2, results.size)
        
        // Results are sorted by name
        val resultA = results.find { it.employeeName == "A" }!!
        val resultB = results.find { it.employeeName == "B" }!!
        
        // A: below threshold
        assertFalse(resultA.thresholdReached)
        assertEquals(0.0, resultA.payoutWE, 0.001)
        
        // B: above threshold
        assertTrue(resultB.thresholdReached)
        assertEquals(2.5, resultB.weTotal, 0.001)
        assertEquals(1.5, resultB.wePaid, 0.001)
        assertEquals(675.0, resultB.payoutWE, 0.001)
    }
    
    private fun parseDate(dateString: String): Date {
        return dateFormat.parse(dateString) ?: throw IllegalArgumentException("Invalid date")
    }
}
