'use strict';

var assert = require('assert');
var TwilioError = require('../../../../lib/util/twilioerror');

describe('TwilioError', function() {
  describe('constructor', () => {
    var error;

    before(() => {
      error = new TwilioError(1234);
    });

    it('should be an instance of Error', () => {
      assert(error instanceof Error);
    });

    it('should set the name and code properties', () => {
      assert.equal(error.name, 'TwilioError');
      assert.equal(error.code, 1234);
    });

    it('should set the message property to empty', () => {
      assert.equal(error.message, '');
    });

    it('should set the stack property to start with "TwilioError"', () => {
      assert(/^TwilioError/.test(error.stack));
    });

    context('when message is provided', () => {
      it('should set the message property', () => {
        var errorWithMsg = new TwilioError(1234, 'some error message');
        assert.equal(errorWithMsg.message, 'some error message');
      });
    });
  });
});
