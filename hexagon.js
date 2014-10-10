// The MIT License
//
// Copyright (c) 2012-2013 Robert Anton Reese
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

'use strict';

angular.module('myApp.hexagon', []).service('hexagon', function(){
    var radius;

    var height;
    var width;
    var side;

    var canvas;
    var context;

    var canvasOriginX;
    var canvasOriginY;

    var sideNum;

    this.init = function init(canvasId, radius) {
        radius = radius;
    
        height = Math.sqrt(3) * radius;
        width = 2 * radius;
        side = (3 / 2) * radius;
    
        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');
    
        canvasOriginX = 0;
        canvasOriginY = 0;
    
        sideNum = 6;
        
        //canvas.addEventListener("mousedown", clickEvent.bind(this), false);
    };
    
    this.drawHexGrid = function drawHexGrid(rows, cols, originX, originY, isDebug) {
        canvasOriginX = originX;
        canvasOriginY = originY;
        
        var currentHexX;
        var currentHexY;
        var debugText = "";
    
        var offsetColumn = false;
    
        for (var col = 0; col < cols; col++) {
            for (var row = 0; row < rows; row++) {
    
                if (!offsetColumn) {
                    currentHexX = (col * side) + originX;
                    currentHexY = (row * height) + originY;
                } else {
                    currentHexX = col * side + originX;
                    currentHexY = (row * height) + originY + (height * 0.5);
                }
    
                if (isDebug) {
                    //var tr = offsetToAxial(col, row);
                    //debugText = tr[0]+ "," + tr[1];
                    debugText = col+ "," + row;
                }
    
                drawHex(currentHexX, currentHexY, "#ddd", debugText);
                //drawPathTile(currentHexX, currentHexY, 1, 4);
            }
            offsetColumn = !offsetColumn;
        }
    };
    
    function drawHexAtColRow(column, row, color) {
        var drawy = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var drawx = (column * side) + canvasOriginX;
    
        drawHex(drawx, drawy, color, "");
    };
    
    function drawHex(x0, y0, fillColor, debugText) {
    
        /* 
         
       0 1  2
          __
       0 /  \ 3
         \__/
         5  4  */
        context.strokeStyle = "#000";
        context.beginPath();
        context.moveTo(x0, y0 + (height / 2)); //0
        context.lineTo(x0 + width - side, y0); //1
        context.lineTo(x0 + side, y0); //2
        context.lineTo(x0 + width, y0 + (height / 2)); //3
        context.lineTo(x0 + side, y0 + height); //4
        context.lineTo(x0 + width - side, y0 + height); //5
    
        if (fillColor) {
            context.fillStyle = fillColor;
            context.fill();
        }
    
        context.closePath();
        context.stroke();
    
        if (debugText) {
            context.font = "8px";
            context.fillStyle = "#000";
            context.fillText(debugText, x0 + (width / 2) - (width/4), y0 + (height - 5));
        }
    };
    
    function drawPath(x0, y0, s0, s1) {
        var side = [];
        var vertex = [];
    
        vertex[0] = [x0, y0 + (height / 2)];                    //0
        vertex[1] = [x0 + width - side, y0];               //1
        vertex[2] = [x0 + side, y0];                            //2
        vertex[3] = [x0 + width, y0 + (height / 2)];       //3
        vertex[4] = [x0 + side, y0 + height];              //4
        vertex[5] = [x0 + width - side, y0 + height]; //5
    
        for(var i = 0; i < sideNum; i++){
            side[i] = [(vertex[i][0] + vertex[(i+1)%sideNum][0])/2, (vertex[i][1] + vertex[(i+1)%sideNum][1])/2];
        }
    
        var diff = Math.abs(s1 - s0);
        if(diff == 1 || diff == 5){
            // Draw an arc with half radius
            var vs;
            var ve;
            if((s0 + 1)%sideNum == s1){
                vs = s1;
                ve = s0;
            }
            else{
                vs = s0;
                ve = s1;
            }
            context.beginPath();
            context.arc(vertex[vs][0],vertex[vs][1],radius/2, 1/3*Math.PI*ve, 2/3*Math.PI + 1/3*Math.PI*ve);
            context.stroke();
        }
        else if(diff == 2 || diff == 4){
            // Draw an arc with 2/3 radius
            var vs;
            var ve;
            if((s0 + 2)%sideNum == s1){
                vs = s0;
                ve = (vs+1)%sideNum;
            }
            else{
                vs = s1;
                ve = (vs+1)%sideNum;
            }
            var cx = vertex[ve][0] + vertex[ve][0] - vertex[vs][0];
            var cy = vertex[ve][1] + vertex[ve][1] - vertex[vs][1];
            context.beginPath();
            context.arc(cx,cy,radius*3/2, 1/3*Math.PI*ve, 1/3*Math.PI*ve + 1/3*Math.PI);
            context.stroke();
        }
        else if(diff == 3){
            //Draw a line
            context.moveTo(side[s0][0], side[s0][1]); 
            context.lineTo(side[s1][0], side[s1][1]); 
            context.stroke();
        }
    };
    
    function drawPathTile(x0, y0, tid, rot) {
        var tile = [[1,0,3,2,5,4],
                    [1,0,4,5,2,3],
                    [1,0,5,4,3,2],
                    [2,4,0,5,1,3],
                    [3,4,5,0,1,2]];
        
        drawHex(x0, y0, "#ddd", "");
        for(var i = 0; i < sideNum; i++){
            var ss = i;
            var se = tile[tid][i];
            ss = (ss + sideNum - rot) % sideNum;
            se = (se + sideNum - rot) % sideNum;
            drawPath(x0, y0, ss, se);
        }
    
    }
    
    
    //Recusivly step up to the body to calculate canvas offset.
    function getRelativeCanvasOffset() {
    	var x = 0, y = 0;
    	var layoutElement = canvas;
        if (layoutElement.offsetParent) {
            do {
                x += layoutElement.offsetLeft;
                y += layoutElement.offsetTop;
            } while (layoutElement = layoutElement.offsetParent);
            
            return { x: x, y: y };
        }
    }
    
    //Uses a grid overlay algorithm to determine hexagon location
    //Left edge of grid has a test to acuratly determin correct hex
    this.getSelectedTile = function getSelectedTile(mouseX, mouseY) {
    
    	var offSet = getRelativeCanvasOffset();
        console.log(offSet);
    
        mouseX -= offSet.x;
        mouseY -= offSet.y;

        mouseX -= canvasOriginX;
        mouseY -= canvasOriginY;
    
        var column = Math.floor((mouseX) / side);
        var row = Math.floor(
            column % 2 == 0
                ? Math.floor((mouseY) / height)
                : Math.floor(((mouseY + (height * 0.5)) / height)) - 1);
    
    
        //Test if on left side of frame            
        if (mouseX > (column * side) && mouseX < (column * side) + width - side) {
    
    
            //Now test which of the two triangles we are in 
            //Top left triangle points
            var p1 = new Object();
            p1.x = column * side;
            p1.y = column % 2 == 0
                ? row * height
                : (row * height) + (height / 2);
    
            var p2 = new Object();
            p2.x = p1.x;
            p2.y = p1.y + (height / 2);
    
            var p3 = new Object();
            p3.x = p1.x + width - side;
            p3.y = p1.y;
    
            var mousePoint = new Object();
            mousePoint.x = mouseX;
            mousePoint.y = mouseY;
    
            if (isPointInTriangle(mousePoint, p1, p2, p3)) {
                column--;
    
                if (column % 2 != 0) {
                    row--;
                }
            }
    
            //Bottom left triangle points
            var p4 = new Object();
            p4 = p2;
    
            var p5 = new Object();
            p5.x = p4.x;
            p5.y = p4.y + (height / 2);
    
            var p6 = new Object();
            p6.x = p5.x + (width - side);
            p6.y = p5.y;
    
            if (isPointInTriangle(mousePoint, p4, p5, p6)) {
                column--;
    
                if (column % 2 == 0) {
                    row++;
                }
            }
        }
    
        return  { row: row, column: column };
    };
    
    
    function sign(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };
    
    //TODO: Replace with optimized barycentric coordinate method
    function isPointInTriangle(pt, v1, v2, v3) {
        var b1, b2, b3;
    
        b1 = sign(pt, v1, v2) < 0.0;
        b2 = sign(pt, v2, v3) < 0.0;
        b3 = sign(pt, v3, v1) < 0.0;
    
        return ((b1 == b2) && (b2 == b3));
    };
    
    function clickEvent(e) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
    
        var localX = mouseX;
        var localY = mouseY;
    
        var tile = this.getSelectedTile(localX, localY);
        if (tile.column >= 0 && tile.row >= 0) {
            var drawy = tile.column % 2 == 0 ? (tile.row * height) + canvasOriginY + 6 : (tile.row * height) + canvasOriginY + 6 + (height / 2);
            var drawx = (tile.column * side) + canvasOriginX;
    
            drawHex(drawx, drawy - 6, "rgba(110,110,70,0.3)", "");
        } 
    };
    
    function axialToOffset(ax, ay) {
        var ox = ax;
        var oy = ay + (ax - (ax&1))/2;
        return [ox, oy];
    };
    
    function offsetToAxial(ox, oy) {
        var ax = ox;
        var ay = oy - (ox - (ox&1))/2;
        return [ax, ay];
    };

});
