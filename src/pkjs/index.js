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

var geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};

var dict = {
  'Word1': '...',
  'Word2': '...',
  'Word3': '...'
}

function sendLocation() {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
}

Pebble.addEventListener('ready', function() {
  setInterval(sendLocation, 30000)
  sendLocation();
});

function geoSuccess(pos) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(req.responseText);
      var words = res.words.split('.');
      dict.Word1 = words[0];
      dict.Word2 = words[1];
      dict.Word3 = words[2];
      Pebble.sendAppMessage(dict, function() {
      }, function(e) {
      });
    }
  };
  req.open(
    'GET',
    'https://api.what3words.com/v3/convert-to-3wa?coordinates='
    + pos.coords.latitude + ',' + pos.coords.longitude + '&key=' + W3W_KEY,
    true);
  req.send();
}

function geoError(err) {
}
