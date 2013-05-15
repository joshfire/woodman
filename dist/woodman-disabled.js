/*!
Woodman - v0.4.1 - 2013-05-15
 Copyright 2013 Joshfire; MIT license
 https://github.com/joshfire/woodman

Based on log4j v2.0:
 Copyright © 1999-2013 Apache Software Foundation. All Rights Reserved.
 Apache License, Version 2.0
 http://logging.apache.org/log4j/2.x/
*/
(function(e,t){var n=null,r=function(e,t,r){n=r()};r("woodman-disabled",[],function(){var e=function(){},t=function(){arguments&&arguments.length>0&&arguments[arguments.length-1]()};return{registerAppender:e,registerFilter:e,registerLayout:e,load:t,unload:t,initialize:t,start:t,stop:e,getLogger:function(){return{log:e,info:e,warn:e,error:e}}}}),t?t("woodman",n):typeof module!="undefined"&&module.exports&&(t=require("amdefine")(module),t(n)),e&&(e.woodman=n)})(typeof window!="undefined"?window:this,typeof define=="function"?define:null);