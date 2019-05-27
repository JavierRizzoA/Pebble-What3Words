/*
   This file is part of Pebble-What3Words.

   Pebble-What3Words is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Pebble-What3Words is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Pebble-What3Words .  If not, see <http://www.gnu.org/licenses/>.
 */

var W3W_KEY = '';
var WEATHER_FREQ = 30 * 60 * 1000;

var lastWeatherUpdate = (new Date).getTime() - WEATHER_FREQ;

var geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};

var dict = {
  'Word1': '',
  'Word2': '',
  'Word3': '',
  'Weather': ''
};

var lat = null;
var lon = null;

var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

var settings = {};

function updateLocation() {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
}

Pebble.addEventListener('ready', function() {
  if(!localStorage.getItem('settings')) {
    settings = {'ShowWeather':{'value':false}};
  } else {
    settings = JSON.parse(localStorage.getItem('settings'));
  }
  setInterval(updateLocation, 30000)
  updateLocation();
});

Pebble.addEventListener('webviewclosed', function(e) {
  if(e.response) {
    settings = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('settings', decodeURIComponent(e.response));
    lastWeatherUpdate = (new Date).getTime() - WEATHER_FREQ
    updateLocation();
  }
});

function geoSuccess(pos) {
  if(lat != pos.coords.latitude || lon != pos.coords.longitude) {
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    get3Words();
  }
  var timeNow = (new Date).getTime();
  if(settings.ShowWeather.value) {
    if(timeNow - lastWeatherUpdate > WEATHER_FREQ) {
      lastWeatherUpdate = timeNow;
      getWeather();
    }
  } else {
    dict.Weather = '';
  }
}

function geoError(err) {
}

function get3Words(pos) {
  var wordsReq = new XMLHttpRequest();
  wordsReq.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(wordsReq.responseText);
      var words = res.words.split('.');
      if(dict.Word1 != words[0]
        ||dict.Word2 != words[1]
        ||dict.Word3 != words[2]) {
        dict.Word1 = words[0];
        dict.Word2 = words[1];
        dict.Word3 = words[2];
        Pebble.sendAppMessage(dict, function() {
        }, function(e) {
        });
      }
    }
  };
  wordsReq.open(
    'GET',
    'https://api.what3words.com/v3/convert-to-3wa?coordinates='
    + lat + ',' + lon + '&key=' + W3W_KEY,
    true);
  wordsReq.send();
}

function getWeather() {
  if(lat != null && lon != null) {
    var weatherReq = new XMLHttpRequest();
    weatherReq.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var res = JSON.parse(weatherReq.responseText);
        var weather = res.weather[0].main.replace('Thunderstorm', 'Thunder') + ', '
          + Math.round(res.main.temp) + 'º';
        if(dict.Weather != weather) {
          dict.Weather = weather;
          Pebble.sendAppMessage(dict, function() {}, function(e) {});
        }
      }
    };
    if(settings.WeatherKey) {
      weatherReq.open(
        'GET',
        'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon='
        + lon + '&units=' + settings.Unit.value + '&APPID=' + settings.WeatherKey.value,
        true);
      weatherReq.send();
    }
  }
}
