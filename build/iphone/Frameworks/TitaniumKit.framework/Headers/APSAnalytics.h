/**
 * APS Analytics
 * Copyright (c) 2019 by Axway, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
@import Foundation;
@import CoreLocation;

/** Constant indicating development deployment */
extern NSString *const APSDeployTypeDevelopment;

/** Constant indicating production deployment */
extern NSString *const APSDeployTypeProduction;

/**
 * The APSAnalytics class configures the application to use the APS analytic services
 * to send analytic data that can be viewed on the sample_admob Dashboard.
 *
 * For information on getting started with sample_admob Platform Services,
 * see [sample_admob Platform Services for iOS](http://bit.ly/1kqteQS).
 */
@interface APSAnalytics : NSObject

/**
 * Return the singleton instance to the real-time analytics service.
 */
+ (instancetype)sharedInstance;

/**
 * Retrieves the current session identifier.
 *
 * @return {NSString*} session identifier.
 */
- (NSString *)getCurrentSessionId;

/**
 * Retrieves the last event sent.
 *
 * @return {NSDictionary *} the last event stored, otherwise null if none have been stored.
 */
- (NSDictionary *)getLastEvent;

/**
 * Retrieves the derived machine identifier.
 *
 * @return {NSString *} machine identifier.
 */
- (NSString *)getMachineId;

/**
 * Obtains machine identifier.
 */
- (void)setMachineId;

/**
 * Checks whether the user has opted out from sending analytics data.
 *
 * @return {BOOL} with the decision
 */
- (BOOL)isOptedOut;

/**
 * Writes the optedOut property in the SharedPreferences instance.
 *
 * @param {BOOL} value with the decision to opt out.
 */
- (void)setOptedOut:(BOOL)optedOut;

/**
 * Sends an application enroll event to indicate first launch.
 *
 * @deprecated use sendAppInstallEvent() instead.
 */
- (void)sendAppEnrollEvent;

/**
 * Sends an application enroll event to indicate first launch.
 *
 * If this is called multiple times, all executions after the first will
 * be ignored and do nothing.
 */
- (void)sendAppInstallEvent;

/**
 * Sends an application foreground event to indicate a new session.
 *
 * This will usually start a new session, unless one of two conditions:
 *
 * 1. This is the first foreground sent after an enroll has been sent.
 * 2. The last time a background was sent was within the session timeout.
 *
 * In both of these cases, the same session identifier will be kept.
 */
- (void)sendSessionStartEvent;

/**
 * Sends an application background event to indicate an ended session.
 */
- (void)sendSessionEndEvent;

/**
 * Sends an application navigation event which describes moving between views.
 *
 * @param fromView the name of the view the user navigated from.
 * @param toView the name of the view the user navigated to.
 * @param data arbitrary data to be sent alongside the nav event.
 */
- (void)sendAppNavEvent:(NSString *_Nonnull)fromView
                 toView:(NSString *_Nonnull)toView
                  event:(NSString *_Nullable)event
                   data:(NSDictionary *_Nullable)data;

- (void)sendAppNavEventFromView:(NSString *_Nonnull)fromView
                         toView:(NSString *_Nonnull)toView
                       withName:(NSString *_Nullable)event
                        payload:(NSDictionary *_Nullable)data;

/**
 * Sends an application feature event to allow sending custom data.
 *
 * @deprecated use sendCustomEvent(String, JSONObject) instead.
 */
- (void)sendAppFeatureEvent:(NSString *_Nonnull)event
                    payload:(NSDictionary *_Nullable)data;

/**
 * Sends an application feature event to allow sending custom data.
 *
 * @param name the name of the event being sent.
 * @param data the data to send alongside the event.
 */
- (void)sendCustomEvent:(NSString *_Nonnull)name
                   data:(NSDictionary *_Nullable)data;

/**
 * Sends a crash report as a custom event.
 *
 * @deprecated use sendCrashReport(JSONObject) instead.
 */
- (void)sendAppCrashEvent:(NSDictionary *_Nonnull)data;

/**
 * Sends a crash report as a custom event.
 *
 * @param crash the crash data to be included with the payload.
 */
- (void)sendCrashReport:(NSDictionary *_Nonnull)crash;

/**
 * Flush event queue.
 */
- (void)flush;

/**
 * Set sdk version to send in analytics.
 *
 * @param version sdk version
 *
 * @deprecated use setSdkVersion() instead.
 */
- (void)setSDKVersion:(NSString *)version;

/**
 * @deprecated NOT USED, only defined for backwards compatibility.
 */
- (void)setBuildType:(NSString *)type;

/**
 * Enables Analytics with a given app-key and deploy-type.
 * @param appKey The APSAnalytics app-key.
 * @param deployTime The deploy-type of the application.
 */
- (void)enableWithAppKey:(NSString *)appKey andDeployType:(NSString *)deployType;

/**
 * Get analytics endpoint url
 */
- (NSString *)getAnalyticsUrl;

/**
 * Get device architecture
 */
- (NSString *)getArchitecture;

/**
 * Get application id
 */
- (NSString *)getAppId;

/**
 * Get application name
 */
- (NSString *)getAppName;

/**
 * Get application version
 */
- (NSString *)getAppVersion;

/**
 * Get application deployment type (production, development)
 */
- (NSString *)getDeployType;

/**
 * Get analytics flush interval
 */
- (NSInteger)getFlushInterval;

/**
 * Get analytics flush requeue interval
 */
- (NSInteger)getFlushRequeue;

/**
 * Get device model
 */
- (NSString *)getModel;

/**
 * Get network type
 */
- (NSString *)getNetworkType;

/**
 * Get OS type (32bit, 64bit)
 */
- (NSString *)getOsType;

/**
 * Get OS version
 */
- (NSString *)getOsVersion;

/**
 * Get current platform
 */
- (NSString *)getPlatform;

/**
 * Get device processor count
 */
- (NSInteger)getProcessorCount;

/**
 * Get SDK version
 */
- (NSString *)getSdkVersion;

/**
 * Set analytics endpoint url
 */
- (void)setAnalyticsUrl:(NSString *)url;

/**
 * Set application id
 */
- (void)setAppId:(NSString *)appId;

/**
 * Set application name
 */
- (void)setAppName:(NSString *)appName;

/**
 * Set application version
 */
- (void)setAppVersion:(NSString *)appVersion;

/**
 * Set application deployment type
 */
- (void)setDeployType:(NSString *)deployType;

/**
 * Set SDK version
 */
- (void)setSdkVersion:(NSString *)sdkVersion;

/**
 * Set analytics flush interval
 */
- (void)setFlushInterval:(NSInteger)timeout;

/**
 * Set analytics flush requeue interval
 */
- (void)setFlushRequeue:(NSInteger)timeout;

@end
