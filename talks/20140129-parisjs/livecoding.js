/*global woodman*/
/************************************************************
Premiers pas
************************************************************/
// Démarrer Woodman avec une configuration de base
// (à faire une fois pour toutes au chargement de l’application)
woodman.load('console');

// Récupérer un logger pour le module ou le scope courant
// (par module/scope à identifier dans les logs)
var logger = woodman.getLogger('slides');

// Ecrire des messages
logger.log('Salut Woodman');
logger.info('Ceci n’est pas une pipe');
logger.warn('Résultat étonnant', { result: 42, operation: '6x7' });
logger.error('Oh non !', 'J’ai tout cassé !');
logger.log('Ceci est {} {}', 'une', 'substitution');




/************************************************************
Le raccourci "console"
************************************************************/
woodman.load({
  loggers: [
    {
      root: true,
      level: 'log',
      appenders: [ 'theconsole' ]
    }
  ],
  appenders: [
    {
      name: 'theconsole',
      type: 'Console',
      appendStrings: false,
      layout: {
        type: 'PatternLayout',
        pattern: '%date{yyyy-MM-dd HH:mm:ss} [%logger] %message%n'
      }
    }
  ]
});
var logger = woodman.getLogger('slides');
logger.log('Un log');
logger.info('Une info');
logger.warn('Une alerte');
logger.error('Une erreur');




/************************************************************
Changer le niveau
************************************************************/
woodman.load({
  loggers: [
    {
      root: true,
      level: 'warn',
      appenders: [ 'theconsole' ]
    }
  ],
  appenders: [
    {
      name: 'theconsole',
      type: 'Console',
      appendStrings: false,
      layout: {
        type: 'PatternLayout',
        pattern: '%date{yyyy-MM-dd HH:mm:ss} [%logger] %message%n'
      }
    }
  ]
});
var logger = woodman.getLogger('slides');
logger.log('Un log filtré');
logger.info('Une info filtrée');
logger.warn('Une alerte affichée');
logger.error('Une erreur affichée');




/************************************************************
Faire taire un module
************************************************************/
woodman.load({
  loggers: [
    {
      root: true,
      level: 'log',
      appenders: [ 'theconsole' ]
    },
    {
      name: 'slides',
      level: 'off'
    },
    {
      name: 'slides.shout',
      level: 'warn'
    }
  ],
  appenders: [
    {
      name: 'theconsole',
      type: 'Console',
      appendStrings: false,
      layout: {
        type: 'PatternLayout',
        pattern: '%date{yyyy-MM-dd HH:mm:ss} [%logger] %message%n'
      }
    }
  ]
});
var logger = woodman.getLogger('slides');
var sublogger = woodman.getLogger('slides.sub');
var shoutlogger = woodman.getLogger('slides.shout');
logger.warn('Cette alerte est filtrée');
sublogger.warn('Cette alerte d’un sous-module est filtrée');
shoutlogger.warn('Cette alerte du sous-module "shout" n’est pas filtrée');


/************************************************************
Envoyer les logs sur un serveur via Socket.IO
************************************************************/
woodman.load({
  loggers: [
    {
      root: true,
      level: 'log',
      appenders: [ 'theconsole', 'remoteserver' ]
    }
  ],
  appenders: [
    {
      name: 'theconsole',
      type: 'Console',
      appendStrings: false,
      layout: {
        type: 'PatternLayout',
        pattern: '[%logger] %message%n'
      }
    },
    {
      type: 'SocketAppender',
      name: 'remoteserver',
      url: 'http://localhost:40031',
      layout: {
        type: 'pattern',
        pattern: '%date{ISO8601} [%highlight{%level}] %logger - %message'
      },
      appendStrings: true
    }
  ]
});
var logger = woodman.getLogger('slides');
logger.log('Un log');
logger.info('Une info');
logger.warn('Une alerte');
logger.error('Une erreur');