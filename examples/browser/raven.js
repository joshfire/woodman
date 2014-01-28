/*global woodman,Raven*/

// install raven first
Raven.config("http://sentry_key@sentry_host:sentry_port/sentry_project").install();

var config = {
  appenders: [ {
    name: "raven_appender",
    type: "raven",
    raven: Raven, /* this must be set to the Raven object from Raven-js */
    layout: { /* unused, as the raw data must be sent to Sentry, but required by Woodman */
      type: "pattern",
      pattern: "%message"
    }
  } ],
  loggers: [ {
    name: "raven.logger",
    appenders: ["raven_appender"]
  } ]
};

woodman.load(config, function (err) {
  if (err) throw err;

  var logger = woodman.getLogger('raven.logger');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');

  logger.error('This is a fatal error', { level: "fatal" });
  logger.error('This error has tags', { tags: { cdn: "horus", component: "router" } });
  logger.info('This info has extra data in the option object', { extra: { ticket: "43566" } });
  logger.info('This info has extra data and no option', 'extra1', 'extra2', 'extra3', null);
  logger.info('This info has two extras and options', 'extra1', { tags: { foo: "bar"}, extra: { key2: "extra2" } });
});
