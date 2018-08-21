<template>
	<!--<div class="AppImg" v-finger:pinch="ZoomOut" v-finger:press-move="pressMove" v-finger:multipoint-end="multipointEnd" ref="AppDiv">-->
	<div class="AppImg" v-finger:pinch="ZoomOut" ref="AppDiv" v-finger:tap="clickevent" v-finger:press-move="pressMove" v-finger:multipoint-end="multipointEnd" v-finger:multipoint-start="multipointStart">
		<!--<div class="AppImg"  ref="AppDiv">-->
		<!--<img ref="RefImg" src="static/img/ChinaMap.jpeg" :style="{scaleX:ImgScaleX,scaleY:ImgScaleY,translateX:ImgTranslateX,translateY:ImgTranslateY}" />-->
		<!--<img src="static/img/ChinaMap.jpg" ref="RefImg" :style="{transform:MatrixStyle,WebkitTransformOriginX:originX,WebkitTransformOriginY:originY}" />-->
		<img :src="imgname" ref="RefImg" :style="{transform:MatrixStyle}" />

		<!--<img src="static/img/ChinaMap.jpeg" style="position:relative;left:-800px;top:-100px;" ref="RefImg" :style="{TranslateX:ImgTranslateX,TranslateY:ImgTranslateY,height:ImgHeight, width:ImgWidth}" />-->
	</div>
</template>

<script>
	import store from '../../router/storage.js'

	//	Vue.use(veTouch);
	export default {
		store,
		data: function() {
			return {
				imgname: '', //文件相对路径： 'static/img/A111/xxx'
				lastfile: '', //记录当前打开的文件
				scale: 0, //当前倍率
				temppinch: 0, //缩放过程中记录的临时倍率
				maxScale: 2, //最大倍率
				minScale: 0.2, // 最小倍率
				ImgTranslateX: 0, //偏移距离
				ImgTranslateY: 0,
				imgEl: null,
				AppDiv: null,
				fillType: 'H', //填充方向：横向/竖向
				centerX: 50,
				centerY: 50,
				oldImgWidth: 0, //原始尺寸
				oldImgHeight: 0,
				divWidth: 0, //div尺寸
				divHeight: 0,
				imgWidth: 0, //当前尺寸
				imgHeight: 0,
				originX: 0, //坐标原点
				originY: 0,
				MatrixStyle: '', //缩放css属性
				minX: 0, //最小偏移
				minY: 0,
				maxX: 0, //最大偏移
				maxY: 0,
				temp: 0,
				imgobj: 0,
				count:0
			}
		},
		//		created() {
		//		  console.log('appmap created+++')  
		//		},

		mounted() {
			//			console.log('appmap mounted+++: ', this.$route.params.mapName);
			this.imgEl = this.$refs.RefImg;
			this.AppDiv = this.$refs.AppDiv;
			this.divWidth = this.AppDiv.offsetWidth;
			this.divHeight = this.AppDiv.offsetHeight;

			this.InitImg();

			console.log('appmap mounted++++++: ', JSON.stringify(this.$route.params));
		},
		//		updated() {
		//		    this.imgEl = this.$refs.RefImg;
		//          this.AppDiv = this.$refs.AppDiv;
		//          this.divWidth = this.AppDiv.offsetWidth;
		//          this.divHeight = this.AppDiv.offsetHeight;
		//          
		//          this.InitImg();
		//          console.log('appmap updated+++: ', this.$route.params.mapName);
		//		},
		watch: {
			'$route' (to, from) {
				console.log('appmap watched+++: ', JSON.stringify(this.$route.params));

				this.InitImg();
			}
		},
		//      computed: {
		//          curimg: function() {
		//              console.log('appmap computed', + this.$route.params.mapName);
		//              if (this.imgobj == null) {
		//                  this.InitImg();
		//              }
		//              return this.imgobj.src; 
		//          }
		//      },
		methods: {

			InitImg: function() {
				//				let imgpath = 'cdvfile://localhost/bundle/www/static/img/' + this.$route.params.airportNo + '/' + this.$route.params.mapName + '.jpg';
				console.log('appmap InitImg++++++: ', JSON.stringify(this.$route.params), this.$route.params.mapName);
				let ApNo = this.$route.params.airportNo;
				let imgpath = '';
				if(ApNo === undefined || ApNo === null || '' === ApNo || JSON.stringify(ApNo) == "{}") {
					imgpath = 'static/img/' + this.$route.params.mapName + '.jpg';
				} else {
					imgpath = 'static/img/' + ApNo + '/' + this.$route.params.mapName + '.jpg';
				}
				this.imgobj = new Image();

				console.log('appmap before imgobj.onload:' + imgpath + ' initscale:' + parseFloat(this.$route.params.initscale));
				this.imgobj.onload = () => {
					this.imgname = 'static/img/' + this.$route.params.airportNo + '/' + this.$route.params.mapName + '.jpg';

					console.log('appmap imgobj.onload');

					this.oldImgWidth = this.imgobj.width;
					this.oldImgHeight = this.imgobj.height;
					//确定填充方向和最小倍率
					if(this.oldImgWidth / this.divWidth > this.oldImgHeight / this.divHeight) {
						this.fillType = 'H';
						this.minScale = (this.divHeight / this.oldImgHeight);
					} else {
						this.fillType = 'W';
						this.minScale = (this.divWidth / this.oldImgWidth);
					}
					let initScale = parseFloat(this.$route.params.initscale);
					if(initScale == 0 || initScale == undefined) {
						initScale = this.minScale; //用于pdf，最小倍率展示
						console.debug('run here for mini scale' + initScale);
					}
					this.scale = initScale;
					this.temppinch = initScale;
					this.originX = this.oldImgWidth / 2;
					this.originY = this.oldImgHeight / 2;
					this.imgWidth = this.oldImgWidth * initScale;
					this.imgHeight = this.oldImgHeight * initScale;
					this.minX = -(this.originX + (this.imgWidth) / 2 - this.divWidth);
					this.minY = -(this.originY + (this.imgHeight) / 2 - this.divHeight);
					this.maxX = this.imgWidth / 2 - this.originX;
					this.maxY = this.imgHeight / 2 - this.originY;
					if(parseInt(this.$route.params.transx) !== 0) {
						this.ImgTranslateX = parseInt(this.$route.params.transx);
					} else {
						this.ImgTranslateX = -1 * Math.round(this.originX - this.imgWidth);
					}

					if(parseInt(this.$route.params.transy) !== 0) {
						this.ImgTranslateY = parseInt(this.$route.params.transy);
					} else {
						this.ImgTranslateY = -1 * Math.round(this.originY - this.imgHeight);
					}

					this.tempX = this.ImgTranslateX;
					this.tempY = this.ImgTranslateY;
					this.imgname = imgpath;
					this.lastfile = this.imgname;
					if(this.ImgTranslateX > this.maxX) {
						this.ImgTranslateX = this.maxX;
					} else if(this.ImgTranslateX < this.minX) {
						this.ImgTranslateX = this.minX;
					}
					if(this.ImgTranslateY < this.minY) {
						this.ImgTranslateY = this.minY;
					} else if(this.ImgTranslateY > this.maxY) {
						this.ImgTranslateY = this.maxY;
					}
					this.MatrixStyle = "translate(" + this.ImgTranslateX + "px," + this.ImgTranslateY + "px) scale(" + initScale + ')';
					console.log('appmap init: ', this.oldImgWidth, this.oldImgHeight, this.ImgTranslateX, this.ImgTranslateY, this.imgname, this.minScale)

				}
				//              this.imgobj.src = this.imgname;
				this.imgobj.src = imgpath;
				//                this.imgobj.src =  'static/img/' + this.$route.params.airportNo + '/' + this.$route.params.mapName + '.jpg';
			},

			ZoomOut: function(event) {
				let OldPinch = this.temppinch
//				this.temppinch = (event.zoom - 1);
                if (this.count < 20) {
                    this.count ++;
                    return;
                }
                this.count = 0;
                if (event.zoom > 1) {
                    this.temppinch = 0.1;
                } else {
                    this.temppinch = -0.1;
                }
				this.scale = this.scale + this.temppinch;
				if(this.temppinch >= 3) {
					this.temppinch = 3;
					return;
				} else if(this.temppinch <= this.minScale) {
					this.temppinch = this.minScale;
					return;
				}

				this.imgWidth = this.oldImgWidth * this.scale;
				this.imgHeight = this.oldImgHeight * this.scale;
				let fx = this.centerX - this.originX;
                let fy = this.centerY - this.originY;
                console.log("fx, fy", fx, fy, this.ImgTranslateX,this.ImgTranslateY);
                 
                let imgTX1 = (fx - parseInt(this.ImgTranslateX)) * this.temppinch + 2 * parseInt(this.ImgTranslateX) - fx;
                let imgTY2 = (fy - parseInt(this.ImgTranslateY)) * this.temppinch + 2 * parseInt(this.ImgTranslateY) - fy;
                let imgTX = (parseFloat(this.ImgTranslateX) - fx) * (this.temppinch + 1) + parseFloat(this.ImgTranslateX);
                let imgTY = (parseFloat(this.ImgTranslateY) - fy) * (this.temppinch + 1) + parseFloat(this.ImgTranslateY);
    
                console.log("oldTx,oldTY, newTX1, newTY1:", this.ImgTranslateX, this.ImgTranslateY, imgTX, imgTY, imgTX1, imgTY2);
                
				this.minX = -(this.originX + (this.imgWidth) / 2 - this.divWidth);
				this.minY = -(this.originY + (this.imgHeight) / 2 - this.divHeight);
				this.maxX = this.imgWidth / 2 - this.originX;
				this.maxY = this.imgHeight / 2 - this.originY;

				if(imgTX < this.minX) {
					imgTX = this.minX;
				}
				if(imgTY < this.minY) {
					imgTY = this.minY;
				}
				if(imgTX > this.maxX) {
					imgTX = this.maxX;
				}
				if(imgTY > this.maxY) {
					imgTY = this.maxY;
				}
                
                this.ImgTranslateX = Math.round(imgTX);
                this.ImgTranslateY = Math.round(imgTY);
				this.MatrixStyle = "translate(" + this.ImgTranslateX + "px," + this.ImgTranslateY + "px) scale(" + this.scale + ')';
				let img = this.$refs.RefImg.getBoundingClientRect();
//				console.log('zoomout, TX, TY: ', this.ImgTranslateX, this.ImgTranslateY, this.imgWidth, this.imgHeight, img.width, img.height);
				console.log('zoomout, TX, TY: ', this.ImgTranslateX, this.ImgTranslateY, img.width, img.height)
			},
			pressMove: function(evt) {
				this.ImgTranslateX += evt.deltaX;
				this.ImgTranslateY += evt.deltaY;

				if(this.ImgTranslateX < this.minX) {
					this.ImgTranslateX = this.minX;
				}
				if(this.ImgTranslateY < this.minY) {
					this.ImgTranslateY = this.minY;
				}
				if(this.ImgTranslateX > this.maxX) {
					this.ImgTranslateX = this.maxX;
				}
				if(this.ImgTranslateY > this.maxY) {
					this.ImgTranslateY = this.maxY;
				}
				this.tempX = this.ImgTranslateX;
				this.tempY = this.ImgTranslateY;
				this.MatrixStyle = "translate(" + this.ImgTranslateX + "px," + this.ImgTranslateY + "px) scale(" + this.scale + ')';
				evt.preventDefault();
//				console.log("pressMove", evt.deltaX, evt.deltaY, this.MatrixStyle);
			},

			multipointEnd: function(event) {
//				if(this.temppinch !== 0)
//					this.scale = this.temppinch;
//

//				let img = this.$refs.RefImg.getBoundingClientRect();
//
//				this.minX = -(this.originX + (img.width) / 2 - this.divWidth);
//				this.minY = -(this.originY + (img.height) / 2 - this.divHeight);
//				this.maxX = img.width / 2 - this.originX;
//				this.maxY = img.height / 2 - this.originY;
//
//				if(this.ImgTranslateX < this.minX) {
//					this.ImgTranslateX = this.minX;
//				}
//				if(this.ImgTranslateY < this.minY) {
//					this.ImgTranslateY = this.minY;
//				}
//				if(this.ImgTranslateX > this.maxX) {
//					this.ImgTranslateX = this.maxX;
//				}
//				if(this.ImgTranslateY > this.maxY) {
//					this.ImgTranslateY = this.maxY;
//				}
//
//				console.log('multipointEnd: ' + this.scale + '\n img: ' + this.imgWidth + ',' + this.imgHeight +
//					'\n bounding: ' + img.width + ',' + img.height +
//					'\n tranXY: ' + this.ImgTranslateX + ',' + this.ImgTranslateY +
//					'\n maxXY: ' + this.minX + ',' + this.minY + ',' + this.maxX + ',' + this.maxY + 'temppinch:' + this.temppinch
//				);
//
//				this.MatrixStyle = "translate(" + this.ImgTranslateX + "px," + this.ImgTranslateY + "px) scale(" + this.temppinch + ')';
			},
			multipointStart: function(evt) {
				let x = (evt.touches[0].pageX + evt.touches[1].pageX) / 2;
				let y = (evt.touches[0].pageY + evt.touches[1].pageY) / 2;
				let div = this.$refs.AppDiv.getBoundingClientRect();
				let divLeft = div.left;
				let divTop = div.top;
				this.centerX = x - divLeft;
				this.centerY = y - divTop;
				
                console.log('multipointStart: ' , this.centerX, this.centerY);
			},
			ease: function(x) {
				return Math.sqrt(1 - Math.pow(x - 1, 2));
			},
			clickevent: function() {
				this.$emit('clickevent');
			}
		}
	}
</script>

<style>
	.AppImg {
		height: 100%;
		width: 100%;
		/*overflow: auto;*/
	}
</style>