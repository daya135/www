var name = "global";
var age = 100;

/* 普通函数版本 */
console.log('普通函数版本.....');
var Obj = {
	name: "obj",
	objage: this.age,
	ObjFunc: function() {
		console.log("Obj:", this.name, this.age); //this指向运行时的作用域
	}
};
var foo = Obj.ObjFunc;
Obj.ObjFunc();  //运行时作用域为Obj对象
Obj.ObjFunc.call({name: 'callobj', age: 90});	//运行作用域为call内参数，改变运行作用域
foo();	//运行时作用域为window对象

/* 箭头函数版本 */
console.log('箭头函数版本.....');
var Obj2 = {
	name: "obj",
	objage: this.age,
	ObjFunc: () => console.log("Obj:", this.name, this.age) //this指向定义时的作用域
};
var foo2 = Obj.ObjFunc;
Obj2.ObjFunc();
Obj2.ObjFunc.call({name: 'callobj', age: 90}); //call也改变不了作用域
foo2();

/*	全局变量也自动成了顶层对象（浏览器为window）的属性
 *  ES6 为了改变这一点，一方面规定，为了保持兼容性，var命令和function命令声明的全局变量，依旧是顶层对象的属性；
 *  另一方面规定，let命令、const命令、class命令声明的全局变量，不属于顶层对象的属性。 */
console.log('顶层对象的属性与全局变量挂钩.....');
console.log("window.name:", window.name)		

