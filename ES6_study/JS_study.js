function myBrowser(){
	var userAgent = window.navigator.userAgent;
	if (userAgent.indexOf("Chrome") > -1) {
		alert("Chrome");
	}
	if (userAgent.indexOf("Opera") > -1) {
		alert("Opera");
	}
	if (userAgent.indexOf("Firefox") > -1) {
		alert("Firefox");
	}
	if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1) {
		//因为chrome浏览器的userAgent也带有safari的版本信息，所以要特殊处理
		alert(Safari);
	}
	if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        alert("IE");
    }; //判断是否IE浏览器
}

/*
 * 练习数组和对象的创建方式
 */
function arrayAndObjext(){
	
	var a = new Array({key:"jzz", value:"100"}, {key:"jzl", value:"1000"});
	for (var i = 0; i < a.length; i++) {
		console.log(a[i].key + " " + a[i].value);
	}
	var b = new Array("a", "b", "c");
	for (var i = 0; i < b.length; i++) {
		console.log(b[i]);
	}
	
	var c = (1, 2, 3);	//这种方式是错误的数组定义方法
	for (var i = 0; i < c.length; i++) {
		console.log(c[i]);
	}

	var d = new Array();
	d[0] = 1;
	d[1] = 2;
	for (var i = 0; i < d.length; i++) {
		console.log(d[i]);
	}

	//创建对象方法1
	var person=new Object();
	person.firstname="Bill";
	person.lastname="Gates";
	person.age=56;
	person.toString=function(){
		return this.firstname + this.lastname + this.age;
	}
	console.log(person);
	console.log(person.toString());
	
	//创建对象方法2
	var person={firstname:"John",lastname:"Doe",age:50,eyecolor:"blue"};
	//person2 = Object.create({firstname:"John",lastname:"Doe",age:50,eyecolor:"blue"});//通过person构造
	console.log(person);
	console.log(person.toString());
	
	//创建对象方法3，通过构造函数
	var jzz = new Person('jzz','jzz',20);
	var jzl = new Person('jzl','jzl',20);
//	jzz.prototype.toString = function() { //不能这么写，jzz.prototype为undefined
//		return "aaa!!~~~";
//	}
	//重写
	jzz.toString = function() {
		return "aaa!!~~~";
	}
	console.log(jzz);
	console.log(jzz.toString());
	console.log(jzl);
	console.log(jzl.toString());
	console.log(jzl instanceof Person);
	console.log(jzl.constructor === Person);
	console.log(jzl.constructor.constructor);
	
	
}

//构造函数一般首字母大写，区别普通函数
//构造函数的this会被绑定到创建的对象实例上。普通函数的this则属于此函数的调用者（顶层调用this即为windows，object.func时则this是个对象）。
//任何函数，只要通过 new 操作符来调用，那它就可以作为构造函数 ；否则就视为普通函数
function Person(firstname, lastname, age){
	this.firstname = firstname;
	this.lastname = lastname;
	this.age = age;
}
Person.prototype.toString=function(){	//通过原型对象添加属性
	return this.firstname + this.lastname + this.age;
}
