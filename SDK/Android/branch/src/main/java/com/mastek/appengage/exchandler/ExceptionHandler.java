/*
package com.example.rakesh13449.test.handler;

import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import com.example.rakesh13449.test.activity.AnotherActivity;
import com.example.rakesh13449.test.activity.MainActivity;

import java.io.PrintWriter;
import java.io.StringWriter;

*/
/**
 * Created by rakesh13449 on 5/26/2016.
 *//*

public class ExceptionHandler extends Application implements Thread.UncaughtExceptionHandler {
    private static final String TAG = ExceptionHandler.class.getSimpleName();
    private static final int ACTIVITY_REQUEST_SEND_LOG = 1;
    private final Activity myContext;
    private final String LINE_SEPARATOR = "\n";


    public ExceptionHandler(Activity context) {
        this.myContext = context;
        Thread.getDefaultUncaughtExceptionHandler();
    }

    @Override
    public void uncaughtException(Thread thread, Throwable exception) {
        StringWriter stackTrace = new StringWriter();
        exception.printStackTrace(new PrintWriter(stackTrace));
        Log.e(TAG,"************ CAUSE OF ERROR ************\\n\\n"+exception);
        MainActivity.sendCrashDataToServer(exception.getMessage());
        Log.e(TAG,"crash resport sent to server");
        StringBuilder errorReport = new StringBuilder();
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
*/
/*
        Intent intent = new Intent(myContext, Echo.class);
        intent.putExtra("error", errorReport.toString());
        myContext.startActivity(intent);*//*


        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setType("plain/text");
        intent.putExtra(Intent.EXTRA_EMAIL, new String[]{"omkarchavan75@gmail.com"});
        intent.putExtra(Intent.EXTRA_SUBJECT, "log file");
        intent.putExtra(Intent.EXTRA_STREAM, Uri.parse("file://" + stackTrace));
        myContext.startActivityForResult(intent, ACTIVITY_REQUEST_SEND_LOG);


        android.os.Process.killProcess(android.os.Process.myPid());
        System.exit(10);
    }

    public void onActivityResult (int requestCode, int resultCode, Intent data)
    {
        if (requestCode == ACTIVITY_REQUEST_SEND_LOG)
            System.exit(1);
    }

}
*/
