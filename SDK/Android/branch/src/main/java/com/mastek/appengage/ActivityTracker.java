package com.mastek.appengage;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.util.Log;

import com.mastek.appengage.utils.Utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Created by Badal13631 on 9/22/2016.
 */

public class ActivityTracker implements Application.ActivityLifecycleCallbacks {
    private static int started;
    private static int stopped;
    private static boolean isEndApiCalled = true;

    HashMap<String,Integer> hashMapActivityTracker = new HashMap<String,Integer>();
  /*  HashMap<String,Long> hashMapDifferenceTracker = new HashMap<String,Long>();
*/
    HashMap<String,Long> hashMapStartTracker = new HashMap<String,Long>();
    HashMap<String,Long> hashMapEndTracker = new HashMap<String,Long>();
//    static JSONArray jsonArray = new JSONArray();
    /*long[] startTime = new long[2];
    long[] endTime = new long[2];*/
    long timeSpent;
   /* int temp0 = 0;
    int temp1 = 0;
*/
    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        //Log.e("onActivityCreated","Activity Name :"+ activity.getLocalClassName());
    }

    @Override
    public void onActivityStarted(Activity activity) {
        //Log.e("onActivityStarted","Activity Name :"+ activity.getLocalClassName());

        if(isEndApiCalled)
        {
            Log.e("Activity Started","Activity started");
            MA.beginApi(activity);
            isEndApiCalled = false;
        }
        started++;
        /*if(temp0 == 1)
            temp0 = 0;
        else if(temp0 == 0)
            temp0 = 1;*/
        hashMapStartTracker.put(activity.getLocalClassName().toString(),System.nanoTime());
        /*startTime[temp0] = System.nanoTime();
        */Log.e("onActivityStarted",activity.getLocalClassName()+" Start time :"+hashMapStartTracker.get(activity.getLocalClassName()));
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
        Log.e("onActivityStopped","Activity Name :"+ activity.getLocalClassName() + "onStop");
/*

        if(temp1 == 1)
            temp1 = 0;
        else if(temp1 == 0)
            temp1 = 1;

        endTime[temp1] = System.nanoTime();
*/
        stopped++;
        timeCalculation(activity);

        if(!isApplicationInForeground())
        {
            Log.e("ActivityTracker","Application is in background");
            MA.activityTimeTrackingApi(activity);
            MA.endApi(activity);
            isEndApiCalled = true;
        }
    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

        //Log.e("onActivitySaveInstanceState","Activity Name :"+ activity.getLocalClassName());
    }

    @Override
    public void onActivityDestroyed(Activity activity) {
        //Log.e("onActivityDestroyed","Activity Name :"+ activity.getLocalClassName());
       /* if(!Utils.endApiCalled)
        {
            MA.activityTimeTrackingApi(activity);
            MA.endApi(activity);
            Utils.endApiCalled = true;
        }*/

        //timeCalculation(activity);
    }

    public static boolean isApplicationInForeground() {
        return started > stopped;
    }

    public static void convertHashToJsonArray(HashMap hashMap)
    {
        JSONArray jsonArray = new JSONArray();
        try
        {

            Iterator it = hashMap.entrySet().iterator();
            while (it.hasNext()) {
                JSONObject json = new JSONObject();
                Map.Entry pair = (Map.Entry) it.next();
                json.put("key", pair.getKey());
                json.put("ts", pair.getValue());
                jsonArray.put(json);
                it.remove();
            }

        }catch (JSONException e)
        {
            e.printStackTrace();
        }finally {
            Log.e("JsonArray",jsonArray.toString());
            Utils.jsonArray = jsonArray;
//            jsonArray = null;
        }
    }

    private void timeCalculation(Activity activity)
    {
        hashMapEndTracker.put(activity.getLocalClassName(),System.nanoTime());
        Log.e("onActivityStopped",activity.getLocalClassName()+" End time :"+hashMapEndTracker.get(activity.getLocalClassName()));
        //timeSpent = endTime[temp1]-startTime[temp1];
        timeSpent = hashMapEndTracker.get(activity.getLocalClassName()) - hashMapStartTracker.get(activity.getLocalClassName());
        timeSpent = TimeUnit.NANOSECONDS.toSeconds(timeSpent);
        Utils.duration +=timeSpent;
        Log.e("timeSpent","____>>>>>"+Utils.duration);
        //hashMapDifferenceTracker.put(activity.getLocalClassName().toString(),timeSpent);

        Log.e("TimeSpent","TimeSpent"+" on "+activity.getLocalClassName()+" is "+timeSpent);
        if(hashMapActivityTracker.containsKey(activity.getLocalClassName())) {
            //timeSpent+=hashMapDifferenceTracker.get(activity.getLocalClassName());

            timeSpent+=hashMapActivityTracker.get(activity.getLocalClassName());
            hashMapActivityTracker.put(activity.getLocalClassName(), (int) timeSpent);
            Utils.hashMap = hashMapActivityTracker;
        }
        else{
            hashMapActivityTracker.put(activity.getLocalClassName(),(int) timeSpent);
            Utils.hashMap = hashMapActivityTracker;
        }

        Log.e("hash",hashMapActivityTracker.toString());
    }
}
