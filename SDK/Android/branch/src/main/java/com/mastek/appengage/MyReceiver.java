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

/**
 * Created by rakesh13449 on 14-Jun-16.
 */
public class MyReceiver extends BroadcastReceiver {
    private static final String TAG = MyReceiver.class.getSimpleName();
    private boolean isConnected = true;
    private DBUserManager dbUserManager;
//    User user;

    @Override
    public void onReceive(Context context, Intent intent) {

        isNetworkAvailable(context);
    }


    private boolean isNetworkAvailable(Context context) {
        ConnectivityManager connectivity = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
//        user = MA.getUserDetails();
        if (connectivity != null) {
            NetworkInfo info = connectivity.getActiveNetworkInfo();
            if (info != null) {
//                for (int i = 0; i < info.length; i++) {
                    if (info.isConnected()/* == NetworkInfo.State.CONNECTED*/) {
                        if (!isConnected) {
                            Log.v(TAG, "Now you are connected to Internet!");
                            Toast.makeText(context, "Internet availablle via Broadcast receiver", Toast.LENGTH_SHORT).show();
                            isConnected = true;

                            SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
                            String sync_status = preferences.getString("sync_status", null);

                            Log.e(TAG, "sync_status:----" + sync_status);


                            dbUserManager = new DBUserManager(context);
                            JSONArray array = dbUserManager.findArray();

//                            Log.e(TAG, "dbUserManager.find(this.user).......:----" + dbUserManager.find(this.user));

                            MA.senddatawhenonline(array);

                            Log.e(TAG, "database deleted:----");

                            //////task to get the data from database from user... and send in webservice
                        }
                        return true;
                    }
//                }
            }
        }
        Log.v(TAG, "You are not connected to Internet!");
        Toast.makeText(context, "Internet NOT availablle via Broadcast receiver", Toast.LENGTH_SHORT).show();
        isConnected = false;
        return false;
    }
}
