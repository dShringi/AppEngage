
package com.mastek.appengage.exchandler;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;


import com.mastek.appengage.MA;
import com.mastek.appengage.dbusermanager.DBUserManager;
import com.mastek.appengage.utils.ConnectionManager;
import com.mastek.appengage.utils.Utils;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Created by rakesh13449 on 5/26/2016.
 */

public class ExceptionHandler implements Thread.UncaughtExceptionHandler {
    private static final String TAG = ExceptionHandler.class.getSimpleName();
    private static final int ACTIVITY_REQUEST_SEND_LOG = 1;
    private final Context myContext;
    private final String LINE_SEPARATOR = "\n";


    public ExceptionHandler(Context context) {

        this.myContext = context;
        // Thread.getDefaultUncaughtExceptionHandler();
    }

    @Override
    public void uncaughtException(final Thread thread, final Throwable exception) {



        new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {

                StringWriter stackTrace = new StringWriter();
                exception.printStackTrace(new PrintWriter(stackTrace));
                Log.e(TAG, "************ CAUSE OF ERROR ************\\n\\n" + exception);

                Log.e(TAG, "crash resport sent to server");
                final StringBuffer errorReport = new StringBuffer();
                errorReport.append("************ CAUSE OF ERROR ************\n\n");
                errorReport.append(stackTrace.toString());

                errorReport.append("\n************ DEVICE INFORMATION ***********\n");
                errorReport.append("Brand: ");
                errorReport.append(Build.BRAND);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Device: ");
                errorReport.append(Build.DEVICE);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Model: ");
                errorReport.append(Build.MODEL);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Id: ");
                errorReport.append(Build.ID);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Product: ");
                errorReport.append(Build.PRODUCT);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("\n************ FIRMWARE ************\n");
                errorReport.append("SDK: ");
                errorReport.append(Build.VERSION.SDK);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Release: ");
                errorReport.append(Build.VERSION.RELEASE);
                errorReport.append(LINE_SEPARATOR);
                errorReport.append("Incremental: ");
                errorReport.append(Build.VERSION.INCREMENTAL);
                errorReport.append(LINE_SEPARATOR);
                Log.e("crashAPI In app", "Called");


                MA.crashApi(exception.getMessage(), errorReport.toString());
              //  System.exit(0);
                return null;
            }

            @Override
            protected void onPostExecute(Void aVoid) {
                Log.e("Exception", exception.getLocalizedMessage());
                android.os.Process.killProcess(android.os.Process.myPid());
            }
        }.execute();



/*        new Thread(){
            @Override
            public void run() {
                super.run();
                MA.activityTimeTrackingApi(myContext);
                MA.endApi(myContext);
            }
        }.start();*/

        //android.os.Process.killProcess(android.os.Process.myPid());
        //System.exit(1);

    }

}
