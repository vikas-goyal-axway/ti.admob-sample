/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2020 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import <Foundation/Foundation.h>

#pragma mark - TiScriptError

/**
 * Script Error class
 */
@interface TiScriptError : NSObject

/**
 * Returns source URL where error happened.
 */
@property (nonatomic, readonly) NSString *sourceURL;

/**
 * Returns line number where error happened.
 */
@property (nonatomic, readonly) NSInteger lineNo;

/**
 * Returns line column where error happened.
 */
@property (nonatomic, readonly) NSInteger column;

/**
 * Returns error related message
 */
@property (nonatomic, readonly) NSString *message;

/**
 * If created with a dictionary, returns the creating dictionary. Otherwise, may be nil.
 */
@property (nonatomic, readonly) NSDictionary *dictionaryValue;

/**
 * Returns the call stack as a static string. May or may not include the most recent function.
 */
@property (nonatomic, readonly) NSString *backtrace;

/**
 * Returns the native stack as a static string.
 */
@property (nonatomic, readonly) NSArray<NSString *> *nativeStack;

- (id)initWithMessage:(NSString *)message sourceURL:(NSString *)sourceURL lineNo:(NSInteger)lineNo;
- (id)initWithDictionary:(NSDictionary *)dictionary;

/**
 * Returns detailed description.
 */
- (NSString *)detailedDescription;

@end

#pragma mark - TiExceptionHandlerDelegate

/**
 * Exception handler delegate protocol. 
 */
@protocol TiExceptionHandlerDelegate <NSObject>

/**
 * Called when a Objective-C exception is thrown.
 * @param exception An original NSException object
 */
- (void)handleUncaughtException:(NSException *)exception;

/**
 * Called when a JavaScript script error occured.
 * @param error An JavaScript script error
 */
- (void)handleScriptError:(TiScriptError *)error;

@end

#pragma mark - TiExceptionHandler

/**
 * The Exception Handler class. Singleton instance accessed via <defaultExceptionHandler>
 */
@interface TiExceptionHandler : NSObject <TiExceptionHandlerDelegate>

/**
 * Delegate for error/exception handling
 * @see TiExceptionHandlerDelegate
 */
@property (nonatomic, assign) id<TiExceptionHandlerDelegate> delegate;

/**
 * Presents provided script error to user. Default behavior in development mode.
 * @param error The script error object/
 */
- (void)showScriptError:(TiScriptError *)error;

/**
 * Returns singleton instance of TiExceptionHandler.
 * @return singleton instance
 */
+ (TiExceptionHandler *)defaultExceptionHandler;

- (void)reportScriptError:(TiScriptError *)error;

@end