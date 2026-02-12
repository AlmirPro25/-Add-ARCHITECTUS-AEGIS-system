package com.aegis.fieldagent.network

import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

data class RegisterDeviceRequest(
    @SerializedName("deviceName") val deviceName: String,
    @SerializedName("deviceType") val deviceType: String = "ANDROID"
)

data class RegisterDeviceResponse(
    @SerializedName("token") val token: String,
    @SerializedName("deviceId") val deviceId: String,
    @SerializedName("device") val device: DeviceInfo
)

data class DeviceInfo(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("type") val type: String,
    @SerializedName("isOnline") val isOnline: Boolean
)

interface ApiService {
    
    @POST("/api/v1/auth/register-device")
    suspend fun registerDevice(@Body request: RegisterDeviceRequest): Response<RegisterDeviceResponse>

    companion object {
        fun create(baseUrl: String): ApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            return retrofit.create(ApiService::class.java)
        }
    }
}
