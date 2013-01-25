var fs = require('fs');
var precompile = require('./precompile');

var args = process.argv;
var inputFile = '';
var input = '';
var outputFile = '';
var output = '';
var opts = {};
var callback;
var indexArg = 0;

// INFO : args[0] == 'node', args[1] == 'precompiler.js'
var reg = new RegExp('-level.*', "gi");
var level = -1;
var ind;
for(var i = 0, c = args.length; i < c; i++){
  ind = args[i].search(reg);
  if(ind !== -1){
    level = i;
    opts.keepLevel = args[ i + 1 ].split(',');
  }
}
if(level !== -1){
  indexArg = level + 2;
}
else{
  indexArg = 2;
}


if(args.length > indexArg){
  inputFile = args[indexArg];
}
if(args.length > (indexArg + 1)){
  outputFile = args[indexArg + 1];
}

// var folder = fs.readdirSync('precompile');
// if(!folder) return;
// var inputFileName;
// for(var i = 0, c = folder.length; i < c; i++){
//   inputFileName = folder[ i ];
//   if(inputFileName.indexOf('.js')){
//     outputFileName = inputFileName;
//   }
// }
// console.log(folder);

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
