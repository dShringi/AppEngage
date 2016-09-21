package com.mastek.appengage.dbusermanager;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.util.Log;

import com.mastek.appengage.dao.Idao;
import com.mastek.appengage.db.DataHandler;
import com.mastek.appengage.table.UserTable;
import com.mastek.appengage.utils.Utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class DBUserManager implements Idao {
	private static final String TAG = DBUserManager.class.getSimpleName();
	private static DBUserManager INSTANCE = null;
	private Context _context;
	private DataHandler dbObject;

	private DBUserManager() {
	}

	public DBUserManager(Context _context) {
		this._context = _context;
		dbObject = new DataHandler(_context);
	}

	public static DBUserManager getInstance() {
		if (INSTANCE == null) {
			INSTANCE = new DBUserManager();
		}

		return INSTANCE;
	}

	public void initDB(Context context) {
		_context = context;
		dbObject = new DataHandler(_context);
	}

	@Override
	public boolean save(/*User user*/) {
		long id = 0;
		dbObject.open();
		final ContentValues contentValues = getContentValues(/*user*/);
		id = dbObject.db.insertOrThrow(UserTable.TABLE_NAME, null,
				contentValues);
		Log.d(TAG, "id... : " + id);
		Log.d(TAG, "dbObject... : " + dbObject);
		dbObject.close();
		if (id == -1)
			return false;
		else
			return true;
	}

	/*@Override
	public boolean update(User userVO) {
		return false;
	}

	@Override
	public boolean delete(User userVO) {
		return false;
	}*/

	/*@Override
	public User find(*//*User user*//*) {
		dbObject.open();
		try {
			String query = UserTable.STATEMENT_SELECT *//*+ " where "
					+ UserTable.KEY_SYNC_STATUS + " = '" + user.getSyncStatus()
					+ "'"*//*;
			Log.d(TAG, "find() Query : " + query);

			Cursor cursor = dbObject.db.rawQuery(query, null);
			int count = cursor.getCount();
			Log.d(TAG, "Record Count :" + count);

			if (count > 0) {
			JSONArray array = cursorToModel(cursor);
//				Log.d(TAG, "Record  : " + user);
			}
			cursor.close();

		} catch (Exception e) {

			Log.e(TAG, "error in find query..." + e.getMessage());
		}

		dbObject.close();
		return user;
	}*/
	
	
	public JSONArray findArray() {
		dbObject.open();
		JSONArray array=null;
		try {
			String query = UserTable.STATEMENT_SELECT /*+ " where "
					+ UserTable.KEY_SYNC_STATUS + " = '" + user.getSyncStatus()
					+ "'"*/;
			Log.d(TAG, "find() Query : " + query);

			Cursor cursor = dbObject.db.rawQuery(query, null);
			int count = cursor.getCount();
			Log.d(TAG, "Record Count :" + count);

			if (count > 0) {
				array = cursorToModel(cursor);
			//	Log.d(TAG, "Record  : " + user);
			}
			cursor.close();

		} catch (Exception e) {

			Log.e(TAG, "error in find query..." + e.getMessage());
		}

		dbObject.close();
		return array;
	}

	@Override
	public JSONArray cursorToModel(Cursor cursor) {
		JSONArray array=new JSONArray();
		
		while(cursor.moveToNext())
		{
			JSONObject object=new JSONObject();
			
			try {
				object.put("mnu", cursor.getString(cursor.getColumnIndex(UserTable.KEY_MANUFACTURER)));
				object.put("mod", cursor.getString(cursor.getColumnIndex(UserTable.KEY_MODEL)));
				object.put("osv", cursor.getString(cursor.getColumnIndex(UserTable.KEY_OSNAME)));
				object.put("pf", cursor.getString(cursor.getColumnIndex(UserTable.KEY_PLATFORM)));
				object.put("rl",cursor.getString(cursor.getColumnIndex(UserTable.KEY_RELEASE)) );
				object.put("avn", cursor.getString(cursor.getColumnIndex(UserTable.KEY_VERSION_NAME)));
				object.put("lat", cursor.getString(cursor.getColumnIndex(UserTable.KEY_LATITUDE)));
				object.put("lng", cursor.getString(cursor.getColumnIndex(UserTable.KEY_LONGITUDE)));
				object.put("rtc", cursor.getString(cursor.getColumnIndex(UserTable.KEY_TIMESTAMP)));
				object.put("sid",cursor.getString(cursor.getColumnIndex(UserTable.KEY_SESSIONID)));
				object.put("did", cursor.getString(cursor.getColumnIndex(UserTable.KEY_DEVICEID)));
				object.put("c", cursor.getString(cursor.getColumnIndex(UserTable.KEY_CARRIER)));
				object.put("dt", cursor.getString(cursor.getColumnIndex(UserTable.KEY_DEVICETYPE)));
				object.put("uid", cursor.getString(cursor.getColumnIndex(UserTable.KEY_POSSIBLEEMAIL)));
				object.put("nw", cursor.getString(cursor.getColumnIndex(UserTable.KEY_NETWORKTYPE)));
				object.put("cpu", cursor.getString(cursor.getColumnIndex(UserTable.KEY_CPU)));
				object.put("ori",cursor.getString(cursor.getColumnIndex(UserTable.KEY_ORIENTATION)));
				object.put("akey", cursor.getString(cursor.getColumnIndex(UserTable.KEY_APIKEY)));
				object.put("sdv",cursor.getString(cursor.getColumnIndex(UserTable.KEY_SDKVERSION)));
				object.put("mt",cursor.getString(cursor.getColumnIndex(UserTable.KEY_MESSEGETYPE)));
				object.put("fbiKey",cursor.getString(cursor.getColumnIndex(UserTable.KEY_FBI)));
				
				
				Log.e("MTTTT",""+cursor.getString(cursor.getColumnIndex(UserTable.KEY_MODEL)));
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			
		
		
		array.put(object);
		}
		
		return array;
	}

	private ContentValues getContentValues(/*User user*/) {
		ContentValues content = new ContentValues();
		content.put(UserTable.KEY_MODEL, Utils.MODEL);
		content.put(UserTable.KEY_RELEASE, Utils.RELEASE);
		content.put(UserTable.KEY_VERSION_NAME, Utils.VERSIONNAME);
		content.put(UserTable.KEY_LATITUDE, Utils.locLatitude);
		content.put(UserTable.KEY_LONGITUDE, Utils.locLongitude);
		content.put(UserTable.KEY_DEVICEID, Utils.deviceId);
		content.put(UserTable.KEY_SESSIONID, String.valueOf(Utils.TIME) + "-" + Utils.deviceId);
		content.put(UserTable.KEY_CARRIER, Utils.carrierName);
		content.put(UserTable.KEY_DEVICETYPE, Utils.deviceType);
		content.put(UserTable.KEY_POSSIBLEEMAIL, Utils.possibleEmail);
		content.put(UserTable.KEY_NETWORKTYPE, Utils.getNetworkClass(_context));
		content.put(UserTable.KEY_CPU, Utils.ARCH);
		content.put(UserTable.KEY_APIKEY, Utils.akey);
		content.put(UserTable.KEY_ORIENTATION, Utils.orientation);
		content.put(UserTable.KEY_SDKVERSION, Utils.SDK_INT);
		content.put(UserTable.KEY_MESSEGETYPE, "O");
		content.put(UserTable.KEY_FBI, Utils.tokenGen);
		return content;
	}

}
