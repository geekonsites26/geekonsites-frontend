package com.asitech.geekonsites;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "TechnicianTracking", permissions = {
        @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }),
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
})
public class TechnicianTrackingPlugin extends Plugin {
    private static final String PREFS = "technician_tracking";

    @PluginMethod
    public void startTechnicianTracking(PluginCall call) {
        boolean notificationsRequired = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU;
        if (getPermissionState("location") != PermissionState.GRANTED ||
                (notificationsRequired && getPermissionState("notifications") != PermissionState.GRANTED)) {
            requestPermissionForAliases(new String[] { "location", "notifications" }, call, "locationPermissionCallback");
            return;
        }
        startService(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Location permission denied. Enable precise location in Android settings.", "LOCATION_PERMISSION_DENIED");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                getPermissionState("notifications") != PermissionState.GRANTED) {
            call.reject("Notification permission is required to show when live tracking is active. Enable it in Android settings.", "NOTIFICATION_PERMISSION_DENIED");
            return;
        }
        startService(call);
    }

    private void startService(PluginCall call) {
        Long bookingId = call.getLong("bookingId");
        String token = call.getString("token");
        String apiBaseUrl = call.getString("apiBaseUrl");
        if (bookingId == null || token == null || token.isBlank() || apiBaseUrl == null || !apiBaseUrl.startsWith("https://") || apiBaseUrl.contains("localhost")) {
            call.reject("Secure tracking configuration is invalid.", "INVALID_TRACKING_CONFIGURATION");
            return;
        }
        LocationManager manager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (manager == null || (!manager.isProviderEnabled(LocationManager.GPS_PROVIDER) && !manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER))) {
            call.reject("Location services are disabled. Enable GPS and try again.", "LOCATION_SERVICES_DISABLED");
            return;
        }
        Intent intent = new Intent(getContext(), TechnicianLocationService.class)
                .setAction(TechnicianLocationService.ACTION_START)
                .putExtra(TechnicianLocationService.EXTRA_BOOKING_ID, bookingId)
                .putExtra(TechnicianLocationService.EXTRA_TOKEN, token)
                .putExtra(TechnicianLocationService.EXTRA_API_BASE_URL, apiBaseUrl);
        ContextCompat.startForegroundService(getContext(), intent);
        JSObject result = new JSObject();
        result.put("tracking", true); result.put("bookingId", bookingId);
        call.resolve(result);
    }

    @PluginMethod
    public void stopTechnicianTracking(PluginCall call) {
        Intent intent = new Intent(getContext(), TechnicianLocationService.class).setAction(TechnicianLocationService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void getTechnicianTrackingStatus(PluginCall call) {
        var prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSObject result = new JSObject();
        result.put("tracking", prefs.getBoolean("tracking", false));
        if (prefs.contains("bookingId")) result.put("bookingId", prefs.getLong("bookingId", -1));
        call.resolve(result);
    }
}
