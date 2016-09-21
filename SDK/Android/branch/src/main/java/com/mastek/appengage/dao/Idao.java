package com.mastek.appengage.dao;

import android.database.Cursor;

import org.json.JSONArray;

/**
 * Created by Admin on 11/03/2016.
 */
public interface Idao {

	public boolean save(/*Model model*/);

	/*public boolean update(Model model);

	public boolean delete(Model model);

	public User find(Model model);*/
	
	public abstract JSONArray cursorToModel(Cursor cursor);
	/*
	 * public List<Model> findAll(Model model);
	 */
}
