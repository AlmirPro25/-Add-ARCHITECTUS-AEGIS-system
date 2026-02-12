package com.aegis.fieldagent.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class PreferencesManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "aegis_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_DEVICE_NAME = "device_name"
        private const val KEY_SERVER_URL = "server_url"
        private const val KEY_IS_REGISTERED = "is_registered"
    }

    var deviceId: String?
        get() = sharedPreferences.getString(KEY_DEVICE_ID, null)
        set(value) = sharedPreferences.edit().putString(KEY_DEVICE_ID, value).apply()

    var authToken: String?
        get() = sharedPreferences.getString(KEY_AUTH_TOKEN, null)
        set(value) = sharedPreferences.edit().putString(KEY_AUTH_TOKEN, value).apply()

    var deviceName: String?
        get() = sharedPreferences.getString(KEY_DEVICE_NAME, null)
        set(value) = sharedPreferences.edit().putString(KEY_DEVICE_NAME, value).apply()

    var serverUrl: String
        get() = sharedPreferences.getString(KEY_SERVER_URL, "http://10.0.2.2:3000") ?: "http://10.0.2.2:3000"
        set(value) = sharedPreferences.edit().putString(KEY_SERVER_URL, value).apply()

    var isRegistered: Boolean
        get() = sharedPreferences.getBoolean(KEY_IS_REGISTERED, false)
        set(value) = sharedPreferences.edit().putBoolean(KEY_IS_REGISTERED, value).apply()

    fun clear() {
        sharedPreferences.edit().clear().apply()
    }
}
