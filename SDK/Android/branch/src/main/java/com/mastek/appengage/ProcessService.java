package com.mastek.appengage;

import java.lang.reflect.Method;

import android.app.Service;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.widget.Toast;

public class ProcessService extends Service {

	@Override
	public final int onStartCommand(Intent intent, int flags, int startId) {
		Toast.makeText(getApplicationContext(), "onStartCommand",
				Toast.LENGTH_SHORT).show();
		return START_STICKY;
	}

	@Override
	public final IBinder onBind(Intent intent) {
		return null;
	}

	@Override
	public void onTaskRemoved(Intent rootIntent) {
		Toast.makeText(getApplicationContext(), "APP KILLED", Toast.LENGTH_LONG)
				.show(); // here your app is killed by user
		try {
			stopService(new Intent(this, this.getClass()));
		} catch (Exception e) {
			e.printStackTrace();
		}
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
			super.onTaskRemoved(rootIntent);
		} else {
		}
	}


}
