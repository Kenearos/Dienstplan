package com.dienstplan.nrw

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.dienstplan.nrw.data.DutyDataStore
import com.dienstplan.nrw.databinding.ActivityDutyEntryBinding
import com.dienstplan.nrw.databinding.ItemDutyEntryBinding
import com.dienstplan.nrw.model.DutyEntry
import java.text.SimpleDateFormat
import java.util.*

class DutyEntryActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityDutyEntryBinding
    private lateinit var adapter: DutyEntryAdapter
    private var year: Int = 0
    private var month: Int = 0
    private val dateFormat = SimpleDateFormat("dd.MM.yyyy", Locale.GERMANY)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDutyEntryBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        year = intent.getIntExtra("year", 0)
        month = intent.getIntExtra("month", 0)
        
        if (year == 0 || month == 0) {
            finish()
            return
        }
        
        setupUI()
        loadDuties()
    }
    
    private fun setupUI() {
        val monthName = getMonthName(month)
        binding.tvSelectedMonth.text = String.format("%s %d", monthName, year)
        
        adapter = DutyEntryAdapter { duty ->
            deleteDuty(duty)
        }
        binding.rvDuties.layoutManager = LinearLayoutManager(this)
        binding.rvDuties.adapter = adapter
        
        binding.btnAddDuty.setOnClickListener {
            showAddDutyDialog()
        }
        
        binding.btnSave.setOnClickListener {
            Toast.makeText(this, "Dienste gespeichert", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
    
    private fun loadDuties() {
        val duties = DutyDataStore.getDutiesForMonth(year, month)
        adapter.submitList(duties)
    }
    
    private fun showAddDutyDialog() {
        val dates = DutyDataStore.getDatesInMonth(year, month)
        val dateStrings = dates.map { dateFormat.format(it) }.toTypedArray()
        
        AlertDialog.Builder(this)
            .setTitle("Datum auswählen")
            .setItems(dateStrings) { _, which ->
                val selectedDate = dates[which]
                showEmployeeDialog(selectedDate)
            }
            .show()
    }
    
    private fun showEmployeeDialog(date: Date) {
        val builder = AlertDialog.Builder(this)
        val inflater = layoutInflater
        val dialogView = inflater.inflate(R.layout.dialog_add_duty, null)
        
        val etName = dialogView.findViewById<android.widget.EditText>(R.id.etEmployeeName)
        val etShare = dialogView.findViewById<android.widget.EditText>(R.id.etShare)
        
        builder.setView(dialogView)
            .setTitle("Dienst hinzufügen - ${dateFormat.format(date)}")
            .setPositiveButton("Hinzufügen") { _, _ ->
                val name = etName.text.toString().trim()
                val shareStr = etShare.text.toString().trim()
                
                if (name.isEmpty()) {
                    Toast.makeText(this, R.string.error_empty_name, Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                val share = shareStr.toDoubleOrNull() ?: 0.0
                if (share <= 0.0 || share > 1.0) {
                    Toast.makeText(this, R.string.error_invalid_share, Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                val monthKey = DutyDataStore.getMonthKey(year, month)
                val duty = DutyEntry(
                    date = date,
                    employeeName = name,
                    share = share,
                    monthKey = monthKey
                )
                
                DutyDataStore.addDuty(duty)
                loadDuties()
            }
            .setNegativeButton("Abbrechen", null)
            .show()
    }
    
    private fun deleteDuty(duty: DutyEntry) {
        DutyDataStore.deleteDuty(duty.id)
        loadDuties()
    }
    
    private fun getMonthName(month: Int): String {
        val months = resources.getStringArray(R.array.months)
        return if (month in 1..12) months[month - 1] else ""
    }
}

class DutyEntryAdapter(
    private val onDelete: (DutyEntry) -> Unit
) : RecyclerView.Adapter<DutyEntryAdapter.ViewHolder>() {
    
    private var duties = listOf<DutyEntry>()
    private val dateFormat = SimpleDateFormat("dd.MM.yyyy", Locale.GERMANY)
    
    fun submitList(newDuties: List<DutyEntry>) {
        duties = newDuties.sortedBy { it.date }
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemDutyEntryBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(duties[position])
    }
    
    override fun getItemCount() = duties.size
    
    inner class ViewHolder(
        private val binding: ItemDutyEntryBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(duty: DutyEntry) {
            binding.tvDate.text = dateFormat.format(duty.date)
            binding.etEmployeeName.setText(duty.employeeName)
            binding.etShare.setText(duty.share.toString())
            
            binding.btnDelete.setOnClickListener {
                onDelete(duty)
            }
            
            // Disable editing in the list view
            binding.etEmployeeName.isEnabled = false
            binding.etShare.isEnabled = false
        }
    }
}
