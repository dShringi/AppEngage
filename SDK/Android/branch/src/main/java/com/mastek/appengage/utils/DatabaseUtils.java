package com.mastek.appengage.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import com.mastek.appengage.db.DataHandler;

public class DatabaseUtils extends android.database.DatabaseUtils {

	public static final String TAG = DatabaseUtils.class.getSimpleName();

	public static void pullDatabaseFile(Context context) {
		try {
			File sd = Environment.getExternalStorageDirectory();
			if (sd.canWrite()) {
				String currentDBPath = context.getDatabasePath("test_db")
						.getPath();
				String backupDBPath = "test_db"; /* DataHandler.DATABASE_NAME */

				Log.i(TAG, "currentDBPath :: " + currentDBPath
						+ "\nbackupDBPath :: " + backupDBPath);

				Log.i(TAG,
						"database path :: "
								+ context.getDatabasePath("test_db").getPath());

				File currentDB = new File(currentDBPath);
				File backupDB = new File(sd, backupDBPath);

				if (currentDB.exists()) {
					FileChannel src = new FileInputStream(currentDB)
							.getChannel();
					FileChannel dst = new FileOutputStream(backupDB)
							.getChannel();
					dst.transferFrom(src, 0, src.size());
					src.close();
					dst.close();
					Log.i(TAG, "Database pulled successfully");

				}
			}
		} catch (Exception e) {
			Log.e(TAG,
					"Exception while pulling Database file : "
							+ e.getLocalizedMessage(), e);
		}
	}

//	public static final void initializeDatabase(Context context,
//			boolean isSessionRestored) {
//		// Initialize database adapter
//		DataHandler db = DataHandler.initialize(context);
//		if (!isSessionRestored) {
//			db.open();
//			pullDatabaseFile(context);
//			db.reCreateTables();
//			db.close();
//		}
//	}

}