const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
const req = require('request');
const expectFormat = 4;

admin.initializeApp(functions.config().firebase);

exports.weatherGet = functions.firestore.document('Dive/{diveId}').onCreate((snap, context) => {
  let time = snap.data.data().timeStart;
  let lat = snap.data.data().coordinateStart.latitude;
  let lon = snap.data.data().coordinateStart.longitude;
  req(`https://api.darksky.net/forecast/0572265ceb918ccb26859277f09bde18/${lat},${lon},${time}`, (error, response, body)=>{
    if(error){
      console.error(`Could not get weather data with error ${error}`);
      return -1;
    }
    console.log(snap.data.id);
    console.log(`${lat},${lon},${time}`);
    console.log(body);
    return 0;
  });

  return 0;
});

exports.sensorCreate = functions.pubsub.topic('sensorCreate').onPublish((event) =>{
  console.log('Registering sensor');
  let db = admin.firestore();
  let sensorId = event.data.attributes.device_id;
  let rawData = String(atob(event.data.data));
  console.log(`Raw Data: ${rawData}`);

  let sensor = {
    version: rawData.substring(0,1),
    lastUpdated: new Date()

  };

  db.collection('Sensor').doc(sensorId).set(sensor).then(()=>{
    console.log(`Created sensor ${sensorId}`);
    return 0;
  }).catch(error=>{
    console.error(`Could not create sensor ${sensorId} with error ${error}`);
    return -1;
  });

  return 0;
});

exports.diveCreate = functions.pubsub.topic('diveCreate').onPublish((event) => {
  console.log('Creating dive');
  let db = admin.firestore();
  let rawData = String(atob(event.data));
  let sensorId = event.attributes.device_id;
  let diveData = rawData.split(" ");

  let timestamp = Date.now();

  let dive = {
    format: diveData[0],
    sensorId: sensorId,
    sensorDiveId: diveData[1],
    coordinateStart: new admin.firestore.GeoPoint(parseFloat(diveData[2]), parseFloat(diveData[3])),
    coordinateEnd: new admin.firestore.GeoPoint(parseFloat(diveData[4]), parseFloat(diveData[5])),
    sampleCount: parseInt(diveData[6]),
    timeStart: new Date(parseInt(diveData[7])*1000),
    timeEnd: new Date(parseInt(diveData[8])*1000),
    createdAt: timestamp,
    lastUpdatedAt: timestamp 
  };

  // No duplicate dives!
  db.collection('Dive').where(`sensorId`, `==`, sensorId)
		.where(`sensorDiveId`, `==`, dive.sensorDiveId.toString())
		.get()
    .then(snapshot => {
      if (snapshot.size > 0) {
        console.error(`Duplicate dive ${snapshot.docs[0].id}; aborting create!`);
        throw new Error('Already exits');
      }

      db.collection('Dive').add(dive).then(ref => {
        console.log(`Dive ${ref.id} written`);
	return 0;
      }).catch(error => {
        console.error(`Error creating dive with error ${error} raw data ${event.data} attributes ${event.attributes.toString()}`);
        return -1;
      });
      return 0;
  }).catch(err => {
      // TODO: probably ignore the 'Already Exists' error
      console.error(`Error creating dive: ${err}`);
      return -1;
    });

  return 0;
});

exports.diveAppend = functions.pubsub.topic('diveAppend').onPublish((event) => {
  console.log('Appending dive');
  let db = admin.firestore();
  let sensorId = event.attributes.device_id;

  let z85Data = atob(event.data);
  // Debug: this would be VERY shouty in production
  //console.log(`z85 Data (${z85Data.length}): ${z85Data}`);

  let rawData = module.exports.decode(z85Data);
  // Debug: this would be VERY shouty in production
  console.log(`Raw Data (${rawData.length}): ${rawData}`);
 
  let message = { 
	  format: rawData.readUInt8(0),
	  diveId: rawData.readUInt8(1),
	  startTime: rawData.readUInt32LE(2),
	  samples: rawData.readUInt8(6)
  };
  
  if (message.format !== expectFormat) {
        console.error(`Unexpected format code ${message.format}, expected format ${expectFormat}.`);
        return -1;
  }

  db.collection('Dive').where(`sensorId`, `==`, sensorId)
		.where(`sensorDiveId`, `==`, message.diveId.toString())
		.get()
    .then(snapshot => {
      if (snapshot.size === 0) {
      	console.error(`No dive found matching ${sensorId}, ${message.diveId.toString()}, ${message.startTime}!`)
        throw new Error('No dive found!');
      } else if (snapshot.size > 1) {
        console.error(`Found ${snapshot.size} docs matching ${sensorId}, ${message.diveId.toString()}, ${message.startTime}!`)
        throw new Error('Multiple dives found!');
      }

      let batch = db.batch();
      let timestamp = message.startTime;
      console.log(`Writing to ${snapshot.docs[0].id}: ${message.samples} at ${message.startTime}`);

      for (let offset = 0; offset < message.samples; offset++) {
	timestamp = message.startTime + offset;
	// timestamp is ID -- avoid need to de-duplicate
	batch.set(db.collection('Dive').doc(snapshot.docs[0].id).collection('data').doc(timestamp.toString()),
		{
		  timestamp: timestamp,
		  depth: rawData.readUInt16LE(7 + (6*offset)),
		  temp1: rawData.readUInt16LE(9 + (6*offset))/200.0 - 50,
		  temp2: rawData.readUInt16LE(11 + (6*offset))/200.0 - 50
      		});
      }

      batch.commit().catch(err=>{
      	  console.error(`Error during batch commit: ${err}`);
      	  return -1;
      });
      
      console.log(`Write sucess on ${snapshot.docs[0].id}: ${message.samples} at ${message.startTime}`);

      return 0;
    }).catch(err => {
      console.error(`Error before batch commit: ${err}`);
      return -1;
    });

  return 0;
});

exports.diveDone = functions.pubsub.topic('diveDone').onPublish((event) => {
  console.log('Closing dive');
  // Initially, use same data format as diveCreate; can verify field match
  let db = admin.firestore();
  let rawData = String(atob(event.data));
  let sensorId = event.attributes.device_id;
  let diveData = rawData.split(" ");

  let dive = {
    format: diveData[0],
    sensorId: sensorId,
    sensorDiveId: diveData[1],
    coordinateStart: new admin.firestore.GeoPoint(parseFloat(diveData[2]), parseFloat(diveData[3])),
    coordinateEnd: new admin.firestore.GeoPoint(parseFloat(diveData[4]), parseFloat(diveData[5])),
    sampleCount: parseInt(diveData[6]),
    timeStart: new Date(parseInt(diveData[7])*1000),
    timeEnd: new Date(parseInt(diveData[8])*1000)
  };

  // TODO: verify that all samples have been received before closing
  db.collection('Dive').where(`sensorId`, `==`, sensorId)
		.where(`sensorDiveId`, `==`, dive.sensorDiveId.toString())
		.get()
    .then(snapshot => {
      if (snapshot.size === 0) {
      	console.error(`No dive found matching ${sensorId}, ${dive.sensorDiveId.toString()}!`)
        throw new Error('No dive found!');
      } else if (snapshot.size > 1) {
        console.error(`Found ${snapshot.size} docs matching ${sensorId}, ${dive.sensorDiveId.toString()}!`)
        throw new Error('Multiple dives found!');
      }

      console.log(`Closing out dive ${snapshot.docs[0].id}`);
      let data = snapshot.docs[0].data();
      data.lastUpdatedAt = Date.now();
      data.sensorDiveId = "_"+data.sensorDiveId;
      
      db.collection('Dive').doc(snapshot.docs[0].id).set(data).catch(err=>{
        console.error(`Error during dive close: ${err}`);
        return -1;
      });
    return 0;
  }).catch(err => {
    console.error(`Error before dive close: ${err}`);
    return -1;
  });

  return 0;
});

exports.escapeHatch = functions.https.onRequest((req, res) => {
  res.status(200);
});

//  --------------------------------------------------------------------------
// CODE BELOW IS FROM:
// https://github.com/msealand/z85.node/blob/master/index.js
// (with slight compatibility edits)
/*
The MIT License (MIT)

Copyright (c) 2014 Michael Sealand

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//  --------------------------------------------------------------------------

// Implements http://rfc.zeromq.org/spec:32
// Ported from https://github.com/zeromq/libzmq/blob/8cda54c52b08005b71f828243f22051cdbc482b4/src/zmq_utils.cpp#L77-L168

var encoder = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#".split("");

var decoder = [
    0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00, 
    0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45, 
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
    0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47, 
    0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 
    0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32, 
    0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 
    0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00, 
    0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 
    0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 
    0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
];
/*
module.exports.encode = function(data) {
	if ((data.length % 4) !== 0) {
		return null;
	}
	
	var str = "",
		byte_nbr = 0,
		size = data.length,
		value = 0;
	while (byte_nbr < size) {
		var characterCode;
		if (typeof data === 'string') {
			characterCode = data.charCodeAt(byte_nbr++);
		} else {
			characterCode = data[byte_nbr++];
		}
		value = (value * 256) + characterCode;
		if ((byte_nbr % 4) === 0) {
			var divisor = 85 * 85 * 85 * 85;
			while (divisor >= 1) {
				var idx = Math.floor(value / divisor) % 85;
				str += encoder[idx];
				divisor /= 85;
			}
			value = 0
		}
	}
	
	return str;
}
*/

module.exports.decode = function(string) {
	if ((string.length % 5) !== 0) {
		return null;
	}
	
	var dest = new Buffer(string.length * 4 / 5),
		byte_nbr = 0,
		char_nbr = 0,
		string_len = string.length,
		value = 0;
	while (char_nbr < string_len) {
		var idx = string.charCodeAt(char_nbr++) - 32;
		if ((idx < 0) || (idx >= decoder.length)) {
			//delete dest;
			return;
		}
		value = (value * 85) + decoder[idx];
		if ((char_nbr % 5) === 0) {
			var divisor = 256 * 256 * 256;
			while (divisor >= 1) {
				dest[byte_nbr++] = (value / divisor) % 256;
				divisor /= 256;
			}
			value = 0;
		}
	}
	
	return dest;
}
