var centreX = 150;
var centreY = 80;
var radius = 60;
var imgArray = new Array();
var selectIndex = -1;

function getEventPosition(ev){
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
      x = ev.layerX;
      y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      x = ev.offsetX;
      y = ev.offsetY;
    }
    return {x: x, y: y};
}//注：使用上面这个函数，需要给Canvas元素的position设为absolute。

$(document).ready(function(){  
	$("#upCycBtn").attr("disabled","disabled");
	myCanvas = document.getElementById("CycleID");
	context = document.getElementById("CycleID").getContext('2d');
	myCanvas.addEventListener('click', function(e){
		  p = getEventPosition(e);
		  var index = findByClick(p);
		  if (index >= 0 && imgArray[index] != null) {
			  $("#upCycBtn").removeAttr("disabled");
			  fixFormByImg(index);
			  selectIndex = index;
		  } else {
			  $("#upCycBtn").attr("disabled","disabled");
			  selectIndex = -1;
		  }
		  //console.log(p); //在控制台可以打印出来点击的位置
		}, false);
});

function findByClick(p) {
	var t = null;
	for (var i = 0; i < imgArray.length; i++) {
		t = imgArray[i];
		if (p.x <= t.x + t.bx && p.x >= t.x - t.bx && p.y <= t.y + t.by && p.y >= t.y - t.by) {
			return i;
		}
	}
}

function fixFormByImg(index) {
	var imgObj = imgArray[index];
	if(imgObj.unit == '\'') {
		$("#FeatType2").val("0002");
		$("#xposSlider").val(imgObj.x - centreX);
		$("#yposSlider").val(imgObj.y - centreY);
		$("#xpos").text(imgObj.x - centreX);
		$("#ypos").text(imgObj.y - centreY);
	} else {
		$("#FeatType2").val("0001");
	}
	$("#CycValue").val(imgObj.body);

}

function ChangeCylePan(FeatType){
	if(FeatType == '0001'){
		document.getElementById("ValueLabel").innerText = "角度:";
	}else{
		document.getElementById("ValueLabel").innerText = "高度:";
	}
}

function DrawCycle(){
	var canvas = $('#CycleID');
	canvas.drawArc({
		  strokeStyle: 'black',
		  strokeWidth: 2,
		  x: centreX, y: centreY,
		  radius: radius,
		  start: 0, end: 360
	});	
}

function redraw() {
	var c = document.getElementById("CycleID")
	c.getContext("2d");
	c.height = c.height; //清空画布
	DrawCycle(); //重绘圆
	var canvas = $('#CycleID');
	for (var i = 0; i < imgArray.length; i++) {
		if (imgArray[i] == null)
			continue;
		if (imgArray[i].unit == '\'') {
			DrawText(canvas, imgArray[i]);
		} else {
			var line = createLine(0, imgArray[i].body);
			DrawLine(canvas, line);
			DrawText(canvas, imgArray[i]);
		}
	}
}

function UpdateCycle() {
	var body = document.getElementById("CycValue").value;
	if(body == null|| body == ""){
		alert(FTText + "不可以为空");
		return;
	}
	if (imgArray[selectIndex].unit == '\'') {
		var text = createText(centreX + $('#xposSlider').slider('option', 'value'),
			centreY + $('#yposSlider').slider('option', 'value'), body, imgArray[selectIndex].unit);
		imgArray[selectIndex] = text; //更新集合中的对象
	} else {
		if (body > 360 || body < 0) {
			alert("不合法角度");
			return;
		}
		var line = createLine(0, body);
		var text = createText(line.x1, line.y1, body, imgArray[selectIndex].unit);
		imgArray[selectIndex] = text; //更新集合中的对象
	}
	redraw(); //重新绘图
} 

function AddCycle(){
	var canvas = $('#CycleID');
	var body = document.getElementById("CycValue").value;
	var FTText = $("#FeatType2 option:selected").text();
	if(body == null|| body == ""){
		alert(FTText + "不可以为空");
		return;
	}
	var FeatType = $("#FeatType2 option:selected").val();
	if(FeatType == '0001'){
		if (body > 360 || body < 0) {
			alert("不合法角度");
			return;
		}
		var line = createLine(0, body);
		var text = createText(line.x1, line.y1, body, '°');
		imgArray.push(text);	//只用将文字放入集合，重绘时即可还原线条
		DrawLine(canvas, line);
		DrawText(canvas, text);	
	}else{ 
		var text = createText(centreX + $('#xposSlider').slider('option', 'value'),
				centreY + $('#yposSlider').slider('option', 'value'), body, '\'');
		imgArray.push(text);
		DrawText(canvas, text);
	}
}

/**
 * 生成线条两个点的坐标
 */
function createLine(OrgAng, body) {
	var line = new Object();
	line.x1 = centreX + radius * Math.sin((OrgAng + body) * Math.PI / 180);
	line.y1 = centreY - radius * Math.cos((OrgAng + body) * Math.PI / 180);
	line.x2 = centreX;
	line.y2 = centreY;
	return line;
}

/**
 * 创建角度和高度的text对象，存储在集合中
 * 输入:x,y,body(数字),unit(单位)
 * 	 线：x,y为线在圆端的点坐标
 * 	 高度：x, y为文字中心坐标
 * 输出: text
 *   text.bx, text.by 坐标偏移量，用于确定点击范围
 *   text.x, text.y 坐标，确定绘图位置
 *   text.body 文字主体
 *   text.uint 单位，角度或者高度
 */
function createText(x, y, body, unit) {
	var text = new Object();
	if (unit == '\'') {
		text.x = x;
		text.y = y;
	} else {
		text.x = centreX + (x - centreX)/2 + 10;
		text.y = centreY + (y - centreY)/2 + 10;
	}
	text.body = body;
	text.unit = unit;
	text.bx = 2.5 * (text.body.length + 1); //根据字体及内容计算左右偏移，暂时写死！
	text.by = 5;	//根据字体计算上下偏移，暂时写死！
	return text;
}

function DrawLine(canvas, line){
	canvas.drawPath({
		  strokeStyle: '#000',
		  strokeWidth: 2,
		  p1: {
		    type: 'line',
		    rounded: true,
		    endArrow: true,
		    arrowRadius: 10,
		    arrowAngle: 60,
		    x1: line.x1, y1: line.y1,
		    x2: line.x2, y2: line.y2
		  }  
	});
}

function DrawText(canvas, text){
	canvas.drawText({
		  text: text.body + text.unit,
		  fontFamily: '微软雅黑',
		  fontSize: 14,
		  x: text.x, y: text.y,
		  fillStyle: '#000',
		  strokeStyle: '#000',
		  strokeWidth: 1
	});
}