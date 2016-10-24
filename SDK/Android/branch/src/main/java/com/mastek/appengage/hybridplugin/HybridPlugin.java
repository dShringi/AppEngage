package com.mastek.appengage.hybridplugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.mastek.appengage.MA;
import com.mastek.appengage.utils.Utils;
import com.mastek.appengage.utils.Utils.GPSCoordinates;

import android.app.Application;
import android.content.Context;
import android.util.Log;

public class HybridPlugin extends CordovaPlugin {

	private Context context;
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		// TODO Auto-generated method stub
		Log.e("", "action :- " + action + "args :- " + args);
		if (action.equalsIgnoreCase("send")) {

			 context=this.cordova.getActivity().getApplicationContext(); 
			Log.e("action", "inside action");
//			MA.sendApi(context);
//			Application.class.t
			
		}

		else if (action.equalsIgnoreCase("event")) {

//			MA.eventApi(context);
		}

		else if (action.equalsIgnoreCase("end")) {
			
//			MA.endApi();

		}

		else if (action.equalsIgnoreCase("crash")) {

//			MA.crashApi();
		}

		return super.execute(action, args, callbackContext);
	}

}
