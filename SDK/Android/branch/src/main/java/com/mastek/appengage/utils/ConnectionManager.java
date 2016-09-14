package com.mastek.appengage.utils;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.widget.Toast;

public class ConnectionManager extends BroadcastReceiver{

	public static boolean IS_INTERNET_CONNECTED = false;

	@Override
	public void onReceive(Context context, Intent arg1) {

		boolean isConnected = arg1.getBooleanExtra(
				ConnectivityManager.EXTRA_NO_CONNECTIVITY, false);
		if (isConnected) {
			IS_INTERNET_CONNECTED = true;
			Toast.makeText(context, "Internet Connected",
					Toast.LENGTH_LONG).show();
		} else {
			IS_INTERNET_CONNECTED = false;
			Toast.makeText(context, "Internet Connection Lost", Toast.LENGTH_LONG)
					.show();
		}
	}

	public static boolean isNetworkConnected(Context context) {
		ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo ni = cm.getActiveNetworkInfo();
		if (ni == null) {
			// There are no active networks.
			return false;
		} else
			return true;
	}

}