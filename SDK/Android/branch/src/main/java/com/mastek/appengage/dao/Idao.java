package com.mastek.appengage.dao;

import org.json.JSONArray;

import android.database.Cursor;

import com.mastek.appengage.model.User;

/**
 * Created by Admin on 11/03/2016.
 */
public interface Idao<Model> {

	public boolean save(Model model);

	public boolean update(Model model);

	public boolean delete(Model model);

	public User find(Model model);
	
	public abstract JSONArray cursorToModel(Cursor cursor);
	/*
	 * public List<Model> findAll(Model model);
	 */
}
