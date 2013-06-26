/**
 * @fileoverview Tests for the Message class
 */
/*global define, describe, it, expect*/

define(function (require) {
  var Message = require('../../lib/message');

  describe('Message class', function () {

    it('formats a string parameter appropriately', function () {
      var message = new Message();
      var str = message.getFormattedParam('timber!');
      expect(str).toEqual('timber!');
    });


    it('formats a regular object parameter as a JSON string', function () {
      var message = new Message();
      var obj = {
        name: 'timber!',
        sub: {
          foo: 'bar',
          bar: 'baz'
        }
      };
      var str = message.getFormattedParam(obj);
      expect(str).toEqual(JSON.stringify(obj, null, 2));
    });


    it('calls toString to format an object param when possible', function () {
      var message = new Message();
      var obj = {
        name: 'timber!',
        sub: {
          foo: 'bar',
          bar: 'baz'
        }
      };
      obj.toString = function () {
        return 'I do not want to be a string';
      };
      var str = message.getFormattedParam(obj);
      expect(str).toEqual('I do not want to be a string');
    });


    it('calls toString to format an error parameter', function () {
      var message = new Message();
      var obj = new TypeError('Oh no!');
      var str = message.getFormattedParam(obj);
      expect(str).toEqual('TypeError: Oh no!');
    });


    it('formats an object parameter at the right depth', function () {
      var message = new Message();
      var obj = {
        name: 'timber!',
        sub: {
          foo: 'bar',
          bar: 'baz'
        }
      };
      var str = message.getFormattedParam(obj, { objectDepth: 1 });
      expect(str).toEqual(JSON.stringify({
        name: 'timber!',
        sub: '…'
      }, null, 2));
    });


    it('formats an object parameter in compacted form', function () {
      var message = new Message();
      var obj = {
        name: 'timber!',
        sub: {
          foo: 'bar',
          bar: 'baz'
        }
      };
      var str = message.getFormattedParam(obj, { compactObjects: true });
      expect(str).toEqual(JSON.stringify(obj));
    });


    it('serializes a simple message string', function () {
      var message = new Message('Hello world!');
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello world!');
    });


    it('concatenates message parameters separated with a space', function () {
      var message = new Message(['Hello', 'world', '!']);
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello world !');
    });


    it('concatenates message parameters using provided separator', function () {
      var message = new Message(['Hello', 'world', '!']);
      var str = message.getFormattedMessage({
        separator: '|'
      });
      expect(str).toEqual('Hello|world|!');
    });


    it('detects format string and parameters', function () {
      var message = new Message(['Hello {}', 'world', '!']);
      expect(message.getFormat()).toEqual('Hello {}');
      expect(message.getParameters()).toEqual(['world', '!']);
    });


    it('substitutes {} in format string', function () {
      var message = new Message(['Hello {}', 'world']);
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello world');
    });


    it('concatenates remaining parameters', function () {
      var message = new Message(['Hello {}', 'world', '!']);
      var str = message.getFormattedMessage({
        separator: ''
      });
      expect(str).toEqual('Hello world!');
    });


    it('substitutes {} with an empty string for missing parameters', function () {
      var message = new Message(['Hello {}']);
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello ');
    });


    it('substitutes {} with object serialization', function () {
      var message = new Message(['Hello {}', { name: 'toto' }]);
      var str = message.getFormattedMessage({
        compactObjects: true
      });
      expect(str).toEqual('Hello {"name":"toto"}');
    });


    it('substitutes {} with param\'s toString when possible', function () {
      var obj = {
        name: 'toto'
      };
      obj.toString = function () {
        return obj.name;
      };
      var message = new Message(['Hello {}', obj]);
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello toto');
    });


    it('formats parameters as an array of strings', function () {
      var message = new Message(['Hello', { internet: 'of things' }, '!']);
      var result = message.getFormattedParams();
      expect(result).toEqual([
        'Hello',
        '{\n  "internet": "of things"\n}',
        '!'
      ]);
    });


    it('preserves objects when requested', function () {
      var message = new Message(['Hello', { internet: 'of things' }, '!']);
      var result = message.getFormattedParams({
        preserveObjects: true
      });
      expect(result).toEqual([
        'Hello',
        { internet: 'of things' },
        '!'
      ]);
    });


    it('substitutes and preserves objects when requested', function () {
      var message = new Message([
        'Hello {}', 'world',
        { internet: 'of things' },
        '!'
      ]);
      var result = message.getFormattedParams({
        preserveObjects: true
      });
      expect(result).toEqual([
        'Hello world',
        { internet: 'of things' },
        '!'
      ]);
    });


    it('does not preserve objects in substitutions', function () {
      var message = new Message([
        'Hello {}',
        { internet: 'of things' },
        '!'
      ]);
      var result = message.getFormattedParams({
        preserveObjects: true,
        compactObjects: true
      });

      expect(result).toEqual([
        'Hello {"internet":"of things"}',
        '!'
      ]);
    });

    it('does not crash when logging an undefined value', function () {
      var message = new Message();
      var str = message.getFormattedParam(undefined);
      expect(str).toEqual('undefined');
    });


    it('preserves the end of the format string when {} is used', function () {
      var message = new Message(['Hello {} world', 'beautiful']);
      var str = message.getFormattedMessage();
      expect(str).toEqual('Hello beautiful world');
    });
  });
});