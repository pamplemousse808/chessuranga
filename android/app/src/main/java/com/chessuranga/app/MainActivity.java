package com.chessuranga.app;

import com.getcapacitor.BridgeActivity;
import androidx.activity.EdgeToEdge;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
    }
}