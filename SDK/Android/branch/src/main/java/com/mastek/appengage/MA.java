package com.mastek.appengage;

import android.content.Context;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.os.AsyncTask;
import android.util.Log;

import com.mastek.appengage.dbusermanager.DBUserManager;
import com.mastek.appengage.model.User;
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
	private static User user;
	public static String response;
	public static String device2;
	public static Context appContext;
	private static DBUserManager dbUserManager;
	private static String URL = "http://52.87.24.173/api/";
	private static String akey = "4170b44d6459bba992acaa857ac5b25d7fac6cc1";
	public static long CalculatedTime;
	public static long timeDuration;
	private static long time1;
	private static long time2;
	private static int days;
	private static int hours;
	private static int min;
	private static long calTime;	

	public static void sendApi(final Context context) {
		new Thread() {
			
			private MyReceiver mReceiver;
		

			public void run() {
				if (context != null)
					appContext = context;

				dbUserManager = new DBUserManager(appContext);

				Utils.init(appContext);

				user = getUserDetails();

				user.setMessegeType("B");

				this.mReceiver = new MyReceiver();
				appContext.registerReceiver(this.mReceiver, new IntentFilter(
						ConnectivityManager.CONNECTIVITY_ACTION));
				
				
				time1 = System.currentTimeMillis();

				if (ConnectionManager.isNetworkConnected(appContext)) {
					
				
					CalculatedTime =Utils.currentTimeStamp;
					
					Log.e(TAG, "CalculatedTime  "+CalculatedTime);
					senddatatoserver(user);
					
					
				} else {
					boolean save = dbUserManager.save(user);

					Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);

					Log.e(TAG, "SAVE....... :- " + save);

				}

				Utils.updateUI();

			}

		}.start();

	}

	public static void eventApi(final String key,final JSONObject prop) {

		new Thread() {
			@Override
			public void run() {
				super.run();
				user = getUserDetails();

				if (ConnectionManager.isNetworkConnected(appContext)) {

					eventdatatoserver(user,key,prop);
					Log.e(TAG, "event data to server... :- ");
				} else {
					boolean save = dbUserManager.save(user);

					Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);

				}

			}

		}.start();
	}

	public static void endApi(final Context context) {

		new Thread() {

			@Override
			public void run() {
				// TODO Auto-generated method stub
				super.run();

				if (context != null)
					appContext = context;
				
				time2 = System.currentTimeMillis();
				
				
				calTime = (time2 - time1)/1000;
				
				Log.i("======= calTime"," :: "+calTime);
				
				if (ConnectionManager.isNetworkConnected(appContext)) {

					enddatatoserver(user);
					Log.e(TAG, "end data to server... :- ");
				} else {
					boolean save = dbUserManager.save(user);

					Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);

					Log.e(TAG, "SAVE....... :- " + save);
				}

			}
		}.start();
	}

	public static void crashApi(final Context context) {

		new Thread() {
			@Override
			public void run() {
				// TODO Auto-generated method stub
				super.run();

				if (context != null)
					appContext = context;

				user = getUserDetails();

				if (ConnectionManager.isNetworkConnected(appContext)) {

					sendCrashDataToServer("Java.lang.NullPointerException",
							user);
					Log.e(TAG, "end data to server... :- ");
				} else {
					boolean save = dbUserManager.save(user);

					Log.e(TAG, "DBUSERMANAGER :- " + dbUserManager);

					Log.e(TAG, "SAVE....... :- " + save);
				}
			};
		}.start();
	}

	// ///////////////////crash api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void sendCrashDataToServer(String message, User user) {

		JSONObject post_data = new JSONObject();

		try {
			post_data.put("mnu", user.getManufacturer());
			post_data.put("mod", user.getModel());
			post_data.put("osv", user.getRelease());
			post_data.put("pf", user.getOsName());
			post_data.put("avn", user.getVersionName());
			if (Utils.gps_enabled) {
				post_data.put("lat", Utils.locLatitude);
				post_data.put("lng", Utils.locLongitude);

			} else {
				post_data.put("lat", "0.0");
				post_data.put("lng", "0.0");
			}
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + user.getDeviceId());
			post_data.put("did", user.getDeviceId());
			post_data.put("res", user.getResolution());
			post_data.put("c", user.getCarrierName());
			post_data.put("dt", user.getDeviceType());
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", user.getNetworkType());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori", user.getOrientation());
			post_data.put("akey", akey);
			post_data.put("frs", user.getFreeRamSize());
			post_data.put("trs", user.getTotalRamSize());
			post_data.put("fds", user.getFreeDiskSize());
			post_data.put("tds", user.getTotalDiskSize());
			post_data.put("bl", user.getBatteryLevel());
			post_data.put("ids", user.getIsDeviceRooted());
			post_data.put("ido", user.getIsDeviceOnline());
			post_data
					.put("est",
							"E/AndroidRuntime(27386): java.lang.NullPointerException: return value is null at method AAA");
			post_data.put("esm", "");

			post_data.put("Ess", message);
			post_data.put("sdv", "1.0");
			post_data.put("mt", "C");

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);
			new SendCrashDataToServer().execute(String.valueOf(post_data));
		}
	}

	public static class SendCrashDataToServer extends
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
						akey);
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
		}

	}

	// ///////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ///////////////////send api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void senddatatoserver(User user) {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();

		JSONArray array = new JSONArray();

		try {
			post_data.put("sync_status", user.getSyncStatus());
			post_data.put("test", user.getTest());
			post_data.put("mod", user.getModel());
			post_data.put("avn", user.getVersionName());
			post_data.put("mnu", user.getManufacturer());
			post_data.put("osv", user.getRelease());
			post_data.put("pf", user.getOsName());
			post_data.put("lat", Utils.locLatitude);
			post_data.put("lng", Utils.locLongitude);
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + user.getDeviceId());
			post_data.put("did", user.getDeviceId());
			post_data.put("res", user.getResolution());
			post_data.put("c", user.getCarrierName());
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw",user.getNetworkType());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori", Utils.orientation);
			post_data.put("akey", akey);
			post_data.put("sdv", "1.0");
            post_data.put("fbiKey",Utils.tokenGen);
			post_data.put("mt", "B");
			Log.e(TAG, "     send data;..............." + user);

			array.put(post_data);

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..... send data to server......" + post_data);
			new SendJsonDataToServer().execute(String.valueOf(post_data));
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

				urlConnection.setRequestProperty("akey",akey);
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
				}
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
		}

	}

	// /////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ///////////////////send data when
	// online\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void senddatawhenonline(JSONArray array1) {
		// function in the activity that corresponds to the layout button

		user = getUserDetails();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();

		try {
			post_data.put("test", user.getTest());
			post_data.put("mod", user.getModel());
			post_data.put("avn", user.getVersionName());
			post_data.put("mnu", user.getManufacturer());
			post_data.put("osv", user.getRelease());
			post_data.put("pf", user.getOsName());
			if (Utils.gps_enabled) {
				post_data.put("lat", Utils.locLatitude);
				post_data.put("lng", Utils.locLongitude);

			} else {
				post_data.put("lat", "0.0");
				post_data.put("lng", "0.0");
			}
			post_data.put("rtc", user.getTimeStamp());
			post_data.put("sid", time1 + "" + user.getDeviceId());
			post_data.put("did", user.getDeviceId());
			post_data.put("res", Utils.screenWidth + "*" + Utils.screenHeight);
			post_data.put("c", user.getCarrierName());
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", user.getNetworkType());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori", Utils.orientation);
			post_data.put("akey", akey);
			post_data.put("sdv", "1.0");
			post_data.put("mt", "O");
			Log.e(TAG, "     send data;..............." + user);

			array1.put(post_data);

		} catch (JSONException e) {
			e.printStackTrace();
			Log.e(TAG, "JSONException in catch......" + e.getMessage());
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..... send data to server......" + post_data);
			new SendJsonArrayToServerWhenOnline().execute(String.valueOf(array1));
		}
	}

	public static class SendJsonArrayToServerWhenOnline extends
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
						akey);
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
				}
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
		}

	}

	// /////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// /////////////////////////////Event Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void eventdatatoserver(User user,String key,JSONObject prop) {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();
		

		try {
			post_data.put("mnu", user.getManufacturer());
			post_data.put("mod", user.getModel());
			post_data.put("osv", user.getRelease());
			post_data.put("pf", user.getOsName());
			post_data.put("avn", user.getVersionName());
			if (Utils.gps_enabled) {
				post_data.put("lat", Utils.locLatitude);
				post_data.put("lng", Utils.locLongitude);
				
			} else {
				post_data.put("lat", "0.0");
				post_data.put("lng", "0.0");
			}
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + user.getDeviceId());
			post_data.put("did", user.getDeviceId());
			post_data.put("res", user.getResolution());
			post_data.put("c", user.getCarrierName());
			post_data.put("dt", Utils.deviceType);
			post_data.put("ac", Utils.possibleEmail);
			post_data.put("nw", user.getNetworkType());
			post_data.put("cpu", Utils.ARCH);
			post_data.put("ori", user.getOrientation());
			post_data.put("akey", akey);
			post_data.put("sdv", "1.0");
			post_data.put("mt", "event");
			post_data.put("key", key);
			
			
			
			post_data.put("pro", prop);
			Log.e(TAG, "     send data;..............." + user);
			

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);
			new EventJsonDataToServer().execute(String.valueOf(post_data));
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
						akey);
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
				}
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
		}

	}

	// //////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	// ////////////////////////////End Api\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static void enddatatoserver(User user) {
		// function in the activity that corresponds to the layout button
		// LatLng = txtLatitudeLongitude.getText().toString();
		versionName = Utils.VERSIONNAME;
		JSONObject post_data = new JSONObject();
 
		try {
			post_data.put("tsd", calTime);// //total session duration
			post_data.put("did", Utils.deviceId);
			post_data.put("akey", akey);// api
																				// key
			post_data.put("rtc", CalculatedTime);
			post_data.put("sid", time1 + "" + Utils.deviceId);
			post_data.put("sdv", "1.0");// sdk version
			post_data.put("dt", Utils.deviceType);
			post_data.put("mt", "E");
			Log.e(TAG, "     send data;..............." + user);

		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (post_data.length() > 0) {
			Log.e(TAG, "POST_DATA..........." + post_data);
			new EndJsonDataToServer().execute(String.valueOf(post_data));
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
						akey);
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
				}
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
		}

	}

	// ///////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	public static User getUserDetails() {

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
		user.setResolution(Utils.ResolutionOfDevice(appContext));
		user.setOrientation(Utils.orientation);
		user.setCarrierName(Utils.carrierName);
		user.setTokenGen(Utils.tokenGen);

		if (Connectivity.isConnected(appContext)) {
			
			if (Connectivity.isConnectedMobile(appContext)) {
				
				
				Log.e("Connectivity",""+ Utils.networkType);
				
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
	};

}
