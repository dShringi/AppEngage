package com.mastek.appengage.model;

import java.io.Serializable;

public class User implements Serializable{

//	private long Id;
	private String release;
	private String model;
	private String messegeType;
	private String versionName;
	private String test;
	private String syncStatus;
	private String manufacturer;
	private String osName;
	private String latitude;
	private String longitude;
	private String timeStamp;
	private String deviceId;
	private String resolution;
	private String carrierName;
	private String deviceType;
	private String networkType;
	private String orientation;
	private String sdkVersion;
	private long freeRamSize;
	private long totalRamSize;
	private long freeDiskSize;
	private long totalDiskSize;
	private String batteryLevel;
	private String isDeviceRooted;
	private String isDeviceOnline;
	private String sessionId;
	private String userId;
	private String cpu;
	private String apiKey;
	private String productId;
	private String category;
	private String offer;
	private String key;
	private String tokenGen;
	/*public long getId() {
		return Id;
	}

	public void setId(long id) {
		Id = id;
	}*/
	
	

	public String getRelease() {
		return release;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getTokenGen() {
		return tokenGen;
	}

	public void setTokenGen(String tokenGen) {
		this.tokenGen = tokenGen;
	}

	public String getProductId() {
		return productId;
	}

	public void setProductId(String productId) {
		this.productId = productId;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getOffer() {
		return offer;
	}

	public void setOffer(String offer) {
		this.offer = offer;
	}

	public String getMessegeType() {
		return messegeType;
	}

	public void setMessegeType(String messegeType) {
		this.messegeType = messegeType;
	}

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}

	public String getCpu() {
		return cpu;
	}

	public void setCpu(String cpu) {
		this.cpu = cpu;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public Long getFreeRamSize() {
		return freeRamSize;
	}

	public void setFreeRamSize(Long totalMemory) {
		this.freeRamSize = totalMemory;
	}

	public long getTotalRamSize() {
		return totalRamSize;
	}

	public void setTotalRamSize(long totalRamSize) {
		this.totalRamSize = totalRamSize;
	}

	public Long getFreeDiskSize() {
		return freeDiskSize;
	}

	public void setFreeDiskSize(Long freeDiskSize) {
		this.freeDiskSize = freeDiskSize;
	}

	public Long getTotalDiskSize() {
		return totalDiskSize;
	}

	public void setTotalDiskSize(Long totalDiskSize) {
		this.totalDiskSize = totalDiskSize;
	}

	public String getBatteryLevel() {
		return batteryLevel;
	}

	public void setBatteryLevel(String batteryLevel) {
		this.batteryLevel = batteryLevel;
	}

	public String getIsDeviceRooted() {
		return isDeviceRooted;
	}

	public void setIsDeviceRooted(String isDeviceRooted) {
		this.isDeviceRooted = isDeviceRooted;
	}

	public String getIsDeviceOnline() {
		return isDeviceOnline;
	}

	public void setIsDeviceOnline(String isDeviceOnline) {
		this.isDeviceOnline = isDeviceOnline;
	}

	public void setRelease(String release) {
		this.release = release;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String model) {
		this.model = model;
	}

	public String getVersionName() {
		return versionName;
	}

	public void setVersionName(String versionName) {
		this.versionName = versionName;
	}

	public String getTest() {
		return test;
	}

	public void setTest(String test) {
		this.test = test;
	}

	public String getSyncStatus() {
		return syncStatus;
	}

	public void setSyncStatus(String syncStatus) {
		this.syncStatus = syncStatus;
	}

	public String getManufacturer() {
		return manufacturer;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

	public String getOsName() {
		return osName;
	}

	public void setOsName(String osName) {
		this.osName = osName;
	}


	public String getLatitude() {
		return latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	public String getLongitude() {
		return longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	public String getTimeStamp() {
		return timeStamp;
	}

	public void setTimeStamp(String timeStamp) {
		this.timeStamp = timeStamp;
	}

	public String getDeviceId() {
		return deviceId;
	}

	public void setDeviceId(String deviceId) {
		this.deviceId = deviceId;
	}

	public String getResolution() {
		return resolution;
	}

	public void setResolution(String resolution) {
		this.resolution = resolution;
	}

	public String getCarrierName() {
		return carrierName;
	}

	public void setCarrierName(String carrierName) {
		this.carrierName = carrierName;
	}

	public String getDeviceType() {
		return deviceType;
	}

	public void setDeviceType(String deviceType) {
		this.deviceType = deviceType;
	}

	public String getNetworkType() {
		return networkType;
	}

	public void setNetworkType(String networkType) {
		this.networkType = networkType;
	}

	public String getOrientation() {
		return orientation;
	}

	public void setOrientation(String orientation) {
		this.orientation = orientation;
	}
	
	

	public String getSdkVersion() {
		return sdkVersion;
	}

	public void setSdkVersion(String sdkVersion) {
		this.sdkVersion = sdkVersion;
	}
	
	

	public String getSessionId() {
		return sessionId;
	}

	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}

	public void setFreeRamSize(long freeRamSize) {
		this.freeRamSize = freeRamSize;
	}

	/*public void setTotalRamSize(long totalRamSize) {
		this.totalRamSize = totalRamSize;
	}*/

	public void setFreeDiskSize(long freeDiskSize) {
		this.freeDiskSize = freeDiskSize;
	}

	public void setTotalDiskSize(long totalDiskSize) {
		this.totalDiskSize = totalDiskSize;
	}

	@Override
	public String toString() {
		return "User [release=" + release + ", model=" + model
				+ ", messegeType=" + messegeType + ", versionName="
				+ versionName + ", test=" + test + ", syncStatus=" + syncStatus
				+ ", manufacturer=" + manufacturer + ", osName=" + osName
				+ ", latitude=" + latitude + ", longitude=" + longitude
				+ ", timeStamp=" + timeStamp + ", deviceId=" + deviceId
				+ ", resolution=" + resolution + ", carrierName=" + carrierName
				+ ", deviceType=" + deviceType + ", networkType=" + networkType
				+ ", orientation=" + orientation + ", sdkVersion=" + sdkVersion
				+ ", freeRamSize=" + freeRamSize + ", totalRamSize="
				+ totalRamSize + ", freeDiskSize=" + freeDiskSize
				+ ", totalDiskSize=" + totalDiskSize + ", batteryLevel="
				+ batteryLevel + ", isDeviceRooted=" + isDeviceRooted
				+ ", isDeviceOnline=" + isDeviceOnline + ", sessionId="
				+ sessionId + ", userId=" + userId + ", cpu=" + cpu
				+ ", apiKey=" + apiKey + ", productId=" + productId
				+ ", category=" + category + ", offer=" + offer + ", key="
				+ key + ",tokenGen=" + tokenGen +"]";
	}
}
