import person from './testModule.js'

console.log('index.js：' + person.name + person.age);

var spanclick = function(obj){
	obj.innerText=person.name + person.age;
}
