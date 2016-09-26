package com.mastek.appengage.table;

public class UserTable{
	public static final String TABLE_NAME = "user_tbl";
	public static final String TABLE_NAME1 = "user_tbl1";
	public static final String KEY_STRING = "key_string";

	//	public static final String KEY_ID = "id";
	public static final String KEY_RELEASE = "release";
	public static final String KEY_VERSION_NAME = "versionName";
	public static final String KEY_MODEL = "model";
	public static final String KEY_MANUFACTURER = "manufacturer";
	public static final String KEY_OSNAME = "os_name";
	public static final String KEY_PLATFORM = "platform";
	public static final String KEY_LATITUDE = "latitude";
	public static final String KEY_LONGITUDE = "longitude";
	public static final String KEY_TIMESTAMP = "time_stamp";
	public static final String KEY_DEVICEID = "device_id";
	public static final String KEY_CARRIER = "carrier";
	public static final String KEY_DEVICETYPE = "device_type";
	public static final String KEY_POSSIBLEEMAIL = "possible_email";
	public static final String KEY_NETWORKTYPE = "network_type";
	public static final String KEY_CPU = "cpu";
	public static final String KEY_ORIENTATION = "orientation";
	public static final String KEY_APIKEY = "api_key";
	public static final String KEY_SESSIONID = "session_id";
	public static final String KEY_SDKVERSION = "sdk_version";
	public static final String KEY_MESSEGETYPE = "messege_type";
	public static final String KEY_FBI = "fbi_key";

	public static final String TABLE_CREATE_USER = "CREATE TABLE "
			+ TABLE_NAME
			+ "("
//			+ KEY_ID
//			+ " INTEGER PRIMARY KEY AUTOINCREMENT,"
			+ KEY_RELEASE
			+ " VARCHAR,"
			+ KEY_VERSION_NAME
			+ " VARCHAR,"
			
				+ KEY_MANUFACTURER
			+ " VARCHAR,"
				+ KEY_OSNAME
			+ " VARCHAR,"
				+ KEY_LATITUDE
			+ " VARCHAR,"
				+ KEY_LONGITUDE
			+ " VARCHAR,"
				+ KEY_DEVICEID
			+ " VARCHAR,"
				+ KEY_CARRIER
			+ " VARCHAR,"
				+ KEY_DEVICETYPE
			+ " VARCHAR,"
				+ KEY_POSSIBLEEMAIL
			+ " VARCHAR,"
				+ KEY_NETWORKTYPE
			+ " VARCHAR,"
				+ KEY_CPU
			+ " VARCHAR,"
				+ KEY_ORIENTATION
			+ " VARCHAR,"
				+ KEY_APIKEY
			+ " VARCHAR,"
			+ KEY_SESSIONID
			+ " VARCHAR,"
			+ KEY_SDKVERSION
			+ " VARCHAR,"
				+ KEY_MESSEGETYPE
			+ " VARCHAR,"
			
			+ KEY_PLATFORM
			+ " VARCHAR,"
			
				+ KEY_TIMESTAMP
			+ " VARCHAR,"

			+ KEY_FBI
			+ " VARCHAR,"
			
			/*+ KEY_SYNC_STATUS
			+ " VARCHAR,"*/
			+ KEY_MODEL
			+ " VARCHAR"
		/*	+ KEY_TEST
			+ " VARCHAR "*/
			+ ")";
	public static final String TABLE_CREATE_USER1 = "CREATE TABLE "
			+ TABLE_NAME1
			+ "("
			+ KEY_STRING
			+ " VARCHAR"+
			 ")";

	public static final String STATEMENT_SELECT = "select * from "
			+ UserTable.TABLE_NAME;

	public static final String STATEMENT_SELECT1 = "select * from "
			+ UserTable.TABLE_NAME1;
}
