package com.mastek.appengage;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

import com.mastek.appengage.dbusermanager.DBUserManager;

import org.json.JSONArray;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by rakesh13449 on 14-Jun-16.
 */
public class MyReceiver extends BroadcastReceiver {
    private static final String TAG = MyReceiver.class.getSimpleName();
    private DBUserManager dbUserManager;
//    User user;

    @Override
    public void onReceive(Context context, Intent intent) {
        //Toast.makeText(context,"OnRecieve Called",Toast.LENGTH_LONG);
        //Log.e("OnRecieve","onRecieve");
        isNetworkAvailable(context);
    }


    public boolean isNetworkAvailable(Context context) {
          if (isOnline(context)) {
            //Log.e("network", "insideIsOnlineIf");
            Log.v(TAG, "Now you are connected to Internet!");
            //Toast.makeText(context, "Internet availablle via Broadcast receiver", Toast.LENGTH_SHORT).show();
            SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
            String sync_status = preferences.getString("sync_status", null);
            //Log.e(TAG, "sync_status:----" + sync_status);

            dbUserManager = new DBUserManager(context);
            JSONArray array = dbUserManager.findArray();
            SharedPreferences prefs = context.getSharedPreferences("com.mastek.appengage", context.MODE_PRIVATE);

				Log.e("contains","----->"+prefs.contains("URL"));
                String URL="";
				if(prefs.contains("URL"))
				{
					URL = prefs.getString("URL",null);
					Log.e("inSharedPref",URL);

              //Log.e("network","abc "+array.length());
            if(array!=null) {
                //Log.e("network","insidearraylength");
                new MA.SendJsonArrayToServerWhenOnline(URL).execute(String.valueOf(array));
                dbUserManager.removeAll();
                Log.e(TAG, "entries in database deleted:----");

            }
                }
                //////task to get the data from database from user... and send in webservice
            return true;
    } else {
            //Log.e("network","insideElseOfisOnline");
            Log.v(TAG, "You are not connected to Internet!");
            //Toast.makeText(context, "Internet NOT availablle via Broadcast receiver", Toast.LENGTH_SHORT).show();
            return false;
        }
    }

    public boolean isOnline(Context context) {
        ConnectivityManager cm =
                (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo netInfo = cm.getActiveNetworkInfo();
        return netInfo != null && netInfo.isConnected();
    }
}
