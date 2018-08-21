<template>
	<!--<div class="AppImg" v-finger:pinch="ZoomOut" v-finger:press-move="pressMove" v-finger:multipoint-end="multipointEnd" ref="AppDiv">-->
	<div class="AppImg" v-finger:pinch="ZoomOut" v-finger:touch-end="touchEnd" ref="AppDiv"   v-finger:tap="clickevent">
		<!--<div class="AppImg" v-touch:scale ref="AppDiv">-->
		<!--<img ref="RefImg" src="static/img/ChinaMap.jpeg" :style="{scaleX:ImgScaleX,scaleY:ImgScaleY,translateX:ImgTranslateX,translateY:ImgTranslateY}" />-->
		<img src="static/img/ChinaMap.jpeg" ref="RefImg" :style="{height:ImgHeight, width:ImgWidth}" />
		<!--<img src="static/img/ChinaMap.jpeg" style="position:relative;left:-800px;top:-100px;" ref="RefImg" :style="{TranslateX:ImgTranslateX,TranslateY:ImgTranslateY,height:ImgHeight, width:ImgWidth}" />-->
	</div>
</template>

<script>
	import BScroll from 'better-scroll'
	import store from '../../router/storage.js'

/**
 * 使用v-finger和better-scroll实现缩放，又严重的bug，图像缩放会突然发生位移，猜测是better-scroll的多线程问题
 * 导致translate值不对
 */

//	Vue.use(veTouch);
	export default {
		store,
		data: function() {
			return {
				ImgHeight: '1500px',
				ImgWidth: '1352px',
				InitScale: 1,
				FstFlg: false,
				Scale: 4864 / 5395,
				ImgScaleX: 100,
				ImgScaleY: 1,
				ImgTranslateX: '0',
				ImgTranslateY: '0',
				imgEl: null,
				AppDiv: null,
				scroll: null,
				MAXSCAL: 1.5,
                oldWidth: 5395,
                oldHeight: 4864,
                fillType: 'H',
                temppinch: 1

			}
		},
		mounted() {
			this.imgEl = this.$refs.RefImg;
			this.AppDiv = this.$refs.AppDiv;
			
			let innerWidth = this.$refs.RefImg.width;
			let InnerHeight = this.$refs.RefImg.height;
			//			this.Scale = this.ImgHeight / this.ImgWidth;
			let InitFlg = this.$route.params.Openfalg;
			let StrX = 0;
			let StrY = 0;
			StrX = -450;
			StrY = -150;
			let opt = {
				scrollX: true,
				scrollY: true,
				freeScroll: true,
				scrollbar: false,
				bounce: false,
				startX: StrX,
				startY: StrY,
				//				maxScrollX:-5395,
				//				maxScrollY:-4864,
				//				click:false
				//				disableTouch:false
			};
			this.$nextTick(() => {
				this.scroll = new BScroll(this.$refs.AppDiv, opt);
//				console.log('$nextTick' + this.scroll.x + ',' + this.scroll.y);
//				this.scroll.maxScrollX = -1 * (this.ImgWidth -  this.AppDiv.offsetWidth );
//				this.scroll.maxScrollY = -1 * ( this.ImgHeight -  this.AppDiv.offsetHeight);

//				let TempHeight = 1500;
//				let TempWidth = Math.round(TempHeight / this.Scale);
//
//				this.ImgWidth = TempWidth + 'px';
//				this.ImgHeight = TempHeight + 'px';
				//				
				//				console.log('$nextTick'+ this.Scale + ','+TempHeight+ ','+TempWidth + ','+this.ImgWidth+ ',' +this.ImgHeight);
			});
			//			this.scroll.scrollBy(-1200, -1100, 500);
			//			this.$refs.AppDiv.scrollTop = '200px';
			//			this.$refs.AppDiv.scroll(60,60);

		},
		methods: {
			clickevent: function() {
				this.$emit('clickevent');
				console.log('clickevent:' + this.ImgHeight + ',' + this.ImgWidth + ',' + this.scroll.x + ',' + this.scroll.y);
			},
			ZoomOut: function(event) {
//			    console.log('parseInt(this.ImgWidth) / this.oldWidth, '+ parseInt(this.ImgWidth) / this.oldWidth)
			    if ((event.zoom > 1) && (parseInt(this.ImgWidth) / this.oldWidth >= this.MAXSCAL)) {
                    console.log('已经放大到最大倍数：' + this.ImgWidth, this.ImgHeight)
                    return 
                }
//			    console.log('parseInt(this.ImgWidth) / this.AppDiv.offsetHeight, '+ parseInt(this.ImgWidth) / this.AppDiv.offsetHeight)
                if ((event.zoom < 1)  
                    && ( parseInt(this.ImgHeight) / this.AppDiv.offsetHeight <= 1 
                        || parseInt(this.ImgWidth) / this.AppDiv.offsetWidth <= 1 )) {
                    console.log('已经缩小到到最小倍数: ' + this.ImgWidth + ' ' + this.ImgHeight)
                    return
                } 
			    if ( Math.abs(event.zoom - this.temppinch) < 0.02 ) {
			        console.log('缩放太小忽略：', this.temppinch, event.zoom);
			        return 
			    } 
			    this.temppinch = event.zoom;
			    
                let pinch = event.zoom < 1 ? (-1 / event.zoom) : event.zoom;
                let totalPinch = parseInt(this.ImgWidth) / this.AppDiv.offsetWidth;
                console.log('pinch:', event.zoom, pinch, Math.sqrt(totalPinch))
                let ChangeSet = Math.round(pinch * 10 * Math.sqrt(totalPinch));
                
				let OldWidth = this.ImgWidth;
				let TempHeight = parseInt(this.ImgHeight) + ChangeSet;
				let TempWidth = Math.round(TempHeight / this.Scale);
				
				let DiffWIdth = TempWidth - OldWidth;
				
				if(TempHeight <  this.AppDiv.offsetHeight){
					TempHeight = this.AppDiv.offsetHeight;
					TempWidth = Math.round(TempHeight / this.Scale);
				}
				if(TempWidth <  this.AppDiv.offsetWidth){
                    TempWidth = this.AppDiv.offsetWidth;
                    TempHeight = Math.round(TempWidth * this.Scale);
                }

				this.ImgTranslateX = Math.round((-1 * ChangeSet) / 2);
				this.ImgTranslateY = Math.round((-1 * ChangeSet * this.Scale) / 2);

				this.scroll.maxScrollX = ( TempWidth -  this.AppDiv.offsetWidth) * -1;
				this.scroll.maxScrollY = ( TempHeight - this.AppDiv.offsetHeight) * -1;
				
				this.ImgWidth = TempWidth + 'px';
                this.ImgHeight = TempHeight + 'px';
                this.scroll.refresh();
                
				this.$nextTick(() => {
				    this.scroll.scrollBy(this.ImgTranslateX, this.ImgTranslateY, 0);
                    console.log('ZoomOut:' + this.ImgHeight + ',' + this.ImgWidth + ',' + this.scroll.x + ',' + this.scroll.y);
                })
				
			},
			pressMove: function(evt) {
//				console.log(evt.deltaX);
//				console.log(evt.deltaY);
//				this.ImgTranslateX = evt.deltaX + 5;
//				this.ImgTranslateY = evt.deltaY + 5;
////				let x = Math.abs(this.scroll.x)  +  ;
////				console.log("pressMove" +x + ','  +this.ImgWidth)
//				if((Math.abs(this.scroll.x)  +  this.AppDiv.offsetWidth)<= parseInt(this.ImgWidth)) {
//					console.log("offsetWidth" + this.scroll.x + ',' + this.ImgWidth + ','  + this.AppDiv.offsetWidth);
//					this.ImgTranslateX = 0;
//				}
//				if((Math.abs(this.scroll.y)  +  this.AppDiv.offsetHeight)<= parseInt(this.ImgHeight)) {
//					console.log("offsetHeight" + this.scroll.y + ',' + this.ImgHeight + ','  + this.AppDiv.offsetHeight);
//					this.ImgTranslateY = 0;
//				}
//
//				this.scroll.scrollBy(this.ImgTranslateX * -1, this.ImgTranslateY * -1, 0);
//				evt.preventDefault();
				console.log("pressMove" + this.scroll.x + ',' + this.scroll.y);
			},
			multipointEnd: function(evt) {

				console.log("multipointEnd");
				this.initScale = this.ImgScaleX;
			},
			touchEnd: function(event) {
			    
//			    this.scroll.scrollBy(this.ImgTranslateX, this.ImgTranslateY, 0);
			    console.log('touch end:' + this.ImgHeight + ',' + this.ImgWidth + ',' + this.scroll.x + ',' + this.scroll.y);
			},

			ease: function(x) {
				return Math.sqrt(1 - Math.pow(x - 1, 2));
			},
			moveTo: function(_storeId) {
				let _point = polygonPoints[_storeId];
				let _scale = 2;

				let _center = getCenter(_point);
				let _x = window.innerWidth - _center.deltaX * _scale;
				let _y = 30;

				highLight(_storeId);

				new To(this.imgEl, "scaleX", _scale, _timeout, ease);
				new To(this.imgEl, "scaleY", _scale, _timeout, ease);

				new To(this.imgEl, "translateX", _x, _timeout, ease);
				new To(this.imgEl, "translateY", _y, _timeout, ease);
			},
			getCenter: function(_points) {
				let _oddY = 0;
				let _evenX = 0;
				let _result = {
					deltaX: 0,
					deltaY: 0
				};
				for(let i in _points) {
					if(i % 2 == 0) {
						_evenX += _points[i];
					} else {
						_oddY += _points[i];
					}
				}

				let _rate = $("#hit").width() / 1920;

				_result.deltaY = Math.round(_oddY * _rate / (_points.length / 2))
				_result.deltaX = Math.round(_evenX * _rate / (_points.length / 2))

				return _result;
			}

		}
	}
</script>

<style>
	.AppImg {
		height: 100%;
		width: 100%;
	}
</style>