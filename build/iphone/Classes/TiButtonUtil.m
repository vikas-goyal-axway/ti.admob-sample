/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2020 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#import "TiButtonUtil.h"
#import <TitaniumKit/TiBase.h>

@implementation TiButtonUtil

+ (UIView *)systemButtonWithType:(int)type
{
  switch (type) {
  case UIsample_admobNativeItemInfoLight: {
    return [UIButton buttonWithType:UIButtonTypeInfoLight];
  }
  case UIsample_admobNativeItemInfoDark: {
    return [UIButton buttonWithType:UIButtonTypeInfoDark];
  }
  case UIsample_admobNativeItemDisclosure: {
    return [UIButton buttonWithType:UIButtonTypeDetailDisclosure];
  }
  case UIsample_admobNativeItemContactAdd: {
    return [UIButton buttonWithType:UIButtonTypeContactAdd];
  }
  case UIsample_admobNativeItemSpinner: {
    UIActivityIndicatorView *button = [[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite] autorelease];
    [button startAnimating];
    return button;
  }
  }
  return nil;
}

+ (UIView *)buttonWithType:(int)type
{
  UIView *button = [TiButtonUtil systemButtonWithType:type];
  if (button == nil) {
    button = [UIButton buttonWithType:type];
  }
  return button;
}

@end
