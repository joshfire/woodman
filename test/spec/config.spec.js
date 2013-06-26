/**
 * @fileoverview Tests on logger configuration
 */
/*global define, describe, it, expect*/

define(function (require) {
  var Appender = require('../../lib/appender');
  var Layout = require('../../lib/layout');
  var LoggerContext = require('../../lib/loggercontext');
  var RegexFilter = require('../../lib/filters/regexfilter');

  describe('Logger initialization', function () {

    it('creates appenders in "appenders" property', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          },
          {
            type: 'Appender',
            name: 'console',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic',
              'console'
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(2);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[1].name).toEqual('console');
    });


    it('creates appenders referenced in an "appenders-ref" property', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          },
          {
            type: 'Appender',
            name: 'console',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            'appender-ref': [
              { ref: 'basic' },
              { ref: 'console' }
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(2);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[1].name).toEqual('console');
    });


    it('creates appenders defined inline', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        loggers: [
          {
            root: true,
            appenders: [
              {
                type: 'Appender',
                name: 'basic',
                layout: {
                  type: 'Layout'
                }
              },
              {
                type: 'Appender',
                name: 'console',
                layout: {
                  type: 'Layout'
                }
              }
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(2);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[1].name).toEqual('console');
    });


    it('creates appenders defined with keys', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: {
          Appender: [
            {
              name: 'basic',
              layout: {
                type: 'Layout'
              }
            },
            {
              name: 'basic2',
              layout: {
                type: 'Layout'
              }
            }
          ],
          ConsoleAppender: {
            name: 'console',
            layout: {
              type: 'Layout'
            }
          }
        },
        loggers: [
          {
            root: true,
            appenders: [
              'basic',
              'basic2',
              'console'
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(3);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[1].name).toEqual('basic2');
      expect(rootLogger.appenders[2].name).toEqual('console');
    });


    it('creates appenders with a mix of inline reference and definitions', function () {
      var log = new LoggerContext();

      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          },
          {
            type: 'Appender',
            name: 'console',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic',
              {
                type: 'Appender',
                name: 'basic2',
                layout: {
                  type: 'Layout'
                }
              },
              'console'
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(3);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[1].name).toEqual('basic2');
      expect(rootLogger.appenders[2].name).toEqual('console');
    });


    it('creates layout defined inline', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerLayout('PatternLayout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            PatternLayout: {}
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ]
          }
        ]
      });

      var rootLogger = log.getLogger();
      expect(rootLogger.appenders.length).toEqual(1);
      expect(rootLogger.appenders[0].name).toEqual('basic');
      expect(rootLogger.appenders[0].getLayout()).toBeTruthy();
    });


    it('sets up loggers with the right trace level', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('spec.loggercontext.hierarchy');
      var parentLogger = log.getLogger('spec.loggercontext');
      var greatParentLogger = log.getLogger('spec');
      var rootLogger = log.getLogger();

      log.registerAppender('Appender', Appender);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ],
            level: 'error'
          },
          {
            name: 'spec.loggercontext.hierarchy',
            level: 'info'
          },
          {
            name: 'spec',
            level: 'warn'
          }
        ]
      });

      expect(logger).toHaveLevel('info');
      expect(parentLogger).toHaveLevel('warn');
      expect(greatParentLogger).toHaveLevel('warn');
      expect(rootLogger).toHaveLevel('error');
    });


    it('sets up context-wide filters', function () {
      var log = new LoggerContext();

      log.registerAppender('Appender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.initialize({
        filters: [
          {
            type: 'RegexFilter',
            regex: 'timber'
          }
        ],
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ],
            level: 'error'
          },
          {
            name: 'spec.loggercontext.hierarchy',
            level: 'info'
          },
          {
            name: 'spec',
            level: 'warn'
          }
        ]
      });

      expect(log.filter).not.toBeNull();
      expect(log.filter).toBeInstanceOf(RegexFilter);
      expect(log.filter.regex).toEqual(/timber/);
    });


    it('sets up context-wide filters defined as objects', function () {
      var log = new LoggerContext();

      log.registerAppender('Appender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.initialize({
        filters: {
          RegexFilter: [
            {
              regex: 'timber'
            },
            {
              regex: 'hello'
            }
          ]
        },
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ],
            level: 'error'
          },
          {
            name: 'spec.loggercontext.hierarchy',
            level: 'info'
          },
          {
            name: 'spec',
            level: 'warn'
          }
        ]
      });

      expect(log.filter).not.toBeNull();
      expect(log.filter.filters.length).toEqual(2);
    });


    it('sets up logger filters', function () {
      var log = new LoggerContext();
      var logger = null;

      log.registerAppender('Appender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ],
            level: 'error'
          },
          {
            name: 'spec.loggercontext.hierarchy',
            level: 'info'
          },
          {
            name: 'spec',
            level: 'warn',
            filters: [
              {
                type: 'RegexFilter',
                regex: 'timber'
              }
            ]
          }
        ]
      });

      logger = log.getLogger('spec');
      expect(log.filter).toBeNull();
      expect(logger.filter).not.toBeNull();
      expect(logger.filter.regex).toEqual(/timber/);
    });


    it('sets up appender filters', function () {
      var log = new LoggerContext();
      var logger = null;

      log.registerAppender('Appender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.initialize({
        appenders: [
          {
            type: 'Appender',
            name: 'basic',
            layout: {
              type: 'Layout'
            },
            filters: {
              RegexFilter: {
                regex: 'timber'
              }
            }
          }
        ],
        loggers: [
          {
            root: true,
            appenders: [
              'basic'
            ],
            level: 'error'
          },
          {
            name: 'spec.loggercontext.hierarchy',
            level: 'info'
          },
          {
            name: 'spec',
            level: 'warn'
          }
        ]
      });

      logger = log.getLogger();
      expect(log.filter).toBeNull();
      expect(logger.filter).toBeNull();
      expect(logger.appenders[0].filter).not.toBeNull();
      expect(logger.appenders[0].filter.regex).toEqual(/timber/);
    });


    it('throws an error when config is invalid', function () {
      var init = function () {
        var log = new LoggerContext();
        log.initialize({
          loggers: [
            {
              name: 'woodman',
              level: 'all',
              appenders: [
                {
                  name: 'append',
                  type: 'kesako'
                }
              ]
            }
          ]
        });
      };
      expect(init).toThrow();
    });


    it('passes the error to the callback when config is invalid', function () {
      var log = new LoggerContext();
      log.load({
        loggers: [
          {
            name: 'woodman',
            level: 'all',
            appenders: [
              {
                name: 'append',
                type: 'kesako'
              }
            ]
          }
        ]
      }, function (err) {
        expect(err).toBeTruthy();
      });
      expect(log).not.toBeStarted();
    });
  });
});