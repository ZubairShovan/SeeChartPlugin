var sendDataToServer = true;
var locateAndProcessImage = false;

var pathSeg = require('../lib/pathSeg.js');
var VisDeconstruct = require('d3-decon-lib').Deconstruct;
var $ = require('jquery');
var _ = require('underscore');
var CircularJSON = require('circular-json');


var contextElem;
document.addEventListener("contextmenu", function(event) {
    contextElem = event.target;
});


var decon_flag = false;
var decon_json = false;
var highchart_flag = false;
var highchart_no;

document.addEventListener("pageDeconEvent", function () {
    console.log("about to deconstruct!!");
    // buildOverlay($("html")[0], true);
    setTimeout(pageDeconstruct, 10);

});

document.addEventListener("nodeDeconEvent", function () {
    console.log("nodeDeconEvent");
    if (contextElem instanceof SVGElement) {
        if (contextElem.tagName !== "svg") {
            contextElem = contextElem.ownerSVGElement;
        }

        buildOverlay(contextElem, false);
        setTimeout(function() {
            visDeconstruct(contextElem);
        }, 10);
    }
    else {

    }
});

var el;
var sound;

function tempAlert(msg,duration) {
    // var myAudio = new Audio(chrome.runtime.getURL("dist/sound.mp3"));
    // myAudio.play();

    sound = document.createElement("audio");
    sound.setAttribute("src", "dist/sound.mp3")
    sound.setAttribute("autoplay", "autoplay")
    // sound.setAttribute("width", "0")
    // sound.setAttribute("height", "0")
    sound.setAttribute("id", "sound1")
    // sound.setAttribute("enablejavascript", "true")


    el = document.createElement("div");
    el.setAttribute("style","left: 0; bottom:0; position: fixed; text-align: center; width: 100%;font-size: 30pt;color:white;background-color:black;opacity:0.65;");

    var el2 = document.createElement("div");
    el2.setAttribute("style","text-align: center; font-size: 12pt; color:yellow");
    var text = "Press Enter to open it in a new tab or Press Escape to cancel."

    el.innerHTML = msg + text;
    // el.innerHTML = msg + '<input id="btn" type="button" value="Click here to open"" />';

    el.appendChild(el2);
    el.appendChild(sound);





    // document.getElementById("btn").addEventListener ("click", openVis, false);

    // el.addEventListener ("click", openVis, false);

    window.onkeyup = function(e) {
        if (e.code === "Enter"){
            // PlaySound(sound);
            if (document.getElementById("sound1") != null){
                document.getElementById("sound1").play();
            }

            el2.innerHTML = "Opening..."
            if (decon_flag === true && highchart_flag === false){
                openVis()
            } else if (highchart_flag === true){
                openHighChart()
            }

            el.parentNode.removeChild(el);
        }
        else if (e.code === "Escape"){
            el.parentNode.removeChild(el);
        }
    }
    var seconds = 15;
    function incrementSeconds() {
        seconds -= 1;
        el2.innerText = "This will disappear in " + seconds + " seconds. ";
    }

    var cancel = setInterval(incrementSeconds, 1000);

    setTimeout(function(){
        el.parentNode.removeChild(el);
    },duration);
    document.body.appendChild(el);
}

function PlaySound(soundObj) {
    var sound = document.getElementById(soundObj);
    sound.play();
}


function openHighChart(){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // var win = window.open("https://192.168.0.108:8080/?chart="+highchart_no, '_blank');
            var win = window.open("https://192.168.0.108:8080/?chart=611", '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }
        }
    }
    // xhr.open('GET', 'https://192.168.0.108:8080/load', true);
    // xhr.open('GET', "https://192.168.0.108:8080/?chart="+highchart_no, true);
    xhr.open('GET', "https://192.168.0.108:8080/?chart=611", true);
    xhr.send(null);
}


function openVis(){
    // el.parentNode.removeChild(el);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // var tempDiv = document.createElement("div");
            // tempDiv.setAttribute("style","left: 0; bottom: 0; position: fixed; width: 100%; height: 100%; background-color:#d6d9d0; opacity:0.8;");
            // tempDiv.innerHTML = '<iframe src="https://192.168.0.108:8080/test" width="100%" height="100%"></iframe>'
            // tempDiv.focus()
            // document.body.appendChild(tempDiv);

            // var win = window.open('https://192.168.0.108:8080'+xhr.responseText, '_blank');
            var win = window.open("https://infovis-userstudy.herokuapp.com/task?chart=test1", '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }
        }
    }
    // xhr.open('GET', 'https://192.168.0.108:8080/load', true);
    xhr.open('GET', 'https://infovis-userstudy.herokuapp.com/task?chart=test1', true);
    xhr.send(null);
}


function buildOverlay(domElem, fullPage) {
    var overlay;
    if (fullPage) {
        overlay = $('<div class="loadingOverlayFullPage"></div>');
        $(overlay).append(text);
    }
    else {
        var elemOffset = $(domElem).offset();
        overlay = $('<div class="loadingOverlay"></div>');
        $(overlay).css("top", elemOffset.top);
        $(overlay).css("left", elemOffset.left);

        var rect = domElem.getBoundingClientRect();
        $(overlay).css("width", rect.width);
        $(overlay).css("height", rect.height);
    }

    var text = $('<div class="overlayText">Deconstructing...</div>');
    $(overlay).append(text);
    $("html").append(overlay);
}


/**
 * Accepts a top level SVG node and deconstructs it by extracting data, marks, and the
 * mappings between them.
 * @param svgNode - Top level SVG node of a D3 visualization.
 */
function visDeconstruct(svgNode) {
  console.log('visDeconstruct');
  console.log(svgNode);
  var deconstructed = VisDeconstruct.deconstruct(svgNode,sendDataToServer, "from 64");

    var deconData = [{
        schematized: deconstructed.groups,
        svg: deconstructed.svg,
        labels: deconstructed.labels,
        ids: _.map(deconstructed.marks, function(mark) { return mark.deconID; })
    }];

    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("deconDataEvent", true, true, deconData);
    document.dispatchEvent(evt);
    if(sendDataToServer){
        window.deconstruction = {
            deconstruction: [deconstructed],
            updaterRecovered: false
        };
    }

}


var img_found = false;

var number_of_chart = 0;

function pageDeconstruct() {
    console.log('I AM HERE @ injected.pageDeconstruct')
    var deconstructed = VisDeconstruct.pageDeconstruct(sendDataToServer);

    console.log("deconstructed")
    console.log(deconstructed[0])

    var deconData = [];
    console.log('deconstructed length -> '+deconstructed.length)
    if(deconstructed.length >= 0 && deconstructed[0]!=="highchart"){
        decon_flag = true;
    }
    else if (deconstructed.length >= 0 && deconstructed[0]==="highchart"){
        highchart_flag = true;
    }
    //console.log(deconstructed);
    $.each(deconstructed, function(i, decon) {
        //nodes = nodes.concat(decon.dataNodes.nodes);
        //ids = ids.concat(decon.dataNodes.ids);
        //updaters.push(new VisUpdater(svgNode, decon.dataNodes.nodes, decon.dataNodes.ids,
        //    decon.schematizedData));

        number_of_chart = number_of_chart + 1;

        var deconDataItem = {
            schematized: decon.groups,
            svg: decon.svg,
            labels: decon.labels,
            ids: _.map(decon.marks, function(mark) { return mark.deconID; })
        };
        console.log(deconDataItem)
        deconData.push(deconDataItem);
    });

    console.log("Number of charts: "+ number_of_chart);

    deconData = JSON.parse(CircularJSON.stringify(deconData));

    var deconDataStr = JSON.stringify(deconData);
    deconDataStr = '{"url": "'+window.location.href+'","scrap_date":"'+new Date().toUTCString()+'","d3data": '+ deconDataStr +'}';

    //console.log(deconDataStr);

    if(sendDataToServer){
        $.ajax({
            type: "POST",
            url: "https://192.168.0.108:8080/decon",
            data: {
                decon: deconDataStr
            },
            success: function(data, textStatus, xhr) {
                console.log("CHECK THE STATUS CODE HERE: "+xhr.status);
                if(xhr.status === 200){
                    decon_json = true;
                }
                else {
                    console.log("D3 Data was not found! HELLO")
                }
            }
        }).done(function (o) {
            console.log('Decon data sent');
        });


        setTimeout(function (){
            if(decon_flag === true && decon_json === true){

                // testOverlay($("html")[0], true);
                if (number_of_chart === 1){
                    var msg = "We have found a chart in this page! "
                    tempAlert(msg,10000)
                }
                else if (number_of_chart > 1){
                    var msg = "We have "+number_of_chart+" charts in this page! "
                    tempAlert(msg,10000)
                }


            }
            else if (highchart_flag === true){
                var msg = "We have found a chart in this page! "
                tempAlert(msg,10000)


                $.ajax({

                    type: "POST",
                    url: "https://192.168.0.108:8080/high",
                    data: {
                        url: window.location.href
                    },
                    success: function(data, textStatus, xhr) {
                        console.log("CHECK THE STATUS CODE HERE: "+xhr.status);
                        if(xhr.status === 200){
                            console.log("GOTCHA!")
                            console.log(data['json_no'])
                            highchart_no = data['json_no']

                            var msg = "We have found a chart in this page!"
                            tempAlert(msg,10000)
                        }
                        else {
                            console.log("COULD NOT FIND THE URL")
                        }
                    }
                }).done(function (o) {
                    console.log('Highchart was searched');
                });


            }



            // TO OPEN ANYWAY
            else {
                var msg = "SeeChart has found a chart in this page!"
                tempAlert(msg,10000)
            }

        }, 1000);


    }

    if(sendDataToServer === false) {
      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent("deconDataEvent", true, true, deconData);
      document.dispatchEvent(evt);

      window.deconstruction = {
        deconstruction: deconstructed,
        updaterRecovered: false
      };
    }

    if(locateAndProcessImage === true) {
        img_find();

        if (img_found === true){
            console.log("Images were sent!")
        }
        else {
            console.log("No suitable image found!")
        }


    }


}

function img_find() {
    var imgs = document.getElementsByTagName("img");
    // var imgSrcs = [];
    var imgSrcs = "";

    console.log("IMAGE REPORT -> ")
    for (var i = 0; i < imgs.length; i++) {
        // if(imgs[i].width > 500 && imgs[i].height > 300){
        if(imgs[i].width > 10 && imgs[i].height > 10){
            img_found = true;
            // imgSrcs.push(imgs[i].src);
            imgSrcs = imgs[i].src;

            $.ajax({
                type: "POST",
                url: "https://192.168.0.108:8080/crawlImage",
                data: {
                    img_url: imgSrcs
                },
                success: function(data, textStatus, xhr, imgSrcs) {
                    console.log("crawlImage: STATUS: "+xhr.status);
                    if(xhr.status === 200){
                        console.log("DONE")
                    }
                }
            }).done(function (o) {
                console.log('Images are stored!');
            });

        }

    }
}
