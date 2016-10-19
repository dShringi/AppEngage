package com.example.testapp2;

import android.app.Application;
import android.os.Build;
import android.support.annotation.RequiresApi;
import android.util.Log;
import android.widget.Toast;

import com.mastek.appengage.ActivityTracker;
import com.mastek.appengage.exchandler.ExceptionHandler;

/**
 * Created by Badal13631 on 9/23/2016.
 */

public class app extends Application {
    @RequiresApi(api = Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    @Override
    public void onCreate() {
        super.onCreate();
        //Thread.setDefaultUncaughtExceptionHandler(new ExceptionHandler(this));

        registerActivityLifecycleCallbacks(new ActivityTracker());

        //Log.e("AppLevel","Broadcast Reviever Called");

        //Toast.makeText(this,"MyReceiver Called in app",Toast.LENGTH_SHORT);

    }
}
