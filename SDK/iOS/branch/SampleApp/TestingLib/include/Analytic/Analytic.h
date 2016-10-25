//
//  Analytic.h
//  Analytic
//
//  Created by Krunal on 30/06/16.
//  Copyright © 2016 mastek. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

@interface Analytic : NSObject<CLLocationManagerDelegate>{
    NSString *deviceType,*orientatin,*netwrokType,*sdkVersion,*cpuType,*kUrl,*deviceId,*lastVisitedPage;
    CLLocationManager *locationManager;
    NSTimer *timer,*timerVC;
    int tsd,timerForVC;
    double batteryLevel;
    natural_t mem_free,mem_total;
    NSMutableArray *jsonObjArr,*jsonArr,*viewControllerArr,*tempArr;
    NSNumberFormatter *formatter;
}

+ (Analytic *)sharedObject;
-(void)BeginCallWithkUrl:(NSString *)url AppKey:(NSString *)appkey;
-(void)EventCall:(NSString*)eventName;
-(void)EndCall;
-(void)BulkCall:(NSString*)eventName;
-(void)RegisterForPushNotification;
-(void)crashCall:(NSArray*)crashStackSymbol crashDescription:(NSString*)crashDesc;
//-(void)SetOfflineDataCounter;
@end
