//
//  ViewController.m
//  TestingLib
//
//  Created by Krunal on 17/08/16.
//  Copyright © 2016 mastek. All rights reserved.
//

#import "ViewController.h"
#import "Analytic.h"
#import <sys/sysctl.h>
#import <mach/mach.h>
#import <mach/mach_host.h>
#include <sys/types.h>
#include <mach/machine.h>

@interface ViewController ()

@end

@implementation ViewController{
    
   // Analytic *Objct;
}


- (void)viewDidLoad {
    [super viewDidLoad];
    
   
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc]init];
    [formatter setMaximumFractionDigits:0];

//    
//    NSString *st=[formatter stringFromNumber:[NSNumber numberWithDouble:(NSTimeInterval)([[NSDate date] timeIntervalSince1970])]];
//    
//    NSLog(@"p = %ld",(long)(NSTimeInterval)([[NSDate date] timeIntervalSince1970]));
//    
//    NSLog(@"time = %@",);

    
    
}

-(void)viewWillAppear:(BOOL)animated{
   
    [[NSNotificationCenter defaultCenter] postNotificationName:@"notifier" object:@"first page"];
    
}

- (IBAction)eventCall:(id)sender {
    [[Analytic sharedObject] EventCall:@"Event Button Click"];
}

- (IBAction)crashCall:(id)sender {
    
   // [[Analytic sharedObject] crashCall];
    //5/0;
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
