package com.mastek.appengage.utils;

import android.Manifest;
import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.MemoryInfo;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.StatFs;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.telephony.TelephonyManager;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.Patterns;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.GoogleApiClient.ConnectionCallbacks;
import com.google.android.gms.common.api.GoogleApiClient.OnConnectionFailedListener;
import com.google.android.gms.location.LocationServices;
import com.google.firebase.iid.FirebaseInstanceId;
import com.mastek.appengage.MA;
import com.mastek.appengage.dbusermanager.DBUserManager;
import com.mastek.appengage.locservice.LocationService1;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.security.MessageDigest;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Admin on 3/8/2016.
 */
public class Utils implements LocationListener,
		GoogleApiClient.ConnectionCallbacks,
		GoogleApiClient.OnConnectionFailedListener {
	private static final String TAG = Utils.class.getSimpleName();
	public static GoogleApiClient mGoogleApiClient;
	static String mLastUpdateTime;
	protected static boolean mRequestingLocationUpdates;
	private static String ACTIVITY_SERVICE = "activity-service";
	protected final static String KEY_REQUESTING_LOCATION_UPDATES = "requesting-location-updates";
	protected final static String KEY_LOCATION = "location";
	protected final static String KEY_LAST_UPDATED_TIME_STRING = "last-updated-time-string";

	public static String deviceId;
	public static long currentTimeStamp;
	public static int screenWidth;
	public static int screenHeight;
	public static String carrierName;
	public static Location mCurrentLocation;
	public static String StrLatitude;
	public static String StrLongitude;
	public static long totalMemory;
	public static long availableMegs;
	public static long megAvailable;
	public static int batteryLevel;
	public static int batteryScale;
	public static String root;
	private static BroadcastReceiver receiver;
	public static String locLatitude;
	public static String resolution;
	public static String locLongitude;
	public static String device1;
	public static String deviceType;
	public static String Smartphone;
	private static String tablet;
	private static String extraHealth;
//	private static User user;
	public static String orientation;
	public static String possibleEmail;
	public static int networkType;
	public static int duration;
	public static long startTime;
	public static boolean gps_enabled;
	public static String akey = "4170b44d6459bba992acaa857ac5b25d7fac6cc1";

	public static String tokenGen = FirebaseInstanceId.getInstance().getToken();
	/*
	 * static String eNdTime = "16:20:00"; private static Date endDate;
	 */
	public static long Available;
	public static long percentAvail;

	public static void init(Context context) {

		isTablet(context);
		isRooted(context);
		getDeviceId(context);
		ResolutionOfDevice(context);
		RamSize(context);
		getBatteryLevel(context);
		freeDiskSize();
		getEmail(context);
		getNetworkClass(context);
		CarrierName(context);
		TimeStamp();
		// duration();

		/*
		 * Calendar c = Calendar.getInstance(); int seconds =
		 * c.get(Calendar.SECOND);
		 */

		/*
		 * String string1 = eNdTime; try { endDate = new
		 * SimpleDateFormat("HH:mm:ss").parse(string1); } catch (ParseException
		 * e) { // TODO Auto-generated catch block e.printStackTrace(); }
		 */
		/* startTime = (Calendar.getInstance().getTime().getSeconds()); */

		/*
		 * Time today = new Time(Time.getCurrentTimezone()); today.setToNow();
		 */
		startTime = System.currentTimeMillis();

		Log.e(TAG, "Time " + startTime);

		LocationManager lm = (LocationManager) context
				.getSystemService(Context.LOCATION_SERVICE);
		gps_enabled = false;
		boolean network_enabled = false;

		try {
			gps_enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
		} catch (Exception ex) {
		}

		try {
			network_enabled = lm
					.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
		} catch (Exception ex) {
		}

		if (!gps_enabled && !network_enabled) {
			// notify user
			/*
			 * AlertDialog.Builder dialog = new AlertDialog.Builder(context);
			 * dialog.setMessage(context.getResources().getString(R.string.
			 * gps_network_not_enabled));
			 * dialog.setPositiveButton(context.getResources
			 * ().getString(R.string.open_location_settings), new
			 * DialogInterface.OnClickListener() {
			 * 
			 * @Override public void onClick(DialogInterface
			 * paramDialogInterface, int paramInt) { // TODO Auto-generated
			 * method stub Intent myIntent = new Intent(
			 * Settings.ACTION_LOCATION_SOURCE_SETTINGS);
			 * context.startActivity(myIntent); //get gps } });
			 */
			/*
			 * dialog.setNegativeButton(context.getString(R.string.Cancel), new
			 * DialogInterface.OnClickListener() {
			 * 
			 * @Override public void onClick(DialogInterface
			 * paramDialogInterface, int paramInt) { // TODO Auto-generated
			 * method stub
			 * 
			 * } }); dialog.show();
			 */
		}
	}

	public static void initiateAllDataBase(Context context) {

//		user = new User();
		DBUserManager.getInstance().initDB(context);
		Log.e(TAG, "DATABASE INITIALIZED");

		receiver = new BroadcastReceiver() {
			@Override
			public void onReceive(Context context, Intent intent) {
				String d = intent.getStringExtra(LocationService1.MESSAGE);

				// mLatitudeTextView.setText("Total distance : " + d.trim() +
				// " In meters");
				// do something here.
			}
		};

		mGoogleApiClient.connect();
		LocalBroadcastManager.getInstance(context).registerReceiver((receiver),
				new IntentFilter(LocationService1.RESULT));

		if (mCurrentLocation == null) {
			if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
				// TODO: Consider calling
				//    ActivityCompat#requestPermissions
				// here to request the missing permissions, and then overriding
				//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
				//                                          int[] grantResults)
				// to handle the case where the user grants the permission. See the documentation
				// for ActivityCompat#requestPermissions for more details.
				return;
			}
			mCurrentLocation = LocationServices.FusedLocationApi
					.getLastLocation(mGoogleApiClient);
			mLastUpdateTime = DateFormat.getTimeInstance().format(new Date());
			Log.e(TAG, "location problem in mCurrentLocation");
			updateUI();
		}

		Log.e(TAG, "DATABASE INITIALIZED");

		ManufacturerName();
		DeviceImei(context);
		CarrierName(context);
		TimeStamp();
		getEmail(context);
		RamSize(context);
		freeDiskSize();
		getBatteryLevel(context);
		isTablet(context);

		mGoogleApiClient = new GoogleApiClient.Builder(context)
				.addConnectionCallbacks((ConnectionCallbacks) context)
				.addOnConnectionFailedListener(
						(OnConnectionFailedListener) context)
				.addApi(LocationServices.API).build();

		Log.e(TAG, "Ui tuits INITIALIZED" + mGoogleApiClient);
		// updateValuesFromBundle(context.get);

		/*
		 * if (deviceType==tablet) { user.setDeviceType(tablet); } else if
		 * (deviceType==Smartphone){
		 * 
		 * user.setDeviceType(Smartphone); }
		 */

	}

	public static void isTablet(Context context) {
		boolean isTablet = (context.getResources().getConfiguration().screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE;

		if (isTablet) {

			Log.e("isTablet", "Tablet");
			tablet = "T";
			deviceType = tablet;

			orientation = "landscape";

		} else {
			Log.e("isTablet", "Smartphone");
			Smartphone = "S";

			deviceType = Smartphone;

			orientation = "potrait";
			// user.setDeviceType(Smartphone);
		}

	}

	public synchronized void buildGoogleApiClient(Context context) {
		Log.i(TAG, "Building GoogleApiClient");
		mGoogleApiClient = new GoogleApiClient.Builder(context, this, null)
				.addConnectionCallbacks(this)
				.addOnConnectionFailedListener(this)
				.addApi(LocationServices.API).build();
	}

	private static void updateValuesFromBundle(Bundle savedInstanceState) {
		if (savedInstanceState != null) {
			// Update the value of mRequestingLocationUpdates from the Bundle,
			// and make sure that
			// the Start Updates and Stop Updates buttons are correctly enabled
			// or disabled.
			if (savedInstanceState.keySet().contains(
					KEY_REQUESTING_LOCATION_UPDATES)) {
				mRequestingLocationUpdates = savedInstanceState
						.getBoolean(KEY_REQUESTING_LOCATION_UPDATES);
			}

			// Update the value of mCurrentLocation from the Bundle and update
			// the UI to show the
			// correct latitude and longitude.
			if (savedInstanceState.keySet().contains(KEY_LOCATION)) {
				// Since KEY_LOCATION was found in the Bundle, we can be sure
				// that mCurrentLocation
				// is not null.
				mCurrentLocation = savedInstanceState
						.getParcelable(KEY_LOCATION);
			}

			// Update the value of mLastUpdateTime from the Bundle and update
			// the UI.
			if (savedInstanceState.keySet().contains(
					KEY_LAST_UPDATED_TIME_STRING)) {
				mLastUpdateTime = savedInstanceState
						.getString(KEY_LAST_UPDATED_TIME_STRING);
			}
			updateUI();
		}
	}

	public static final String md5(final String toEncrypt) {
		try {
			final MessageDigest digest = MessageDigest.getInstance("md5");
			Log.e("toEncrypt", toEncrypt);
			digest.update(toEncrypt.getBytes());
			final byte[] bytes = digest.digest();
			final StringBuilder sb = new StringBuilder();
			for (int i = 0; i < bytes.length; i++) {
				sb.append(String.format("%02X", bytes[i]));
			}
			return sb.toString().toLowerCase();
		} catch (Exception exc) {
			return "";
		}
	}

	public static void showProgressBar(Context context, ProgressDialog progress) {
		progress.setTitle("Loading");
		progress.setMessage("Wait while loading...");
		progress.setCancelable(false);
		progress.show();
	}

	public static void dismissProgressBar(ProgressDialog progress) {
		progress.dismiss();
	}

	public static void getDeviceId(Context context) {
		if (ActivityCompat.checkSelfPermission(context, Manifest.permission.GET_ACCOUNTS) != PackageManager.PERMISSION_GRANTED) {
			// TODO: Consider calling
			//    ActivityCompat#requestPermissions
			// here to request the missing permissions, and then overriding
			//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
			//                                          int[] grantResults)
			// to handle the case where the user grants the permission. See the documentation
			// for ActivityCompat#requestPermissions for more details.
			deviceId = "NP";
		}
		else
		{
			TelephonyManager tm = (TelephonyManager) context
					.getSystemService(Activity.TELEPHONY_SERVICE);

			// device1 = tm.getDeviceId();
			deviceId = tm.getDeviceId();
		}

	}

	public static String changeTimeFormat(int hours, int mins) {

		String timeSet = "";
		if (hours > 12) {
			hours -= 12;
			timeSet = "PM";
		} else if (hours == 0) {
			hours += 12;
			timeSet = "AM";
		} else if (hours == 12)
			timeSet = "PM";
		else
			timeSet = "AM";

		String minutes = "";
		if (mins < 10)
			minutes = "0" + mins;
		else
			minutes = String.valueOf(mins);
		// Append in a StringBuilder
		String aTime = new StringBuilder().append(hours).append(':')
				.append(minutes).append(' ').append(timeSet).toString();

		return aTime;

	}

	public static void syncData(Context context) {

		// new SyncCategory(context).execute();
		// new SyncExpense(context).execute();
	}

	private static void ManufacturerName() {

		String deviceName = android.os.Build.MODEL;
		String deviceMan = android.os.Build.MANUFACTURER;

		Log.e(TAG, "deviceName :- " + deviceMan);
		Log.e(TAG, "deviceMan :-" + deviceName);
	}

	// @TargetApi(Build.VERSION_CODES.M)
	public static void DeviceImei(Context context) {
		TelephonyManager telephonyManager = (TelephonyManager) context
				.getSystemService(Context.TELEPHONY_SERVICE);

		/*
		 * if (checkSelfPermission(Manifest.permission.READ_PHONE_STATE) !=
		 * PackageManager.PERMISSION_GRANTED &&
		 * checkSelfPermission(Manifest.permission.READ_PHONE_STATE) !=
		 * PackageManager.PERMISSION_GRANTED) { // TODO: Consider calling //
		 * public void requestPermissions(@NonNull String[] permissions, int
		 * requestCode) // here to request the missing permissions, and then
		 * overriding // public void onRequestPermissionsResult(int requestCode,
		 * String[] permissions, // int[] grantResults) // to handle the case
		 * where the user grants the permission. See the documentation // for
		 * Activity#requestPermissions for more details. return; }
		 */
		if (telephonyManager.getDeviceId() == null) {
			// Toast.makeText(this, "Device Id not present",
			// Toast.LENGTH_SHORT);
		} else {
			deviceId = telephonyManager.getDeviceId();
			Log.e(TAG, "deviceId :-" + deviceId);
		}

	}

	public static void CarrierName(Context context) {

		TelephonyManager manager = (TelephonyManager) context
				.getSystemService(Context.TELEPHONY_SERVICE);
		carrierName = manager.getSimOperatorName();
		Log.e(TAG, "carrierName :-" + carrierName);
	}

	public static void RamSize(Context context) {

		/*ActivityManager actManager = (ActivityManager) context
				.getSystemService(context.ACTIVITY_SERVICE);
		ActivityManager.MemoryInfo memInfo = new ActivityManager.MemoryInfo();*/
		// actManager.getMemoryInfo(memInfo);
		// totalMemory = memInfo.totalMem;

		Log.e(TAG, "totalMemory :-" + totalMemory);

		MemoryInfo mi = new MemoryInfo();
		ActivityManager activityManager = (ActivityManager) context
				.getSystemService(Context.ACTIVITY_SERVICE);
		activityManager.getMemoryInfo(mi);
		availableMegs = mi.availMem / 1048576L;
		totalMemory = mi.totalMem / 1048576L;
		Log.e(TAG, "totalMemory :-" + totalMemory);

		 percentAvail = mi.availMem / mi.totalMem;

		Log.e(TAG, "totalMemory :-" + totalMemory);
	}

	public static String getTotalRAM() {

		RandomAccessFile reader = null;
		String load = null;
		DecimalFormat twoDecimalForm = new DecimalFormat("###");
		long totRam = 0;
		String lastValue = "";
		try {
			reader = new RandomAccessFile("/proc/meminfo", "r");
			load = reader.readLine();

			// Get the Number value from the string
			Pattern p = Pattern.compile("(\\d+)");
			Matcher m = p.matcher(load);
			String value = "";
			while (m.find()) {
				value = m.group(1);
				// System.out.println("Ram : " + value);
			}
			reader.close();

			totRam = (long) Double.parseDouble(value);
			// totRam = totRam / 1024;

			double mb = totRam / 1024.0;
			long gb = (long) (totRam / 1048576.0);
			double tb = totRam / 1073741824.0;

			if (tb > 1) {
				lastValue = twoDecimalForm.format(tb).concat(" TB");
			} else if (gb > 1) {
				lastValue = String.valueOf(gb);
			} else if (mb > 1) {
				lastValue = twoDecimalForm.format(mb).concat(" MB");
			} else {
				lastValue = twoDecimalForm.format(totRam).concat(" KB");
			}

		} catch (IOException ex) {
			ex.printStackTrace();
		} finally {
			// Streams.close(reader);
		}

		return lastValue;
	}

	public static float getBatteryLevel(Context context) {
		Intent batteryIntent = context.registerReceiver(null, new IntentFilter(
				Intent.ACTION_BATTERY_CHANGED));
		int level = batteryIntent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
		int scale = batteryIntent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);

		// Error checking that probably isn't needed but I added just in case.
		if (level == -1 || scale == -1) {
			return 50.0f;
		}
		Log.e(TAG, "total Battery level :-" + level + " " + scale);

		batteryLevel = level;
		batteryScale = scale;

		return ((float) level / (float) scale) * 100.0f;

	}

	private static void TimeStamp() {

		/*
		 * SimpleDateFormat dateFormat = new
		 * SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); String currentTimeStamp =
		 * dateFormat.format(new Date()); // Find todays date
		 */

		Long tsLong = System.currentTimeMillis() / 1000;
		currentTimeStamp = Long.parseLong(tsLong.toString()); /*
															 * time stamp in
															 * millis
															 */

		Log.e(TAG, "currentTimeStamp :- " + currentTimeStamp);
	}

	public static String ResolutionOfDevice(Context context) {

		/*
		 * DisplayMetrics displayMetrics = new DisplayMetrics(); WindowManager
		 * wm = (WindowManager) context
		 * .getSystemService(Context.WINDOW_SERVICE); // the results will // be
		 * higher than // using the // activity context // object or the //
		 * getWindowManager() // shortcut
		 * wm.getDefaultDisplay().getMetrics(displayMetrics);
		 */

		/*
		 * WindowManager wm = (WindowManager)
		 * context.getSystemService(Context.WINDOW_SERVICE); Display
		 * displayMetrics = wm.getDefaultDisplay(); screenWidth =
		 * displayMetrics.getWidth(); screenHeight = displayMetrics.getHeight();
		 */
		/*
		 * Display display = ((Activity)
		 * context).getWindowManager().getDefaultDisplay(); Point size = new
		 * Point(); display.getSize(size); int width = size.x; int height =
		 * size.y;
		 */

		/*
		 * DisplayMetrics dm = new DisplayMetrics(); ((Activity)
		 * context).getWindowManager().getDefaultDisplay().getMetrics(dm);
		 * double screenWidth = Math.pow(dm.widthPixels / dm.xdpi, 2)
		 * dm.widthPixels; double screenHeight = Math.pow(dm.heightPixels /
		 * dm.ydpi, 2) dm.heightPixels; double screenInches =
		 * Math.sqrt(screenWidth + screenHeight); Log.d("debug",
		 * "Screen inches : " + screenInches);
		 */

		DisplayMetrics displayMetrics = new DisplayMetrics();

		Log.e("Context---------- ", "" + (context == null));
		((Activity) context).getWindowManager().getDefaultDisplay()
				.getMetrics(displayMetrics);
		int screenWidth = displayMetrics.widthPixels;
		int screenHeight = displayMetrics.heightPixels;
		resolution=screenHeight + "*" + screenWidth;
		return screenHeight + "*" + screenWidth;
	}

	/*
	 * static String getEmail(Context context) { AccountManager accountManager =
	 * AccountManager.get(context); Account account =
	 * getAccount(accountManager);
	 * 
	 * if (account == null) { return null; } else { return account.name; } }
	 * 
	 * private static Account getAccount(AccountManager accountManager) {
	 * Account[] accounts = accountManager.getAccountsByType("com.google");
	 * Account account; if (accounts.length > 0) { account = accounts[0]; } else
	 * { account = null; } return account; }
	 */

	public static String getEmail(Context context) {
		possibleEmail = "";
		Pattern emailPattern = Patterns.EMAIL_ADDRESS; // API level 8+
		if (ActivityCompat.checkSelfPermission(context, Manifest.permission.GET_ACCOUNTS) != PackageManager.PERMISSION_GRANTED) {
			// TODO: Consider calling
			//    ActivityCompat#requestPermissions
			// here to request the missing permissions, and then overriding
			//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
			//                                          int[] grantResults)
			// to handle the case where the user grants the permission. See the documentation
			// for ActivityCompat#requestPermissions for more details.
			return "NP";
		}
		else {
			Account[] accounts = AccountManager.get(context).getAccounts();
			for (Account account : accounts) {
				if (emailPattern.matcher(account.name).matches()) {
					if (account.name != null
							&& !account.name.trim().equalsIgnoreCase("")) {
						possibleEmail = account.name;
						Log.e(TAG, "Email  " + possibleEmail);
						break;
					}
				}
			}
			return possibleEmail;
		}
	}

	public static String getNetworkClass(Context context) {
		TelephonyManager mTelephonyManager = (TelephonyManager) context
				.getSystemService(Context.TELEPHONY_SERVICE);
		networkType = mTelephonyManager.getNetworkType();
		switch (networkType) {
			case TelephonyManager.NETWORK_TYPE_GPRS:
			case TelephonyManager.NETWORK_TYPE_EDGE:
			case TelephonyManager.NETWORK_TYPE_CDMA:
			case TelephonyManager.NETWORK_TYPE_1xRTT:
			case TelephonyManager.NETWORK_TYPE_IDEN:
				return "2G";
			case TelephonyManager.NETWORK_TYPE_UMTS:
			case TelephonyManager.NETWORK_TYPE_EVDO_0:
			case TelephonyManager.NETWORK_TYPE_EVDO_A:
			case TelephonyManager.NETWORK_TYPE_HSDPA:
			case TelephonyManager.NETWORK_TYPE_HSUPA:
			case TelephonyManager.NETWORK_TYPE_HSPA:
			case TelephonyManager.NETWORK_TYPE_EVDO_B:
			case TelephonyManager.NETWORK_TYPE_EHRPD:
			case TelephonyManager.NETWORK_TYPE_HSPAP:
				return "3G";
			case TelephonyManager.NETWORK_TYPE_LTE:
				return "4G";
			default:
				return "Unknown";
		}
	}

	private String getDensity(Context context) {
		int density = context.getResources().getDisplayMetrics().densityDpi;

		String strDensity = "MDPI";

		switch (density) {
			case DisplayMetrics.DENSITY_LOW:
				// Toast.makeText(this, "LDPI",
				// Toast.LENGTH_SHORT).show();
				strDensity = "LDPI";
				break;
			case DisplayMetrics.DENSITY_MEDIUM:
				// Toast.makeText(this, "MDPI",
				// Toast.LENGTH_SHORT).show();
				strDensity = "MDPI";
				break;
			case DisplayMetrics.DENSITY_HIGH:
				// Toast.makeText(this, "HDPI",
				// Toast.LENGTH_SHORT).show();
				strDensity = "HDPI";
				break;
			case DisplayMetrics.DENSITY_XHIGH:
				// Toast.makeText(this, "XHDPI", Toast.LENGTH_SHORT)
				// .show();
				strDensity = "XHDPI";

			case DisplayMetrics.DENSITY_XXHIGH:
				// Toast.makeText(this, "XHDPI", Toast.LENGTH_SHORT)
				// .show();
				strDensity = "XXHDPI";
				break;
		}
		Log.e(TAG, "strDensity  " + strDensity);
		return strDensity;

	}

	private void getInternetBandwidth(Context context) {

		WifiManager wifiManager = (WifiManager) context
				.getSystemService(Context.WIFI_SERVICE);
		WifiInfo wifiInfo = wifiManager.getConnectionInfo();
		if (wifiInfo != null) {
			Integer linkSpeed = wifiInfo.getLinkSpeed(); // measured using
			// WifiInfo.LINK_SPEED_UNITS

			Log.e(TAG, "linkSpeed :- " + linkSpeed);
		}
	}

	private static void freeDiskSize() {

		StatFs stat = new StatFs(Environment.getExternalStorageDirectory()
				.getPath());
		long bytesAvailable = (long) stat.getBlockSize()
				* (long) stat.getAvailableBlocks();

		long TotalAvailable = (long) stat.getBlockSize();
		megAvailable = bytesAvailable / (1024 * 1024);
		Available = TotalAvailable;
		Log.e("", "Available MB : " + megAvailable);
	}

	public static void updateUI() {
		Log.d(TAG, "UI update initiated .............");
		if (null != mCurrentLocation) {
			double lat = mCurrentLocation.getLatitude();
			double lng = mCurrentLocation.getLongitude();
			float accuracy = mCurrentLocation.getAccuracy();
			// String provider = String.valueOf(mCurrentLocation.getProvider());
			// String time = String.valueOf(mCurrentLocation.getTime());

			/*
			 * txtLatitudeLongitude.setText("At Time: " + mLastUpdateTime + "\n"
			 * + "Latitude: " + lat + "\n" + "Longitude: " + lng + "\n" +
			 * "Accuracy: " + mCurrentLocation.getAccuracy() + "\n" +
			 * "Provider: " + mCurrentLocation.getProvider());
			 */

			Log.e(TAG, "latitude..............." + lat);
			Log.e(TAG, "longitude..............." + lng);
			Log.e(TAG, "accuracy..............." + accuracy);
			StrLatitude = lat + "";
			StrLongitude = lng + "";
			// Log.e(TAG, "     user.setLatitude(lat );..............." + user);
		} else {
			Log.d(TAG, "location is null ...............");
		}
	}

	// get System info.
	public static String OSNAME = "A";
	public static String OSVERSION = System.getProperty("os.version");
	public static String RELEASE = android.os.Build.VERSION.RELEASE;
	public static String VERSIONNAME = "1.0";
	public static String DEVICE = android.os.Build.DEVICE;
	public static String MODEL = android.os.Build.MODEL;
	public static String SDK_INT = Build.VERSION.SDK + "";
	public static String PRODUCT = android.os.Build.PRODUCT;
	public static String BRAND = android.os.Build.BRAND;
	public static String DISPLAY = android.os.Build.DISPLAY;
	public static String CPU_ABI = android.os.Build.CPU_ABI;
	public static String CPU_ABI2 = android.os.Build.CPU_ABI2;
	public static String UNKNOWN = android.os.Build.UNKNOWN;
	public static String CARRIER_NAME = android.os.Build.HOST;
	public static long TIME = android.os.Build.TIME;

	public static String timeStamp = TimeUnit.MILLISECONDS.toSeconds(System
			.currentTimeMillis()) + "";
	public static String DEVICE_ID = android.os.Build.ID;
	public static String HARDWARE = android.os.Build.HARDWARE;
	public static String ID = android.os.Build.ID;
	public static String MANUFACTURER = android.os.Build.MANUFACTURER;
	public static String SERIAL = android.os.Build.SERIAL;
	public static String USER = android.os.Build.USER;
	public static String HOST = android.os.Build.HOST;
	public static String ARCH = System.getProperty("os.arch");

	@Override
	public void onConnected(Bundle arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onConnectionSuspended(int arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onConnectionFailed(ConnectionResult arg0) {
		// TODO Auto-generated method stub

	}

	public static void isRooted(Context context) {
		boolean isRooted = findBinary("su");

		if (isRooted) {

			root = "yes";

			Log.e(TAG, "ROOTED :-" + "NOT ROOTED");
		} else {
			Log.e(TAG, "ROOTED :-" + " ROOTED");
			root = "no";
		}
	}

	public static boolean findBinary(String binaryName) {
		boolean found = false;
		if (!found) {
			String[] places = {"/sbin/", "/system/bin/", "/system/xbin/",
					"/data/local/xbin/", "/data/local/bin/",
					"/system/sd/xbin/", "/system/bin/failsafe/", "/data/local/"};
			for (String where : places) {
				if (new File(where + binaryName).exists()) {
					found = true;
					break;
				}
			}
		}

		Log.e(TAG, "find is rooted or not :-" + found);
		return found;
	}

	public static void BatteryLevel() {
		String level = BatteryManager.EXTRA_LEVEL;
		Log.e(TAG, "BATTERY LEVEL : " + String.valueOf(level) + "%");
		String extraPresent = BatteryManager.EXTRA_PRESENT;
		Log.e(TAG, "BATTERY Present : " + String.valueOf(extraPresent) + "%");
		extraHealth = BatteryManager.EXTRA_HEALTH;
		Log.e(TAG, "BATTERY Health :" + String.valueOf(extraHealth) + "%");
	}

	@Override
	public void onLocationChanged(Location location) {
		// TODO Auto-generated method stub
		mCurrentLocation = location;
		mLastUpdateTime = DateFormat.getTimeInstance().format(new Date());
		updateUI();

		/*
		 * Log.e(TAG, "latitude...23423.... :- " + Utils.locLatitude);
		 * Log.e(TAG, "longitude....2345656... :- " + Utils.locLongitude);
		 */
		/*
		 * locLatitude = String.valueOf(location.getLatitude()); locLongitude =
		 * String.valueOf(location .getLongitude());
		 */

	}

	@Override
	public void onProviderDisabled(String arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onProviderEnabled(String arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onStatusChanged(String arg0, int arg1, Bundle arg2) {
		// TODO Auto-generated method stub

	}

	public static interface LocationCallback {
		public void onNewLocationAvailable(GPSCoordinates location);
	}

	// calls back to calling thread, note this is for low grain: if you want
	// higher precision, swap the
	// contents of the else and if. Also be sure to check gps
	// permission/settings are allowed.
	// call usually takes <10ms
	public static void requestSingleUpdate(final Context context,
										   final LocationCallback callback) {
		final LocationManager locationManager = (LocationManager) context
				.getSystemService(Context.LOCATION_SERVICE);
		boolean isNetworkEnabled = locationManager
				.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
		Log.e(TAG, "isNetworkEnabled  " + isNetworkEnabled);
		if (isNetworkEnabled) {
			Criteria criteria = new Criteria();
			criteria.setAccuracy(Criteria.ACCURACY_COARSE);
			Log.e(TAG, "done work   ------------" + isNetworkEnabled);
			if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
				// TODO: Consider calling
				//    ActivityCompat#requestPermissions
				// here to request the missing permissions, and then overriding
				//   public void onRequestPermissionsResult(int requestCode, String[] permissions,
				//                                          int[] grantResults)
				// to handle the case where the user grants the permission. See the documentation
				// for ActivityCompat#requestPermissions for more details.
				Log.e(TAG, "isNetworkEnabled  " );
				locLatitude = "NP";
				locLongitude = "NP";
				MA.sendApi(context);
			}
			locationManager.requestSingleUpdate(criteria,
					new LocationListener() {
						@Override
						public void onLocationChanged(Location location) {

							locLatitude = String.valueOf(location.getLatitude());

							Log.e(TAG,
									"done work ////////////  "
											+ location.getLatitude());

							callback.onNewLocationAvailable(new GPSCoordinates(
									location.getLatitude(), location
									.getLongitude()));
							Log.e(TAG,
									"done work >>>>>>>>>>>>>>"
											+ location.getLongitude());
							locLongitude = String.valueOf(location
									.getLongitude());


							MA.sendApi(context);
						}

						@Override
						public void onStatusChanged(String provider,
													int status, Bundle extras) {
						}

						@Override
						public void onProviderEnabled(String provider) {
						}

						@Override
						public void onProviderDisabled(String provider) {
						}
					}, null);
		} else {

			Log.e(TAG,
					"location not found-------------");
			MA.sendApi(context);
			boolean isGPSEnabled = locationManager
					.isProviderEnabled(LocationManager.GPS_PROVIDER);
			if (isGPSEnabled) {
				Criteria criteria = new Criteria();
				criteria.setAccuracy(Criteria.ACCURACY_FINE);
				locationManager.requestSingleUpdate(criteria,
						new LocationListener() {
							@Override
							public void onLocationChanged(Location location) {
								callback.onNewLocationAvailable(new GPSCoordinates(
										location.getLatitude(), location
												.getLongitude()));
								Log.e(TAG, "done work+++++++++++++  "
										+ location.getLatitude());
								locLatitude = String.valueOf(location
										.getLatitude());
								locLongitude = String.valueOf(location
										.getLongitude());

								Log.e(TAG,
										"done work*******  "
												+ location.getLongitude());

							}

							@Override
							public void onStatusChanged(String provider,
									int status, Bundle extras) {
							}

							@Override
							public void onProviderEnabled(String provider) {
							}

							@Override
							public void onProviderDisabled(String provider) {
							}
						}, null);
			}
		}
	}

	// consider returning Location instead of this dummy wrapper class
	public static class GPSCoordinates {
		public float longitude = -1;
		public float latitude = -1;

		public GPSCoordinates(float theLongitude, float theLatitude) {
			longitude = theLongitude;
			latitude = theLatitude;
		}

		public GPSCoordinates(double theLongitude, double theLatitude) {
			longitude = (float) theLongitude;
			latitude = (float) theLatitude;
		}
	}

	public static int duration() {
		/*
		 * int start = (int) System.currentTimeMillis();
		 * 
		 * Log.e(TAG, "start ////////////  " + start);
		 * 
		 * int end = (int) System.currentTimeMillis();
		 * 
		 * Log.e(TAG, "end ////////////  " + end);
		 */

		// duration = Utils.TIME - MA.CalculatedTime;

		return duration;

	}


}
