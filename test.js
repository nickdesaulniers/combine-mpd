var util = require('util');
var xml2js = require('xml2js');
var fsp = require('fs-promise');

var parser = new xml2js.Parser;

function log (msg) {
  console.log(util.inspect(msg, false, null))
};

if (process.argv.length < 4) {
  console.error('usage: node test.js input.mpd output.mpd');
  process.exit(1);
}

function parseXML (info) {
  return new Promise(function (resolve, reject) {
    parser.parseString(info, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

function logKeys (obj) {
  console.log(Object.keys(obj));
};

var adaptationCount = 0;
var representationCount = 0;
function renumberAdaptationSets (periodTag) {
  periodTag.forEach(function (period) {
    var adaptationSetTag = period.AdaptationSet;
    adaptationSetTag.forEach(function (adaptationSet) {
      adaptationSet.$.id = adaptationCount++;
      var representationTag = adaptationSet.Representation;
      representationTag.forEach(function (representation) {
        representation.$.id = representationCount++;
      });
    });
  });
};

function combineXML (values) {
  return new Promise(function (resolve, reject) {
    var result = null;
    values.forEach(function (value, i) {
      renumberAdaptationSets(value.MPD.Period);
      if (i === 0) {
        result = value;
      } else {
        value.MPD.Period.forEach(function (period) {
          period.AdaptationSet.forEach(function (adaptationSet) {
            result.MPD.Period[0].AdaptationSet.push(adaptationSet);
          });
        });
      }
    });
    resolve(result);
    // should reject on try/catch
  });
};

function writeXML (value) {
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(value);

    var filename = process.argv[process.argv.length - 1];
    console.log(filename);
    return fsp.writeFile(filename, xml + '\n');
};

var parsedXML = [];
for (var i = 2; i < process.argv.length - 1; ++i) {
  parsedXML.push(fsp.readFile(process.argv[i]).then(parseXML));
}
Promise.all(parsedXML).then(combineXML).then(writeXML).then(function () {
  console.log('done');
});

//.then(function (value) {
  //console.log(value);
//});

//a.then(function (result) {
  //console.log(result);
//});

//console.log('a: ', a);

//fs.readFile(process.argv[2], function (err, data) {
  //if (err) throw err;

  //parser.parseString(data, function (err, result) {
    //if (err) throw err;

    ////log(result);
    //log(result.MPD.Period);

    //var builder = new xml2js.Builder();
    //var xml = builder.buildObject(result);

    //fs.writeFile(process.argv[3], xml + '\n', function (err) {
      //if (err) throw err;
    //});
  //});
//});
