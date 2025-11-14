package com.dienstplan.nrw

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.dienstplan.nrw.data.DutyDataStore
import com.dienstplan.nrw.data.PayrollCalculator
import com.dienstplan.nrw.databinding.ActivityResultsBinding
import com.dienstplan.nrw.databinding.ItemResultBinding
import com.dienstplan.nrw.model.PayrollResult

class ResultsActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityResultsBinding
    private lateinit var adapter: ResultsAdapter
    private var year: Int = 0
    private var month: Int = 0
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityResultsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        year = intent.getIntExtra("year", 0)
        month = intent.getIntExtra("month", 0)
        
        if (year == 0 || month == 0) {
            finish()
            return
        }
        
        setupUI()
        calculateAndDisplayResults()
    }
    
    private fun setupUI() {
        val monthName = getMonthName(month)
        binding.tvSelectedMonth.text = String.format("%s %d", monthName, year)
        
        adapter = ResultsAdapter()
        binding.rvResults.layoutManager = LinearLayoutManager(this)
        binding.rvResults.adapter = adapter
    }
    
    private fun calculateAndDisplayResults() {
        val duties = DutyDataStore.getDutiesForMonth(year, month)
        val calculator = PayrollCalculator()
        val results = calculator.calculatePayroll(duties, year, month)
        
        adapter.submitList(results)
    }
    
    private fun getMonthName(month: Int): String {
        val months = resources.getStringArray(R.array.months)
        return if (month in 1..12) months[month - 1] else ""
    }
}

class ResultsAdapter : RecyclerView.Adapter<ResultsAdapter.ViewHolder>() {
    
    private var results = listOf<PayrollResult>()
    
    fun submitList(newResults: List<PayrollResult>) {
        results = newResults
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemResultBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(results[position])
    }
    
    override fun getItemCount() = results.size
    
    class ViewHolder(
        private val binding: ItemResultBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(result: PayrollResult) {
            binding.tvEmployeeName.text = result.employeeName
            binding.tvWTUnits.text = String.format("%.2f", result.wtUnits)
            binding.tvWEFriday.text = String.format("%.2f", result.weFriday)
            binding.tvWEOther.text = String.format("%.2f", result.weOther)
            binding.tvWETotal.text = String.format("%.2f", result.weTotal)
            binding.tvThresholdReached.text = if (result.thresholdReached) "JA" else "NEIN"
            binding.tvPayoutWT.text = String.format("%.2f €", result.payoutWT)
            binding.tvPayoutWE.text = String.format("%.2f €", result.payoutWE)
            binding.tvPayoutTotal.text = String.format("%.2f €", result.payoutTotal)
        }
    }
}
