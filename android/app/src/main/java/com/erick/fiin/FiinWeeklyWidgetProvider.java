package com.erick.fiin;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.os.Build;
import android.widget.RemoteViews;

public class FiinWeeklyWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_UPDATE = "com.erick.fiin.UPDATE_WEEKLY_WIDGET";
    private static final String PREFS = "CapacitorStorage";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAll(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE.equals(intent.getAction())) {
            updateAll(context);
        }
    }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, FiinWeeklyWidgetProvider.class));
        for (int id : ids) {
            updateWidget(context, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String spent = prefs.getString("weekly_spent", "$0.00");
        String limit = prefs.getString("weekly_limit", "$0.00");
        String remaining = prefs.getString("weekly_remaining", "$0.00");
        int percent = parsePercent(prefs.getString("weekly_percent", "0"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weekly_budget);
        views.setTextViewText(R.id.widget_weekly_available, "Disponible: " + remaining);
        views.setTextViewText(R.id.widget_weekly_amount, spent + " de " + limit);
        views.setProgressBar(R.id.widget_weekly_progress, 100, percent, false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            int color = percent >= 100 ? 0xFFEF4444 : percent >= 85 ? 0xFFF59E0B : 0xFF10B981;
            views.setColorStateList(
                    R.id.widget_weekly_progress,
                    "setProgressTintList",
                    ColorStateList.valueOf(color)
            );
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
                context, 3001, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_weekly_root, openPendingIntent);

        manager.updateAppWidget(appWidgetId, views);
    }

    private static int parsePercent(String raw) {
        try {
            return Math.max(0, Math.min(100, Integer.parseInt(raw.trim())));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
