package com.mastek.appengage.db;

import org.json.JSONArray;

import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.mastek.appengage.table.UserTable;

public class DataHandler {

	// Define Database name and version
	public static final String DATABASE_NAME = "test_db";
	public static final int DATABASE_VERSION = 1;

	Context ctx;
	public static SQLiteDatabase db;
	private DataBaseHelper dataHelper;
	private static DataHandler datahandler;

	public static DataHandler getInstance() {
		return datahandler;
	}

	public static DataHandler initialize(Context context) {
//		MultiDex.install(context);
		if (datahandler == null) {
			datahandler = new DataHandler(context);
		}
		return datahandler;
	}
	
	public void checkRecords()
	{
		open();
		try {
			String query = UserTable.STATEMENT_SELECT /*+ " where "
					+ UserTable.KEY_SYNC_STATUS + " = '" + user.getSyncStatus()
					+ "'"*/;
			

			Cursor cursor = db.rawQuery(query, null);
			int count = cursor.getCount();
			Log.d("checkRecords", "Record Count :" + count);

			
			cursor.close();

		} catch (Exception e) {

			Log.e("checkRecords", "error in find query..." + e.getMessage());
		}
		
		close();
	}

	public DataHandler(Context ctx) {
		this.ctx = ctx;
		dataHelper = new DataBaseHelper(ctx);

	}

	private static class DataBaseHelper extends SQLiteOpenHelper {
		public DataBaseHelper(Context ctx) {
			super(ctx, DATABASE_NAME, null, DATABASE_VERSION);
		}

		@Override
		public void onCreate(SQLiteDatabase db) {
			try {
				// createTables(db);
				db.execSQL(UserTable.TABLE_CREATE_USER);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		@Override
		public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

			// onCreate(db);

			/*
			 * if (oldVersion == 1) { try { db.execSQL("ALTER TABLE " +
			 * UserTable.TABLE_NAME + " ADD COLUMN " + UserTable.KEY_TEST +
			 * " VARCHAR"); } catch (Exception e) { Log.e("DB ADAPTER",
			 * "Exception :: save(user) " + e.getMessage()); } }
			 */

			/*
			 * if (oldVersion == 2) { try { db.execSQL("ALTER TABLE " +
			 * UserTable.TABLE_NAME + " ADD COLUMN " + UserTable.TABLE_NAME +
			 * " VARCHAR"); } catch (Exception e) { Log.e("DB ADAPTER",
			 * "Exception :: save(user) " + e.getMessage()); } }
			 */
		}

		private void reCreateTables(SQLiteDatabase db) {

			try {
				db.execSQL("DROP TABLE IF EXISTS " + UserTable.TABLE_NAME);
			} catch (SQLException e) {
				e.printStackTrace();
			}
			// db.execSQL("DROP TABLE IF EXISTS " + DashboardTable.TABLE_NAME);
			createTables(db);

		}

		private void createTables(SQLiteDatabase db) {

			// db.execSQL(UserTable.TABLE_NAME);
		}
	}

	/*
	 * public void open() { if (!db.isOpen()) datahandler.open(); db =
	 * dataHelper.getWritableDatabase(); }
	 */

	// ---opens the database---
	public SQLiteDatabase open() throws SQLException {
		db = dataHelper.getWritableDatabase();
		return db;
	}

	/*
	 * public void close() { if(db.isOpen()) datahandler.close(); }
	 */

	// ---closes the database---
	public void close() {
		dataHelper.close();
	}

	// ---reCreateTables the database---
	public void reCreateTables() {
		dataHelper.reCreateTables(db);
	}
}