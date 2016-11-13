// Rocky.js
var rocky = require('rocky');

// Global object to store weather data
var weather;

var hourColor = "red";
var fontFamily = "Droid-serif";
var fontSize = "12px";

var week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


rocky.on('hourchange', function(event) {
  // Send a message to fetch the weather information (on startup and every hour)
  rocky.postMessage({'fetch': true});
});

rocky.on('minutechange', function(event) {
  // Tick every minute
  rocky.requestDraw();
});

rocky.on('message', function(event) {
  // Receive a message from the mobile device (pkjs)
  var message = event.data;

  if (message.weather) {
    // Save the weather data
    weather = message.weather;

    // Request a redraw so we see the information
    rocky.requestDraw();
  }
});

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Draw the conditions (before clock hands, so it's drawn underneath them)
  if (weather) {
    drawWeather(ctx, weather);
  }
	
	 drawCalendar(ctx);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Determine the center point of the display
  // and the max size of watch hands
  var cx = w / 2;
  var cy = h / 2;

  // -20 so we're inset 10px on each side
  var maxLength = (Math.min(w, h) - 20) / 2;

  // Calculate the minute hand angle
	 var _minutes = d.getMinutes();
  var minuteFraction = _minutes / 60;
  var minuteAngle = fractionToRadian(minuteFraction);
	
	 if(_minutes >= 30){
				_minutes = _minutes - 30;
		}else if(_minutes < 30){
			 _minutes = _minutes + 30;
		}
	
  var minuteReverseAngle = fractionToRadian(_minutes / 60);

  // Draw the minute hand
  drawHand(ctx, cx, cy, minuteAngle, minuteReverseAngle, maxLength, 'white');

  // Calculate the hour hand angle
	 var _hour = d.getHours();
  var hourFraction = (_hour % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);
		
	if(_hour >= 6){
				_hour =  _hour - 6;
		}else if(_hour < 6){
			 _hour = _hour + 6;
		}
	
  var hourReverseAngle = fractionToRadian((_hour % 12 + ( minuteFraction)) / 12);

  // Draw the hour hand
  drawHand(ctx, cx, cy, hourAngle, hourReverseAngle, maxLength * 0.6, hourColor);
		
	 drawRound(ctx, cx, cy, hourColor);
});


function drawCalendar(ctx) {
  var currentTime = new Date();
	
	 var topCalendar = week[currentTime.getDay()] + " " + currentTime.getDate();
	 var bottomCalendar = monthNames[currentTime.getMonth()] + " " + currentTime.getFullYear();
	
	 var Wposition = 30;
	
  // Draw the text, top center
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font = fontSize + ' ' + fontFamily;
  ctx.fillText(topCalendar, Wposition, ctx.canvas.unobstructedHeight/2 - 18);
  ctx.fillText(bottomCalendar, Wposition, ctx.canvas.unobstructedHeight/2);
}
function drawWeather(ctx, weather) {
  // Create a string describing the weather
  //var weatherString = weather.celcius + 'ºC, ' + weather.desc;
  var weatherString = weather.fahrenheit + 'ºF';
	 var weatherDesc = weather.desc;
	
	var Wposition = ctx.canvas.unobstructedWidth - 20;

  // Draw the text, top center
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font = fontSize + ' ' + fontFamily;
  ctx.fillText(weatherString, Wposition, ctx.canvas.unobstructedHeight/2 - 18);
  ctx.fillText(weatherDesc, Wposition, ctx.canvas.unobstructedHeight/2);
}

function drawHand(ctx, cx, cy, angle, reverseAngle, length, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);  
	 ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
	
	 drawOtherSide(ctx, cx, cy, reverseAngle, 10, color);
}

function drawOtherSide(ctx, cx, cy, angle, length, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);  
	 ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}


function drawRound(ctx, cx, cy, color) {
		ctx.fillStyle = color;
		ctx.rockyFillRadial(cx, cy, 0, 6, 0, 2 * Math.PI);
}

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}
