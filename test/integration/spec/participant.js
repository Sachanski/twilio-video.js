'use strict';

var assert = require('assert');
var connect = require('../../../lib/connect');
var createLocalTracks = require('../../../lib/createlocaltracks');
var credentials = require('../../env');
var fakeGetUserMedia = require('../../lib/fakemediastream').fakeGetUserMedia;
var getToken = require('../../lib/token').getToken.bind(null, credentials);
var logLevel = credentials.logLevel;
var randomName = require('../../lib/util').randomName;
var wsServer = credentials.wsServer;
var PeerConnectionManager = require('../../../lib/signaling/v2/peerconnectionmanager');

describe('Participant', () => {
  var options = {};
  if (wsServer) {
    options.wsServer = wsServer;
  }
  if (logLevel) {
    options.logLevel = logLevel;
  }

  options.getUserMedia = fakeGetUserMedia;

  describe('events', () => {
    var roomName = null;
    var aliceRoom = null;
    var alice = null;
    var bobRoom = null;
    var bob = null;

    beforeEach(() => {
      roomName = randomName();
      alice = randomName();
      bob = randomName();
    });

    context('when alice (with audio and video tracks) and bob connect to the Room,', () => {
      it('should populate alice\'s Participant in bob\'s Room with her Tracks', () => {
        return createFakeLocalTracks(alice, options).then(tracks => {
          return connect(getToken({ address: alice }), Object.assign({
            name: roomName,
            tracks: tracks
          }, options));
        }).then(room => {
          aliceRoom = room;
          PeerConnectionManager.prototype.getRemoteMediaStreamTracks = () => fakeMediaStreamTracks.get(alice);
          return connect(getToken({ address: bob }), Object.assign({
            name: roomName
          }, options));
        }).then(room => {
          bobRoom = room;
          var aliceParticipantSid = aliceRoom.localParticipant.sid;
          assert(bobRoom.participants.has(aliceParticipantSid));

          var aliceTracks = bobRoom.participants.get(aliceParticipantSid).tracks;
          assert.equal(aliceTracks.size, 2);

          fakeMediaStreamTracks.get(alice).forEach(track => {
            var aliceTrack = aliceTracks.get(track.id);
            assert.equal(aliceTrack.id, track.id);
            assert.equal(aliceTrack.kind, track.kind);
          });
        });
      });

      context('when bob later disconnects from the Room,', () => {
        it('should not trigger "trackRemoved" event on alice\'s Participant in bob\'s Room', () => {
          return createFakeLocalTracks(alice, options).then(tracks => {
            return connect(getToken({ address: alice }), Object.assign({
              name: roomName,
              tracks: tracks
            }, options));
          }).then(room => {
            aliceRoom = room;
            PeerConnectionManager.prototype.getRemoteMediaStreamTracks = () => fakeMediaStreamTracks.get(alice);
            return connect(getToken({ address: bob }), Object.assign({
              name: roomName
            }, options));
          }).then(room => {
            bobRoom = room;
            return new Promise((resolve, reject) => {
              var aliceParticipantSid = aliceRoom.localParticipant.sid;
              var aliceParticipant = bobRoom.participants.get(aliceParticipantSid);

              aliceParticipant.on('trackRemoved',
                () => reject(new Error('"trackRemoved" triggered on alice\'s Participant')));
              bobRoom.disconnect();
              setTimeout(resolve);
            });
          });
        });
      });
    });

    afterEach(() => {
      if (aliceRoom) {
        aliceRoom.disconnect();
        aliceRoom = null;
      }
      fakeMediaStreamTracks.delete(alice);
      alice = null;

      if (bobRoom) {
        bobRoom.disconnect();
        bobRoom = null;
      }
      bob = null;
      PeerConnectionManager.prototype.getRemoteMediaStreamTracks = getRemoteMediaStreamTracks;
    });
  });
});

var fakeMediaStreamTracks = new Map();
var getRemoteMediaStreamTracks =
  PeerConnectionManager.prototype.getRemoteMediaStreamTracks;

function createFakeLocalTracks(name, options) {
  return createLocalTracks(options).then(tracks => {
    fakeMediaStreamTracks.set(name, tracks.map(track => track.mediaStreamTrack));
    return tracks;
  });
}
