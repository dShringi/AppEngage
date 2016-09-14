package com.mastek.appengage.locservice;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;

/**
 * Created by Admin on 5/6/2016.
 */
public class LocationService1 extends Service implements LocationListener,
		GoogleApiClient.ConnectionCallbacks,
		GoogleApiClient.OnConnectionFailedListener {

	static final public String RESULT = "com.google.android.gms.location.sample.locationsettings.LocationService.REQUEST_PROCESSED";
	static final public String MESSAGE = "com.google.android.gms.location.sample.locationsettings.LocationService.COPA_MSG";
	static final public String OLDLOCATION = "com.google.android.gms.location.sample.locationsettings.LocationService.OLD_LOCATION";
	static final public String NEWLOCATION = "com.google.android.gms.location.sample.locationsettings.LocationService.NEW_LOCATION";
	private static final String TAG = LocationService1.class.getSimpleName();
	private static final String MY_PREFS_NAME = "MyPrefsFile";
	public static double newDistance = 0.0;
	protected Location mCurrentLocation;
	public static Boolean serviceRunning = false;
	private LocalBroadcastManager broadcaster;
	private SharedPreferences.Editor editor;
	private SharedPreferences defaultSharedPreferences;
	public static final long UPDATE_INTERVAL_IN_MILLISECONDS = 60000;
	public static final long FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS = UPDATE_INTERVAL_IN_MILLISECONDS / 2;
	private static final float SMALLEST_DISPLACEMENT = 10.0f;
	protected Boolean mRequestingLocationUpdates;
	public static GoogleApiClient mGoogleApiClient;
	public static LocationRequest mLocationRequest;
	private SharedPreferences settings;

	@Override
	public void onCreate() {
		super.onCreate();
		Log.d(TAG, "Service Started successfully ");

		// initializeDatabase();
		settings = getApplicationContext().getSharedPreferences(MY_PREFS_NAME,
				Activity.MODE_PRIVATE);
		// LocationActivity.mGoogleApiClient.connect();
		buildGoogleApiClient();
		createLocationRequest();
		broadcaster = LocalBroadcastManager.getInstance(this);
	}

	@Nullable
	@Override
	public IBinder onBind(Intent intent) {
		throw new UnsupportedOperationException("Not yet implemented");
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		serviceRunning = true;
		if (mGoogleApiClient.isConnected() && mCurrentLocation != null)
			startLocationUpdates();
		/*
		 * if(!LocationActivity.mGoogleApiClient.isConnected())
		 * LocationActivity.mGoogleApiClient.connect();
		 */
		/*
		 * Handler handler = new Handler(); handler.postDelayed(new Runnable() {
		 * 
		 * @Override public void run() {
		 * 
		 * //performe the deskred task
		 * 
		 * } }, 10 * 1000);
		 */

		return Service.START_STICKY;
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		serviceRunning = false;
	}

	/*
	 * private void initializeDatabase() { try { //
	 * com.example.rakesh13449.test.
	 * Utils.initiateAllDataBase(getApplicationContext()); } catch (Exception e)
	 * { e.printStackTrace(); } finally { } }
	 */

	@Override
	public void onLocationChanged(Location location) {

		// final DistanceVO distnceAndLocation =
		// DBLocationManager.getInstance().getDistnceAndLocation();
		// if(distnceAndLocation == null){
		Log.d(TAG, "old lattitude : " + mCurrentLocation.getLatitude()
				+ " old Longitude : " + mCurrentLocation.getLongitude());
		Log.d(TAG, "lattitude changed : " + location.getLatitude()
				+ " Longitude changed : " + location.getLongitude());
		final double FirstDistance = haversine(mCurrentLocation.getLatitude(),
				mCurrentLocation.getLongitude(), location.getLatitude(),
				location.getLongitude());

		Log.d(TAG, "Distance: " + FirstDistance);
		/*
		 * DistanceVO distanceVO = new DistanceVO();
		 * distanceVO.setStartLatitude(mCurrentLocation.getLatitude());
		 * distanceVO.setStartLongitude(mCurrentLocation.getLongitude());
		 * distanceVO.setFirstLatitude(mCurrentLocation.getLatitude());
		 * distanceVO.setFirstLongitude(mCurrentLocation.getLongitude());
		 * distanceVO.setEndLatitude(location.getLatitude());
		 * distanceVO.setEndLongitude(location.getLongitude());
		 * distanceVO.setDistance(FirstDistance);
		 * 
		 * DBLocationManager.getInstance().insertDistanceAndLocation(distanceVO);
		 */
		sendResult(String.valueOf(FirstDistance));
		/*
		 * } else { Log.d(TAG,"Database lattitude : "+
		 * distnceAndLocation.getEndLatitude()+" Database Longitude : "+
		 * distnceAndLocation.getEndLongitude()); Log.d(TAG,
		 * "lattitude changed : " + location.getLatitude() +
		 * " Longitude changed : " + location.getLongitude()); double distance =
		 * haversine(distnceAndLocation.getEndLatitude(),
		 * distnceAndLocation.getEndLongitude(), location.getLatitude(),
		 * location.getLongitude()); Log.d(TAG,
		 * "Distance After Database values: " + distance); final double
		 * distance1 = distnceAndLocation.getDistance(); Log.d(TAG,
		 * "Database Distance: " + distance1); distance = distance1+ distance;
		 * Log.d(TAG, "Final Distance: " + distance); DistanceVO distanceVO =
		 * new DistanceVO();
		 * distanceVO.setStartLatitude(distnceAndLocation.getEndLatitude());
		 * distanceVO.setStartLongitude(distnceAndLocation.getEndLongitude());
		 * distanceVO.setEndLatitude(location.getLatitude());
		 * distanceVO.setEndLongitude(location.getLongitude());
		 * distanceVO.setDistance(distance);
		 * 
		 * DBLocationManager.getInstance().updateDistanceAndLocation(distanceVO);
		 * sendResult(String.valueOf(distance)); }
		 */
		/*
		 * Log.d(TAG, "Old Distance : " + distance);
		 * 
		 * String d = settings.getString("distance",null); if (d == null) {
		 * newDistance = newDistance + distance; } else {
		 * Log.d(TAG,"Value of sharedPref :"+ d); Double dis =
		 * Double.parseDouble(d); newDistance = dis + distance; }
		 * 
		 * Log.d(TAG, "New Distance : " + newDistance);
		 * settings.edit().putString("distance",
		 * Double.valueOf(newDistance).toString()); settings.edit().apply();
		 */

		mCurrentLocation = location;

	}

//	@TargetApi(Build.VERSION_CODES.M)
	protected void startLocationUpdates() {
//		if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
//				&& checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
			// TODO: Consider calling
			// public void requestPermissions(@NonNull String[] permissions, int
			// requestCode)
			// here to request the missing permissions, and then overriding
			// public void onRequestPermissionsResult(int requestCode, String[]
			// permissions,
			// int[] grantResults)
			// to handle the case where the user grants the permission. See the
			// documentation
			// for Activity#requestPermissions for more details.
//			return;
//		}
		LocationServices.FusedLocationApi.requestLocationUpdates(
				mGoogleApiClient, mLocationRequest, this).setResultCallback(
				new ResultCallback<Status>() {
					@Override
					public void onResult(Status status) {
						mRequestingLocationUpdates = true;
						// setButtonsEnabledState();
					}
				});

		Log.d(TAG, "lattitude : " + mCurrentLocation.getLatitude()
				+ "Longitude : " + mCurrentLocation.getLongitude());

	}

	public static double haversine(double lat1, double lon1, double lat2,
			double lon2) {
		int R = 6371000;
		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);
		lat1 = Math.toRadians(lat1);
		lat2 = Math.toRadians(lat2);

		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2)
				* Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	/*
	 * protected void createLocationRequest() { mLocationRequest = new
	 * LocationRequest();
	 * mLocationRequest.setInterval(UPDATE_INTERVAL_IN_MILLISECONDS);
	 * //mLocationRequest
	 * .setFastestInterval(FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS);
	 * mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY); }
	 */

	public void sendResult(String distance) {
		Intent intent = new Intent(RESULT);
		if (distance != null)
			intent.putExtra(MESSAGE, distance);
		if (intent != null)
			broadcaster.sendBroadcast(intent);
	}

	@Override
	public void onConnected(Bundle bundle) {
		if (mCurrentLocation == null) {

//			if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
//					&& checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
//				// TODO: Consider calling
//				// public void requestPermissions(@NonNull String[] permissions,
//				// int requestCode)
//				// here to request the missing permissions, and then overriding
//				// public void onRequestPermissionsResult(int requestCode,
//				// String[] permissions,
//				// int[] grantResults)
//				// to handle the case where the user grants the permission. See
//				// the documentation
//				// for Activity#requestPermissions for more details.
//				return;
//			}
			mCurrentLocation = LocationServices.FusedLocationApi
					.getLastLocation(mGoogleApiClient);
			Log.d(TAG, "lattitude : " + mCurrentLocation.getLatitude()
					+ "Longitude : " + mCurrentLocation.getLongitude());
			startLocationUpdates();
		}
	}

	@Override
	public void onConnectionSuspended(int i) {
		mGoogleApiClient.connect();
	}

	@Override
	public void onConnectionFailed(ConnectionResult connectionResult) {

	}

	public synchronized void buildGoogleApiClient() {
		Log.i(TAG, "Building GoogleApiClient");
		mGoogleApiClient = new GoogleApiClient.Builder(this)
				.addConnectionCallbacks(this)
				.addOnConnectionFailedListener(this)
				.addApi(LocationServices.API).build();
		mGoogleApiClient.connect();
	}

	protected void createLocationRequest() {
		mLocationRequest = new LocationRequest();
		mLocationRequest.setSmallestDisplacement(SMALLEST_DISPLACEMENT);
		mLocationRequest.setInterval(UPDATE_INTERVAL_IN_MILLISECONDS);
		mLocationRequest
				.setFastestInterval(FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS);
		mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
	}

	@Override
	public void onTaskRemoved(Intent rootIntent) {
		super.onTaskRemoved(rootIntent);

		Log.e(TAG, "TASK REMOVED");
	}
}
