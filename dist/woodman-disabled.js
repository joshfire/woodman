/*! Woodman - v0.1.4 - 2013-02-01 - https://github.com/joshfire/woodman
Copyright 2013 Joshfire; MIT license */

/* Disabled distribution */

(function(e,t){var n=null,r=function(e,t,r){n=r()};r("woodman-disabled",[],function(){var e=function(){},t=function(){arguments&&arguments.length>0&&arguments[arguments.length-1]()};return{registerAppender:e,registerLayout:e,load:t,unload:t,initialize:t,start:t,stop:e,getLogger:function(){return{log:e,info:e,warn:e,error:e}}}}),t?t("woodman",n):typeof module!="undefined"&&module.exports&&(t=require("amdefine")(module),t(n)),e&&(e.woodman=n)})(typeof window!="undefined"?window:this,typeof define=="function"?define:null);