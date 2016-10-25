//
//  Analytic.m
//  Analytic
//
//  Created by Krunal on 30/06/16.
//  Copyright © 2016 mastek. All rights reserved.
//

#import "Analytic.h"
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCarrier.h>
#import <sys/sysctl.h>
#import "AFNetworking/AFNetworkReachabilityManager.h"
#import <mach/mach.h>
#import <mach/mach_host.h>

#define IS_OS_8_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
const int kofflineDataCounter = 5;


@implementation Analytic

+ (Analytic *)sharedObject
{
    static dispatch_once_t shared_initialized;
    static Analytic *shared_instance = nil;
    
    dispatch_once(&shared_initialized, ^ {
        shared_instance = [Analytic new];
    });
    
    return shared_instance;
}




-(id)init
{
    
    jsonObjArr = [NSMutableArray array];
    viewControllerArr = [NSMutableArray array];
    
    
    formatter = [[NSNumberFormatter alloc]init];
    [formatter setMaximumFractionDigits:0];
    
    //set crash handler
    NSSetUncaughtExceptionHandler(&uncaughtExceptionHandler);

    
    [[AFNetworkReachabilityManager sharedManager] startMonitoring];
    [[AFNetworkReachabilityManager sharedManager] setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status){
      
        //Checks Internet connection....
        if([AFNetworkReachabilityManager sharedManager].isReachable){
      
            //Calls Begin Event because internet available....
        //    [self BeginCall];
           
            //send bulk data if exists....
             [self sendBulkDataToserver];
            
        }else{
            
            //Calling Bulk because internet is not available...
            [self BulkCall:@"---"];
            
        }
    }];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:AFNetworkingReachabilityDidChangeNotification object:nil];
    
    
    //Get Screen changes Notification...
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(receiveScreenChangeNotification:)
                                                 name:@"notifier"
                                               object:nil];
    
    //Get rkey when changes...
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(receiveRkeyChangeNotification:)
                                                 name:@"fcmtoken"
                                               object:nil];
    
    return [super init];
}


- (void)receiveScreenChangeNotification:(NSNotification *) notification
{
    // [notification name] should always be @"notifier"
    // unless you use this method for observation of other notifications
    // as well.
    
    NSLog(@"noti obj info = %@",[notification object]);
    @try {
        
        if ([[notification name] isEqualToString:@"notifier"]){
           
            
            //App launches from background...
            if ([[notification object] isEqual:@"foreground"]) {
                
               
                viewControllerArr = [NSMutableArray array];
                [tempArr removeAllObjects];
                tempArr = nil;
            }
            
            
            NSMutableDictionary *dict = [NSMutableDictionary new];
            
            //2nd viewController onwards
            if ([tempArr count]>0) {
              
                //Stop the timer of lastViewController...
                if ([timerVC isValid]) {
                    [timerVC invalidate];
                }
                timerVC = nil;
                
                
                
                
                //Adds timer to the lastViewController...
                [dict setObject:[NSNumber numberWithInt:timerForVC] forKey:[NSString stringWithFormat:@"%@",[tempArr objectAtIndex:[tempArr count]-1]]];

                
                //Adds visited ViewControllers name to viewControllerArr
                [viewControllerArr addObject:dict];
               
                
                if ([NSStringFromClass([[notification object] class]) isEqual:@"AppDelegate"]) {
                   
                    //Get the lastVisitedPage so tht when app launches from bg then new session should start frm lastVisitedPage.
                    lastVisitedPage =  [tempArr objectAtIndex:[tempArr count]-1];
                    NSLog(@"lastVisitedPage in BG---- %@",lastVisitedPage);
                    //Delete everything..... Session ended
                    [tempArr removeAllObjects];
                    tempArr = nil;
                    
                }else{
                    [tempArr addObject:[notification object]];
                    
                    //Start the timer for Current ViewController
                    timerForVC=0;
                    if (!timerVC) {
                        timerVC = [NSTimer scheduledTimerWithTimeInterval:1.0f
                                                                   target:self
                                                                 selector:@selector(_startVCTimer:)
                                                                 userInfo:nil
                                                                  repeats:YES];
                    }
                }
                
                
               

                
                
            }else{//This wil be called only for first time
                
                
                //start the timer for first viewController.
                timerForVC=0;
                if (!timerVC) {
                    timerVC = [NSTimer scheduledTimerWithTimeInterval:1.0f
                                                             target:self
                                                           selector:@selector(_startVCTimer:)
                                                           userInfo:nil
                                                            repeats:YES];
                }
                NSLog(@"First time");
                //Intialize Temp arr and add first view controller to it
                tempArr = [NSMutableArray new];
                
                if ([[notification object] isEqual:@"foreground"]) {
                    [tempArr addObject:lastVisitedPage];
                }else{
                    [tempArr addObject:[notification object]];
                }
                
            }
            
            
        }
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
   
}


//Captures screen timne only for Hybrid (Not used for Native)
-(void)ScreenChanged:(NSString*)ScreenName{
   
    @try {
        
        
            
            
            //App launches from background...
            if ([ScreenName isEqualToString:@"foreground"]) {
                
                
                viewControllerArr = [NSMutableArray array];
                [tempArr removeAllObjects];
                tempArr = nil;
            }
            
            
            NSMutableDictionary *dict = [NSMutableDictionary new];
            
            //2nd viewController onwards
            if ([tempArr count]>0) {
                
                //Stop the timer of lastViewController...
                if ([timerVC isValid]) {
                    [timerVC invalidate];
                }
                timerVC = nil;
                
                
                
                
                //Adds timer to the lastViewController...
                [dict setObject:[NSNumber numberWithInt:timerForVC] forKey:[NSString stringWithFormat:@"%@",[tempArr objectAtIndex:[tempArr count]-1]]];
                
                
                //Adds visited ViewControllers name to viewControllerArr
                [viewControllerArr addObject:dict];
                
                
                if ([ScreenName isEqualToString:@"AppDelegate"]) {
                    
                    //Get the lastVisitedPage so tht when app launches from bg then new session should start frm lastVisitedPage.
                    lastVisitedPage =  [tempArr objectAtIndex:[tempArr count]-1];
                    NSLog(@"lastVisitedPage in BG---- %@",lastVisitedPage);
                    //Delete everything..... Session ended
                    [tempArr removeAllObjects];
                    tempArr = nil;
                    
                }else{
                    [tempArr addObject:ScreenName];
                    
                    //Start the timer for Current ViewController
                    timerForVC=0;
                    if (!timerVC) {
                        timerVC = [NSTimer scheduledTimerWithTimeInterval:1.0f
                                                                   target:self
                                                                 selector:@selector(_startVCTimer:)
                                                                 userInfo:nil
                                                                  repeats:YES];
                    }
                }
                
                
                
                
                
                
            }else{//This wil be called only for first time
                
                
                //start the timer for first viewController.
                timerForVC=0;
                if (!timerVC) {
                    timerVC = [NSTimer scheduledTimerWithTimeInterval:1.0f
                                                               target:self
                                                             selector:@selector(_startVCTimer:)
                                                             userInfo:nil
                                                              repeats:YES];
                }
                NSLog(@"First time");
                //Intialize Temp arr and add first view controller to it
                tempArr = [NSMutableArray new];
                
                if ([ScreenName isEqualToString:@"foreground"]) {
                    [tempArr addObject:lastVisitedPage];
                }else{
                    [tempArr addObject:ScreenName];
                }
                
            }
            
            
        
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
}


-(void)RegisterForPushNotification{
    //Intialize PushNotification
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
    {
        [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge) categories:nil]];
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    }
    else
    {
        [[UIApplication sharedApplication] registerForRemoteNotificationTypes:
         (UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationTypeAlert)];
    }
}

- (void)receiveRkeyChangeNotification:(NSNotification *) notification{
    
    @try {
        if ([[notification name] isEqualToString:@"fcmtoken"]){
            
            [[NSUserDefaults standardUserDefaults] setObject:[notification object] forKey:@"rKey"];
        }
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
}

//Call this when app is laucnhed...
-(void)BeginCallWithkUrl:(NSString *)url AppKey:(NSString *)appkey{
    
    @try {
        
        //Get url and app key from app developer..
        [[NSUserDefaults standardUserDefaults] setObject:url forKey:@"kUrl"];
        [[NSUserDefaults standardUserDefaults] setObject:appkey forKey:@"aKey"];
        
        
        
        //Finds genral Device informations....
        [self getDevieInfo];
        
        //Total timm for new Sesssion...
        tsd=0;
        if (!timer) {
            timer = [NSTimer scheduledTimerWithTimeInterval:1.0f
                                                     target:self
                                                   selector:@selector(_timerFired:)
                                                   userInfo:nil
                                                    repeats:YES];
        }
                
        //Calls Begin service
        NSError *error=nil;
        
        //Add Body data...
     
        NSDictionary *inputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple", @"mnu",[self platformNiceString], @"mod",[[UIDevice currentDevice] systemVersion],@"osv",@"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",[[NSUserDefaults standardUserDefaults]stringForKey:@"lat"],@"lat", [[NSUserDefaults standardUserDefaults]stringForKey:@"lng"],@"lng",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId] ,@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",deviceId, @"ac",netwrokType,@"nw",cpuType,@"cpu", orientatin,@"ori", [[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",sdkVersion,@"sdv",[[NSUserDefaults standardUserDefaults]stringForKey:@"rKey"],@"rkey",@"B",@"mt",nil];
        
        
        kUrl = [[NSUserDefaults standardUserDefaults] objectForKey:@"kUrl"];
       
        NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
                                                           options:NSJSONWritingPrettyPrinted
                                                             error:&error];
        
        
        
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[kUrl stringByAppendingString:@"api/i/single/B"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
            [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
            
            [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
            [request setHTTPMethod:@"POST"];
            [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
            [request setHTTPBody:jsondata];
            
            
            NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
            [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                
                NSLog(@"requestReply on Begin: %@", requestReply);
                
                
            }] resume];
        });
        
        
        
        
        
         NSLog(@"crash on begin =%@",[NSKeyedUnarchiver unarchiveObjectWithData:[[NSUserDefaults standardUserDefaults] objectForKey:@"crashData"]]);
        
        
        //Checks if crash exists then send to server...
        [NSKeyedUnarchiver unarchiveObjectWithData:[[NSUserDefaults standardUserDefaults] objectForKey:@"crashData"]];
        
        if ([NSKeyedUnarchiver unarchiveObjectWithData:[[NSUserDefaults standardUserDefaults] objectForKey:@"crashData"]]!= nil) {
            NSLog(@"crashdata found........");
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                
                        NSError *err=nil;
                        NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
                                                                           options:NSJSONWritingPrettyPrinted
                                                                             error:&err];
                        NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[[[NSUserDefaults standardUserDefaults] objectForKey:@"kUrl"] stringByAppendingString:@"api/i/single/C"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
                        [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
                        [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
                        [request setHTTPMethod:@"POST"];
                        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
                        [request setHTTPBody:jsondata];
                
                
                        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
                        [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                            NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                            
                            NSLog(@"requestReply on crash: %@", requestReply);
                            [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"crashData"];
                            
                        }] resume];
                    });
        }
        
        
    } @catch (NSException *exception) {
        
    } @finally {
        
    }

}

//Call this when app wants to track Events...
-(void)EventCall:(NSString*)eventName{
    
   
    @try {
        [self getDevieInfo];
        
        
        
        //Call post service
        NSError *error=nil;
       
        
        NSDictionary *inputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple",@"mnu",[self platformNiceString],@"mod",[[UIDevice currentDevice] systemVersion],@"osv", @"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",[[NSUserDefaults standardUserDefaults]stringForKey:@"lat"],@"lat", [[NSUserDefaults standardUserDefaults]stringForKey:@"lng"],@"lng",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId] ,@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",deviceId, @"ac",netwrokType,@"nw",cpuType,@"cpu", orientatin,@"ori",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",sdkVersion,@"sdv",@"event",@"mt",eventName,@"key",@"{\"productid\":45,\"category\":2,\"Offer\":\"Y\"}",@"pro",nil];
        
        
        //If Internet Connected send data....
        if([AFNetworkReachabilityManager sharedManager].isReachable){
            
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                
                NSError *err=nil;
                NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
                                                                   options:NSJSONWritingPrettyPrinted
                                                                     error:&err];
                NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[kUrl stringByAppendingString:@"api/i/single/event"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
                [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
                [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
                [request setHTTPMethod:@"POST"];
                [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
                [request setHTTPBody:jsondata];
                
                
                NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
                [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                    NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                    
                    NSLog(@"requestReply in event: %@", requestReply);
                    
                    
                    
                }] resume];
            });
            
        }else{
            //Internet is offline send to bulk
            [self BulkCall:eventName];
        }
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
    
    
}

//Call this when app is terminataed...
-(void)EndCall{
    
    
    @try {
        [self getDevieInfo];
        
        
        
        
        
     
        
        
        
        
        
        
        
        
        
        
//        int sum = 0;
//        for (int i = 0; i < [first count]; i++) {
//            NSLog(@"i= %d",i);
//            NSLog(@"[first objectAtIndex:i] =%@",[first objectAtIndex:i]);
//            
//            sum = sum + [first objectAtIndex:i];
//            NSLog(@"i complete");
//        }
//        NSLog(@"sum =%ld",(long)sum);
//
//        
//        int total = 0;
//        for (NSNumber *number in first)
//        {
//            total += [number intValue];
//        }
//        NSLog(@"total =%d",total);
//        
//        
//        NSLog(@"val =%d",[[first valueForKeyPath:@"@sum.self"] integerValue]);
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        
//        long sum1 =[[first valueForKeyPath:@"@sum.self"] integerValue];
//        
//        NSLog(@"sum2 = %ld",(long)sum1);
//        
//        
//        
//        
//        NSArray *second = [viewControllerArr valueForKey:@"second page"];
//     
//        long sum2 =[[second valueForKeyPath:@"@sum.self"] integerValue];
//        
//        NSLog(@"sum2 = %ld",(long)sum2);
        
        //Stop the timer...
        if ([timer isValid]) {
            [timer invalidate];
        }
        timer = nil;
        
        //POST service call
        NSDictionary *endInputData = [[NSDictionary alloc] initWithObjectsAndKeys:[NSNumber numberWithInteger:tsd],@"tsd",deviceId ,@"did",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",deviceType, @"dt",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId],@"sid",@"E",@"mt", nil];
        
        
        if (![AFNetworkReachabilityManager sharedManager].isReachable) {
            
            NSString *jsonEnd;
            NSError *error;
            
            NSData *jsonEndData = [NSJSONSerialization dataWithJSONObject:endInputData
                                                                  options:0 // Pass 0 if you don't care about the readability of the generated string
                                                                    error:&error];
            
            if (! jsonEndData) {
                //    NSLog(@"Got an error while converting to jsonEnd: %@", error);
            } else {
                jsonEnd = [[NSString alloc] initWithData:jsonEndData encoding:NSUTF8StringEncoding];
            }
            
            
            //Adds Current session values to bulkArr...
            NSMutableArray *temp = [NSMutableArray new];
            temp = [[[NSUserDefaults standardUserDefaults] arrayForKey:@"bulkArr"] mutableCopy];
            [temp addObject:jsonEnd];
            
        }else{
         
    
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NSError *error=nil;
                NSData *jsondata = [NSJSONSerialization dataWithJSONObject:endInputData
                                                                   options:NSJSONWritingPrettyPrinted
                                                                     error:&error];
                NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[kUrl stringByAppendingString:@"api/i/single/E"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
                [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
                [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
                [request setHTTPMethod:@"POST"];
                [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
                [request setHTTPBody:jsondata];
                
                
                NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
                [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                    NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                    
                    NSLog(@"requestReply in End: %@", requestReply);
                    
                    
                }] resume];
            });
            
           
        }
        
        [self sendScreenTimer];
        
    } @catch (NSException *exception) {
        NSLog(@"exceptn in end =%@",exception.description);
    } @finally {
        
    }
    
}


//Sends Individual screen time....
-(void)sendScreenTimer{
    
    @try {
         if([AFNetworkReachabilityManager sharedManager].isReachable){
            NSMutableArray *arrWithscreenTime = [[NSMutableArray alloc]init];
            
            
            /* First we need to add timer of same page
             */
            
            //Gets all same keys i.e same page name
            NSArray *uniqueKeys = [viewControllerArr valueForKeyPath:@"@distinctUnionOfArrays.@allKeys"];
           
            
            
            
            //adds the time time for each page and saves output in array of dictionary.
            for (int k=0; k<[uniqueKeys count]; k++) {
                NSMutableArray *temp = [viewControllerArr valueForKey:[uniqueKeys objectAtIndex:k]];
               
                //Removes nil from array index..
                NSMutableArray *tempAr= [[NSMutableArray alloc]init];
                for (int i = 0; i < [temp count]; i++) {
                    id obj = [temp objectAtIndex:i];
                    if (![obj  isKindOfClass:[NSNull class]]) { // or if (![obj  isKindOfClass:[[NSNull null]class]]) {
                        [tempAr addObject:obj];
                     
                    }
                }
                
                //Adds all time of sinlge screen and stores in dict...
                NSMutableDictionary *dict = [NSMutableDictionary new];
                //[dict setObject:[tempAr valueForKeyPath:@"@sum.self"] forKey:[uniqueKeys objectAtIndex:k]];
                
                
                [dict setObject:[uniqueKeys objectAtIndex:k] forKey:[NSString stringWithFormat:@"key"]];
                [dict setObject:[tempAr valueForKeyPath:@"@sum.self"] forKey:[NSString stringWithFormat:@"ts"]];
                
                
                //adds the time i.e for "first page" id key and value is time like 10;
                [arrWithscreenTime addObject:dict];
                
                
                
            }
           
             
//             for (intj=0 ; j<[arrWithscreenTime count]; j++) {
//                 NSMutableDictionary *tempDict;
//                 [tempDict setObject:[[arrWithscreenTime objectAtIndex:j] obje] forKey:<#(nonnull id<NSCopying>)#>]
//             }
                        
            [self getDevieInfo];
            
            
            
            //Call post service
            NSError *error=nil;
            NSDictionary *inputData = [[NSDictionary alloc] initWithObjectsAndKeys:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] ,@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId] ,@"sid",deviceType, @"dt",@"iOS",@"pf",deviceId ,@"did",arrWithscreenTime,@"act",nil];
            
             
            
            //If Internet Connected send data....
            if([AFNetworkReachabilityManager sharedManager].isReachable){
                
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                    
                    NSError *err=nil;
                    NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
                                                                       options:NSJSONWritingPrettyPrinted
                                                                         error:&err];
                    NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[kUrl stringByAppendingString:@"api/i/single/S"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
                    [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
                    [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
                    [request setHTTPMethod:@"POST"];
                    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
                    [request setHTTPBody:jsondata];
                    
                    
                    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
                    [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                        NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                        
                        NSLog(@"requestReply in sinlge screen: %@", requestReply);
                        
                        
                        
                    }] resume];
                });
                
                
               
            }else{
                //Internet is offline send to bulk
                
            }
        }
        
        
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
    
}

void uncaughtExceptionHandler(NSException *exception)
{
   
    //Get device orientation
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    NSString *orientatin;
    if(orientation == 0 || orientation == UIInterfaceOrientationPortrait) {
        orientatin=@"PORTRAIT";
    }else{
        orientatin=@"LANDSCAPE";
    }
    
    
    //Get Network types
    NSArray *subviews = [[[[UIApplication sharedApplication] valueForKey:@"statusBar"] valueForKey:@"foregroundView"]subviews];
    NSNumber *dataNetworkItemView = nil;
    NSString* netwrokType;
    for (id subview in subviews) {
        if([subview isKindOfClass:[NSClassFromString(@"UIStatusBarDataNetworkItemView") class]]) {
            dataNetworkItemView = subview;
            break;
        }
    }
    
    switch ([[dataNetworkItemView valueForKey:@"dataNetworkType"]integerValue]) {
        case 0:
            netwrokType=@"No wifi or cellular";
            break;
            
        case 1:
            netwrokType = @"2G";
            break;
            
        case 2:
            netwrokType = @"3G";
            break;
            
        case 3:
            netwrokType = @"4G";
            break;
            
        case 4:
            netwrokType = @"LTE";
            break;
            
        case 5:
            netwrokType = @"Wifi";
            break;
            
            
        default:
            break;
    }
    
    
    
    //get device type
    NSString *deviceType;
    if([[UIDevice currentDevice]userInterfaceIdiom]==UIUserInterfaceIdiomPhone)
    {
        deviceType=@"S";
    }else{
        deviceType=@"T";
    }
    
    
    //Get device carrier
    CTTelephonyNetworkInfo *networkInfo = [[CTTelephonyNetworkInfo alloc] init];
    CTCarrier *carrier = [networkInfo subscriberCellularProvider];
    [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%@",[carrier carrierName]] forKey:@"carrierName"];
    
    
    
    
    //Get SDK Version...
    NSString* sdkVersion = [[Analytic sharedObject] buildVersion];
    
    
    //Get cpuType i.e armv7,armv7s etc
    NSString* cpuType = [[Analytic sharedObject] getCPUType];
    
    NSString* deviceId = [[[UIDevice currentDevice] identifierForVendor]UUIDString];
    
    
    uint64_t totalSpace = 0;
    uint64_t totalFreeSpace = 0;
    NSError *error = nil;
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error: &error];
    
    if (dictionary) {
        NSNumber *fileSystemSizeInBytes = [dictionary objectForKey: NSFileSystemSize];
        NSNumber *freeFileSystemSizeInBytes = [dictionary objectForKey:NSFileSystemFreeSize];
        totalSpace = [fileSystemSizeInBytes unsignedLongLongValue];
        totalFreeSpace = [freeFileSystemSizeInBytes unsignedLongLongValue];
        // NSLog(@"Memory Capacity of %llu MiB with %llu MiB Free memory available.", ((totalSpace/1024ll)/1024ll), ((totalFreeSpace/1024ll)/1024ll));
    } else {
        //  NSLog(@"Error Obtaining System Memory Info: Domain = %@, Code = %ld", [error domain], (long)[error code]);
    }
    
    
    
    //Get infor about RAM used for crash
    mach_port_t host_port;
    mach_msg_type_number_t host_size;
    vm_size_t pagesize;
    
    host_port = mach_host_self();
    host_size = sizeof(vm_statistics_data_t) / sizeof(integer_t);
    host_page_size(host_port, &pagesize);
    
    vm_statistics_data_t vm_stat;
    
    if (host_statistics(host_port, HOST_VM_INFO, (host_info_t)&vm_stat, &host_size) != KERN_SUCCESS) {
        // NSLog(@"Failed to fetch vm statistics");
    }
    
    /* Stats in bytes */
    natural_t mem_used = (vm_stat.active_count +
                          vm_stat.inactive_count +
                          vm_stat.wire_count) * pagesize;
    natural_t mem_free = vm_stat.free_count * pagesize;
    natural_t mem_total = mem_used + mem_free;
    
    
    //Get bettery level...
    [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];
    double batteryLevel = [[UIDevice currentDevice] batteryLevel];
    batteryLevel = round(batteryLevel*100);
    
    NSNumberFormatter *formatter1 = [[NSNumberFormatter alloc]init];
     [formatter1 setMaximumFractionDigits:0];
    
    
   
    
    //Call post service
    NSDictionary *inputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple", @"mnu",[[Analytic sharedObject] platformNiceString], @"mod",[[UIDevice currentDevice] systemVersion],@"osv",@"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",[[NSUserDefaults standardUserDefaults]stringForKey:@"lat"],@"lat", [[NSUserDefaults standardUserDefaults]stringForKey:@"lng"],@"lng",[formatter1 numberFromString:[formatter1 stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc", [[NSString stringWithFormat:@"%@",[formatter1 stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId],@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",@"N/A",@"ac",netwrokType,@"nw",cpuType,@"cpu",orientatin,@"ori",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",@"n/A",@"frs",@"n/A",@"trs",[NSString stringWithFormat:@"%u",mem_free],@"fds",[NSString stringWithFormat:@"%u",mem_total],@"tds",[NSString stringWithFormat:@"%f",batteryLevel],@"bl",@"n/A",@"ids",@"Y",@"ido",[exception callStackSymbols],@"est",@"Non-Fatal",@"esm",[exception description],@"Ess",sdkVersion,@"sdv",@"C",@"mt",nil];
   
    [[NSUserDefaults standardUserDefaults] setObject:inputData forKey:@"crashData"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    
    
    //Save Crash report and send on next begin..
    NSData *data = [NSKeyedArchiver archivedDataWithRootObject:inputData];
    [[NSUserDefaults standardUserDefaults] setObject:data forKey:@"crashData"];
    
    
    NSLog(@"crashData saved ----------------");
//   
//    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
//        
//        NSError *err=nil;
//        NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
//                                                           options:NSJSONWritingPrettyPrinted
//                                                             error:&err];
//        NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[[[NSUserDefaults standardUserDefaults] objectForKey:@"kUrl"] stringByAppendingString:@"api/i/single/C"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
//        [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
//        [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
//        [request setHTTPMethod:@"POST"];
//        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
//        [request setHTTPBody:jsondata];
//        
//        
//        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
//        [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
//            NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
//            
//            NSLog(@"requestReply on crash: %@", requestReply);
//            
//            
//        }] resume];
//    });
    
    
    
    
}

-(void)crashCall:(NSArray*)crashStackSymbol crashDescription:(NSString*)crashDesc{
    //Get device orientation
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    NSString *orientatin;
    if(orientation == 0 || orientation == UIInterfaceOrientationPortrait) {
        orientatin=@"PORTRAIT";
    }else{
        orientatin=@"LANDSCAPE";
    }
    
    
    //Get Network types
    NSArray *subviews = [[[[UIApplication sharedApplication] valueForKey:@"statusBar"] valueForKey:@"foregroundView"]subviews];
    NSNumber *dataNetworkItemView = nil;
    NSString* netwrokType;
    for (id subview in subviews) {
        if([subview isKindOfClass:[NSClassFromString(@"UIStatusBarDataNetworkItemView") class]]) {
            dataNetworkItemView = subview;
            break;
        }
    }
    
    switch ([[dataNetworkItemView valueForKey:@"dataNetworkType"]integerValue]) {
        case 0:
            netwrokType=@"No wifi or cellular";
            break;
            
        case 1:
            netwrokType = @"2G";
            break;
            
        case 2:
            netwrokType = @"3G";
            break;
            
        case 3:
            netwrokType = @"4G";
            break;
            
        case 4:
            netwrokType = @"LTE";
            break;
            
        case 5:
            netwrokType = @"Wifi";
            break;
            
            
        default:
            break;
    }
    
    
    
    //get device type
    NSString *deviceType;
    if([[UIDevice currentDevice]userInterfaceIdiom]==UIUserInterfaceIdiomPhone)
    {
        deviceType=@"S";
    }else{
        deviceType=@"T";
    }
    
    
    //Get device carrier
    CTTelephonyNetworkInfo *networkInfo = [[CTTelephonyNetworkInfo alloc] init];
    CTCarrier *carrier = [networkInfo subscriberCellularProvider];
    [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%@",[carrier carrierName]] forKey:@"carrierName"];
    
    
    
    
    //Get SDK Version...
    NSString* sdkVersion = [[Analytic sharedObject] buildVersion];
    
    
    //Get cpuType i.e armv7,armv7s etc
    NSString* cpuType = [[Analytic sharedObject] getCPUType];
    
    
    uint64_t totalSpace = 0;
    uint64_t totalFreeSpace = 0;
    NSError *error = nil;
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error: &error];
    
    if (dictionary) {
        NSNumber *fileSystemSizeInBytes = [dictionary objectForKey: NSFileSystemSize];
        NSNumber *freeFileSystemSizeInBytes = [dictionary objectForKey:NSFileSystemFreeSize];
        totalSpace = [fileSystemSizeInBytes unsignedLongLongValue];
        totalFreeSpace = [freeFileSystemSizeInBytes unsignedLongLongValue];
        // NSLog(@"Memory Capacity of %llu MiB with %llu MiB Free memory available.", ((totalSpace/1024ll)/1024ll), ((totalFreeSpace/1024ll)/1024ll));
    } else {
        //  NSLog(@"Error Obtaining System Memory Info: Domain = %@, Code = %ld", [error domain], (long)[error code]);
    }
    
    
    
    //Get infor about RAM used for crash
    mach_port_t host_port;
    mach_msg_type_number_t host_size;
    vm_size_t pagesize;
    
    host_port = mach_host_self();
    host_size = sizeof(vm_statistics_data_t) / sizeof(integer_t);
    host_page_size(host_port, &pagesize);
    
    vm_statistics_data_t vm_stat;
    
    if (host_statistics(host_port, HOST_VM_INFO, (host_info_t)&vm_stat, &host_size) != KERN_SUCCESS) {
        // NSLog(@"Failed to fetch vm statistics");
    }
    
    /* Stats in bytes */
    natural_t mem_used = (vm_stat.active_count +
                          vm_stat.inactive_count +
                          vm_stat.wire_count) * pagesize;
    natural_t mem_free = vm_stat.free_count * pagesize;
    natural_t mem_total = mem_used + mem_free;
    
    
    //Get bettery level...
    [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];
    double batteryLevel = [[UIDevice currentDevice] batteryLevel];
    batteryLevel = round(batteryLevel*100);
    
    
    //Call post service
    NSDictionary *inputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple", @"mnu",[[Analytic sharedObject] platformNiceString], @"mod",[[UIDevice currentDevice] systemVersion],@"osv",@"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",[[NSUserDefaults standardUserDefaults]stringForKey:@"lat"],@"lat", [[NSUserDefaults standardUserDefaults]stringForKey:@"lng"],@"lng",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc", [[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId],@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",@"N/A",@"ac",netwrokType,@"nw",cpuType,@"cpu",orientatin,@"ori",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",@"n/A",@"frs",@"n/A",@"trs",[NSString stringWithFormat:@"%u",mem_free],@"fds",[NSString stringWithFormat:@"%u",mem_total],@"tds",[NSString stringWithFormat:@"%f",batteryLevel],@"bl",@"n/A",@"ids",@"Y",@"ido",crashStackSymbol,@"est",@"Non-Fatal",@"esm",crashDesc,@"Ess",@"sdv",@"C",@"mt",nil];
    
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *err=nil;
        
        NSData *jsondata = [NSJSONSerialization dataWithJSONObject:inputData
                                                           options:NSJSONWritingPrettyPrinted
                                                             error:&err];
        NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[[[NSUserDefaults standardUserDefaults] objectForKey:@"kUrl"] stringByAppendingString:@"api/i/single/C"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
        [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
        [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
        [request setHTTPMethod:@"POST"];
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
        [request setHTTPBody:jsondata];
        
        
        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
        [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
            
            NSLog(@"requestReply on crash: %@", requestReply);
            
            
        }] resume];
    });
    
    
}

//Call this when app was on offline mode and then send offline data...
-(void)BulkCall:(NSString*)eventName{
    
     [self getDevieInfo];
    
    //get Begin data..
    NSDictionary *beginInputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple", @"mnu",[self platformNiceString], @"mod",[[UIDevice currentDevice] systemVersion],@"osv",@"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",@"0.0",@"lat", @"0.0",@"lng",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] ,@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId] ,@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",deviceId, @"ac",netwrokType,@"nw",cpuType,@"cpu", orientatin,@"ori",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",sdkVersion,@"sdv",@"B",@"mt",nil];
    

    
//    //get endData...
//    NSDictionary *endInputData = [[NSDictionary alloc] initWithObjectsAndKeys:[NSString stringWithFormat:@"%d",tsd],@"tsd",deviceId ,@"did",@"4170b44d6459bba992acaa857ac5b25d7fac6cc1",@"akey",[NSString stringWithFormat:@"%ld",(long)(NSTimeInterval)([[NSDate date] timeIntervalSince1970])],@"Rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId],@"sid",@"E",@"mt", nil];
//    
//  
    

    
//    //get crashData...
//    NSDictionary *crashInputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple", @"mnu",[self platformNiceString], @"mod",[[UIDevice currentDevice] systemVersion],@"osv",@"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",@"0.0",@"lat", @"0.0",@"lng", [NSString stringWithFormat:@"%ld",(long)(NSTimeInterval)([[NSDate date] timeIntervalSince1970])],@"rtc", [[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId],@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",@"N/A",@"ac",netwrokType,@"nw",@"armv7s",@"cpu",orientatin,@"ori",@"4170b44d6459bba992acaa857ac5b25d7fac6cc1",@"akey",@"n/A",@"frs",@"n/A",@"trs",[NSString stringWithFormat:@"%u",mem_free],@"fds",[NSString stringWithFormat:@"%u",mem_total],@"tds",[NSString stringWithFormat:@"%f",batteryLevel],@"bl",@"n/A",@"ids",@"Y",@"ido",@"NSInvalidArgumanetException",@"est",@"Non-Fatal",@"esm",@"InvalidArgumanet",@"Ess",@"7.0",@"sdv",@"C",@"mt",nil];
//    
//      NSLog(@"after crash on BulkCall");
    
    NSError *error;
    NSString *jsonBegin,*jsonEvent,*jsonCrash;
    
    
    
    NSData *jsonBeginData = [NSJSONSerialization dataWithJSONObject:beginInputData
                                                       options:0 // Pass 0 if you don't care about the readability of the generated string
                                                         error:&error];
    
    if (! jsonBeginData) {
     //   NSLog(@"Got an error while converting to jsonBegin: %@", error);
    } else {
        jsonBegin = [[NSString alloc] initWithData:jsonBeginData encoding:NSUTF8StringEncoding];
    }
    
    

//    NSData *jsonEndData = [NSJSONSerialization dataWithJSONObject:endInputData
//                                                       options:0 // Pass 0 if you don't care about the readability of the generated string
//                                                         error:&error];
//    
//    if (! jsonEndData) {
//    //    NSLog(@"Got an error while converting to jsonEnd: %@", error);
//    } else {
//        jsonEnd = [[NSString alloc] initWithData:jsonEndData encoding:NSUTF8StringEncoding];
//    }
    
    
    
    
    
    //Create a bulkArr for first time...
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    if(![[[userDefaults dictionaryRepresentation] allKeys] containsObject:@"bulkArr"]){
    
        [userDefaults setObject:jsonObjArr forKey:@"bulkArr"];
        [userDefaults synchronize];
    }
    
    
    //Adds Current session values to bulkArr...
    NSMutableArray *temp = [NSMutableArray new];
    temp = [[userDefaults arrayForKey:@"bulkArr"] mutableCopy];
    [temp addObject:jsonBegin];
   // [temp addObject:jsonEnd];
    
    
    
    //Calls incase when event happnes, when there is no internet....
    if (![eventName isEqualToString:@"---"]) {
        
            //get eventData...
            NSDictionary *eventInputData = [[NSDictionary alloc] initWithObjectsAndKeys:@"apple",@"mnu",[self platformNiceString],@"mod",[[UIDevice currentDevice] systemVersion],@"osv", @"iOS", @"pf",[[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"], @"avn",@"0.0",@"lat", @"0.0",@"lng",[formatter numberFromString:[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]],@"rtc",[[NSString stringWithFormat:@"%@",[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]]] stringByAppendingString:deviceId] ,@"sid",deviceId ,@"did",[NSString stringWithFormat:@"%.0f*%.0f",[[UIScreen mainScreen] bounds].size.width,[[UIScreen mainScreen] bounds].size.height],@"res",[[NSUserDefaults standardUserDefaults]stringForKey:@"carrierName"],@"c",deviceType, @"dt",deviceId, @"ac",netwrokType,@"nw",cpuType,@"cpu", orientatin,@"ori",[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"],@"akey",sdkVersion,@"sdv",@"event",@"mt",@"AddToCart",@"key",@"{“productid”:45,”category”:2,”Offer”:”Y”}",@"pro",nil];
        
        
        
        //    Json Of Event...
            NSData *jsonEventData = [NSJSONSerialization dataWithJSONObject:eventInputData
                                                                  options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
                                                                    error:&error];
        
            if (! jsonEventData) {
           //     NSLog(@"Got an error while converting to jsonEvent: %@", error);
            } else {
                jsonEvent = [[NSString alloc] initWithData:jsonEventData encoding:NSUTF8StringEncoding];
            }
        
        ////Adds Current event session values to bulkArr...
        [temp addObject:jsonEvent];
        
    }
   
    
    [userDefaults setObject:temp forKey:@"bulkArr"];
    [userDefaults synchronize];

    
    
    
//    Json of Crash...
//    NSData *jsonCrashData = [NSJSONSerialization dataWithJSONObject:crashInputData
//                                                          options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
//                                                            error:&error];
//    
//    if (! jsonCrashData) {
//        NSLog(@"Got an error while converting to jsonCrash: %@", error);
//    } else {
//        jsonCrash = [[NSString alloc] initWithData:jsonCrashData encoding:NSUTF8StringEncoding];
//    }
    
    
    
}

//send offline data to server when internet available..
-(void)sendBulkDataToserver{
    
    @try {
        //send data only if exists....
        if ([[[[NSUserDefaults standardUserDefaults] dictionaryRepresentation] allKeys] containsObject:@"bulkArr"]) {
            
            
            NSMutableArray *dataToSendArr = [NSMutableArray new];
            NSMutableArray *completeArr = [NSMutableArray new];
            
            //completeArr is contains all the offline data....
            completeArr = [[[NSUserDefaults standardUserDefaults] arrayForKey:@"bulkArr"] mutableCopy];
            
            //filtred array after modified to group of offline counter mantioned.
            dataToSendArr = [self convertToJsonArry:completeArr];
            
            
            
            //Hit webservice on Background thread...
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NSError *error;
                
                for (int i=0; i<[dataToSendArr count]; i++) {
                    
                    
                    NSData *jsonData2 = [NSJSONSerialization dataWithJSONObject:[dataToSendArr objectAtIndex:i] options:0 error:&error];
                    NSString *jsonString = [[NSString alloc] initWithData:jsonData2 encoding:NSUTF8StringEncoding];
                    
                    NSMutableArray *sendArr = [NSMutableArray new];
                    [sendArr addObject:jsonString];
                    
                   
                    NSData *jsondata = [NSJSONSerialization dataWithJSONObject:sendArr
                                                                       options:NSJSONWritingPrettyPrinted
                                                                         error:&error];
                    NSMutableURLRequest * request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:[kUrl stringByAppendingString:@"api/i/bulk/O"]] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:120.0];
                    [request setValue:@"application/json" forHTTPHeaderField:@"Content-type"];
                    [request setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"aKey"] forHTTPHeaderField:@"aKey"];
                    [request setHTTPMethod:@"POST"];
                    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsondata length]] forHTTPHeaderField:@"Content-Length"];
                    [request setHTTPBody:jsondata];
                    
                    
                    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
                    [[session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                        NSString *requestReply = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
                      
                        NSLog(@"requestReply on bulk: %@", requestReply);
                        
                    }] resume];
                    
                    
                    //Delete the offline data once data sent on server...
                    NSMutableArray *tempoArr = [NSMutableArray new];
                    tempoArr = [[[NSUserDefaults standardUserDefaults] arrayForKey:@"bulkArr"] mutableCopy];
                    
                    [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"bulkArr"];
                }
            });
            
            
            
        }else{
      //      NSLog(@"No Bulk data available to send");
        }
    } @catch (NSException *exception) {
    //    NSLog(@"Exception in Bulk--- %@",[exception description]);
    } @finally {
        
    }
}

//Convserts offline data to required format for sending to server...
-(NSMutableArray *)convertToJsonArry: (NSMutableArray*)completeArr{
    
    @try {
        NSError *error;
        
        //Creates a group of offlineData Counter (i.e 5 by default)
        NSUInteger cnt=[completeArr count];
        
        NSMutableArray *groupFinalArr = [NSMutableArray new];
        for (int i=0; i<cnt; i++) {
            
            if (jsonArr == nil) {
                
                jsonArr = [NSMutableArray new];
            }
            
            int j=i+1;
            
            NSData *data = [[completeArr objectAtIndex:i] dataUsingEncoding:NSUTF8StringEncoding];
            id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
            
            [jsonArr addObject:json];
            
            
            //this adds group of 5 elements to jsonArr..
            if (j%kofflineDataCounter==0 || i==cnt-1) {
                
                [groupFinalArr addObject:jsonArr];
                jsonArr =nil;
                
                
                if (i==cnt-1) {
                    break;
                    
                }else{
                    continue;
                    
                }
            }
        }
        
        
        return groupFinalArr;
    } @catch (NSException *exception) {
    } @finally {
    }
}

- (void)getDevieInfo{
    @try {
        //Get users location
        locationManager = [[CLLocationManager alloc] init];
        locationManager.delegate = self;
        [self get_currentLocation];
        
        
        //Get Network types
        NSArray *subviews = [[[[UIApplication sharedApplication] valueForKey:@"statusBar"] valueForKey:@"foregroundView"]subviews];
        NSNumber *dataNetworkItemView = nil;
        
        for (id subview in subviews) {
            if([subview isKindOfClass:[NSClassFromString(@"UIStatusBarDataNetworkItemView") class]]) {
                dataNetworkItemView = subview;
                break;
            }
        }
        
        switch ([[dataNetworkItemView valueForKey:@"dataNetworkType"]integerValue]) {
            case 0:
                netwrokType=@"No wifi or cellular";
                break;
                
            case 1:
                netwrokType = @"2G";
                break;
                
            case 2:
                netwrokType = @"3G";
                break;
                
            case 3:
                netwrokType = @"4G";
                break;
                
            case 4:
                netwrokType = @"LTE";
                break;
                
            case 5:
                netwrokType = @"Wifi";
                break;
                
                
            default:
                break;
        }
        
        
        
        //Get device orientation
        UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
        
        if(orientation == 0 || orientation == UIInterfaceOrientationPortrait) {
            orientatin=@"PORTRAIT";
        }else{
            orientatin=@"LANDSCAPE";
        }
        
        
        
        //Get device carrier
        CTTelephonyNetworkInfo *networkInfo = [[CTTelephonyNetworkInfo alloc] init];
        CTCarrier *carrier = [networkInfo subscriberCellularProvider];
        [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%@",[carrier carrierName]] forKey:@"carrierName"];
        
        
        
        //get device type
        if([[UIDevice currentDevice]userInterfaceIdiom]==UIUserInterfaceIdiomPhone)
        {
            deviceType=@"S";
        }else{
            deviceType=@"T";
        }
        
        
        //Get SDK Version...
        sdkVersion = [self buildVersion];
        
        
        //Get cpuType i.e armv7,armv7s etc
        cpuType = [self getCPUType];
        
        
      
        
        deviceId = [[[UIDevice currentDevice] identifierForVendor]UUIDString];
        
        
        uint64_t totalSpace = 0;
        uint64_t totalFreeSpace = 0;
        NSError *error = nil;
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error: &error];
        
        if (dictionary) {
            NSNumber *fileSystemSizeInBytes = [dictionary objectForKey: NSFileSystemSize];
            NSNumber *freeFileSystemSizeInBytes = [dictionary objectForKey:NSFileSystemFreeSize];
            totalSpace = [fileSystemSizeInBytes unsignedLongLongValue];
            totalFreeSpace = [freeFileSystemSizeInBytes unsignedLongLongValue];
           // NSLog(@"Memory Capacity of %llu MiB with %llu MiB Free memory available.", ((totalSpace/1024ll)/1024ll), ((totalFreeSpace/1024ll)/1024ll));
        } else {
          //  NSLog(@"Error Obtaining System Memory Info: Domain = %@, Code = %ld", [error domain], (long)[error code]);
        }
        
        
        
        
        
        //Get infor about RAM used for crash
        mach_port_t host_port;
        mach_msg_type_number_t host_size;
        vm_size_t pagesize;
        
        host_port = mach_host_self();
        host_size = sizeof(vm_statistics_data_t) / sizeof(integer_t);
        host_page_size(host_port, &pagesize);
        
        vm_statistics_data_t vm_stat;
        
        if (host_statistics(host_port, HOST_VM_INFO, (host_info_t)&vm_stat, &host_size) != KERN_SUCCESS) {
      //      NSLog(@"Failed to fetch vm statistics");
        }
        
        /* Stats in bytes */
        natural_t mem_used = (vm_stat.active_count +
                              vm_stat.inactive_count +
                              vm_stat.wire_count) * pagesize;
        mem_free = vm_stat.free_count * pagesize;
        mem_total = mem_used + mem_free;
    
        
        
        //Get bettery level...
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];
        batteryLevel = [[UIDevice currentDevice] batteryLevel];
        batteryLevel = round(batteryLevel*100);
       
    } @catch (NSException *exception) {
        
    } @finally {
        
    }

}

-(void)get_currentLocation{
    
    if(IS_OS_8_OR_LATER){

            if([[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSLocationAlwaysUsageDescription"]){
                [locationManager requestAlwaysAuthorization];
                
                
                                [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%f",locationManager.location.coordinate.latitude] forKey:@"lat"];
                                [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%f",locationManager.location.coordinate.longitude] forKey:@"lng"];
                
                
            } else if([[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSLocationWhenInUseUsageDescription"]) {
                [locationManager  requestWhenInUseAuthorization];
                
                [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%f",locationManager.location.coordinate.latitude] forKey:@"lat"];
                [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%f",locationManager.location.coordinate.longitude] forKey:@"lng"];
                
            } else {
         //       NSLog(@"");
            }
        //}
    }
    [locationManager startUpdatingLocation];
}

- (NSString *)platformRawString {
    size_t size;
    sysctlbyname("hw.machine", NULL, &size, NULL, 0);
    char *machine = malloc(size);
    sysctlbyname("hw.machine", machine, &size, NULL, 0);
    NSString *platform = [NSString stringWithUTF8String:machine];
    free(machine);
    return platform;
}

- (NSString *)platformNiceString {
    NSString *platform = [self platformRawString];
    if ([platform isEqualToString:@"iPhone1,1"])    return @"iPhone 1G";
    if ([platform isEqualToString:@"iPhone1,2"])    return @"iPhone 3G";
    if ([platform isEqualToString:@"iPhone2,1"])    return @"iPhone 3GS";
    if ([platform isEqualToString:@"iPhone3,1"])    return @"iPhone 4";
    if ([platform isEqualToString:@"iPhone3,3"])    return @"Verizon iPhone 4";
    if ([platform isEqualToString:@"iPhone4,1"])    return @"iPhone 4S";
    if ([platform isEqualToString:@"iPhone5,1"])    return @"iPhone 5 (GSM)";
    if ([platform isEqualToString:@"iPhone5,2"])    return @"iPhone 5 (GSM+CDMA)";
    if ([platform isEqualToString:@"iPhone5,3"])    return @"iPhone 5c (GSM)";
    if ([platform isEqualToString:@"iPhone5,4"])    return @"iPhone 5c (GSM+CDMA)";
    if ([platform isEqualToString:@"iPhone6,1"])    return @"iPhone 5s (GSM)";
    if ([platform isEqualToString:@"iPhone6,2"])    return @"iPhone 5s (GSM+CDMA)";
    if ([platform isEqualToString:@"iPhone7,1"])    return @"iPhone 6 Plus";
    if ([platform isEqualToString:@"iPhone7,2"])    return @"iPhone 6";
    if ([platform isEqualToString:@"iPhone8,1"])    return @"iPhone 6s";
    if ([platform isEqualToString:@"iPhone8,2"])    return @"iPhone 6s Plus";
    if ([platform isEqualToString:@"iPhone8,4"])    return @"iPhone SE";
    if ([platform isEqualToString:@"iPhone9,1"])    return @"iPhone 7";
    if ([platform isEqualToString:@"iPhone9,3"])    return @"iPhone 7";
    if ([platform isEqualToString:@"iPhone9,2"])    return @"iPhone 7 Plus";
    if ([platform isEqualToString:@"iPhone9,4"])    return @"iPhone 7 Plus";
    if ([platform isEqualToString:@"iPod1,1"])      return @"iPod Touch 1G";
    if ([platform isEqualToString:@"iPod2,1"])      return @"iPod Touch 2G";
    if ([platform isEqualToString:@"iPod3,1"])      return @"iPod Touch 3G";
    if ([platform isEqualToString:@"iPod4,1"])      return @"iPod Touch 4G";
    if ([platform isEqualToString:@"iPod5,1"])      return @"iPod Touch 5G";
    if ([platform isEqualToString:@"iPad1,1"])      return @"iPad";
    if ([platform isEqualToString:@"iPad2,1"])      return @"iPad 2 (WiFi)";
    if ([platform isEqualToString:@"iPad2,2"])      return @"iPad 2 (GSM)";
    if ([platform isEqualToString:@"iPad2,3"])      return @"iPad 2 (CDMA)";
    if ([platform isEqualToString:@"iPad2,4"])      return @"iPad 2 (WiFi)";
    if ([platform isEqualToString:@"iPad2,5"])      return @"iPad Mini (WiFi)";
    if ([platform isEqualToString:@"iPad2,6"])      return @"iPad Mini (GSM)";
    if ([platform isEqualToString:@"iPad2,7"])      return @"iPad Mini (GSM+CDMA)";
    if ([platform isEqualToString:@"iPad3,1"])      return @"iPad 3 (WiFi)";
    if ([platform isEqualToString:@"iPad3,2"])      return @"iPad 3 (GSM+CDMA)";
    if ([platform isEqualToString:@"iPad3,3"])      return @"iPad 3 (GSM)";
    if ([platform isEqualToString:@"iPad3,4"])      return @"iPad 4 (WiFi)";
    if ([platform isEqualToString:@"iPad3,5"])      return @"iPad 4 (GSM)";
    if ([platform isEqualToString:@"iPad3,6"])      return @"iPad 4 (GSM+CDMA)";
    if ([platform isEqualToString:@"iPad4,1"])      return @"iPad Air (WiFi)";
    if ([platform isEqualToString:@"iPad4,2"])      return @"iPad Air (Cellular)";
    if ([platform isEqualToString:@"iPad4,4"])      return @"iPad mini 2G (WiFi)";
    if ([platform isEqualToString:@"iPad4,5"])      return @"iPad mini 2G (Cellular)";
    if ([platform isEqualToString:@"iPad4,7"])      return @"iPad mini 3G (Wifi)";
    if ([platform isEqualToString:@"i386"])         return @"Simulator";
    if ([platform isEqualToString:@"x86_64"])       return @"Simulator";
    return platform;
}

//Finds SDK Version...
- (NSString *)buildVersion
{
    // form character set of digits and punctuation
    NSMutableCharacterSet *characterSet =
    [[NSCharacterSet decimalDigitCharacterSet] mutableCopy];
    
    [characterSet formUnionWithCharacterSet:
     [NSCharacterSet punctuationCharacterSet]];
    
    // get only those things in characterSet from the SDK name
    NSString *SDKName = [[NSBundle mainBundle] infoDictionary][@"DTSDKName"];
    NSArray *components =
    [[SDKName componentsSeparatedByCharactersInSet:
      [characterSet invertedSet]]
     filteredArrayUsingPredicate:
     [NSPredicate predicateWithFormat:@"length != 0"]];
    
    if([components count]) return components[0];
    return nil;
}

//Finds cpu Architecture type...
- (NSString *)getCPUType
{
    @try {
        int32_t value = 0;
        size_t length = sizeof(value);
        sysctlbyname("hw.cpusubtype", &value, &length, NULL, 0);
        
        NSMutableString *cpu = [[NSMutableString alloc] init];
        
        // values for cputype and cpusubtype defined in mach/machine.h
        if (value == 1) {
            [cpu appendString:@"VAX"];
        } else if (value == 6) {
            [cpu appendString:@"MC680x0"];
        } else if (value == 7) {
            [cpu appendString:@"x86"];
        }else if (value == 10) {
            [cpu appendString:@"MC98000"];
        }else if (value == 11) {
            [cpu appendString:@"HPPA"];
        }else if (value == 12) {
            [cpu appendString:@"ARM"];
        }else if (value == 13) {
            [cpu appendString:@"MC88000"];
        }else if (value == 14) {
            [cpu appendString:@"SPARC"];
        }else if (value == 15) {
            [cpu appendString:@"I860"];
        }else if (value == 18) {
            [cpu appendString:@"POWERPC"];
        }else{
            [cpu appendString:@"ARM v7s"];
        }
        

        return cpu;
    } @catch (NSException *exception) {
        
    } @finally {
        
    }
}


//Calls when internet changes his status i.e online to offline or viceversa...
- (void)reachabilityChanged:(NSNotification *)notification
{
    if([AFNetworkReachabilityManager sharedManager].isReachable){
        //checks if bulkArr exists..
        if([[[[NSUserDefaults standardUserDefaults] dictionaryRepresentation] allKeys] containsObject:@"bulkArr"]){
        }else{
        }
    }else{
    }
}

- (void)_timerFired:(NSTimer *)timer {
    tsd++;
}

- (void)_startVCTimer:(NSTimer *)timer {
    timerForVC++;
}


-(void)SetOfflineDataCounter{
//    kofflineDataCounter
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType{
    
  //  [Analytic sharedObject];
    
    NSLog(@"------  shouldStartLoadWithRequest  -------");
    
    NSLog(@"------  shouldStartLoadWithRequest  ------- %@",[[request URL] absoluteString]);

    
        if ([[[request URL] absoluteString] hasPrefix:@"ios:webToNativeBeginCall"]) {
    
                // Call the given selector
            // [self performSelector:@selector(EndCall)];
              //  [self performSelector:@selector(BeginCallWithkUrl:AppKey:)];
            return NO;
        }
            if ([[[request URL] absoluteString] hasPrefix:@"ios:webToNativeEventCall:"]) {
                // Call the given selector
               // [self performSelector:@selector(EventCall:)];
                return NO;
            }
            if ([[[request URL] absoluteString] hasPrefix:@"ios:webToNativeEndCall:"]) {
                // Call the given selector
               // [self performSelector:@selector(EndCall)];
                return NO;
            }
            if ([[[request URL] absoluteString] hasPrefix:@"ios:webToNativeCrashCall:"]) {
                // Call the given selector
             //   [self performSelector:@selector(uncaughtExceptionHandler)];
                return NO;
            }
    
    return YES;
}


@end
