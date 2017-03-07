/* globals mozRTCPeerConnection, RTCPeerConnection, webkitRTCPeerConnection */
'use strict';

if (typeof cordova !== 'undefined' && cordova.plugins.iosrtc) {
  module.exports = cordova.plugins.iosrtc.RTCPeerConnection;
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
  module.exports = require('./chrome');
} else if (typeof mozRTCPeerConnection !== 'undefined') {
  module.exports = require('./firefox');
} else if (typeof RTCPeerConnection !== 'undefined') {
  module.exports = RTCPeerConnection;
}
