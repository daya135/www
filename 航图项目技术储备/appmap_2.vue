<template>
    	<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true" onclick="clickevent">
    	    <div class="pswp__bg"></div>
    	    <div class="pswp__scroll-wrap">
    	        <div class="pswp__container">
                    <div class="pswp__item"></div>
                    <div class="pswp__item"></div>
                 <div class="pswp__item"></div>
                </div>
            </div>
    </div>  
</template>

<script>
	import store from '../../router/storage.js'
/**
 * 使用photoswipe处理图片缩放，唯一的bug就是图片太大可能会闪退
 */
	export default {
		store,
		data: function() {
			return {
			}
		},
		mounted() {
            this.OpenFile('ChinaMap.jpg', true) 
		},
		methods: {
			clickevent: function() {
			    console.log('clickevent');
				this.$emit('clickevent');
			},
			OpenFile: function(imgname, needZoom) {
			    let pswpElement = document.querySelectorAll('.pswp')[0];
                console.log('mounted imgname, needZomm:' + imgname + ' ' + needZoom);
                
                let items = [
                    {
                        src: 'static/img/' + imgname,
                        //当图片超过此大小时，最终已此大小为准决定最大清晰度
                        w: 7130,
                        h: 6500
                    }
                ];
                let options = {
                    index: 0 ,
                    maxSpreadZoom: 2,
                    closeOnScroll: false,   
                    closeOnVerticalDrag: false,
                    pinchToClose:false,
                    loadingIndicatorDelay:0,
                    showAnimationDuration:0
                };
                let gallery = new PhotoSwipe( pswpElement, null, items, options);
                gallery.init();
                
                if(needZoom) {
                    //调整初始化缩放倍数和中心点
                    gallery.zoomTo(0.2, {x:gallery.viewportSize.x / 1.1, y:gallery.viewportSize.y / 2.5}, 0, false, function(now) {
                        console.log('mounted zoom over ', gallery.viewportSize.x, gallery.viewportSize.y);
                    });
                    //调整loading.gif的位置
                    let bak = document.getElementsByClassName('pswp__img--placeholder--blank')
                    bak[0].style.backgroundPosition = '82% 35%';
                }
                 gallery.framework.bind( gallery.scrollWrap, 'pswpTap', (e) => {
                    this.$emit('clickevent');
                });
			}
		}
	}
</script>

<style>
	.AppImg {
		height: 100%;
		width: 100%;
	}
	.pswp__img--placeholder--blank {
	    background: url(../../static/icon/downloading.gif) no-repeat 20% 50%;
	    background-size: 25rem 25rem;
	}
	

</style>