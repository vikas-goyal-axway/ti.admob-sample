
var IOS = (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad');
var ANDROID = (Ti.Platform.osname === 'android');
var UI = require('ui');
const AdMob = require('ti.admob');
AdMob.initialize({ 'appId': 'ca-app-pub-3940256099942544~3347511713' });

var rows = [
    require('banner'),
    require('interstitial'),
];

if (ANDROID && Map.isGooglePlayServicesAvailable() !== Map.SUCCESS) {
    alert ('Google Play Services is not installed/updated/available');
} else {
    startUI();
}

function startUI() {
    UI.init(rows, function(e) {
        rows[e.index].run && rows[e.index].run(UI,AdMob);
    });
}