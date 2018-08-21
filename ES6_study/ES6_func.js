/* 
 * http://es6.ruanyifeng.com/?search=promise&x=0&y=0#docs/function#箭头函数
 * this指向的固定化，并不是因为箭头函数内部有绑定this的机制，实际原因是箭头函数根本没有自己的this，导致内部的this就是外层代码块的this。正是因为它没有this，所以也就不能用作构造函数。
 * 除了this，以下三个变量在箭头函数之中也是不存在的，指向外层函数的对应变量：arguments、super、new.target。
 */

var o = {
    user:"追梦子",
    fn:function(){  //这个函数的调用者为o，与底下Timer类中的function不一样
        console.log(this.user);  
    }
}
o.fn();	//此时fn中的调用者为o

/*******************************************/
function Timer() {
	this.s1 = 0;
	this.s2 = 0;
	setInterval(() => this.s1++, 1000);
	setInterval(function(){			//请注意，这里function的调用者为window
		this.s2++;
	}, 1000);
}

var timer = new Timer();
setTimeout(() => console.log('s1:', timer.s1), 3100);
setTimeout(() => console.log('s2:', timer.s2), 3100);

var id = 'global obj';
function foo(){
	console.log('foo id:', this.id);	//call函数会改变运行时作用域，对foo的this产生影响，但setTimeout的This仍指向global
	setTimeout(function(){	//普通函数，this指向运行时所在的作用域
		console.log('setTimeout id:', this.id)
	}, 1);
}
function foo2(){
	setTimeout(() => console.log('setTimeout2 id:', this.id), 1); //箭头函数导致this总是指向函数定义生时所在的作用域（此处指向foo2）
}

foo();
foo.call({'id': 'run id'});
foo2();
foo2.call({'id': 'run id'});  //call将foo2的this指向{'id', 'run id'}对象，然后箭头函数将setTimeout的this指向了foo2，递推则指向了{'id', 'run id'}


/*************************************************************************************/
var x = "我是全局变量";　　　　//定义全局变量x  
function a(){　　　　　　　　　//定义函数类结构a　　  
    this.x = "我是在函数类结构a中声明的哦";      
}  
//定义普通函数，弹出当前指针所包含的变量x的值  
function f(){         
    consolg.log(this.x);
}  
//返回值为“我是在函数类结构a中声明的哦”  
f.call(new a()); 

//说明call的继承思想,调用者被call参数对象继承
function f(){      
    this.a ="a";      
    this.b = function(){      
        console.log("b");  
    }  
}  
function e(){      
    f.call(this); //此时e()继承了f()的属性
}  
var c = new e();  
console.log(c.a);  //弹出a  
c.b();    //弹出b
