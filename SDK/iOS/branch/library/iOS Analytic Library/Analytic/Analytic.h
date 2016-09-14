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
    NSString *deviceType,*orientatin,*netwrokType,*sdkVersion,*cpuType;
    CLLocationManager *locationManager;
    NSTimer *timer;
    int tsd;
    double batteryLevel;
    natural_t mem_free,mem_total;
    NSMutableArray *jsonObjArr,*jsonArr;
}
+ (Analytic *)sharedObject;
-(void)BeginCall;
-(void)EventCall:(NSString*)eventName;
-(void)EndCall;
-(void)BulkCall:(NSString*)eventName;
@end
