package com.example.testapp2;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.mastek.appengage.MA;
import com.mastek.appengage.MyReceiver;
import com.mastek.appengage.db.DataHandler;
import com.mastek.appengage.utils.Utils;
import com.mastek.appengage.ReturnResponse;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

public class MainActivity extends Activity implements ReturnResponse{


    private static final String TAG = "Mainactivity";
    private Button crash,btnEvent;
    private Object returnValue;
    public static TextView txtResponse;
    String SENT = "SMS_SENT";
    String DELIVERED = "SMS_DELIVERED";
    public static String key;
    public static Date time1;
    private EditText edtEvent;
    private static final int PERMISSION_REQUEST_CODE = 1;
    public static long calTime;
    public static final String PROPERTY_REG_ID = "registration_id";
    private static final String PROPERTY_APP_VERSION = "appVersion";
    private MyReceiver mReceiver = null;
    private BroadcastReceiver sendBroadcastReceiver;
    private BroadcastReceiver deliveryBroadcastReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setContentView(R.layout.activity_main);

        //Activity act=(Activity)this;
        Log.e("Mobile Analytics", "done work");

        locate();

        MA.sendApi(this);

        btnEvent = (Button) findViewById(R.id.btnEvent);
        crash = (Button) findViewById(R.id.btnCrash);
        txtResponse = (TextView) findViewById(R.id.txtResponse);

        edtEvent = (EditText)findViewById(R.id.edtEvent);

        temp =  txtResponse.getText() + " \n\n " +"Calling Send Api" ;
        txtResponse.setText(temp);


        super.onCreate(savedInstanceState);

    }

    /*private void storeRegistrationId(Context context, String regId) {
        final SharedPreferences prefs = getGCMPreferences(context);
        int appVersion = getAppVersion(context);
        Log.i(TAG, "Saving regId on app version " + appVersion);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PROPERTY_REG_ID, regId);
        editor.putInt(PROPERTY_APP_VERSION, appVersion);
        editor.commit();
    }
*/

    /*private SharedPreferences getGCMPreferences(Context context) {
        // This sample app persists the registration ID in shared preferences, but
        // how you store the registration ID in your app is up to you.
        return getSharedPreferences(MainActivity.class.getSimpleName(),
                Context.MODE_PRIVATE);
    }*/

    /**
     * @return Application's version code from the {@code PackageManager}.
     */
    private static int getAppVersion(Context context) {
        try {
            PackageInfo packageInfo = context.getPackageManager()
                    .getPackageInfo(context.getPackageName(), 0);
            return packageInfo.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            // should never happen
            throw new RuntimeException("Could not get package name: " + e);
        }
    }

    @Override
    public void sendResponse(String response)
    {
        if(response != null)
        {
            Log.e("JSonResponse","atSendResponseInMainActivity");
            temp = txtResponse.getText()+ " \n\n " + "Success message recieved" ;
            txtResponse.setText(temp);
        }
        else
        {
            temp = txtResponse.getText()+ " \n\n " + "Failure message recieved" ;
            txtResponse.setText(temp);
        }
    }

    public String temp;
    public void onClick(View v) {
        // TODO Auto-generated method stub

        switch (v.getId()) {


            case R.id.btnCrash:
                MA.crashApi(this);
                temp = txtResponse.getText()+ " \n\n " + "Calling Crash Api method" ;
                txtResponse.setText(temp);
                break;

            case R.id.btnEvent:
                JSONObject prop = new JSONObject();
                try {
                    prop.put("productId", "45");//set any value in this as property dictionary
                    prop.put("category", "2");
                    prop.put("Offer", "Y");
                } catch (JSONException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }

                key = edtEvent.getText().toString().trim();

                MA.eventApi(key,prop);
                temp = txtResponse.getText() + " \n\n " + "Calling Event Api method with "+key+" "+prop  ;
                txtResponse.setText(temp);
                break;

            default:
                break;
        }

    }

    private void locate() {

        if (Build.VERSION.SDK_INT >= 23) { // Build.VERSION_CODES.M
            if (checkPermission()) {
                Log.e(TAG, "checkPermission=-=====");
            }
            else {
                requestPermission();
            }
        } else {
            Log.e(TAG, "log for less dan 23 version");
            Utils.requestSingleUpdate(MainActivity.this, new Utils.LocationCallback() {

                @Override
                public void onNewLocationAvailable(Utils.GPSCoordinates location) {
                    // TODO Auto-generated method stub
                }
            });
        }
    }

    @Override
    protected void onStart() {
        // TODO Auto-generated method stub
        super.onStart();
        Log.e(TAG, "startTime  " + Utils.startTime);
        calTime = MA.CalculatedTime;
        Log.e(TAG, "calTime :---" + calTime);
        Log.e(TAG, "onStart");
        Utils.init(this);
    }

    @Override
    protected void onResume() {
        // TODO Auto-generated method stub
        super.onResume();
        Log.e(TAG, "onResume");
    }

    @Override
    protected void onPause() {
        // TODO Auto-generated method stub
        super.onPause();
        Log.e(TAG, "onPause");
    }

    @Override
    protected void onDestroy() {
        // TODO Auto-generated method stub
        Log.e(TAG, "onDestroy");

        super.onDestroy();
        MA.endApi(this);
        temp = txtResponse.getText()+ " \n\n" +"Calling End Api method";
        txtResponse.setText(temp);
        Toast.makeText(this,"Calling End Api method",Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onStop() {
        // TODO Auto-generated method stub
        super.onStop();
        Log.e(TAG, "onStop");
        Log.e(TAG, "startTime  " + Utils.startTime);
    }

    private boolean checkPermission() {
        int result = ActivityCompat.checkSelfPermission(this,
                android.Manifest.permission.ACCESS_FINE_LOCATION);
        int result2 = ActivityCompat.checkSelfPermission(this,
                android.Manifest.permission.ACCESS_COARSE_LOCATION);
        if (result == PackageManager.PERMISSION_GRANTED
                && result2 == PackageManager.PERMISSION_GRANTED) {
            return false;
        } else {
            return true;
        }
    }

    private void requestPermission() {
        ActivityCompat.requestPermissions(this, new String[] {
                        android.Manifest.permission.ACCESS_FINE_LOCATION,
                        android.Manifest.permission.ACCESS_COARSE_LOCATION },
                PERMISSION_REQUEST_CODE);
    }

    @SuppressLint("Override")
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_CODE:
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {

                    Utils.requestSingleUpdate(MainActivity.this, new Utils.LocationCallback() {

                        @Override
                        public void onNewLocationAvailable(Utils.GPSCoordinates location) {
                            // TODO Auto-generated method stub
                        }
                    });
                } else {
                }
                break;
        }
    }
}
