package com.dienstplan.nrw

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.dienstplan.nrw.databinding.ActivityMainBinding
import java.util.*

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private var selectedYear: Int = 0
    private var selectedMonth: Int = 0
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupMonthSpinner()
        setupYearSpinner()
        setupButtons()
        
        // Set default to current month
        val calendar = Calendar.getInstance()
        selectedYear = calendar.get(Calendar.YEAR)
        selectedMonth = calendar.get(Calendar.MONTH) + 1  // Calendar.MONTH is 0-based
    }
    
    private fun setupMonthSpinner() {
        val months = resources.getStringArray(R.array.months)
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, months)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerMonth.adapter = adapter
        
        binding.spinnerMonth.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedMonth = position + 1  // Months are 1-based
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {
                // Do nothing
            }
        }
        
        // Set to current month
        val currentMonth = Calendar.getInstance().get(Calendar.MONTH)
        binding.spinnerMonth.setSelection(currentMonth)
    }
    
    private fun setupYearSpinner() {
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val years = (2025..2030).map { it.toString() }
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, years)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerYear.adapter = adapter
        
        binding.spinnerYear.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedYear = 2025 + position
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {
                // Do nothing
            }
        }
        
        // Set to current year
        val yearIndex = currentYear - 2025
        if (yearIndex >= 0 && yearIndex < years.size) {
            binding.spinnerYear.setSelection(yearIndex)
        }
    }
    
    private fun setupButtons() {
        binding.btnEnterDuties.setOnClickListener {
            if (selectedYear > 0 && selectedMonth > 0) {
                val intent = Intent(this, DutyEntryActivity::class.java)
                intent.putExtra("year", selectedYear)
                intent.putExtra("month", selectedMonth)
                startActivity(intent)
            } else {
                Toast.makeText(this, R.string.error_no_month_selected, Toast.LENGTH_SHORT).show()
            }
        }
        
        binding.btnViewResults.setOnClickListener {
            if (selectedYear > 0 && selectedMonth > 0) {
                val intent = Intent(this, ResultsActivity::class.java)
                intent.putExtra("year", selectedYear)
                intent.putExtra("month", selectedMonth)
                startActivity(intent)
            } else {
                Toast.makeText(this, R.string.error_no_month_selected, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
