package com.aegis.fieldagent.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.aegis.fieldagent.R
import com.aegis.fieldagent.data.PreferencesManager
import com.aegis.fieldagent.databinding.ActivityMainBinding
import com.aegis.fieldagent.network.ApiService
import com.aegis.fieldagent.network.RegisterDeviceRequest
import com.aegis.fieldagent.service.AgentService
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefsManager: PreferencesManager
    private var apiService: ApiService? = null

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        if (allGranted) {
            Toast.makeText(this, "All permissions granted", Toast.LENGTH_SHORT).show()
            updateUI()
        } else {
            Toast.makeText(this, "Some permissions denied. Agent may not function properly.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefsManager = PreferencesManager(this)
        
        setupUI()
        checkPermissions()
        updateUI()
    }

    private fun setupUI() {
        binding.btnRegister.setOnClickListener {
            registerDevice()
        }

        binding.btnStartService.setOnClickListener {
            startAgentService()
        }

        binding.btnStopService.setOnClickListener {
            stopAgentService()
        }

        binding.btnClearData.setOnClickListener {
            clearData()
        }

        binding.btnSaveServer.setOnClickListener {
            saveServerUrl()
        }
    }

    private fun updateUI() {
        val isRegistered = prefsManager.isRegistered
        
        binding.layoutRegistration.visibility = if (isRegistered) View.GONE else View.VISIBLE
        binding.layoutControl.visibility = if (isRegistered) View.VISIBLE else View.GONE
        
        if (isRegistered) {
            binding.tvDeviceId.text = "Device ID: ${prefsManager.deviceId?.take(8)}..."
            binding.tvDeviceName.text = "Name: ${prefsManager.deviceName}"
            binding.tvStatus.text = "Status: Registered"
        }
        
        binding.etServerUrl.setText(prefsManager.serverUrl)
    }

    private fun checkPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            permissions.add(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun saveServerUrl() {
        val url = binding.etServerUrl.text.toString().trim()
        if (url.isNotEmpty()) {
            prefsManager.serverUrl = url
            apiService = ApiService.create(url)
            Toast.makeText(this, "Server URL saved", Toast.LENGTH_SHORT).show()
        }
    }

    private fun registerDevice() {
        val deviceName = binding.etDeviceName.text.toString().trim()
        val serverUrl = binding.etServerUrl.text.toString().trim()

        if (deviceName.isEmpty()) {
            Toast.makeText(this, "Please enter device name", Toast.LENGTH_SHORT).show()
            return
        }

        if (serverUrl.isEmpty()) {
            Toast.makeText(this, "Please enter server URL", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnRegister.isEnabled = false
        binding.progressBar.visibility = View.VISIBLE

        prefsManager.serverUrl = serverUrl
        apiService = ApiService.create(serverUrl)

        lifecycleScope.launch {
            try {
                val response = apiService!!.registerDevice(
                    RegisterDeviceRequest(deviceName = deviceName)
                )

                if (response.isSuccessful && response.body() != null) {
                    val data = response.body()!!
                    
                    prefsManager.deviceId = data.deviceId
                    prefsManager.authToken = data.token
                    prefsManager.deviceName = deviceName
                    prefsManager.isRegistered = true

                    Log.i(TAG, "Device registered: ${data.deviceId}")
                    
                    Toast.makeText(
                        this@MainActivity,
                        "Device registered successfully!",
                        Toast.LENGTH_SHORT
                    ).show()

                    updateUI()
                } else {
                    Toast.makeText(
                        this@MainActivity,
                        "Registration failed: ${response.code()}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Registration error", e)
                Toast.makeText(
                    this@MainActivity,
                    "Registration error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                binding.btnRegister.isEnabled = true
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun startAgentService() {
        if (!prefsManager.isRegistered) {
            Toast.makeText(this, "Please register device first", Toast.LENGTH_SHORT).show()
            return
        }

        val intent = Intent(this, AgentService::class.java).apply {
            putExtra(AgentService.EXTRA_DEVICE_ID, prefsManager.deviceId)
            putExtra(AgentService.EXTRA_AUTH_TOKEN, prefsManager.authToken)
            putExtra(AgentService.EXTRA_SERVER_URL, prefsManager.serverUrl)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        Toast.makeText(this, "Agent service started", Toast.LENGTH_SHORT).show()
        binding.tvStatus.text = "Status: Service Running"
    }

    private fun stopAgentService() {
        val intent = Intent(this, AgentService::class.java)
        stopService(intent)
        Toast.makeText(this, "Agent service stopped", Toast.LENGTH_SHORT).show()
        binding.tvStatus.text = "Status: Service Stopped"
    }

    private fun clearData() {
        stopAgentService()
        prefsManager.clear()
        updateUI()
        Toast.makeText(this, "All data cleared", Toast.LENGTH_SHORT).show()
    }
}
