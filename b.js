let obj = require('./a.js');
obj.setCount();

console.log('b', obj.count)


setTimeout(() => {
    console.log('b.next', obj.count);
})