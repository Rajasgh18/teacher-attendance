package com.teacher_attendance

import android.app.*
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import android.app.NotificationManager
import android.content.Context
import android.app.Notification

class LocationTrackingService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var isTracking = false

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "location_tracking_channel"
        private const val LOCATION_UPDATE_INTERVAL = 30 * 1000L // 30 seconds
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createLocationCallback()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_TRACKING" -> startLocationTracking()
            "STOP_TRACKING" -> stopLocationTracking()
            else -> println("LocationTrackingService: Unknown action: ${intent?.action}")
        }
        return START_STICKY
    }

    private fun startLocationTracking() {
        if (isTracking) return
        
        isTracking = true
        startForeground(NOTIFICATION_ID, createNotification())
                
        val locationRequest = LocationRequest.Builder(LOCATION_UPDATE_INTERVAL)
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            println("LocationTrackingService: Security exception - ${e.message}")
        }
    }

    private fun stopLocationTracking() {
        isTracking = false
        fusedLocationClient.removeLocationUpdates(locationCallback)
        stopForeground(true)
        stopSelf()
    }

    private fun createLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                try {
                    locationResult.lastLocation?.let { location ->
                        handleLocationUpdate(location)
                    } ?: run {
                        println("LocationTrackingService: No location in result")
                    }
                } catch (e: Exception) {
                    println("LocationTrackingService: Exception in location callback: ${e.message}")
                    e.printStackTrace()
                }
            }
        }
    }

    private fun handleLocationUpdate(location: Location) {
        // Send location update via broadcast
        val intent = Intent("LOCATION_UPDATE")
        intent.putExtra("latitude", location.latitude)
        intent.putExtra("longitude", location.longitude)
        intent.putExtra("timestamp", System.currentTimeMillis())
        intent.setPackage(packageName) // Make it app-specific
        sendBroadcast(intent)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks your location for attendance"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText("Tracking your location every 5 minutes")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        if (isTracking) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
}
