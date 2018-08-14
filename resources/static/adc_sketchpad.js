/*
*	instanceId {Integer} ID of the current adc
* 	Return the DOM element of the current adc
*/
function getElementByDynamicId(elementId, instanceId) {
    return document.getElementById(elementId + "_" + instanceId);
}


/*
*	instanceId {Integer} ID of the current adc
* 	Return the uploadConfig variable containing properties of the current adc
*/
function uploadConfig(instanceId) {
	return eval('uploadConfig_' + instanceId);
}


var canvas, ctx;
var mouseX, mouseY, mouseDown = 0, lastX, lastY;
var touchX,touchY;

/*
*  ctx {CanvasRenderingContext2D} The drawing context on the canvas
*  x {Integer} abscissa in px
*  y {Integer} ordinate in px
*  Draw a dot or a line to the next dot
*/
function draw(ctx, x, y) {
    var instanceId = canvas.id.split("_")[1];
    if (lastX && lastY && (x !== lastX || y !== lastY)) {
        ctx.strokeStyle = "rgb("+uploadConfig(instanceId).drawingColor+")";
        ctx.lineWidth = 2 * uploadConfig(instanceId).drawingWidth;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  ctx.fillStyle = "rgb("+uploadConfig(instanceId).drawingColor+")";
  ctx.beginPath();
  ctx.arc(x, y, uploadConfig(instanceId).drawingWidth, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
  lastX = x;
  lastY = y;
}

/*
*  canvas {DOMElement} the canvas
*  ctx {CanvasRenderingContext2D} The drawing context on the canvas
*  instanceId {Integer} ID of the current adc
*  Clear the canvas
*/
function clearCanvas(canvas,ctx, instanceId) {
    if (uploadConfig(instanceId).enableCanvasBgColor == 1) {
        ctx.fillStyle = "rgb("+uploadConfig(instanceId).canvasBgColor+")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
	removeClass(document.getElementById("btnClear_"+instanceId), "primary");
    addClass(document.getElementById("canvasWrapper_"+instanceId), "empty");
}

/*
*  When click on canvas call draw()
*/
function onMouseDown() {
  mouseDown = 1;
  draw(ctx, mouseX, mouseY);
}

/*
*  When stop drawing, reset lastX and lastY (avoid drawing a line between two draws)
*/
function onMouseUp() {
  mouseDown = 0;
  lastX = 0;
  lastY = 0;
}

/*
*  e {Event} When mouse is moving
*  When mouse moving and down, calls draw()
*/
function onMouseMove(e) {
  getMousePos(e);
  if (mouseDown == 1) {
      draw(ctx, mouseX, mouseY);
  }
}

/*
*  e {Event} When user interacts with the canvas
*  Sets the coordinates relative to the canvas 
*/
function getMousePos(e) {
  if (!e)
      var e = event;
  if (e.offsetX) {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
  }
  else if (e.layerX) {
      mouseX = e.layerX;
      mouseY = e.layerY;
  }
 }

/*
*  Calls draw() when user touch the canvas
*/
function touchStart() {
    getTouchPos();
    draw(ctx, touchX, touchY);
    event.preventDefault();
}

/*
*  Calls draw() when user move on the canvas
*/
function touchMove(e) { 
    getTouchPos(e);
    draw(ctx, touchX, touchY); 
    event.preventDefault();
}

/*
*  Reset last coordinates to 0 
*/
function touchEnd() {
  lastX = 0;
  lastY = 0;
}

/*
*  side {String} The type of offset we want
*  Returns the total offset from the canvas 
*/
function getTotalOffset(side) {
    var element = canvas, total = 0;
    while (element) {
        if (side == "left") {
        	total += element.offsetLeft;           
        }
        if (side == "top") {
            total += element.offsetTop;
        }
        element = element.offsetParent;
    }   
    return total;
}

/*
*  e {Event}  When user interacts with the canvas
*  Sets the coordinates relative to the canvas 
*/
function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX = touch.pageX-getTotalOffset("left");
            touchY = touch.pageY-getTotalOffset("top");
        }
    }
}


/*
*  instanceId {Integer} ID of the current adc
*  Initializes the canvas
*/
function initCanvas(instanceId) {
    canvas = document.getElementById("sketchpad_"+instanceId);
    if (canvas.getContext) ctx = canvas.getContext('2d');
    if (ctx) {
        if (uploadConfig(instanceId).enableCanvasBgColor == 1) {
            ctx.fillStyle = "rgb("+uploadConfig(instanceId).canvasBgColor+")";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        canvas.addEventListener("mousedown", function() {
            onMouseDown();
            addClass(document.getElementById("btnClear_"+instanceId), "primary");
            removeClass(document.getElementById("canvasWrapper_"+instanceId), "empty");
        }, false);
        canvas.addEventListener("mousemove", onMouseMove, false);
        window.addEventListener("mouseup", onMouseUp, false);
        
        canvas.addEventListener("touchstart", function() {
            touchStart();
            addClass(document.getElementById("btnClear_"+instanceId), "primary");
            removeClass(document.getElementById("canvasWrapper_"+instanceId), "empty");            
        }, false);
        canvas.addEventListener("touchmove", touchMove, false);
        canvas.addEventListener("touchend", touchEnd, false);
    }
}

/*
*  instanceId {Integer} ID of the current adc
*  Stores the canvas as an image
*/
function captureImage(instanceId) {
    var canvas = document.getElementById("sketchpad_"+instanceId);    
    var img = document.getElementById("sketchpadRes_"+instanceId);
    img.src = canvas.toDataURL('image/jpg');
    addClass(img, "full");
}

/*
*  instanceId {Integer} ID of the current adc
*  Show the overlay 
*/
function showOverlay(instanceId){
    removeClass(getElementByDynamicId("overlay_loader", instanceId),'hidden');
}
/*
*  instanceId {Integer} ID of the current adc
*  Hides the overlay
*/
function hideOverlay(instanceId){
    addClass(getElementByDynamicId("overlay_loader", instanceId),'hidden');
}

/*
* 	ele {DOM Element} Element from the HTML
*	cls {String} A class
* 	Returns a boolean depending on the element ele having the class cls or not
*/
function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

/*
* 	ele {DOM Element} Element from the HTML
*	cls {String} A class
* 	Removes the class cls from element ele, if ele has the class cls
*/
function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}

/*
* 	ele {DOM Element} Element from the HTML
*	cls {String} A class
* 	Add the class cls to the element ele, if ele has not the class cls already
*/
function addClass(ele,cls) {
    if (!hasClass(ele,cls)) {
        ele.className += ' '+ cls;
    }
}


/*
*	instanceId {Integer} ID of the current adc
* 	Upload the captured photo on the server
*/
function uploadImage(instanceId){
	hideErrorMessage(instanceId);
    hideSuccessMessage(instanceId);

    if (!uploadConfig(instanceId).apiKey || !uploadConfig(instanceId).secretKey) {
		displayErrorMessage(uploadConfig(instanceId).ErrMsgInvalidApiSecretKeys, instanceId);
        return;
    }
    if (!hasClass(document.getElementById("canvasWrapper_"+instanceId), "empty")) {
        captureImage(instanceId);
        
        var image_b64 = window.atob(document.getElementById("sketchpadRes_"+instanceId).src.split(",")[1]);
        var tmp = new Uint8Array(image_b64.length);
        for (var i = 0; i < image_b64.length; i++) {
            tmp[i] = image_b64.charCodeAt(i);
        }
        var file = new Blob([tmp], {type: "image/jpg"});

        if(validFileSize(instanceId, file)){
                generateNewToken(function(token){
                    uploadConfig(instanceId).token=token;
                    sendFileTransferCall(instanceId, file);
                }, instanceId);
            }
            else{
                displayErrorMessage(uploadConfig(instanceId).ErrMsgFileSizeExceeded, instanceId);
            }
    } 
	else{
        displayErrorMessage(uploadConfig(instanceId).ErrMsgEmptyCanvas, instanceId);
    }
    clearCanvas(canvas, ctx, instanceId);
}

/*
*	instanceId {Integer} ID of the current adc
*	fileData {Data} Data from the current file
* 	Checks if the current file has a valid size
*/
function validFileSize(instanceId, fileData){
    var filesize = 0;
    var maxsize = uploadConfig(instanceId).maxfilesize;
    if (fileData) {
        filesize = fileData.size / 1024;
    }

    if (fileData && filesize > maxsize) {
        return false;
    }
    return true;
}

/*
*	callback {function} Function to execute 
*	instanceId {Integer} ID of the current adc
* 	Generates tokens for the post call
*/
function generateNewToken(callback, instanceId) {

    var data = {
        ApiKey: uploadConfig(instanceId).apiKey,
        SecretKey: uploadConfig(instanceId).secretKey
    };

    var url = uploadConfig(instanceId).authenticationUrl;

    var generateTokenSuccess = function (token) {
        callback(token);
    };
    var generateTokenError = function (error) {
        hideOverlay(instanceId);
        displayErrorMessage(uploadConfig(instanceId).ErrMsgInvalidApiSecretKeys, instanceId);
    };
    var generateTokenBeforeSend=function(){
        showOverlay(instanceId);
    };

    sendAjaxPostCall(url, data, true, generateTokenSuccess, generateTokenError,generateTokenBeforeSend);

}

/*
*	instanceId {Integer} ID of the current adc
*	fileData {Data} Data from the current file
* 	type {String} Type of file (video or photo)
* 	Generates right url, success and error callbacks and transfers it to sendAjaxPostCall function
*/
function sendFileTransferCall(instanceId, fileData) {
    if(!uploadConfig(instanceId).token){
        displayErrorMessage(uploadConfig(instanceId).ErrMsgToken, instanceId);
        return;
    }

    var projectName = uploadConfig(instanceId).ausProjectName;
    var shortcut = uploadConfig(instanceId).shortcut;
    var seed = uploadConfig(instanceId).seedvalue;
    var guid = uploadConfig(instanceId).guidstring;
    var fileDataName = 'file-name.jpg';

    // clean up guid of curly braces
    if (guid.charAt(0) == "{") guid = guid.substr(1);
    if (guid.charAt(guid.length - 1) == "}") guid = guid.substr(0, guid.length - 1);

    var url=uploadConfig(instanceId).uploadUrl + "?tokenkey=" + uploadConfig(instanceId).token + "&filename=" + fileDataName
    + "&projectname=" + projectName + "&shortcut=" + shortcut + "&seed=" + seed + "&guid=" + guid;

    var uploadSuccessCallback = function (response) {
        getElementByDynamicId("HidResult", instanceId).value=response.DestinationFileName;
        displaySuccessMessage(uploadConfig(instanceId).SuccessMsgUpload, uploadConfig(instanceId).SuccessMsgColor, instanceId);
        hideOverlay(instanceId);
    };
    
    var uploadErrorCallback = function (error) {
        getElementByDynamicId("HidResult", instanceId).value='';
        displayErrorMessage(uploadConfig(instanceId).ErrMsgErrorAtUpload, instanceId);
        hideOverlay(instanceId);
    };

    sendAjaxPostCall(url, fileData, false, uploadSuccessCallback, uploadErrorCallback);

}

/*
* 	url {String} url for the request
*  	data {Data} Data from the current file
* 	isJsonRequest {boolean} Specifies if it is a JSON request or not
*	successCallback {Function} Function to execute after successful request
* 	errorCallback {Function} Function to execute after unsuccessful request
*	beforeSend {Function} Function to execute before sending request (optional)
* 	Send the request and execute the callbacks
*/
function sendAjaxPostCall(url, data, isJsonRequest, successCallback, errorCallback,beforeSend) {
    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    if (isJsonRequest) {
        http.setRequestHeader("Content-type", "application/json");
        data = JSON.stringify(data);
    }

    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            if (http.status == 200) {
                var response = JSON.parse(http.responseText);
                successCallback(response);
            } else {
                var response = JSON.parse(http.responseText);
                errorCallback(response);
            }
        }
    }
    if(beforeSend){
        beforeSend();
    }
    http.send(data);
}

/*
*	message {String} The message to display
*	instanceId {Integer} ID of the current adc
* 	Displays an error message
*/
function displayErrorMessage(message, instanceId){
    hideOverlay(instanceId);
    var div = getElementByDynamicId("adc-errdiv", instanceId);
    addClass(div, "askia-errors-summary");
    div.style.marginBottom = "50px";
    var span = getElementByDynamicId("spanErrorMessages", instanceId);
	span.innerHTML = message;
}

/*
*	message {String} The message to display
*	colorcode {String} Background color of the message - ex: xxx,xxx,xxx
*	instanceId {Integer} ID of the current adc
* 	Displays a success message
*/
function displaySuccessMessage(message, colorcode, instanceId){
    hideOverlay(instanceId);
    var div = getElementByDynamicId("adc-succdiv", instanceId);
    div.style.backgroundColor= 'rgb(' + colorcode + ')';
    div.style.color = 'white';
    div.style.width = '100%';
    div.style.paddingTop = '15px';
    div.style.paddingBottom = '15px';
    div.style.marginBottom = '50px';
    div.style.borderRadius = '3px';
    var span = getElementByDynamicId("spanSuccessMessage", instanceId);
    span.innerHTML = message;
}

/*
*	instanceId {Integer} ID of the current adc
* 	Hides success message
*/
function hideSuccessMessage(instanceId) {
    var div = getElementByDynamicId("adc-succdiv", instanceId);
    div.removeAttribute("style");
    var span = getElementByDynamicId("spanSuccessMessage", instanceId);
    span.innerHTML = "";
}

/*
*	instanceId {Integer} ID of the current adc
* 	Hides error message
*/
function hideErrorMessage(instanceId){
    var div = getElementByDynamicId("adc-errdiv", instanceId);
    removeClass(div, "askia-errors-summary");
    div.removeAttribute("style");
    var span = getElementByDynamicId("spanErrorMessages", instanceId);
    span.innerHTML = "";
}

/*
*  instanceId {Integer} ID of the current adc
*  Shows or hides the drawing size list (toolbar)
*/
function showSize(instanceId) {
    var dropdown = document.getElementById("dropdown-size_"+instanceId);
    var sizeList = document.getElementById("sizeList_"+instanceId);
    if (hasClass(dropdown, "activate")) {
        sizeList.style.display = "none";
        removeClass(dropdown, "activate");
    } else {
    	sizeList.style.display = "block";    
        addClass(dropdown, "activate");
    }       
}

/*
*  instanceId {Integer} ID of the current adc
*  size {String} The size
*  Sets the drawing width
*/
function selectSize(instanceId, size) {
    var sizeList = document.getElementById("sizeList_"+instanceId).children;
    var selected = document.getElementsByClassName(size)[instanceId-1];
    for (var i = 0; i < sizeList.length; i++) {
        removeClass(sizeList[i], "selected");
    }
    addClass(selected, "selected");
    switch (size) {
        case "small":
            uploadConfig(instanceId).drawingWidth = 1;
        	break;
         
        case "medium":
            uploadConfig(instanceId).drawingWidth = 2;
            break;
           
        case "large":
            uploadConfig(instanceId).drawingWidth = 4;
            break;
    }
}












