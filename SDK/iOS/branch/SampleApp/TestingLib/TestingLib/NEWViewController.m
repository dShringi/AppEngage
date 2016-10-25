//
//  NEWViewController.m
//  TestingLib
//
//  Created by Krunal on 28/09/16.
//  Copyright © 2016 mastek. All rights reserved.
//

#import "NEWViewController.h"

@interface NEWViewController ()

@end

@implementation NEWViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

-(void)viewWillAppear:(BOOL)animated{
    
        NSLog(@"viewWillAppear second");
   
    [[NSNotificationCenter defaultCenter] postNotificationName:@"notifier" object:@"second page"];
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
