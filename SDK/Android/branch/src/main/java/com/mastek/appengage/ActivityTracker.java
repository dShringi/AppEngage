package com.mastek.appengage;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

/**
 * Created by Badal13631 on 9/22/2016.
 */

public class ActivityTracker implements Application.ActivityLifecycleCallbacks {

    HashMap<String,Integer> hashMapActivityTracker = new HashMap<String,Integer>();
    long[] startTime = new long[2];
    long[] endTime = new long[2];
    long timeSpent;
    int temp0 = 0;
    int temp1 = 0;

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        //Log.e("onActivityCreated","Activity Name :"+ activity.getLocalClassName());
    }

    @Override
    public void onActivityStarted(Activity activity) {
        //Log.e("onActivityStarted","Activity Name :"+ activity.getLocalClassName());


        if(temp0 == 1)
            temp0 = 0;
        else if(temp0 == 0)
            temp0 = 1;

        startTime[temp0] = System.nanoTime();
        Log.e("onActivityStarted",activity.getLocalClassName()+" Start time :"+startTime[temp0]);
    }

    @Override
    public void onActivityResumed(Activity activity) {

        //Log.e("onActivityResumed","Activity Name :"+ activity.getLocalClassName());
    }

    @Override
    public void onActivityPaused(Activity activity) {
        //Log.e("onActivityPaused","Activity Name :"+ activity.getLocalClassName());

    }

    @Override
    public void onActivityStopped(Activity activity) {
        //Log.e("onActivityStopped","Activity Name :"+ activity.getLocalClassName());

        if(temp1 == 1)
            temp1 = 0;
        else if(temp1 == 0)
            temp1 = 1;

        endTime[temp1] = System.nanoTime();

        Log.e("onActivityStopped",activity.getLocalClassName()+" End time :"+endTime[temp1]);
        timeSpent = endTime[temp1]-startTime[temp1];
        timeSpent = TimeUnit.NANOSECONDS.toSeconds(timeSpent);
        Log.e("TimeSpent","TimeSpent"+" on "+activity.getLocalClassName()+" is "+timeSpent);
        if(hashMapActivityTracker.containsKey(activity.getLocalClassName())) {
            timeSpent+=hashMapActivityTracker.get(activity.getLocalClassName());
            hashMapActivityTracker.put(activity.getLocalClassName(), (int) timeSpent);
        }
        else hashMapActivityTracker.put(activity.getLocalClassName(),(int) timeSpent);

            Log.e("hash",hashMapActivityTracker.toString());
    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

        //Log.e("onActivitySaveInstanceState","Activity Name :"+ activity.getLocalClassName());
    }

    @Override
    public void onActivityDestroyed(Activity activity) {
        //Log.e("onActivityDestroyed","Activity Name :"+ activity.getLocalClassName());
        JSONObject json = new JSONObject(hashMapActivityTracker);
        Log.e("Destroy Method Called",json.toString());
    }
}
