/* global mozRTCIceCandidate, RTCIceCandidate */
'use strict';

if (typeof cordova !== 'undefined' && cordova.plugins.iosrtc) {
  module.exports = cordova.plugins.iosrtc.RTCIceCandidate;
} else if (typeof mozRTCIceCandidate !== 'undefined') {
  module.exports = mozRTCIceCandidate;
} else if (typeof RTCIceCandidate !== 'undefined') {
  module.exports = RTCIceCandidate;
}
