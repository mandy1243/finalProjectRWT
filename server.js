// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080); //this will be part of URL when we access our page

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	/*
  	res.writeHead(200);
  	res.end("Life is wonderful");
  	*/
}

/////////////////////////////////
// READING THE JSON FILE
var wordData = fs.readFileSync('words.json');

//node file system is reading raw data, doesn't know I want it to be json...
//if i want it to be a javascript object, I need to parse it

// we need to interpret it as JSON
var words = JSON.parse(wordData);
var newWord;

console.log(words);

// GETTING A TIMESTAMP
// var theDate = new Date();
// console.log(theDate);

/////////////////////////////////
// WEBSOCKET PORTION

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', 

	function (socket) {
	
		console.log("We have a new client: " + socket.id);

		///MY SOCKET EVENTS HERE

		socket.on('getArray', function(){
			console.log("client connected, sending array");
			io.sockets.emit('getArray', words);
		});

		// socket.on('personalComment', function(data){
		// 	console.log("send back personalComment");
		// 	console.log('pushed data to the array');

		// 	//NEED TO TURN TO TEXT BASED DATA TO WRITE TO JSON FILE
		// 	io.sockets.emit('simpleComment', newWord);
		// });

		//event for when someone submits data
		socket.on('chatmessage', function(data){
			console.log('received: ' + data);

			//add to our array
			// words.push(data);
			words.unshift(data);
			console.log('pushed data to the array');

			//NEED TO TURN TO TEXT BASED DATA TO WRITE TO JSON FILE
			//opposite of 'parse' is 'stringify'
			var dataToWrite = JSON.stringify(words);
			console.log(words);

			// write it the file
			fs.writeFile('words.json', dataToWrite, function(callback){
				console.log('data added');

				//print our array so that we know it was added
				// console.log(words);
			});
			console.log(words);

			//send the array to everyone
			io.sockets.emit('allWords', words);
			
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);