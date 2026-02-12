# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep Socket.IO classes
-keep class io.socket.** { *; }
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Keep WebRTC classes
-keep class org.webrtc.** { *; }

# Keep Retrofit and Gson
-keep class retrofit2.** { *; }
-keep class com.google.gson.** { *; }

# Keep data classes
-keep class com.aegis.fieldagent.network.** { *; }
-keep class com.aegis.fieldagent.data.** { *; }

# Keep service
-keep class com.aegis.fieldagent.service.AgentService { *; }
