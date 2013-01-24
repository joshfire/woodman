var precompile = require('./precompile');

var args = process.argv;
var input = '';
var output = 'a.js';
var opts = {};
var callback;

// INFO : args[0] == 'node', args[1] == 'precompiler.js'
if(args.length > 2){
  input = args[2];
}
if(args.length > 3){
  output = args[3];
}
if(args.length > 4){
  opts = args[4];
}
if(args.length > 5){
  callback = args[5];
}

if(input !== ''){
  precompile(input, output, opts, callback);
}
else{
  console.error('You need to enter an input file as first argument');
}
