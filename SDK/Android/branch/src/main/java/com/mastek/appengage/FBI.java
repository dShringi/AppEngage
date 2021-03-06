package com.mastek.appengage;

import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;
import com.mastek.appengage.utils.Utils;

/**
 * Created by Badal13631 on 9/6/2016.
 */
public class FBI extends FirebaseInstanceIdService {
    private static final String TAG = "MyFirebaseIIDService";

    @Override
    public void onTokenRefresh() {


        //Getting registration token
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        //Displaying token on logcat
        Log.d(TAG, "Refreshed token: " + refreshedToken);
        Utils.tokenGen = refreshedToken;

    }


    private void sendRegistrationToServer(String token) {
        //You can implement this method to store the token on your server
        //Not required for current project
    }

}
