package com.example.testapp2;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ScrollView;
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

public class MainActivity extends Activity implements ReturnResponse {


    private static final String TAG = "Mainactivity";
    private Button crash, btnEvent;
    public static TextView txtResponse;
    public static String key;
    private EditText edtEvent;
    private static final int PERMISSION_REQUEST_CODE = 1;
    public static long calTime;
    public static ScrollView sv;
    private boolean exit = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setContentView(R.layout.activity_main);
        //requestPermission();
        //Activity act=(Activity)this;
        Log.e("Mobile Analytics", "done work");


        btnEvent = (Button) findViewById(R.id.btnEvent);
        crash = (Button) findViewById(R.id.btnCrash);
        txtResponse = (TextView) findViewById(R.id.txtResponse);
        sv = (ScrollView) findViewById(R.id.scrollView);
        sv.post(new Runnable() {
            @Override
            public void run() {
                sv.fullScroll(ScrollView.FOCUS_DOWN);
            }
        });
        txtResponse.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                sv.post(new Runnable() {
                    @Override
                    public void run() {
                        sv.fullScroll(ScrollView.FOCUS_DOWN);
                    }
                });
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
        edtEvent = (EditText) findViewById(R.id.edtEvent);


           MA.init(this,"http://52.87.24.173/api/","4170b44d6459bba992acaa857ac5b25d7fac6cc1");
           //if (Build.VERSION.SDK_INT < 23) {
               //Log.e("beginApi", "---- It is here");
               //MA.beginApi(this);
           //}
        super.onCreate(savedInstanceState);

    }

    @Override
    public void sendResponse(final String response) {

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (response != null) {
                    Log.e("JSonResponse", "atSendResponseInMainActivity");
                    txtResponse.append(response+" \n\n ");


                } else {
                    txtResponse.append(response+" \n\n ");

                }
            }
        });

    }

    public String temp;

    public void onClick(View v) {
        // TODO Auto-generated method stub

        switch (v.getId()) {


            case R.id.btnCrash:
               // MA.crashApi(this);
                int a = 1/0;
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

                MA.eventApi(key, prop);


                break;

            default:
                break;
        }

    }


    @Override
    protected void onStart() {
        // TODO Auto-generated method stub
        super.onStart();
        Log.e(TAG, "startTime  " + Utils.startTime);
        //calTime = MA.CalculatedTime;
        Log.e(TAG, "calTime :---" + calTime);
        Log.e(TAG, "onStart");

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
//        MA.endApi(this);
        Log.e(TAG, "onPause");
    }

    @Override
    protected void onDestroy() {
        // TODO Auto-generated method stub
        Log.e(TAG, "onDestroy");

        super.onDestroy();

    }

    @Override
    protected void onStop() {
        // TODO Auto-generated method stub
        super.onStop();
       /* MA.endApi(this);
*/
        Log.e(TAG, "onStop");
        Log.e(TAG, "startTime  " + Utils.startTime);
    }

    //@Override
    /*public void onBackPressed() {
        //super.onBackPressed();
        
        if (exit) {
            Log.e("MainActivity2", "onBackPressed");
            if (!Utils.endApiCalled) {
                MA.activityTimeTrackingApi(this);
                MA.endApi(this);
                Utils.endApiCalled = true;
                Toast.makeText(this, "Calling End Api method", Toast.LENGTH_SHORT).show();

            }
            finish(); // finish activity
            System.exit(0);
        } else {
            Toast.makeText(this, "Press Back again to Exit.",
                    Toast.LENGTH_SHORT).show();
            exit = true;
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    exit = false;
                }
            }, 3 * 1000);

        }*/

    //}


    /*private void requestPermission() {
        Log.e("Request is Here", "Request permission");
        ActivityCompat.requestPermissions(this, new String[]{
                        android.Manifest.permission.ACCESS_FINE_LOCATION,
                        android.Manifest.permission.ACCESS_COARSE_LOCATION},
                PERMISSION_REQUEST_CODE);
    }

    @SuppressLint("Override")
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_CODE:

                //4170b44d6459bba992acaa857ac5b25d7fac6cc1
                //private static String URL = "http://52.87.24.173/api/";
                //MA.beginApi(this);
                break;
        }
    }*/

    public void onDBClick(View v)
    {
        if(v == findViewById(R.id.btnDB)) {
            Intent i = new Intent(this, Main2Activity.class);
            startActivity(i);

        MA.check();
        finish();
        }
    }
}
