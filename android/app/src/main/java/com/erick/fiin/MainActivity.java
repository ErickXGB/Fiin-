package com.erick.fiin;

import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onResume() {
        super.onResume();
        handleQuickType(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleQuickType(intent);
    }

    private void handleQuickType(Intent intent) {
        if (intent == null) return;
        String quickType = intent.getStringExtra("quick_type");
        if (quickType != null && ("expense".equals(quickType) || "income".equals(quickType))) {
            intent.removeExtra("quick_type");
            if (bridge != null && bridge.getWebView() != null) {
                String js = String.format(
                        "window.__FIIN_QUICK_ACTION__ = '%s'; window.dispatchEvent(new CustomEvent('fiin_quick_action', { detail: '%s' }));",
                        quickType, quickType
                );
                bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(js, null));
            }
        }
    }
}
