package com.asitech.geekonsites;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TechnicianLocationService extends Service {
    private static final String TAG = "GOSTracking";
    public static final String ACTION_START = "com.asitech.geekonsites.START_TRACKING";
    public static final String ACTION_STOP = "com.asitech.geekonsites.STOP_TRACKING";
    public static final String EXTRA_BOOKING_ID = "bookingId";
    public static final String EXTRA_TOKEN = "token";
    public static final String EXTRA_API_BASE_URL = "apiBaseUrl";
    private static final String CHANNEL_ID = "technician_live_location";
    private static final int NOTIFICATION_ID = 4107;
    private static final String PREFS = "technician_tracking";

    private FusedLocationProviderClient locationClient;
    private LocationCallback locationCallback;
    private final ExecutorService uploadExecutor = Executors.newSingleThreadExecutor();
    private long bookingId = -1;
    private String token;
    private String apiBaseUrl;

    @Override public void onCreate() {
        super.onCreate();
        locationClient = LocationServices.getFusedLocationProviderClient(this);
        createNotificationChannel();
        locationCallback = new LocationCallback() {
            @Override public void onLocationResult(LocationResult result) {
                Location location = result.getLastLocation();
                if (location != null) uploadLocation(location);
            }
        };
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopTracking();
            return START_NOT_STICKY;
        }
        SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (intent != null && ACTION_START.equals(intent.getAction())) {
            bookingId = intent.getLongExtra(EXTRA_BOOKING_ID, -1);
            token = intent.getStringExtra(EXTRA_TOKEN);
            apiBaseUrl = intent.getStringExtra(EXTRA_API_BASE_URL);
            prefs.edit().putBoolean("tracking", true).putLong("bookingId", bookingId)
                    .putString("token", token).putString("apiBaseUrl", apiBaseUrl).apply();
        } else {
            bookingId = prefs.getLong("bookingId", -1);
            token = prefs.getString("token", null);
            apiBaseUrl = prefs.getString("apiBaseUrl", null);
        }
        if (bookingId < 1 || token == null || apiBaseUrl == null) {
            stopTracking();
            return START_NOT_STICKY;
        }
        startForeground(NOTIFICATION_ID, trackingNotification());
        requestLocationUpdates();
        return START_STICKY;
    }

    private void requestLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopTracking(); return;
        }
        locationClient.removeLocationUpdates(locationCallback);
        LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 7000)
                .setMinUpdateIntervalMillis(5000).setMaxUpdateDelayMillis(10000).build();
        locationClient.requestLocationUpdates(request, locationCallback, getMainLooper());
    }

    private void uploadLocation(Location location) {
        Log.i(TAG, "firstFix bookingId=" + bookingId + " accuracyMeters=" + (location.hasAccuracy() ? Math.round(location.getAccuracy()) : "unknown"));
        final long currentBooking = bookingId;
        final String currentToken = token;
        final String currentBase = apiBaseUrl;
        uploadExecutor.execute(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(currentBase + "/api/bookings/" + currentBooking + "/technician/location");
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("PUT"); connection.setConnectTimeout(10000); connection.setReadTimeout(10000);
                connection.setDoOutput(true); connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Authorization", "Bearer " + currentToken);
                JSONObject payload = new JSONObject();
                payload.put("latitude", location.getLatitude()); payload.put("longitude", location.getLongitude());
                payload.put("accuracy", location.hasAccuracy() ? location.getAccuracy() : JSONObject.NULL);
                payload.put("speed", location.hasSpeed() ? location.getSpeed() * 3.6 : JSONObject.NULL);
                payload.put("heading", location.hasBearing() ? location.getBearing() : JSONObject.NULL);
                payload.put("currentRoad", ""); payload.put("liveTrackingStatus", "ON_THE_WAY");
                SimpleDateFormat timestamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US);
                timestamp.setTimeZone(TimeZone.getTimeZone("UTC"));
                payload.put("gpsTime", timestamp.format(new Date(location.getTime())));
                byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);
                connection.setFixedLengthStreamingMode(body.length);
                try (OutputStream output = connection.getOutputStream()) { output.write(body); }
                int response = connection.getResponseCode();
                Log.i(TAG, "locationPut bookingId=" + currentBooking + " status=" + response);
                if (response >= 200 && response < 300) {
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                        StringBuilder responseBody = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) responseBody.append(line);
                        if (responseBody.length() > 0) {
                            JSONObject booking = new JSONObject(responseBody.toString());
                            String status = booking.optString("bookingStatus", "");
                            String mode = booking.optString("serviceMode", "");
                            if ("REMOTE".equals(mode) || "TECHNICIAN_ARRIVED".equals(status) ||
                                    "SERVICE_STARTED".equals(status) || "SERVICE_COMPLETED".equals(status) ||
                                    "BOOKING_CLOSED".equals(status) || "CANCELLED".equals(status)) stopTracking();
                        }
                    }
                } else if (response >= 400 && response < 500) {
                    stopTracking();
                }
            } catch (Exception ignored) {
                // A temporary network failure must not stop subsequent scheduled updates.
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    private Notification trackingNotification() {
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(this, CHANNEL_ID).setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("GeekOnSites Technician Tracking")
                .setContentText("Live location is active for your onsite job.")
                .setOngoing(true).setOnlyAlertOnce(true).setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setContentIntent(pending).build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Technician live location", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Shows when an onsite technician is sharing live job location.");
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    private void stopTracking() {
        if (locationClient != null && locationCallback != null) locationClient.removeLocationUpdates(locationCallback);
        getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply();
        stopForeground(STOP_FOREGROUND_REMOVE); stopSelf();
    }

    @Override public void onDestroy() { if (locationClient != null) locationClient.removeLocationUpdates(locationCallback); uploadExecutor.shutdown(); super.onDestroy(); }
    @Nullable @Override public IBinder onBind(Intent intent) { return null; }
}
