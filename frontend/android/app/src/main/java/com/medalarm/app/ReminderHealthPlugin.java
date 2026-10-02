package com.medalarm.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Reports the device settings that decide whether dose reminders arrive on time,
 * and opens the screens where the user can fix them.
 */
@CapacitorPlugin(name = "ReminderHealth")
public class ReminderHealthPlugin extends Plugin {

    // Must match CHANNEL_ID in src/services/reminderService.js.
    private static final String REMINDER_CHANNEL_ID = "medalarm-reminders";

    @PluginMethod
    public void getStatus(PluginCall call) {
        Context context = getContext();

        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean batteryOptimized = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                && powerManager != null
                && !powerManager.isIgnoringBatteryOptimizations(context.getPackageName());

        boolean channelEnabled = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            NotificationChannel channel = manager != null ? manager.getNotificationChannel(REMINDER_CHANNEL_ID) : null;
            channelEnabled = channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }

        JSObject result = new JSObject();
        result.put("batteryOptimized", batteryOptimized);
        result.put("notificationsEnabled", NotificationManagerCompat.from(context).areNotificationsEnabled());
        result.put("channelEnabled", channelEnabled);
        result.put("manufacturer", Build.MANUFACTURER);
        call.resolve(result);
    }

    /**
     * Opens the battery-optimization list, where the user can set MedAlarm to
     * "Not optimized". Asking for the exemption directly needs
     * REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, which Play restricts.
     */
    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
        } catch (ActivityNotFoundException ex) {
            // Some OEM builds remove that screen; fall back to the app's own settings page.
            Intent details = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", getContext().getPackageName(), null));
            details.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(details);
        }
        call.resolve();
    }
}
