var fs = require('fs');
var precompile = require('./precompile');

var args = process.argv;
var inputFile = '';
var input = '';
var outputFile = '';
var output = '';
var opts = {};
var callback;

// INFO : args[0] == 'node', args[1] == 'precompiler.js'
if(args.length > 2){
  inputFile = args[2];
}
if(args.length > 3){
  outputFile = args[3];
}
if(args.length > 4){
  opts = args[4];
}
if(args.length > 5){
  callback = args[5];
}

if(inputFile !== ''){
  input = fs.readFileSync(inputFile, 'utf8');
  output = precompile(input, opts);

  if (outputFile) {
    fs.writeFileSync(outputFile, output);
  }
  else {
    console.log(output);
  }
}
else {
  console.error('You need to enter an input file as first argument');
}
