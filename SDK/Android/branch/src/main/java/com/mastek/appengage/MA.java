package com.mastek.appengage;

import android.content.Context;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Looper;
import android.support.v4.app.ActivityCompat;
import android.util.Log;
import android.widget.Toast;

import com.mastek.appengage.dbusermanager.DBUserManager;
import com.mastek.appengage.utils.ConnectionManager;
import com.mastek.appengage.utils.Utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;

import static android.content.Context.MODE_PRIVATE;

public class MA {
    private static final String TAG = MA.class.getSimpleName();
    private static String versionName;
    //	private static User user;
    static String response;
    static String device2;
    static Context appContext;
    static Context applicationContext;
    static DBUserManager dbUserManager;
    static String URL;
    static String API_KEY;
    static long time1;
    static ReturnResponse rResponse;
    static boolean isBeginApiCalled = false;

    public static void init(Context context, String url, String akey) {
        if (context != null)
            appContext = context;
        if (context instanceof ReturnResponse) {
            rResponse = (ReturnResponse) context;
        }
        URL = url;

        SharedPreferences.Editor editor = context.getSharedPreferences("com.mastek.appengage", MODE_PRIVATE).edit();
        editor.putString("URL", URL);
        editor.commit();

        SharedPreferences prefs = appContext.getSharedPreferences("com.mastek.appengage", MODE_PRIVATE);

        Log.e("contains", "----->" + prefs.contains("URL"));
        if (prefs.contains("URL")) {
            URL = prefs.getString("URL", null);
            Log.e("inSharedPref", URL);
        }

        API_KEY = akey;

        Utils.getCurrentTimeStamp();
        dbUserManager = new DBUserManager(appContext);
        Utils.init(context);
    }


    public static void sendApi(final Context context) {

        Log.e(TAG, "-------SENDAPI");

        new Thread() {

            private MyReceiver mReceiver;

            public void run() {
                this.mReceiver = new MyReceiver();

                if (dbUserManager.countEntries() > 0) {
                    /*appContext.registerReceiver(this.mReceiver, new IntentFilter(
							ConnectivityManager.CONNECTIVITY_ACTION));*/
                    mReceiver.isNetworkAvailable(context);
                }

                uiLog(" \n " + "Calling Send Api");


				/*appContext.registerReceiver(this.mReceiver, new IntentFilter(
						ConnectivityManager.CONNECTIVITY_ACTION));*/
                time1 = System.currentTimeMillis();

                senddatatoserver();

                Utils.updateUI();
            }
        }.start();
    }

    public static void eventApi(final String key, final JSONObject prop) {

        new Thread() {
            @Override
            public void run() {
                super.run();
//				user = getUserDetails();
                eventdatatoserver(/*user,*/key, prop);

            }

        }.start();
    }

    //TODO remove activitytracking convert from here
    public static void endApi(final Context context) {

        new Thread() {

            @Override
            public void run() {
                // TODO Auto-generated method stub
                super.run();
                try {
                    uiLog(" \n " + "Calling End Api");
//					Toast.makeText(context,"Calling End Api",Toast.LENGTH_SHORT).show();
                    if (context != null)
                        appContext = context;

//				user = getUserDetails();

                    Log.i("======= App Duration", " :: " + Utils.duration);
                    enddatatoserver();


                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        }.start();
    }


    public static void activityTimeTrackingApi(final Context context) {

        new Thread() {

            @Override
            public void run() {
                // TODO Auto-generated method stub
                super.run();
                try {
 //                   uiLog(" \n " + "Calling activityTimeTrackingApi");
                    if (context != null)
                        appContext = context;

//				user = getUserDetails();
                    activityTimeTrackToServer();


                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        }.start();
    }

    public static void crashApi(final String excSummary, final String excStackTrace) {


        try {

            Log.e("crashAPI In MA", "Called");
//				user = getUserDetails();\

            activityTimeTrackToServer();
            enddatatoserver();
            sendCrashDataToServer(excSummary, excStackTrace);

        } catch (Exception e) {
            Log.e("MA Exception", e.getLocalizedMessage());
            e.printStackTrace();
        }
        /*new Thread() {
            @Override
            public void run() {
                // TODO Auto-generated method stub
                super.run();
                try {

                    Log.e("crashAPI In MA", "Called");
//				user = getUserDetails();

                    sendCrashDataToServer(excSummary, excStackTrace);

                } catch (Exception e) {
                    Log.e("MA Exception", e.getLocalizedMessage());
                    e.printStackTrace();
                }
            }

            ;
        }.start();*/
    }




    // ///////////////////crash api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    static void sendCrashDataToServer(final String excSummary, final String excStackTrace) {

        Log.e("crashAPI In MA", "Called");
        final JSONObject post_data = new JSONObject();

        try {
            Utils.getCurrentTimeStamp();
            post_data.put("mnu", Utils.MANUFACTURER);
            post_data.put("mod", Utils.MODEL);
            post_data.put("osv", Utils.RELEASE);
            post_data.put("pf", Utils.OSNAME);
            post_data.put("avn", Utils.VERSIONNAME);
            Log.e("crashAPI In MA", "Called");
            if (Utils.gps_enabled) {
                post_data.put("lat", Utils.locLatitude);
                post_data.put("lng", Utils.locLongitude);

            } else {
                post_data.put("lat", "0.0");
                post_data.put("lng", "0.0");
            }
            Log.e("crashAPI In MA", "Called");
            post_data.put("rtc", Utils.currentTimeStamp);
            post_data.put("sid", time1 + "" + Utils.deviceId);
            post_data.put("did", Utils.deviceId);
            post_data.put("res", Utils.resolution);
            post_data.put("c", Utils.carrierName);
            post_data.put("dt", Utils.deviceType);
            post_data.put("ac", Utils.possibleEmail);
            post_data.put("nw", networkDesc());
            post_data.put("cpu", Utils.ARCH);
            Log.e("crashAPI In MA", "Called");
            post_data.put("ori", Utils.orientation);
            post_data.put("akey", API_KEY);
            post_data.put("frs", Utils.percentAvail);
            post_data.put("trs", Utils.totalMemory);
            post_data.put("fds", Utils.megAvailable);
            post_data.put("tds", Utils.Available);
            post_data.put("bl", String.valueOf(Utils.batteryLevel));
            post_data.put("ids", Utils.root);
            post_data.put("ido", "N/A");
            post_data.put("est", excStackTrace);
            post_data.put("esm", "");
            post_data.put("Ess", excSummary);
            post_data.put("sdv", "1.0");
            post_data.put("mt", "C");

        } catch (JSONException e) {
            Log.e("ERROR ", e.getLocalizedMessage());
            e.printStackTrace();
        }
        if (post_data.length() > 0) {
            //Log.e(TAG, "POST_DATA........CRASH API..." + post_data);

            if (ConnectionManager.isNetworkConnected(appContext)) {
                //new SendCrashDataToServer().execute(String.valueOf(post_data));
                //*********************
                Log.e(TAG, "POST_DATA......CRASH API....." + post_data);


                String JsonResponse = null;
                String JsonDATA = post_data.toString();
                HttpURLConnection urlConnection = null;
                BufferedReader reader = null;
                try {
                    Log.e(TAG, "POST_DATA..........." + post_data);
                    URL url = new URL(URL + "i/single/C");

                    //Looper.prepare();
                    urlConnection = (HttpURLConnection) url.openConnection();
                    urlConnection.setDoOutput(true);
                    // is output buffer writter
                    Log.e(TAG, "POST_DATA..........." + post_data);
                    urlConnection.setRequestMethod("POST");
                    urlConnection.setRequestProperty("Content-Type",
                            "application/json");

                    urlConnection.setRequestProperty("akey",
                            API_KEY);
                    Writer writer = new BufferedWriter(new OutputStreamWriter(
                            urlConnection.getOutputStream(), "UTF-8"));
                    writer.write(JsonDATA);
                    // json data
                    Log.e(TAG, "WRITER... :- " + writer);
                    writer.close();
                    InputStream inputStream = urlConnection.getInputStream();
                    Log.e(TAG, "URLCONNECTION ON CRASH.....Status code......"
                            + urlConnection.getResponseCode());
                    Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                    // input stream
                    StringBuffer buffer = new StringBuffer();
                    if (inputStream == null) {

                    }
                    reader = new BufferedReader(new InputStreamReader(inputStream));
                    Log.e(TAG, "READER..........." + reader);

                    String inputLine;
                    while ((inputLine = reader.readLine()) != null)
                        buffer.append(inputLine + "\n");
                    if (buffer.length() == 0) {

                    }
//                    Toast.makeText(appContext, "Crash Found", Toast.LENGTH_SHORT).show();

                    JsonResponse = buffer.toString();
                    // response data
                    Log.e(TAG, "JsonResponse..........." + JsonResponse);
                    android.os.Process.killProcess(android.os.Process.myPid());
                    // send to post execute
                   // Looper.loop();

                } catch (IOException e) {
                    Log.e(TAG, "IOException....." + e.getMessage());
                    e.printStackTrace();
                } finally {

                    if (urlConnection != null) {
                        urlConnection.disconnect();
                        Log.e("Connection", "Closed");
                    } else Log.e("Connection", "Not Closed");
                    if (reader != null) {
                        try {
                            reader.close();
                        } catch (final IOException e) {
                            Log.e(TAG, "Error closing stream" + e.getMessage());
                        }
                    }
                    android.os.Process.killProcess(android.os.Process.myPid());

                }


                //********************
                Log.e(TAG, "crash data to server... :- ");
            } else {
                Log.e("DATABASE POST_DATA",post_data.toString());
                boolean save = dbUserManager.saveCompleteJson(post_data.toString());
                Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
                Log.e(TAG, "SAVE....... :- " + save);
                android.os.Process.killProcess(android.os.Process.myPid());
            }
        }
    }

	/*public static class SendCrashDataToServer extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/single/C");
				urlConnection = (HttpURLConnection) url.openConnection();
				urlConnection.setDoOutput(true);
				// is output buffer writter
				urlConnection.setRequestMethod("POST");
				urlConnection.setRequestProperty("Content-Type",
						"application/json");

				urlConnection.setRequestProperty("akey",
						API_KEY);
				Writer writer = new BufferedWriter(new OutputStreamWriter(
						urlConnection.getOutputStream(), "UTF-8"));
				writer.write(JsonDATA);
				// json data
				Log.e(TAG, "WRITER... :- " + writer);
				writer.close();
				InputStream inputStream = urlConnection.getInputStream();
				Log.e(TAG, "URLCONNECTION ON CRASH.....Status code......"
						+ urlConnection.getResponseCode());
				Log.e(TAG, "INPUTSTREAM..........." + inputStream);
				// input stream
				StringBuffer buffer = new StringBuffer();
				if (inputStream == null) {
					// Nothing to do.
					return null;
				}
				reader = new BufferedReader(new InputStreamReader(inputStream));
				Log.e(TAG, "READER..........." + reader);

				String inputLine;
				while ((inputLine = reader.readLine()) != null)
					buffer.append(inputLine + "\n");
				if (buffer.length() == 0) {
					// Stream was empty. No point in parsing.
					return null;
				}
				JsonResponse = buffer.toString();
				// response data
				Log.e(TAG, "JsonResponse..........." + JsonResponse);
				// send to post execute
				return JsonResponse;

			} catch (IOException e) {
				Log.e(TAG, "IOException....." + e.getMessage());
				e.printStackTrace();
			} finally {
				if (urlConnection != null) {
					urlConnection.disconnect();
				}
				if (reader != null) {
					try {
						reader.close();
					} catch (final IOException e) {
						Log.e(TAG, "Error closing stream" + e.getMessage());
					}
				}
			}
			return null;
		}

		@Override
		protected void onPostExecute(String s) {
			if(rResponse != null)
			{
				uiLog("Crash API Data"+s);
			}
		}

	}*/

    static String networkDesc() {
        if (Connectivity.isConnectedMobile(appContext)) {

            return Utils.getNetworkClass(appContext);
        } else if (Connectivity.isConnectedWifi(appContext)) {
            return "Wifi";
        } else {
            return "N/A";
        }
    }

    // ///////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // ///////////////////send api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    static void senddatatoserver() {
        // function in the activity that corresponds to the layout button
        // LatLng = txtLatitudeLongitude.getText().toString();
        versionName = Utils.VERSIONNAME;
        JSONObject post_data = new JSONObject();

        JSONArray array = new JSONArray();


        try {
            Utils.getCurrentTimeStamp();
            Log.e(TAG, "CalculatedTime  " + Utils.currentTimeStamp);

            post_data.put("sync_status", "");
            post_data.put("test", "");
            post_data.put("mod", Utils.MODEL);
            post_data.put("avn", Utils.VERSIONNAME);
            post_data.put("mnu", Utils.MANUFACTURER);
            post_data.put("osv", Utils.RELEASE);
            post_data.put("pf", Utils.OSNAME);
            if (Utils.gps_enabled) {
                post_data.put("lat", Utils.locLatitude);
                post_data.put("lng", Utils.locLongitude);

            } else {
                post_data.put("lat", "0.0");
                post_data.put("lng", "0.0");
            }
            post_data.put("rtc", Utils.currentTimeStamp);
            post_data.put("sid", time1 + "" + Utils.deviceId);
            post_data.put("did", Utils.deviceId);
            post_data.put("res", Utils.resolution);
            post_data.put("c", Utils.carrierName);
            post_data.put("dt", Utils.deviceType);
            post_data.put("ac", Utils.possibleEmail);
            post_data.put("nw", networkDesc());
            post_data.put("cpu", Utils.ARCH);
            post_data.put("ori", Utils.orientation);
            post_data.put("akey", API_KEY);
            post_data.put("sdv", "1.0");
            post_data.put("rkey", Utils.tokenGen);
            post_data.put("mt", "B");
            Log.e(TAG, "     send data;..............." /*+ user*/);

            array.put(post_data);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (post_data.length() > 0) {
            Log.e(TAG, "POST_DATA..... send data to server......" + post_data);

            if (ConnectionManager.isNetworkConnected(appContext)) {
                try {
                    Log.e("Lat ",post_data.get("lat").toString());
                    Log.e("Long ",post_data.get("lng").toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                new SendJsonDataToServer().execute(String.valueOf(post_data));

            } else {

                try {
                    Log.e("Lat ",post_data.get("lat").toString());
                    Log.e("Long ",post_data.get("lng").toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                boolean save = dbUserManager.saveCompleteJson(post_data.toString());

                Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
                uiLog("\n Send API Saved IN DB");
                Log.e(TAG, "SAVE....... sendApi:- " + save);

            }
        }
    }

    static class SendJsonDataToServer extends
            AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            String JsonResponse = null;
            String JsonDATA = params[0];
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            try {
                URL url = new URL(URL + "i/single/B");
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setDoOutput(true);
                // is output buffer writter
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type",
                        "application/json");

                urlConnection.setRequestProperty("akey", API_KEY);
                Writer writer = new BufferedWriter(new OutputStreamWriter(
                        urlConnection.getOutputStream(), "UTF-8"));
                writer.write(JsonDATA);
                // json data
                Log.e(TAG, "WRITER... :- " + writer);
                writer.close();
                InputStream inputStream = urlConnection.getInputStream();
                Log.e(TAG, "URLCONNECTION.....Status code......"
                        + urlConnection.getResponseCode());

                if (urlConnection.getResponseCode() == 200) {
                    response = "Begin API Successfull";
                    Log.e(TAG, "Begin API Successfulll;;;;;;;;;;;;;");
                }
                Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                // input stream
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    // Nothing to do.
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));
                Log.e(TAG, "READER..........." + reader);

                String inputLine;
                while ((inputLine = reader.readLine()) != null)
                    buffer.append(inputLine + "\n");
                if (buffer.length() == 0) {
                    // Stream was empty. No point in parsing.
                    return null;
                }

                JsonResponse = buffer.toString();
                // response data
                Log.e(TAG, "JsonResponse...........sendApi" + JsonResponse);

                // send to post execute
                return JsonResponse;

            } catch (IOException e) {
                Log.e(TAG, "IOException....." + e.getMessage());
                e.printStackTrace();
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                    Log.e("Connection", "Closed");
                } else Log.e("Connection", "Not Closed");
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (final IOException e) {
                        Log.e(TAG, "Error closing stream", e);
                    }
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            if (rResponse != null) {
                uiLog("Send API data " + s);
            }

        }
    }

    static class SendJsonArrayToServerWhenOnline extends
            AsyncTask<String, String, String> {

        String offlineURL;

        public SendJsonArrayToServerWhenOnline(String url) {
            this.offlineURL = url;
        }

        @Override
        protected String doInBackground(String... params) {
            String JsonResponse = null;
            String JsonDATA = params[0];
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            try {

                if (offlineURL != null) {


                    URL url = new URL(offlineURL + "i/bulk/O");
                    urlConnection = (HttpURLConnection) url.openConnection();
                    urlConnection.setDoOutput(true);
                    // is output buffer writter
                    urlConnection.setRequestMethod("POST");
                    urlConnection.setRequestProperty("Content-Type",
                            "application/json");

                    urlConnection.setRequestProperty("akey",
                            API_KEY);
                    // set headers and method
                    Writer writer = new BufferedWriter(new OutputStreamWriter(
                            urlConnection.getOutputStream(), "UTF-8"));
                    writer.write(JsonDATA);
                    // json data
                    Log.e(TAG, "WRITER... :- " + writer);
                    writer.close();
                    InputStream inputStream = urlConnection.getInputStream();
                    Log.e(TAG, "URLCONNECTION.....Status code......"
                            + urlConnection.getResponseCode());

                    if (urlConnection.getResponseCode() == 200) {
                        response = "Json Array Online successfull";
                        Log.e(TAG, "Sending Json Array Online successfull;;;;;;;;;;;;;");
                    }
                    Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                    // input stream
                    StringBuffer buffer = new StringBuffer();
                    if (inputStream == null) {
                        // Nothing to do.
                        return null;
                    }
                    reader = new BufferedReader(new InputStreamReader(inputStream));
                    Log.e(TAG, "READER..........." + reader);

                    String inputLine;
                    while ((inputLine = reader.readLine()) != null)
                        buffer.append(inputLine + "\n");
                    if (buffer.length() == 0) {
                        // Stream was empty. No point in parsing.
                        return null;
                    }
                    JsonResponse = buffer.toString();
                    // response data
                    Log.e(TAG, "JsonResponse..........." + JsonResponse);
                }
                // send to post execute
                return JsonResponse;

            } catch (IOException e) {
                Log.e(TAG, "IOException....." + e.getMessage());
                e.printStackTrace();
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                    Log.e("Connection", "Closed");
                } else Log.e("Connection", "Not Closed");
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (final IOException e) {
                        Log.e(TAG, "Error closing stream", e);
                    }
                }
            }
            return null;
        }


        @Override
        protected void onPostExecute(String s) {
            if (rResponse != null) {
                uiLog("Offline API Data " + s);
            }
        }

    }

    // /////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // /////////////////////////////Event Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    static void eventdatatoserver(String key, JSONObject prop) {
        // function in the activity that corresponds to the layout button
        // LatLng = txtLatitudeLongitude.getText().toString();

        versionName = Utils.VERSIONNAME;
        JSONObject post_data = new JSONObject();


        try {
            Utils.getCurrentTimeStamp();
            post_data.put("mnu", Utils.MANUFACTURER);
            post_data.put("mod", Utils.MODEL);
            post_data.put("osv", Utils.RELEASE);
            post_data.put("pf", Utils.OSNAME);
            post_data.put("avn", Utils.VERSIONNAME);
            if (Utils.gps_enabled) {
                post_data.put("lat", Utils.locLatitude);
                post_data.put("lng", Utils.locLongitude);

            } else {
                post_data.put("lat", "0.0");
                post_data.put("lng", "0.0");
            }
            post_data.put("rtc", Utils.currentTimeStamp);
            post_data.put("sid", time1 + "" + Utils.deviceId);
            post_data.put("did", Utils.deviceId);
            post_data.put("res", Utils.resolution);
            post_data.put("c", Utils.carrierName);
            post_data.put("dt", Utils.deviceType);
            post_data.put("ac", Utils.possibleEmail);
            post_data.put("nw", networkDesc());
            post_data.put("cpu", Utils.ARCH);
            post_data.put("ori", Utils.orientation);
            post_data.put("akey", API_KEY);
            post_data.put("sdv", "1.0");
            post_data.put("mt", "event");
            post_data.put("key", key);


            post_data.put("pro", prop);
            Log.e(TAG, "     send data;...............");


        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (post_data.length() > 0) {
            Log.e(TAG, "POST_DATA..........." + post_data);
            try {
                uiLog(" \n " + "Calling Event Api");
                if (ConnectionManager.isNetworkConnected(appContext)) {
                    new EventJsonDataToServer().execute(String.valueOf(post_data));
                    Log.e(TAG, "event data to server... :- ");
                } else {
                    boolean save = dbUserManager.saveCompleteJson(post_data.toString());

                    Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
                    uiLog("\n Event API Saved IN DB");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (prop.length() > 0) {
            Log.e(TAG, "POST.........." + prop);
        }
    }

    static class EventJsonDataToServer extends
            AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            String JsonResponse = null;
            String JsonDATA = params[0];
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            try {
                URL url = new URL(URL + "i/single/event");
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setDoOutput(true);
                // is output buffer writter
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type",
                        "application/json");
                urlConnection.setRequestProperty("akey",
                        API_KEY);
                // set headers and method
                Writer writer = new BufferedWriter(new OutputStreamWriter(
                        urlConnection.getOutputStream(), "UTF-8"));
                writer.write(JsonDATA);
                // json data
                Log.e(TAG, "WRITER... :- " + writer);
                writer.close();
                InputStream inputStream = urlConnection.getInputStream();
                Log.e(TAG, "URLCONNECTION.....Status code......"
                        + urlConnection.getResponseCode());
                Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                // input stream
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    // Nothing to do.
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));
                Log.e(TAG, "READER..........." + reader);

                String inputLine;
                while ((inputLine = reader.readLine()) != null)
                    buffer.append(inputLine + "\n");
                if (buffer.length() == 0) {
                    // Stream was empty. No point in parsing.
                    return null;
                }
                JsonResponse = buffer.toString();
                // response data
                Log.e(TAG, "JsonResponse..........." + JsonResponse);
                // send to post execute
                return JsonResponse;

            } catch (IOException e) {
                Log.e(TAG, "IOException....." + e.getMessage());
                e.printStackTrace();
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                    Log.e("Connection", "Closed");
                } else Log.e("Connection", "Not Closed");
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (final IOException e) {
                        Log.e(TAG, "Error closing stream", e);
                    }
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            if (rResponse != null) {
                uiLog("Event API Data " + s);
            }
        }


    }

    // //////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // ////////////////////////////End Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    static void enddatatoserver() {
        // function in the activity that corresponds to the layout button
        // LatLng = txtLatitudeLongitude.getText().toString();

        versionName = Utils.VERSIONNAME;
        JSONObject post_data = new JSONObject();

        try {
            //ActivityTracker.convertHashToJsonArray(Utils.hashMap);
            Utils.getCurrentTimeStamp();
            post_data.put("tsd", Utils.duration);// //total session duration

            post_data.put("did", Utils.deviceId);
            post_data.put("akey", API_KEY);// api
            // key
            post_data.put("rtc", Utils.currentTimeStamp);
            post_data.put("sid", time1 + "" + Utils.deviceId);
            post_data.put("sdv", "1.0");// sdk version
            post_data.put("dt", Utils.deviceType);
            //post_data.put("act",Utils.jsonArray);
            post_data.put("mt", "E");
            Log.e(TAG, "     end api data;..............." /*+ user*/);
            Utils.duration = 0;

        } catch (JSONException e) {
            e.printStackTrace();
        }
        if (post_data.length() > 0) {
            Log.e(TAG, "POST_DATA..END API........." + post_data);

            if (ConnectionManager.isNetworkConnected(appContext)) {
                new EndJsonDataToServer().execute(String.valueOf(post_data));
                Log.e(TAG, "end data to server... :- ");
                Utils.endApiCalled = true;
            } else {
                Log.e(TAG, "save--------------------- " + (dbUserManager == null));
                boolean save = dbUserManager.saveCompleteJson(post_data.toString());

                Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
                uiLog("\n End API Saved IN DB");
                Log.e(TAG, "SAVE....... :- " + save);
                Utils.endApiCalled = true;
            }
        }
    }

    static void activityTimeTrackToServer() {
        // function in the activity that corresponds to the layout button
        // LatLng = txtLatitudeLongitude.getText().toString();

        versionName = Utils.VERSIONNAME;
        JSONObject post_data = new JSONObject();

        try {
            ActivityTracker.convertHashToJsonArray(Utils.hashMap);
            Utils.getCurrentTimeStamp();
            post_data.put("akey", API_KEY);// api
            // key
            post_data.put("rtc", Utils.currentTimeStamp);
            post_data.put("sid", time1 + "" + Utils.deviceId);
            post_data.put("dt", Utils.deviceType);
            post_data.put("did", Utils.deviceId);
            post_data.put("act", Utils.jsonArray);
            Utils.hashMap.clear();
            post_data.put("mt", "S");
            Log.e(TAG, "     activityTimeTracking data;..............." + post_data.toString()/*+ user*/);


        } catch (JSONException e) {
            Log.e("MA ERROR in TimeTck2Ser", e.getLocalizedMessage());
            e.printStackTrace();
        }
        if (post_data.length() > 0) {
            Log.e(TAG, "POST_DATA..........." + post_data);

            if (ConnectionManager.isNetworkConnected(appContext)) {
                new ActivityJsonDataToServer().execute(String.valueOf(post_data));
                Log.e(TAG, "activity data to server... :- ");
            } else {
                Log.e(TAG, "save--------------------- " + (dbUserManager == null));
                boolean save = dbUserManager.saveCompleteJson(post_data.toString());

                Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
                uiLog("\n Activity API Saved IN DB");
                Log.e(TAG, "SAVE....... :- " + save);
            }
        }
    }

    static class EndJsonDataToServer extends
            AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            String JsonResponse = null;
            String JsonDATA = params[0];
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            try {
                URL url = new URL(URL + "i/single/E");
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setDoOutput(true);
                // is output buffer writter
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type",
                        "application/json");

                urlConnection.setRequestProperty("akey",
                        API_KEY);
                // urlConnection.setRequestProperty("Accept",
                // "application/json");
                // set headers and method
                Writer writer = new BufferedWriter(new OutputStreamWriter(
                        urlConnection.getOutputStream(), "UTF-8"));
                writer.write(JsonDATA);
                // json data
                Log.e(TAG, "WRITER... :- " + writer);
                writer.close();
                InputStream inputStream = urlConnection.getInputStream();
                Log.e(TAG, "URLCONNECTION.....Status code......"
                        + urlConnection.getResponseCode());

                Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                // input stream
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    // Nothing to do.
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));
                Log.e(TAG, "READER..........." + reader);

                String inputLine;
                while ((inputLine = reader.readLine()) != null)
                    buffer.append(inputLine + "\n");
                if (buffer.length() == 0) {
                    // Stream was empty. No point in parsing.
                    return null;
                }
                JsonResponse = buffer.toString();
                // response data
                Log.e(TAG, "JsonResponse..........." + JsonResponse);
                // send to post execute
                return JsonResponse;


            } catch (IOException e) {
                Log.e(TAG, "IOException....." + e.getMessage());
                e.printStackTrace();
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                    Log.e("Connection", "Closed");
                } else Log.e("Connection", "Not Closed");
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (final IOException e) {
                        Log.e(TAG, "Error closing stream", e);
                    }
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            if (rResponse != null) {
                uiLog("End API data " + s);
                Toast.makeText(appContext, "End API CALLED " + s, Toast.LENGTH_SHORT).show();
            }
        }

    }

    static class ActivityJsonDataToServer extends
            AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... params) {
            String JsonResponse = null;
            String JsonDATA = params[0];
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            try {
                URL url = new URL(URL + "i/single/S");
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setDoOutput(true);
                // is output buffer writter
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type",
                        "application/json");
                urlConnection.setRequestProperty("akey",
                        API_KEY);
                // urlConnection.setRequestProperty("Accept",
                // "application/json");
                // set headers and method
                Writer writer = new BufferedWriter(new OutputStreamWriter(
                        urlConnection.getOutputStream(), "UTF-8"));
                writer.write(JsonDATA);
                // json data
                Log.e(TAG, "WRITER... :- " + writer);
                writer.close();
                InputStream inputStream = urlConnection.getInputStream();
                Log.e(TAG, "URLCONNECTION.....Status code......"
                        + urlConnection.getResponseCode());

                Log.e(TAG, "INPUTSTREAM..........." + inputStream);
                // input stream
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    // Nothing to do.
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));
                Log.e(TAG, "READER..........." + reader);

                String inputLine;
                while ((inputLine = reader.readLine()) != null)
                    buffer.append(inputLine + "\n");
                if (buffer.length() == 0) {
                    // Stream was empty. No point in parsing.
                    return null;
                }
                JsonResponse = buffer.toString();
                // response data
                Log.e(TAG, "JsonResponse..........." + JsonResponse);
                // send to post execute
                return JsonResponse;


            } catch (IOException e) {
                Log.e(TAG, "IOException....." + e.getMessage());
                e.printStackTrace();
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                    Log.e("Connection", "Closed");
                } else Log.e("Connection", "Not Closed");
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (final IOException e) {
                        Log.e(TAG, "Error closing stream", e);
                    }
                }
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            if (rResponse != null) {
                uiLog("ActivityTracking API data " + s);
                Toast.makeText(appContext, "ActivityTracking API data " + s, Toast.LENGTH_SHORT).show();
            }
        }

    }

    public static void beginApi(Context context) {


        //if(!isBeginApiCalled) {
        if (Build.VERSION.SDK_INT >= 23) { // Build.VERSION_CODES.M
            if (checkPermission()) {
                Log.e(TAG, "checkPermission=-=====");
                Utils.requestSingleUpdate(appContext, new Utils.LocationCallback() {
                    @Override
                    public void onNewLocationAvailable(Utils.GPSCoordinates location) {
                        // TODO Auto-generated method stub

                        Log.e("Cordinates",location.latitude+" "+location.longitude);
                    }
                });

            } else {
                Log.e("sendApi", "---it is here");
                Utils.locLatitude = "NP";
                Utils.locLongitude = "NP";
                sendApi(context);
            }
        } else {
            Log.e(TAG, "log for less dan 23 version "+checkPermission());
            Utils.requestSingleUpdate(appContext, new Utils.LocationCallback() {

                @Override
                public void onNewLocationAvailable(Utils.GPSCoordinates location) {
                    // TODO Auto-generated method stub
                    Log.e("Cordinates",location.latitude+" "+location.longitude);
                }
            });


        }
        //isBeginApiCalled = true;
        //}
    }

    private static boolean checkPermission() {
        int result = ActivityCompat.checkSelfPermission(appContext,
                android.Manifest.permission.ACCESS_FINE_LOCATION);
        int result2 = ActivityCompat.checkSelfPermission(appContext,
                android.Manifest.permission.ACCESS_COARSE_LOCATION);
        if (result == PackageManager.PERMISSION_GRANTED
                && result2 == PackageManager.PERMISSION_GRANTED) {
            return true;
        } else {
            return false;
        }
    }


    public static void check() {
        dbUserManager.findArray();
    }


    public static void uiLog(String msg) {
        if (rResponse != null) {
            rResponse.sendResponse(msg);
        }
    }
    // ///////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	/*public static User getUserDetails() {

		user = new User();
		user.setRelease(Utils.RELEASE);
		user.setModel(Utils.MODEL);
		user.setManufacturer(Utils.MANUFACTURER);
		user.setVersionName(Utils.VERSIONNAME);
		user.setOsName(Utils.OSNAME);
		user.setSdkVersion(Utils.SDK_INT);
//		user.setSyncStatus("true");
		user.setTimeStamp(Utils.timeStamp);
		user.setSessionId(String.valueOf(Utils.TIME) + "-" + Utils.deviceId);
		user.setDeviceId(Utils.deviceId);
		user.setDeviceType(Utils.deviceType);
		user.setResolution(Utils.resolution);
		user.setOrientation(Utils.orientation);
		user.setCarrierName(Utils.carrierName);
		user.setTokenGen(Utils.tokenGen);

		if (Connectivity.isConnected(appContext)) {

			if (Connectivity.isConnectedMobile(appContext)) {


				Log.e("Connectivity",""+ Utils.networkType);

				Log.e("Connectivity----++====+---",""+ Utils.getNetworkClass(appContext));
				user.setNetworkType(Utils.getNetworkClass(appContext));

			}
			else if (Connectivity.isConnectedWifi(appContext)) {

				user.setNetworkType("WiFi");
			}
		}
		else {
			Log.e(TAG, "Internet not connected");
		}

		if (Utils.gps_enabled) {
			user.setLatitude(Utils.locLatitude);
			user.setLongitude(Utils.locLongitude);

		} else {
			user.setLatitude("0.0");
			user.setLongitude("0.0");
		}
		user.setFreeRamSize(Utils.availableMegs);
		user.setTotalRamSize(Utils.totalMemory);
		user.setFreeDiskSize(Utils.megAvailable);
		user.setTotalDiskSize(Utils.Available);
		user.setBatteryLevel(String.valueOf(Utils.batteryLevel));
		user.setIsDeviceRooted(Utils.root);
		user.setIsDeviceOnline("N/A");
		user.setProductId("45");
		user.setCategory("2");
		user.setOffer("Y");
		user.setKey("AddToCart");
		
		return user;
	};*/


}
