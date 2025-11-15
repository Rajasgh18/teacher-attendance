package com.teacher_attendance

import android.content.Intent
import android.content.IntentFilter
import android.content.BroadcastReceiver
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class LocationTrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val locationReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == "LOCATION_UPDATE") {
                val latitude = intent.getDoubleExtra("latitude", 0.0)
                val longitude = intent.getDoubleExtra("longitude", 0.0)
                val timestamp = intent.getLongExtra("timestamp", 0L)
                                
                // Create WritableMap for React Native
                val params = Arguments.createMap().apply {
                    putDouble("latitude", latitude)
                    putDouble("longitude", longitude)
                    putDouble("timestamp", timestamp.toDouble())
                }
                
                // Send event to React Native
                try {
                    reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onLocationUpdate", params)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                println("LocationTrackingModule: Received broadcast with unknown action: ${intent?.action}")
            }
        }
    }

    override fun getName(): String {
        return "LocationTrackingModule"
    }

    @ReactMethod
    fun startLocationTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LocationTrackingService::class.java).apply {
                action = "START_TRACKING"
            }
            reactApplicationContext.startForegroundService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to start location tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun stopLocationTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LocationTrackingService::class.java).apply {
                action = "STOP_TRACKING"
            }
            reactApplicationContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to stop location tracking: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for EventEmitter
        
        // Register broadcast receiver when first listener is added
        if (eventName === "onLocationUpdate") {
            try {
                val filter = IntentFilter("LOCATION_UPDATE")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    reactApplicationContext.registerReceiver(locationReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    reactApplicationContext.registerReceiver(locationReceiver, filter)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }



    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for EventEmitter
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        reactApplicationContext.unregisterReceiver(locationReceiver)
    }

    init {
        println("LocationTrackingModule: Initializing...")
        
        // Try to register broadcast receiver immediately
        try {
            val filter = IntentFilter("LOCATION_UPDATE")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactApplicationContext.registerReceiver(locationReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                reactApplicationContext.registerReceiver(locationReceiver, filter)
            }
            println("LocationTrackingModule: Broadcast receiver registered for LOCATION_UPDATE")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
