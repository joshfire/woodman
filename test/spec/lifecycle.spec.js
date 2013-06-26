/**
 * @fileoverview Tests for the LifeCycle class
 */
/*global define, describe, it, expect, beforeEach, jasmine*/

define(function (require) {
  var LifeCycle = require('../../lib/lifecycle');

  describe('LifeCycle class', function () {

    beforeEach(function () {
      /**
       * Returns true when actual level is below the expected trace level
       */
      this.addMatchers({
        toBeStarted: function () {
          var not = this.isNot ? 'NOT ': '';

          this.message = function () {
            return 'Expected object ' + not +
              'to be started';
          };

          return this.actual.isStarted();
        }
      });
    });


    it('needs to be started after instantiation', function () {
      var lifeCycle = new LifeCycle();
      expect(lifeCycle).not.toBeStarted();
    });


    it('starts when stopped', function () {
      var lifeCycle = new LifeCycle();
      lifeCycle.start();
      expect(lifeCycle).toBeStarted();
    });


    it('stops when started', function () {
      var lifeCycle = new LifeCycle();
      lifeCycle.start();
      expect(lifeCycle).toBeStarted();
      lifeCycle.stop();
      expect(lifeCycle).not.toBeStarted();
    });


    it('calls the callback function when started', function () {
      var func = jasmine.createSpy();
      var lifeCycle = new LifeCycle();
      lifeCycle.start(func);
      expect(func).toHaveBeenCalled();
    });


    it('calls the callback function when stopped', function () {
      var func = jasmine.createSpy();
      var lifeCycle = new LifeCycle();
      lifeCycle.start();
      lifeCycle.stop(func);
      expect(func).toHaveBeenCalled();
    });
  });
});