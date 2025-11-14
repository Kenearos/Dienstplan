package com.dienstplan.nrw.model

import java.util.Date

/**
 * Represents a public holiday in NRW.
 * Maps to the tblFeiertage in the Excel implementation.
 */
data class Holiday(
    val date: Date,
    val name: String,
    val bundesland: String = "NRW"
)
