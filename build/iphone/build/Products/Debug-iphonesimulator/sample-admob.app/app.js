
var IOS = true;
var ANDROID = Ti.Platform.osname === 'android';
var UI = require('ui');
var AdMob = require('ti.admob');
AdMob.initialize({ 'appId': 'ca-app-pub-3940256099942544~3347511713' });

var rows = [
require('banner'),
require('interstitial')];


if (ANDROID && Map.isGooglePlayServicesAvailable() !== Map.SUCCESS) {
  alert('Google Play Services is not installed/updated/available');
} else {
  startUI();
}

function startUI() {
  UI.init(rows, function (e) {
    rows[e.index].run && rows[e.index].run(UI, AdMob);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6WyJJT1MiLCJBTkRST0lEIiwiVGkiLCJQbGF0Zm9ybSIsIm9zbmFtZSIsIlVJIiwicmVxdWlyZSIsIkFkTW9iIiwiaW5pdGlhbGl6ZSIsInJvd3MiLCJNYXAiLCJpc0dvb2dsZVBsYXlTZXJ2aWNlc0F2YWlsYWJsZSIsIlNVQ0NFU1MiLCJhbGVydCIsInN0YXJ0VUkiLCJpbml0IiwiZSIsImluZGV4IiwicnVuIl0sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBSUEsR0FBRyxPQUFQO0FBQ0EsSUFBSUMsT0FBTyxHQUFJQyxFQUFFLENBQUNDLFFBQUgsQ0FBWUMsTUFBWixLQUF1QixTQUF0QztBQUNBLElBQUlDLEVBQUUsR0FBR0MsT0FBTyxDQUFDLElBQUQsQ0FBaEI7QUFDQSxJQUFNQyxLQUFLLEdBQUdELE9BQU8sQ0FBQyxVQUFELENBQXJCO0FBQ0FDLEtBQUssQ0FBQ0MsVUFBTixDQUFpQixFQUFFLFNBQVMsd0NBQVgsRUFBakI7O0FBRUEsSUFBSUMsSUFBSSxHQUFHO0FBQ1BILE9BQU8sQ0FBQyxRQUFELENBREE7QUFFUEEsT0FBTyxDQUFDLGNBQUQsQ0FGQSxDQUFYOzs7QUFLQSxJQUFJTCxPQUFPLElBQUlTLEdBQUcsQ0FBQ0MsNkJBQUosT0FBd0NELEdBQUcsQ0FBQ0UsT0FBM0QsRUFBb0U7QUFDaEVDLEVBQUFBLEtBQUssQ0FBRSx5REFBRixDQUFMO0FBQ0gsQ0FGRCxNQUVPO0FBQ0hDLEVBQUFBLE9BQU87QUFDVjs7QUFFRCxTQUFTQSxPQUFULEdBQW1CO0FBQ2ZULEVBQUFBLEVBQUUsQ0FBQ1UsSUFBSCxDQUFRTixJQUFSLEVBQWMsVUFBU08sQ0FBVCxFQUFZO0FBQ3RCUCxJQUFBQSxJQUFJLENBQUNPLENBQUMsQ0FBQ0MsS0FBSCxDQUFKLENBQWNDLEdBQWQsSUFBcUJULElBQUksQ0FBQ08sQ0FBQyxDQUFDQyxLQUFILENBQUosQ0FBY0MsR0FBZCxDQUFrQmIsRUFBbEIsRUFBcUJFLEtBQXJCLENBQXJCO0FBQ0gsR0FGRDtBQUdIIiwic291cmNlc0NvbnRlbnQiOlsiXG52YXIgSU9TID0gKFRpLlBsYXRmb3JtLm9zbmFtZSA9PT0gJ2lwaG9uZScgfHwgVGkuUGxhdGZvcm0ub3NuYW1lID09PSAnaXBhZCcpO1xudmFyIEFORFJPSUQgPSAoVGkuUGxhdGZvcm0ub3NuYW1lID09PSAnYW5kcm9pZCcpO1xudmFyIFVJID0gcmVxdWlyZSgndWknKTtcbmNvbnN0IEFkTW9iID0gcmVxdWlyZSgndGkuYWRtb2InKTtcbkFkTW9iLmluaXRpYWxpemUoeyAnYXBwSWQnOiAnY2EtYXBwLXB1Yi0zOTQwMjU2MDk5OTQyNTQ0fjMzNDc1MTE3MTMnIH0pO1xuXG52YXIgcm93cyA9IFtcbiAgICByZXF1aXJlKCdiYW5uZXInKSxcbiAgICByZXF1aXJlKCdpbnRlcnN0aXRpYWwnKSxcbl07XG5cbmlmIChBTkRST0lEICYmIE1hcC5pc0dvb2dsZVBsYXlTZXJ2aWNlc0F2YWlsYWJsZSgpICE9PSBNYXAuU1VDQ0VTUykge1xuICAgIGFsZXJ0ICgnR29vZ2xlIFBsYXkgU2VydmljZXMgaXMgbm90IGluc3RhbGxlZC91cGRhdGVkL2F2YWlsYWJsZScpO1xufSBlbHNlIHtcbiAgICBzdGFydFVJKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0VUkoKSB7XG4gICAgVUkuaW5pdChyb3dzLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJvd3NbZS5pbmRleF0ucnVuICYmIHJvd3NbZS5pbmRleF0ucnVuKFVJLEFkTW9iKTtcbiAgICB9KTtcbn0iXSwic291cmNlUm9vdCI6Ii9Vc2Vycy92Z295YWwvRGVza3RvcC9Xb3JrU3BhY2UvQXBwY2VsZXJhdG9yL1NhbXBsZXMvc2FtcGxlLWFkbW9iL1Jlc291cmNlcyJ9