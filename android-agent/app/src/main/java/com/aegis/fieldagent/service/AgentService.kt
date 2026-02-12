package com.aegis.fieldagent.service

import android.Manifest
import android.app.Notification
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.aegis.fieldagent.AegisApplication
import com.aegis.fieldagent.R
import com.aegis.fieldagent.data.PreferencesManager
import com.google.android.gms.location.*
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AgentService : Service(), SensorEventListener {

    companion object {
        private const val TAG = "AgentService"
        private const val NOTIFICATION_ID = 1001
        private const val TELEMETRY_INTERVAL = 5000L // 5 seconds
        
        const val EXTRA_DEVICE_ID = "device_id"
        const val EXTRA_AUTH_TOKEN = "auth_token"
        const val EXTRA_SERVER_URL = "server_url"
    }

    private lateinit var prefsManager: PreferencesManager
    private lateinit var sensorManager: SensorManager
    private lateinit var batteryManager: BatteryManager
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var handler: Handler
    private lateinit var wakeLock: PowerManager.WakeLock
    
    private var socket: Socket? = null
    private var deviceId: String? = null
    private var authToken: String? = null
    private var serverUrl: String? = null
    private var isUplinkActive = false
    
    private var lastAccelerometerData: FloatArray? = null
    private var lastGyroscopeData: FloatArray? = null
    
    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(locationResult: LocationResult) {
            locationResult.lastLocation?.let { location ->
                sendLocationTelemetry(location)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "AgentService onCreate")
        
        prefsManager = PreferencesManager(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        handler = Handler(Looper.getMainLooper())
        
        // Acquire wake lock to keep service running
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "AegisAgent::WakeLock"
        )
        wakeLock.acquire(10*60*1000L /*10 minutes*/)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "AgentService onStartCommand")
        
        deviceId = intent?.getStringExtra(EXTRA_DEVICE_ID) ?: prefsManager.deviceId
        authToken = intent?.getStringExtra(EXTRA_AUTH_TOKEN) ?: prefsManager.authToken
        serverUrl = intent?.getStringExtra(EXTRA_SERVER_URL) ?: prefsManager.serverUrl
        
        if (deviceId == null || authToken == null) {
            Log.e(TAG, "Missing device ID or auth token. Stopping service.")
            stopSelf()
            return START_NOT_STICKY
        }
        
        startForeground(NOTIFICATION_ID, createNotification("Initializing uplink..."))
        
        if (!isUplinkActive) {
            initSocketIO()
            startDataCollection()
            isUplinkActive = true
        }
        
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "AgentService onDestroy")
        
        stopDataCollection()
        socket?.disconnect()
        socket = null
        
        if (wakeLock.isHeld) {
            wakeLock.release()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotification(message: String): Notification {
        return NotificationCompat.Builder(this, AegisApplication.NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Aegis Field Agent")
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setShowWhen(false)
            .build()
    }

    private fun updateNotification(message: String) {
        val notification = createNotification(message)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun initSocketIO() {
        try {
            val options = IO.Options().apply {
                auth = mapOf("token" to authToken!!)
                forceNew = true
                transports = arrayOf("websocket")
                reconnection = true
                reconnectionDelay = 5000
                reconnectionAttempts = Int.MAX_VALUE
            }
            
            socket = IO.socket(serverUrl!!, options)
            
            socket?.on(Socket.EVENT_CONNECT) {
                Log.i(TAG, "Socket connected! Device ID: $deviceId")
                handler.post {
                    updateNotification("Uplink Active • Transmitting")
                    sendStatusTelemetry(true)
                }
            }
            
            socket?.on(Socket.EVENT_DISCONNECT) { args ->
                Log.w(TAG, "Socket disconnected! Reason: ${args.getOrNull(0)}")
                handler.post {
                    updateNotification("Uplink Severed • Reconnecting...")
                    sendStatusTelemetry(false)
                }
            }
            
            socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e(TAG, "Socket connect error: ${args.getOrNull(0)}")
                handler.post {
                    updateNotification("Uplink Error • Retrying...")
                }
            }
            
            socket?.on(Socket.EVENT_RECONNECT) {
                Log.i(TAG, "Socket reconnected")
                handler.post {
                    updateNotification("Uplink Restored • Transmitting")
                }
            }
            
            socket?.connect()
            
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Socket.IO", e)
        }
    }

    private fun sendTelemetry(type: String, data: JSONObject) {
        socket?.let { s ->
            if (s.connected()) {
                try {
                    val payload = JSONObject().apply {
                        put("type", type)
                        put("data", data)
                    }
                    s.emit("telemetry", payload)
                } catch (e: Exception) {
                    Log.e(TAG, "Error sending telemetry", e)
                }
            }
        }
    }

    private fun sendStatusTelemetry(online: Boolean) {
        val data = JSONObject().apply {
            put("online", online)
            put("timestamp", System.currentTimeMillis())
        }
        sendTelemetry("STATUS", data)
    }

    private fun sendLocationTelemetry(location: Location) {
        val data = JSONObject().apply {
            put("lat", location.latitude)
            put("lng", location.longitude)
            put("acc", location.accuracy)
            put("alt", location.altitude)
            put("speed", location.speed)
            put("timestamp", location.time)
        }
        sendTelemetry("GPS", data)
    }

    private fun sendBatteryTelemetry() {
        val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val isCharging = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            batteryManager.isCharging
        } else {
            false
        }
        
        val data = JSONObject().apply {
            put("level", batteryLevel)
            put("isCharging", isCharging)
            put("timestamp", System.currentTimeMillis())
        }
        sendTelemetry("BATTERY", data)
    }

    private fun sendSensorTelemetry() {
        lastAccelerometerData?.let { acc ->
            val data = JSONObject().apply {
                put("x", acc[0])
                put("y", acc[1])
                put("z", acc[2])
                put("timestamp", System.currentTimeMillis())
            }
            sendTelemetry("ACCELEROMETER", data)
        }
        
        lastGyroscopeData?.let { gyro ->
            val data = JSONObject().apply {
                put("x", gyro[0])
                put("y", gyro[1])
                put("z", gyro[2])
                put("timestamp", System.currentTimeMillis())
            }
            sendTelemetry("GYROSCOPE", data)
        }
    }

    private val periodicTask = object : Runnable {
        override fun run() {
            sendBatteryTelemetry()
            sendSensorTelemetry()
            handler.postDelayed(this, TELEMETRY_INTERVAL)
        }
    }

    private fun startDataCollection() {
        // Start location updates
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) 
            == PackageManager.PERMISSION_GRANTED) {
            
            val locationRequest = LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                TELEMETRY_INTERVAL
            ).apply {
                setMinUpdateIntervalMillis(TELEMETRY_INTERVAL)
                setWaitForAccurateLocation(false)
            }.build()
            
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            
            Log.d(TAG, "Started GPS updates")
        } else {
            Log.w(TAG, "Location permission not granted")
        }
        
        // Register sensor listeners
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        gyroscope?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        
        Log.d(TAG, "Registered sensor listeners")
        
        // Start periodic tasks
        handler.post(periodicTask)
    }

    private fun stopDataCollection() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        sensorManager.unregisterListener(this)
        handler.removeCallbacks(periodicTask)
        Log.d(TAG, "Stopped data collection")
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> lastAccelerometerData = event.values.clone()
            Sensor.TYPE_GYROSCOPE -> lastGyroscopeData = event.values.clone()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Not used
    }
}
