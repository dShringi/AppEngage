package com.mastek.appengage;

import android.content.Context;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.os.AsyncTask;
import android.os.Build;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

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

public class MA {
	private static final String TAG = MA.class.getSimpleName();
	private static String versionName;
//	private static User user;
	public static String response;
	public static String device2;
	public static Context appContext;
	private static DBUserManager dbUserManager;
	private static String URL;
	public static String API_KEY;
	public static long CalculatedTime;
	public static long timeDuration;
	private static long time1;
	private static long time2;
	private static int days;
	private static int hours;
	private static int min;
	private static long calTime;
	private static ReturnResponse rResponse;

	public static void init(Context context, String url, String akey)
	{

		if(context instanceof  ReturnResponse)
		{
			rResponse=(ReturnResponse) context;
		}
		URL = url;
		API_KEY = akey;
		if (context != null)
			appContext = context;
		CalculatedTime =Utils.currentTimeStamp;
		dbUserManager = new DBUserManager(appContext);
		Utils.init(context);
	}


	public static void sendApi(final Context context) {

		Log.e(TAG,"-------SENDAPI");



		new Thread() {
			
			private MyReceiver mReceiver;
		

			public void run() {



				uiLog(" \n " +"Calling Send Api");
//				user = getUserDetails();

//				user.setMessegeType("B");

				this.mReceiver = new MyReceiver();
				appContext.registerReceiver(this.mReceiver, new IntentFilter(
						ConnectivityManager.CONNECTIVITY_ACTION));
				
				
				time1 = System.currentTimeMillis();

				senddatatoserver();

				Utils.updateUI();

			}

		}.start();

	}

	public static void eventApi(final String key,final JSONObject prop) {

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
					if (context != null)
						appContext = context;

//				user = getUserDetails();

					time2 = System.currentTimeMillis();


					calTime = (time2 - time1) / 1000;

					Log.i("======= calTime", " :: " + calTime);
					enddatatoserver();


				}
				catch (Exception e)
				{
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
					uiLog(" \n " + "Calling activityTimeTrackingApi");
					if (context != null)
						appContext = context;

//				user = getUserDetails();

					time2 = System.currentTimeMillis();


					calTime = (time2 - time1) / 1000;

					Log.i("======= calTime", " :: " + calTime);
					activityTimeTrackToServer();


				}
				catch (Exception e)
				{
					e.printStackTrace();
				}

			}
		}.start();
	}

	public static void crashApi(final String excSummary,final String excStackTrace) {

		new Thread() {
			@Override
			public void run() {
				// TODO Auto-generated method stub
				super.run();
				try {

					Log.e("crashAPI In MA","Called");
//				user = getUserDetails();
					uiLog(" \n " + "Calling Crash Api");
					sendCrashDataToServer(excSummary,excStackTrace);

				}
				catch (Exception e)
				{
					e.printStackTrace();
				}
			};
		}.start();
	}

	// ///////////////////crash api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void sendCrashDataToServer(String excSummary, String excStackTrace) {
		Log.e("crashAPI In MA","Called");
		JSONObject post_data = new JSONObject();

		try {
			post_data.put("mnu", Utils.MANUFACTURER);
			post_data.put("mod", Utils.MODEL);
			post_data.put("osv", Utils.RELEASE);
			post_data.put("pf", Utils.OSNAME);
			post_data.put("avn", Utils.VERSIONNAME);
			Log.e("crashAPI In MA","Called");
			if (Utils.gps_enabled) {
				post_data.put("lat", Utils.locLatitude);
				post_data.put("lng", Utils.locLongitude);

			} else {
				post_data.put("lat", "0.0");
				post_data.put("lng", "0.0");
			}
			Log.e("crashAPI In MA","Called");
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("did", Utils.deviceId);
			post_data.put("res", Utils.resolution);
			post_data.put("c",Utils.carrierName);
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", networkDesc());
			post_data.put("cpu", Utils.ARCH);
			Log.e("crashAPI In MA","Called");
			post_data.put("ori", Utils.orientation);
			post_data.put("akey", API_KEY);
			post_data.put("frs",Utils.percentAvail);
			post_data.put("trs",Utils.totalMemory);
			post_data.put("fds",Utils.megAvailable);
			post_data.put("tds", Utils.Available);
			post_data.put("bl",String.valueOf(Utils.batteryLevel));
			post_data.put("ids", Utils.root);
			post_data.put("ido", "N/A");
			post_data.put("est",excStackTrace);
			post_data.put("esm", "");
			post_data.put("Ess", excSummary);
			post_data.put("sdv", "1.0");
			post_data.put("mt", "C");

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);

			if (ConnectionManager.isNetworkConnected(appContext)) {
				//new SendCrashDataToServer().execute(String.valueOf(post_data));
				//*********************
				Log.e(TAG, "POST_DATA..........." + post_data);
				{
					String JsonResponse = null;
					String JsonDATA = post_data.toString();
					HttpURLConnection urlConnection = null;
					BufferedReader reader = null;
					try {
						Log.e(TAG, "POST_DATA..........." + post_data);
						URL url = new URL(URL+"i/single/C");
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
						JsonResponse = buffer.toString();
						// response data
						Log.e(TAG, "JsonResponse..........." + JsonResponse);
						// send to post execute
						try {
							uiLog(JsonResponse);
						}catch (Exception e)
						{
							e.printStackTrace();
						}

					} catch (IOException e) {
						Log.e(TAG, "IOException....." + e.getMessage());
						e.printStackTrace();
					} finally {
						if (urlConnection != null) {
							urlConnection.disconnect();
							Log.e("Connection","Closed");
						}
						else Log.e("Connection","Not Closed");
						if (reader != null) {
							try {
								reader.close();
							} catch (final IOException e) {
								Log.e(TAG, "Error closing stream" + e.getMessage());
							}
						}
					}

				}

				//********************
				Log.e(TAG, "end data to server... :- ");
			} else {
				boolean save = dbUserManager.saveCompleteJson(post_data.toString());

				Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
				uiLog("\n Crash API Saved IN DB");
				Log.e(TAG, "SAVE....... :- " + save);
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

	public static String networkDesc()
	{
		if (Connectivity.isConnectedMobile(appContext))
		{

			return Utils.getNetworkClass(appContext);
		}
		else if(Connectivity.isConnectedWifi(appContext)){
			return "Wifi";
		}
		else {
			return "N/A";
		}
	}

	// ///////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ///////////////////send api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void senddatatoserver() {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();

		JSONArray array = new JSONArray();



		try {
			CalculatedTime =Utils.currentTimeStamp;
			Log.e(TAG, "CalculatedTime  "+CalculatedTime);

			post_data.put("sync_status","");
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
			post_data.put("rtc", CalculatedTime);
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
            post_data.put("rkey",Utils.tokenGen);
			post_data.put("mt", "B");
			Log.e(TAG, "     send data;..............." /*+ user*/);

			array.put(post_data);

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..... send data to server......" + post_data);

			if (ConnectionManager.isNetworkConnected(appContext)) {


				new SendJsonDataToServer().execute(String.valueOf(post_data));


			} else {
				boolean save = dbUserManager.saveCompleteJson(post_data.toString());

				Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);
				uiLog("\n Send API Saved IN DB");
				Log.e(TAG, "SAVE....... :- " + save);

			}
		}
	}

	public static class SendJsonDataToServer extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/single/B");
				urlConnection = (HttpURLConnection) url.openConnection();
				urlConnection.setDoOutput(true);
				// is output buffer writter
				urlConnection.setRequestMethod("POST");
				urlConnection.setRequestProperty("Content-Type",
						"application/json");

				urlConnection.setRequestProperty("akey",API_KEY);
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
				Log.e(TAG, "JsonResponse..........." + JsonResponse);

				// send to post execute
				return JsonResponse;

			} catch (IOException e) {
				Log.e(TAG, "IOException....." + e.getMessage());
				e.printStackTrace();
			} finally {
				if (urlConnection != null) {
					urlConnection.disconnect();
					Log.e("Connection","Closed");
				}
				else Log.e("Connection","Not Closed");
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
		if(rResponse != null)
		{
			uiLog("Send API data "+s);
		}

		}

	}

	// /////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ///////////////////send data when
	// online\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	/*public static void senddatawhenonline(JSONArray array1) {
		// function in the activity that corresponds to the layout button

//		user = getUserDetails();
		*//*versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();*//*

		*//*try {
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
			post_data.put("rtc", Utils.timeStamp);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("did", Utils.deviceId);
			post_data.put("res", Utils.screenWidth + "*" + Utils.screenHeight);
			post_data.put("c", Utils.carrierName);
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", networkDesc());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori", Utils.orientation);
			post_data.put("akey", API_KEY);
			post_data.put("sdv", "1.0");
			post_data.put("mt", "O");
			//Log.e(TAG, "     send data;...............");

			int maxLogSize = 1000;
			String veryLongString = array1.toString();
			for(int i = 0; i <= veryLongString.length() / maxLogSize; i++) {
				int start = i * maxLogSize;
				int end = (i+1) * maxLogSize;
				end = end > veryLongString.length() ? veryLongString.length() : end;
				Log.e("ARRAY1", veryLongString.substring(start, end));
			}
			//array1.put(post_data);

			//Log.e("ARRAY1",array1.toString());

		} catch (JSONException e) {
			e.printStackTrace();
			Log.e(TAG, "JSONException in catch......" + e.getMessage());
		}*//*


		*//*if (post_data.length() > 0) {
			int maxLogSize = 1000;
			String veryLongString = array1.toString();
			for(int i = 0; i <= veryLongString.length() / maxLogSize; i++) {
				int start = i * maxLogSize;
				int end = (i+1) * maxLogSize;
				end = end > veryLongString.length() ? veryLongString.length() : end;
				Log.e("ARRAY1 when online", veryLongString.substring(start, end));
			}
			//Log.e(TAG, "POST_DATA..... send data to server when online......" + post_data);
		}*//*
	}

	*/public static class SendJsonArrayToServerWhenOnline extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/bulk/O");
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

				// send to post execute
				return JsonResponse;

			} catch (IOException e) {
				Log.e(TAG, "IOException....." + e.getMessage());
				e.printStackTrace();
			} finally {
				if (urlConnection != null) {
					urlConnection.disconnect();
					Log.e("Connection","Closed");
				}

				else Log.e("Connection","Not Closed");
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
			if(rResponse != null)
			{
				uiLog("Offline API Data "+s);
			}
		}

	}

	// /////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// /////////////////////////////Event Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void eventdatatoserver(String key,JSONObject prop) {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();


		try {
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
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("did", Utils.deviceId);
			post_data.put("res", Utils.resolution);
			post_data.put("c", Utils.carrierName);
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", networkDesc());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori",Utils.orientation);
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
					uiLog("\n End API Saved IN DB");
				}
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}

		if (prop.length()>0) {
			Log.e(TAG, "POST.........." + prop);
		}
	}

	public static class EventJsonDataToServer extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/single/event");
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
					Log.e("Connection","Closed");
				}
				else Log.e("Connection","Not Closed");
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
			if(rResponse != null)
			{
				uiLog("Event API Data "+s);
			}
		}


	}

	// //////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ////////////////////////////End Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void enddatatoserver() {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();

		try {
			//ActivityTracker.convertHashToJsonArray(Utils.hashMap);

			post_data.put("tsd", calTime);// //total session duration
			post_data.put("did", Utils.deviceId);
			post_data.put("akey", API_KEY);// api
																				// key
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("sdv", "1.0");// sdk version
			post_data.put("dt", Utils.deviceType);
			//post_data.put("act",Utils.jsonArray);
			post_data.put("mt", "E");
			Log.e(TAG, "     end api data;..............." /*+ user*/);


		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);

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
	public static void activityTimeTrackToServer() {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();

		try {
			ActivityTracker.convertHashToJsonArray(Utils.hashMap);

			post_data.put("akey", API_KEY);// api
			// key
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("dt", Utils.deviceType);
			post_data.put("did", Utils.deviceId);
			post_data.put("act",Utils.jsonArray);
			post_data.put("mt", "S");
			Log.e(TAG, "     activityTimeTracking data;..............." /*+ user*/);


		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);

			if (ConnectionManager.isNetworkConnected(appContext)) {
				new ActivityJsonDataToServer().execute(String.valueOf(post_data));
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

	public static class EndJsonDataToServer extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/single/E");
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
					Log.e("Connection","Closed");
				}
				else Log.e("Connection","Not Closed");
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
			if(rResponse != null)
			{
				uiLog("End API data "+s);
			}
		}

	}

	public static class ActivityJsonDataToServer extends
			AsyncTask<String, String, String> {

		@Override
		protected String doInBackground(String... params) {
			String JsonResponse = null;
			String JsonDATA = params[0];
			HttpURLConnection urlConnection = null;
			BufferedReader reader = null;
			try {
				URL url = new URL(URL+"i/single/S");
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
					Log.e("Connection","Closed");
				}
				else Log.e("Connection","Not Closed");
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
			if(rResponse != null)
			{
				uiLog("ActivityTracking API data "+s);
			}
		}

	}


	public static void beginApi(Context context) {
		if (Build.VERSION.SDK_INT >= 23) { // Build.VERSION_CODES.M
			if (checkPermission()) {
				Log.e(TAG, "checkPermission=-=====");
				Utils.requestSingleUpdate(appContext, new Utils.LocationCallback() {

					@Override
					public void onNewLocationAvailable(Utils.GPSCoordinates location) {
						// TODO Auto-generated method stub
					}
				});
			}
			else {
				Log.e("sendApi","---it is here");
			sendApi(context);
			}
		} else {
			Log.e(TAG, "log for less dan 23 version");
			Utils.requestSingleUpdate(appContext, new Utils.LocationCallback() {

				@Override
				public void onNewLocationAvailable(Utils.GPSCoordinates location) {
					// TODO Auto-generated method stub
				}
			});
		}
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


	public static void check()
	{
		dbUserManager.findArray();
	}



	public static void uiLog(String msg)
	{
		if(rResponse != null)
		{
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
