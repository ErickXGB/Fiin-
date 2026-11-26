package com.erick.fiin;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class FiinApplication extends Application implements SharedPreferences.OnSharedPreferenceChangeListener {

    @Override
    public void onCreate() {
        super.onCreate();
        getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
                .registerOnSharedPreferenceChangeListener(this);
    }

    @Override
    public void onSharedPreferenceChanged(SharedPreferences prefs, String key) {
        if (key != null && key.startsWith("weekly_")) {
            Intent intent = new Intent(FiinWeeklyWidgetProvider.ACTION_UPDATE);
            intent.setPackage(getPackageName());
            sendBroadcast(intent);
        }
    }
}
