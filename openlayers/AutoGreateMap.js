var StationStyle = new ol.style.Style({
	image : new ol.style.Icon(({
		size : [ 48, 48 ],
		anchor : [ 0.35, 0.5 ],
		src : 'img/Station.gif',
		scale: 1
	}))
});

var CastStyle = new ol.style.Style({
	image : new ol.style.Icon(({
		size : [ 48, 48 ],
		anchor : [ 0.2, 0.5 ],
		src : 'img/ReportStation.gif'
	}))
});

var LineStyle =   new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#000',
        width: 4
      })
    });

var UnCastStyle = new ol.style.Style({
	image : new ol.style.Icon(({
		size : [ 48, 48 ],
		anchor : [ 0.2, 0.5 ],
		src : 'img/UnReportStation.gif'
	}))
});

//global so we can remove it later
var vector;
var map;
var collection = new ol.Collection(new Array(),{unique: true});//集合，保存所有矢量元素
var slectedFeature;	//选中记录
var needRedraw, needClean; //重绘记录
var geomType;
var stationCount = 0; //塔台自增
var lineCount = 0;	//航线自增
var reportPtCount = 0;
var noReportPtCount = 0;
var draw, snap;

var FtAirportCodeElem;
var FeatTypeElem;
var PosStrElem;
var MaxSpeedElem;
var AistCodeElem;
var AngleElem;
var LengthElem;
var ElevElem;
var AistElem;
var LeftValElem;
var FeatAngleElem;
var ArrValElem;
var ArrlenElem;
var FeatureIDElem;
var AirportName;
$(document).ready(function(){  
	FtAirportCodeElem = document.getElementById("FtAirportCode");
	FeatTypeElem = document.getElementById("FeatType");
	PosStrElem = document.getElementById("LineGeo");
	MaxSpeedElem = document.getElementById("FTMaxSpeed");
	AistCodeElem = document.getElementById("AistCode");
	AngleElem = document.getElementById("Angle");
	LengthElem = document.getElementById("Length");
	ElevElem = document.getElementById("Elev");
	AistElem = document.getElementById("Aist");
	LeftValElem =  $( "#LeftValSlider" );
	FeatAngleElem = $( "#AngleSlider" );
	ArrValElem =   $( "#ArrValSlider" );
	ArrlenElem =   $( "#ArrlenSlider" );
	FeatureIDElem = document.getElementById("FeatureID");
	AirportName = document.getElementById("TargetAirport");
});


function InitMap(){
	vector = new ol.layer.Vector({
		source : new ol.source.Vector()
	});
	var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
	var mousePositionControl = new ol.control.MousePosition({
	    className: 'custom-mouse-position',
	    target: document.getElementById('location'),
	    coordinateFormat: ol.coordinate.createStringXY(5),
	    undefinedHTML: '&nbsp;'
	});	
	var projection = new ol.proj.Projection({
		code : 'EPSG:4326',
		units : 'degrees',
		axisOrientation : 'neu',
		global : false
	});
	map = new ol.Map({
		controls : ol.control.defaults({attribution : false}).extend([mousePositionControl]),
		target : 'map',
		loadTilesWhileAnimating: true,
		layers : [vector],
		view : new ol.View({
			projection : projection,
		})
	});
    var bounds = [110, 35,
                  115, 40];  //这个设置不当会报错，具体规则不知道！！！
	map.getView().fit(bounds, map.getSize());
	
	FeatTypeElem.onchange = function() {
		if (FeatTypeElem.value == 'None') {
			geomType = 'None';
		} else if (FeatTypeElem.value == '0001') {
			geomType = 'Point';
		} else if (FeatTypeElem.value == '0002') {
			geomType = 'LineString';
		} else if (FeatTypeElem.value == '0003') {
			geomType = 'Point';
		} else if (FeatTypeElem.value == '0004') {
			geomType = 'Point';
		}
		redrawFeature();
		map.removeInteraction(draw);
        map.removeInteraction(snap);
        addInteraction();
	};
	addInteraction();
	
	var select= new ol.interaction.Select();
	select.on('select', function(e) {	    	 
        var features = select.getFeatures(); //{Array.<ol.Feature>}
        var feature = features.item(features.getLength() - 1);
        if (feature != undefined && feature.getId() != undefined) {	//有可能会点到一个id为空的同一个feature
       		slectedFeature = feature;
       		var geom = feature.getGeometry();
       		var coo = geom.getCoordinates();
       		showFeature(slectedFeature);
			if (geom instanceof ol.geom.Point) {
				$("#update").removeAttr("disabled");
			} else {
				$('#update').attr("disabled", "disabled");
			}
			addTips(feature);
			fixForm(feature);
    	}
 	});
	map.addInteraction(select);
	
	//撤销， 只对线条生效
	$('#undoFeature').bind('click', function(){
		console.log("undo!"); 
		draw.removeLastPoint();
	});
	
    $('#updateFeature').bind('click', function(){
//		console.log("update!"); 
//		var newCoo = [110, 30];	//临时
//		var geom = slectedFeature.getGeometry();
//		if (!(geom instanceof ol.geom.Point)) {
//			return ;
//		}
//		var coo = geom.getCoordinates();
//		var lines = slectedFeature.getProperties().lines;
//		for (index in lines) {
//			var lineGeom = lines[index].getGeometry();
//			var lineCoos = lineGeom.getCoordinates();
//			for (i in lineCoos) {
//				if (coo[0] == lineCoos[i][0] && coo[1] == lineCoos[i][1]) {
//					lineCoos[i] = newCoo;
//				}
//			}
//			lineGeom.setCoordinates(lineCoos);
//		}
//		geom.setCoordinates(newCoo);	
    	UpdateFeature();
	});

	$('#deleteFeature').bind('click', function(){
		var log = "collection:";
		collection.forEach(function(f, idx, array){
			log += f.getId() + ",";
		});
		console.log(log);
		if ("Point" == getGeomType(slectedFeature)) {
			removePoint(slectedFeature);
		} else if ("LineString" == getGeomType(slectedFeature)) {
			removeLine(slectedFeature);
		} 
		log = "collection:";
		collection.forEach(function(f, idx, array){
			log += f.getId() + ",";
		});
		console.log(log);
//		collection.removeAt(0);
//		selectedFeature = undefined;
//		vector.getSource().removeFeature(vector.getSource().getFeatureById('station0'));
	});

	$('#addFeature').bind('click', function(){
//		var geom = new ol.geom.Point([105,35]);
//		var feature = new ol.Feature(geom);
//		feature.setProperties({"lines": new Array()}, true);
//		feature.setStyle(StationStyle);
//		vector.getSource().addFeature(feature);
//		collection.push(feature);
		AddFeature();
	});

	$('#update').attr("disabled", "disabled");
}

//使用draw控件绘图
function addInteraction() {
    draw = undefined;
    if (geomType != undefined && geomType !== 'None') {
      draw = new ol.interaction.Draw({
    	features: collection,
        source: vector.getSource(),
        type: geomType,
//      geometryName: "point",
//      style: StationStyle
      });     
      map.addInteraction(draw);
      snap = new ol.interaction.Snap({source: vector.getSource()});
      map.addInteraction(snap);  //这个必须每次都添加，否则点线将会分离无法一起拖动，原因不明！
    }
    
    if(draw != undefined) {
    	draw.on('drawend', function(e){
    		//触发这个事件时还没有将feature加入到集合当中！
    		var feature = e.feature;
    		//判断是否重绘
    		needRedraw = isNeedRedraw(feature, geomType);
    		if (needRedraw != null && needRedraw != undefined) {
    			needClean = feature;
    			console.log("重复绘制，需要清理");
    			return;
    		}
    		//设置元素ID、样式
    		var idStr;
    		if (FeatTypeElem.value == '0001') {
    			feature.setStyle(StationStyle);
    			idStr = "station" + stationCount++;
    		} else if (FeatTypeElem.value == '0002') {
    			feature.setStyle(LineStyle);
    			idStr = "line" + lineCount++;
    		} else if (FeatTypeElem.value == '0003') {
    			feature.setStyle(CastStyle);
    			idStr = "reportPt" + reportPtCount++;
    		} else if (FeatTypeElem.value == '0004') {
    			feature.setStyle(CastStyle);
    			idStr = "noReportPt" + noReportPtCount++;
    		}
    		feature.setId(idStr);
    		feature.setProperties({"featType": FeatTypeElem.value}, true);
    		//设置关联信息
    		if (geomType == 'Point') {
    			feature.setProperties({"lines": new Array()}, true);
    		} else if(geomType == 'LineString') {
    			feature.setProperties({"points": new Array()}, true);
    			addLineToPoint(feature);
    			addPointToLine(feature);
    		}
    		//选中新绘元素
    		slectedFeature = feature;
    	});
    	
    	//绘制元素前清理重复元素
    	draw.on('drawstart', function(e){
    		redrawFeature();
    	});
	}
}

function addTips(feature){
	var contentStr = "";
	var FeType = getGeomType(feature);
	var TipCoo;
	if ("Point" == FeType) {
		TipCoo = feature.getGeometry().getCoordinates();
		contentStr += '<p>ID:' + feature.getId() + '</p>';
		contentStr += '<p>Aist:' + feature.getProperties().aist + '</p>';
		contentStr += '<p>Coordinate:' + feature.getGeometry().getCoordinates() + '</p>';
	} else if ("LineString" == FeType){
		TipCoo = new Array();
		LineCoo = feature.getGeometry().getCoordinates();
		TipCoo[0] = (LineCoo[0][0] + LineCoo[1][0]) / 2;
		TipCoo[1] = (LineCoo[0][1] + LineCoo[1][1]) / 2;
		contentStr += '<p>ID:' + feature.getId() + '</p>';
		contentStr += '<p>Angle:' + feature.getProperties().angle + '</p>';
		contentStr += '<p>length:' + feature.getProperties().length + '</p>';
	}
	
	var overlay = feature.getProperties().overlay;
	if (overlay == undefined || overlay == null) {
		var Tips = document.createElement('div');
		Tips.setAttribute("id", "Tips" + feature.getId());
		Tips.className = 'ol-popup';
        
		var closer = document.createElement('a');
		closer.setAttribute("id", "TipsCloser" + feature.getId());
		closer.className = 'ol-popup-closer';
		Tips.appendChild(closer);
		
		var content = document.createElement('div');
		content.setAttribute("id", "TipsContent" + feature.getId());
		content.innerHTML = contentStr;
		Tips.appendChild(content);
		
		overlay = new ol.Overlay({
			element: Tips,
	        autoPan: true,
	        autoPanAnimation: {
	        	duration: 250
	        }
   		});	
        closer.onclick = function() {
        	map.removeOverlay(overlay);
//             overlay.setPosition(undefined);
//             closer.blur();
            return false;
        };
		feature.setProperties({"overlay": overlay}, true);
	} else {
		var Tips = overlay.getElement();
		var content = Tips.lastChild;
		content.innerHTML = contentStr; //支持元素内容更新
		map.removeOverlay(overlay);
	}

	overlay.setPosition(TipCoo);
	map.addOverlay(overlay); //手动关闭后再次添加  
}

//选中元素填充表单
function fixForm(feature) {
	
	document.getElementById("FeatureID").value = feature.getId();
	document.getElementById("FtAirportCode").value = feature.getProperties().airportCode;
	document.getElementById("FeatType").value = feature.getProperties().featType;
//	$("#FeatType").val(feature.getProperties().featType);
	document.getElementById("LineGeo").value =  feature.getGeometry().getCoordinates();
	document.getElementById("FTMaxSpeed").value = feature.getProperties().maxSpeed;
	document.getElementById("Elev").value =  feature.getProperties().elev;
	document.getElementById("Aist").value =  feature.getProperties().aist;
	document.getElementById("AistCode").value = feature.getProperties().aistCode;
	document.getElementById("Angle").value = feature.getProperties().angle;
	document.getElementById("Length").value = feature.getProperties().length;
	
}

function redrawFeature() {
	if (needRedraw == undefined || needClean == undefined || needRedraw == null || needClean == null)
		return;	
	console.log("redraw");
	collection.remove(needClean);
	vector.getSource().removeFeature(needClean);
	vector.getSource().addFeature(needRedraw);
	needClean = null;
	needRedraw = null;
}

function isNeedRedraw(newFeature, type) {
	var redrawFeature = null;
	collection.forEach(function(feature, index, array){
		if (getGeomType(newFeature) == getGeomType(feature)) {
			if (arrayEqual(newFeature.getGeometry().getCoordinates(), feature.getGeometry().getCoordinates())) {
				redrawFeature = feature;
				return;
			}
		}
	}, this);
	return redrawFeature;
}

function arrayEqual(array1, array2) {
	if(array1 == null || array1 == undefined ||array2 == null || array2 == undefined)
		return false;
	if(array1.length != array2.length)
		return false;
	for (i in array1) {
		if (array1[i] instanceof Array && array2[i] instanceof Array) {
			if (!arrayEqual(array1[i], array2[i]))
				return false;
		} else if (array1[i] != array2[i]){
			return false;
		}
	}
	return true;
}

//将线元素加入到所有穿过的点维护的线列表中。
function addLineToPoint(line) {
	if (!(line.getGeometry() instanceof ol.geom.LineString)) {
		return;
	}
	var lineCoos = line.getGeometry().getCoordinates();
	collection.forEach(function(feature, index, array){
		var geom = feature.getGeometry();
		if (geom instanceof ol.geom.Point) {
			var pCoo = geom.getCoordinates();
			var pLines = feature.getProperties().lines; //点元素维护的线元素列表		
			var lPoints = line.getProperties().points; //线元素维护的点元素列表
			for (i in lineCoos) {
				if (pCoo[0] == lineCoos[i][0] && pCoo[1] == lineCoos[i][1]) {
					pLines.push(line);	//将line加入到点元素维护的线元素列表
					lPoints.push(feature); //将点加入到line维护的点元素列表
					break;
				}
			}
		}
	}, this);
}
//将位于线上的点元素加入到线维护的点元素列表中
function addPointToLine(line) {
	if (!(line.getGeometry() instanceof ol.geom.Point)) {
		return;
	}
	var lineCoos = line.getGeometry().getCoordinates();
	collection.forEach(function(feature, index, array){
		var geom = feature.getGeometry();
		if (geom instanceof ol.geom.Point) {
			var pCoo = geom.getCoordinates();
			var pLines = feature.getProperties().lines; //获得点元素维护的线元素列表			
			for (i in lineCoos) {
				if (pCoo[0] == lineCoos[i][0] && pCoo[1] == lineCoos[i][1]) {
					pLines.push(line);	//将自身加入到点元素维护的线元素列表
					break;
				}
			}
		}
	}, this);
}

function showCollection() {
	console.log("============ showCollection =============");
	collection.forEach(function(feature, index, array){
		showFeature(feature);
	}, this)
	console.log("========================================");
}
//控制台打印元素
function showFeature(feature) {
	var type = getGeomType(feature);
	var delays;
	var log = "delays:";
	if ("Point" == type) {
		delays = getLinesByPoint(feature);
	} else {
		delays = getPointsByLine(feature);
	}
	if (delays != undefined && delays != null)
    	for(i in delays) {
    		log += delays[i].getId() + ",";
    	}
	else 
		delays += "null";
	console.log(feature.getId() + " " + feature.getGeometry().getCoordinates());
	//console.log(feature.getGeometry().getCoordinates());
	console.log(log);
}
function getPointsByLine(line) {
	return line.getProperties().points;
}
function getLinesByPoint(point) {
	return point.getProperties().lines;
} 
//使用featureId查询，返回索引
function getIdxOnCollect(collect, feature) {
	var index = -1;
	collect.forEach(function(f, idx, array){
		if (f.getId() == feature.getId()) {
			index = idx;
		}
	}, this);
	return index;
}
//使用featureId查询，返回索引
function getIdxOnArray(array, feature) {
	var index = -1;
	if (array == undefined) 
		return index;
	for (i in array) {
		if (array[i] == undefined || array[i] == null)
			continue;
		if (array[i].getId() == feature.getId()) {
			index = i;
		}
	}
	return index; 
}
//移除点，同时移除所有以此为端点的线
//并将自身从穿过的线中维护的点列表中移除
function removePoint(point) {
	var lines = getLinesByPoint(point);
	var index = getIdxOnCollect(collection, point);
	collection.removeAt(index); //从collection中移除point
	for (i in lines) {
		var tmpLine = lines[i];
		var lineCoos = lines[i].getGeometry().getCoordinates();
		if(lineCoos.length < 3) { //若线只有两个点，则删除一个端点要伴随删除线
			removeLine(lines[i], point);
		} else {
			pCoo = point.getGeometry().getCoordinates();
			var cooIdx = -1;
	    	for (j in lineCoos) {
	    		if (lineCoos[j][0] == pCoo[0] && lineCoos[j][1] == pCoo[1]) {
	    			cooIdx = j;
	    			//break;
	    			lineCoos.splice(j, 1); //移除坐标,一条线可能多次穿过同一个点，需遍历线的全部坐标
	    		}
	    	}
	    	var lPoints = getPointsByLine(lines[i]);
	    	var pIdx = getIdxOnArray(lPoints, point);
	    	lPoints.splice(pIdx, 1); //从列表移除点	    	    	
	    	tmpLine.getGeometry().setCoordinates(lineCoos);
		}
	}
	var overlay = point.getProperties().overlay;
	map.removeOverlay(overlay);
	vector.getSource().removeFeature(point);
	slectedFeature = undefined;
}
//移除线，并将自身从所有穿过的点维护的线列表中删除。
//参数：point(不需要处理的点， 删除点并联动删除线时加入此参数)
function removeLine(line, point) {
	var points = getPointsByLine(line);
	for (i in points) {
		if (points[i] == point) //跳过此点 
			continue;
		var plines = getLinesByPoint(points[i]);
		var idx = getIdxOnArray(plines, line);
		plines.splice(idx, 1);
	}
	var index = getIdxOnCollect(collection, line);
	collection.removeAt(index); //从collection中移除line
	var overlay = line.getProperties().overlay;
	map.removeOverlay(overlay);
	vector.getSource().removeFeature(line);
	slectedFeature = undefined;
}
function getGeomType(feature) {
	geom = feature.getGeometry();
	if (geom instanceof ol.geom.Point) {
		return "Point";
	} else if (geom instanceof ol.geom.LineString) {
		return "LineString";
	}
	return "unkown";
}

function AddFeature(){
	var FtAirportCode = document.getElementById("FtAirportCode").value;
	var FeatType = document.getElementById("FeatType").value;
	var PosStr = document.getElementById("LineGeo").value;
	var MaxSpeed = document.getElementById("FTMaxSpeed").value;
	var AistCode = document.getElementById("AistCode").value;
	var Angle = document.getElementById("Angle").value;
	var Length = document.getElementById("Length").value;
	var Elev = document.getElementById("Elev").value;
	var Aist = document.getElementById("Aist").value;
	var LeftVal =  $( "#LeftValSlider" ).slider("value" );
	var FeatAngle = $( "#AngleSlider" ).slider("value" );
	var ArrVal =   $( "#ArrValSlider" ).slider("value" );
	var Arrlen =   $( "#ArrlenSlider" ).slider("value" );
	var FeatureID = document.getElementById("FeatureID").value;
	if(FeatureID == null || FeatureID == ""){
		alert("元素ID不可以为空");
		return;
	} 
	if (vector.getSource().getFeatureById(FeatureID)) {
		alert("元素ID重复");
		return;
	}	
//	$( "#HightValSlider" ).slider( "value", 0 );
//	$( "#LeftValSlider" ).slider( "value", 50 );
//	$( "#HighValHandle" ).text( "value", 0 );
//	$( "#LeftValSlider" ).text( "value", 50 );
	
	var feature;
	if(FeatType == '0001'){
		//领航台
		var pos = PosStr.split(',');		
		feature = new ol.Feature(new ol.geom.Point(
				[parseFloat(pos[0]), parseFloat(pos[1])]));
		feature.setStyle(StationStyle);
		feature.setId(FeatureID);
		vector.getSource().addFeature(feature);
		feature.setProperties({"lines": new Array()}, true);
		collection.push(feature);
	}else if(FeatType == '0002'){
		//航线, 支持两个点
		var Pos = document.getElementById("LineGeo").value.split(',');
		feature = new ol.Feature(new ol.geom.LineString([
			[parseFloat(Pos[0]), parseFloat(Pos[1])],
		    [parseFloat(Pos[2]), parseFloat(Pos[3])]
		]));
		feature.setStyle(LineStyle);
		vector.getSource().addFeature(feature);
		feature.setProperties({"points": new Array()}, true);
		addLineToPoint(feature);
		addPointToLine(feature);
		collection.push(feature);
	}else if(FeatType == '0003'){
		//报告点
		var pos = PosStr.split(',');		
		feature = new ol.Feature(new ol.geom.Point(pos));
		feature.setStyle(CastStyle);
		feature.setId(FeatureID);
		vector.getSource().addFeature(feature);
		feature.setProperties({"lines": new Array()}, true);
		collection.push(feature);
	}else if(FeatType == '0004'){
		//不强制汇报点
		var pos = PosStr.split(',');		
		feature = new ol.Feature(new ol.geom.Point(pos));
		feature.setStyle(CastStyle);
		feature.setId(FeatureID);
		vector.getSource().addFeature(feature);
		feature.setProperties({"lines": new Array()}, true);
		collection.push(feature);
	}else if(FeatType == '0005'){
		//机场
		PosStr = Arry[i].LineGeo;
		var pos=PosStr.split(',');
		Point = new ol.Feature(new ol.geom.Point(pos));
		Point.setStyle(WaitAreaStyle);
		vector.getSource().addFeature(Point);
		
	}else if(FeatType == '0006'){
		//等待区
		PosStr = Arry[i].LineGeo;
		var pos=PosStr.split(',');
		Point = new ol.Feature(new ol.geom.Point(pos));
		
		var WaitAreaStyle =  new ol.style.Style({
			image : new ol.style.Icon(({
				size : [ 85, 85 ],
				anchor : [ 0.2, 0.6 ],
//				rotateWithView：true,
				rotation:Math.atan(0.5),
				src : '/statics/img/WaitArea.gif'
			}))
		});
		
		Point.setStyle(WaitAreaStyle);
		vector.getSource().addFeature(Point);
	}			
	if (feature != undefined) {
		feature.setProperties({"featType": FeatType}, true);
		feature.setProperties({"airportCode": FtAirportCode}, true);
		feature.setProperties({"featType": FeatType}, true);//元素类型
		feature.setProperties({"angle": Angle}, true);//角度
		feature.setProperties({"length": Length}, true);//距离
		feature.setProperties({"maxSpeed": MaxSpeed}, true);
		feature.setProperties({"elev": Elev}, true);
		feature.setProperties({"aist": Aist}, true);//通信频率
		feature.setProperties({"aistCode": AistCode}, true);//通信代码
		//增加标签
		addTips(feature);
	}
}

function ChangePosition(event, ui){
	var FeatureID = document.getElementById("FeatureID").value;
	if(FeatureID == null || FeatureID == ""){
		alert("元素ID不可以为空");
		return;
	}
	var Tips = document.getElementById(FeatureID);
	var TipsLine = document.getElementById(FeatureID + "-Ang");
	var TipsCSS = document.defaultView.getComputedStyle(Tips, null); 
	var HightVal =   $( "#HightValSlider" ).slider("value" );
	var leftVal =   $( "#LeftValSlider" ).slider("value" );
	var XLeav;
	var YLeav;
	var Angle;
	var TransAngle;
	var SinLen ;
	var StPoint;
	
	StPoint = leftVal + 50;
	
	if(StPoint >= 0 && HightVal >= 0){		
		XLeav = StPoint;
		YLeav = HightVal;
		Angle =  Math.atan(YLeav/XLeav);
		TransAngle = 3.141593 - Angle;
		
	}else if(StPoint < 0 && HightVal >= 0){
		XLeav = Math.abs(StPoint);
		YLeav = HightVal;
		Angle =  Math.atan(YLeav/XLeav);
		TransAngle = Angle;
		
	}else if(StPoint < 0 && HightVal < 0){
		XLeav = Math.abs(StPoint);
		YLeav = Math.abs(HightVal);
		Angle =  Math.atan(YLeav/XLeav);
		TransAngle = 6.283185 - Angle;
				
	}else if(StPoint >= 0 && HightVal < 0){
		XLeav = StPoint;
		YLeav = Math.abs(HightVal);
		Angle =  Math.atan(YLeav/XLeav);
		TransAngle = 3.141593 + Angle;
	}
	var SinLen = YLeav / Math.sin(Angle) - 20;
	TipsLine.style.width = SinLen + "px";
	TipsLine.style.left = ( leftVal + 30 )  + "px";
	TipsLine.style.bottom = ( HightVal -10 )+ "px";
	
//	TipsLine.style.WebkitTransformOrigin = "1 1";
	TipsLine.style.transform = "rotate(" + TransAngle  + "rad)";
	Tips.style.left = ( leftVal ) + "px";
	Tips.style.bottom = HightVal + "px";
	
//	TipsLine.style.bottom = ( HightVal -50 ) +"px";
	
}

function AddNewMainInfo() {
	var PubDate = document.getElementById("PubDate").value;
	var IndCode = document.getElementById("IndCode").value;	//索引
	var AirportCode = document.getElementById("AirportCode").value;
	var MapName = document.getElementById("MapName").value;
	var Country = document.getElementById("Country").value;
	var City = document.getElementById("City").value;
	var AptElev = document.getElementById("AptElev").value;//标高
	var TransLevSet = document.getElementById("TransLevSet").value; //高度单位
	var TransLev = document.getElementById("TransLev").value;//高度层
	var TransALT = document.getElementById("TransALT").value;//高度过度
	var ATIS = document.getElementById("ATIS").value;	//通波频率
	var MaxSpeed = document.getElementById("MaxSpeed").value;//最高速度
	var ArrvCode = document.getElementById("ArrvCode").value;//进场代码
	var Runway = document.getElementById("Runway").value;//适用跑道
	var CenterPos = document.getElementById("CenterPos").value;	//中心点
	
	document.getElementById("RetPubDate").value = PubDate;
	document.getElementById("RetIndCode").value = IndCode;
	document.getElementById("RetAirportCode").value = AirportCode;
	document.getElementById("RetMapName").value = MapName;
	document.getElementById("RetCountry").value = Country;
	document.getElementById("RetCity").value = City;
	document.getElementById("RetAptElev").value = AptElev;
	document.getElementById("RetTransLevSet").value = TransLevSet; 
	document.getElementById("RetTransLev").value = TransLev;
	document.getElementById("RetTransALT").value = TransALT;
	document.getElementById("RetATIS").value = ATIS;
	document.getElementById("RetMaxSpeed").value = MaxSpeed;
	document.getElementById("RetArrvCode").value = ArrvCode;
	document.getElementById("RetRunway").value = Runway;
//	document.getElementById("RetCenterPos").value = CenterPos;
//	document.getElementById("RetRoute").value(RetRoute);
	
	
}

function InitTestData() {
	document.getElementById("PubDate").value = '2018-01-03';
	document.getElementById("IndCode").value = '4607274';
	document.getElementById("AirportCode").value = 'BG001';
	document.getElementById("MapName").value = '机场进场图';
	document.getElementById("Country").value = '中国';
	document.getElementById("City").value = '北京';
	document.getElementById("AptElev").value = '6000';
	document.getElementById("TransLevSet").value = 'm';
	document.getElementById("TransLev").value = '10';
	document.getElementById("TransALT").value = '200';
	document.getElementById("ATIS").value = '103.9HZ';
	document.getElementById("MaxSpeed").value = '700';
	document.getElementById("ArrvCode").value = 'BG12306';
	document.getElementById("Runway").value = 'Z01';
	document.getElementById("CenterPos").value = 'Point1';

	document.getElementById("FtAirportCode").value = 'BG001';
	document.getElementById("Angle").value = '210';
	document.getElementById("Length").value = '20km';
	document.getElementById("FTMaxSpeed").value = '500km/s';
	document.getElementById("Elev").value = '1000m';
	document.getElementById("Aist").value = '103.9HZ';
	document.getElementById("AistCode").value = '8021AABB';
	
}
