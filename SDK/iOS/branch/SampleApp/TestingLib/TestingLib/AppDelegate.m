//
//  AppDelegate.m
//  TestingLib
//
//  Created by Krunal on 17/08/16.
//  Copyright © 2016 mastek. All rights reserved.
//

#import "AppDelegate.h"
#import "Analytic.h"

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
  //  NSSetUncaughtExceptionHandler(&uncaughtExceptionHandler);
    
    [Analytic sharedObject];
    [[Analytic sharedObject] BeginCallWithkUrl:@"http://52.87.24.173/" AppKey:@"4170b44d6459bba992acaa857ac5b25d7fac6cc1"];
    
    return YES;
}

//void uncaughtExceptionHandler(NSException *exception)
//{
//    NSLog(@"------------------- Bad");
////    NSLog(@"Exception Got: ---- %@",[exception description]);
////    NSLog(@"CRASH----: %@", exception);
////    NSLog(@"Stack Trace----: %@", [exception callStackSymbols]);
////    
//    [[Analytic sharedObject] crashCall:[exception callStackSymbols] crashDescription:[exception description]];
//}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    
    [[NSNotificationCenter defaultCenter] postNotificationName:@"notifier" object:self];
      NSLog(@"----- applicationDidEnterBackground--- ");
 
      [[Analytic sharedObject] EndCall];
    
    
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    
    [[NSNotificationCenter defaultCenter] postNotificationName:@"notifier" object:@"foreground"];
    NSLog(@"----- applicationWillEnterForeground--- ");
   
    [[Analytic sharedObject] BeginCallWithkUrl:@"http://52.87.24.173/" AppKey:@"4170b44d6459bba992acaa857ac5b25d7fac6cc1"];
    
    
    
    
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
   
    [[NSNotificationCenter defaultCenter] postNotificationName:@"notifier" object:self];
    NSLog(@"----- applicationWillTerminate--- ");
    
    [[Analytic sharedObject] EndCall];
}

@end
