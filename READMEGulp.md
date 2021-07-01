
## gulp.task方法用来定义任务，内部使用的是Orchestrator，其语法为：
## gulp.task(name[, deps], fn)
>> name: 为任务名
>> deps: 是当前定义的任务需要依赖的其他任务，为一个数组。当前定义的任务会在所有依赖的任务执完毕后才开始执行。如果没有依赖，则可省略这个参数
>> fn: 为任务函数，我们把任务要执行的代码都写在里面，是当前任务的实际处理逻辑。该参数也是可选的。定义一个有依赖的任务
上面的例子中我们执行two任务时，会先执行one任务，但不会去等待one任务中的异步操作完成后再执行two任务，而是紧接着执行two任务。所以two任务会在one任务中的异步操作完成之前就执行了。

那如果我们想等待异步任务中的异步操作完成后再执行后续的任务，该怎么做呢？
有三种方法可以实现：
第一：在异步操作完成后执行一个回调函数来通知gulp这个异步任务已经完成,这个回调函数就是任务函数的第一个参数。

gulp.task('one',function(cb){ //cb为任务函数提供的回调，用来通知任务已经完成
  //one是一个异步执行的任务
  setTimeout(function(){
    console.log('one is done');
    cb();  //执行回调，表示这个异步任务已经完成，只是起一个通知的作用，并不是指向task two 的 fun
  },5000);
});

//这时two任务会在one任务中的异步操作完成后再执行
gulp.task('two',['one'],function(){
  console.log('two is done');
});
//one is done
//two is done

第二：定义任务时返回一个流对象。适用于任务就是操作gulp.src获取到的流的情况。

gulp.task('one',function(cb){
  var stream = gulp.src('client/**/*.js')
      .pipe(dosomething()) //dosomething()中有某些异步操作
      .pipe(gulp.dest('build'));
    return stream;
});

gulp.task('two',['one'],function(){
  console.log('two is done');
});
第三：返回一个promise对象，例如

var Q = require('q'); //一个著名的异步处理的库 https://github.com/kriskowal/q
gulp.task('one',function(cb){
  var deferred = Q.defer();
  // 做一些异步操作
  setTimeout(function() {
     deferred.resolve();
  }, 5000);
  return deferred.promise;
});

gulp.task('two',['one'],function(){
  console.log('two is done');
});
gulp.task()就这些了，主要是要知道当依赖是异步任务时的处理。

## gulp-sequence
Task 流程控制,当然也可以使用一些 gulp 的插件,比如 gulp-sequence 或是 run-sequence.
官方API 文档: https://www.npmjs.com/package/gulp-sequence

简单说明一下使用方法:

var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')

gulp.task('a', function (cb) {
  //... cb() 
})

gulp.task('b', function (cb) {
  //... cb() 
})

gulp.task('c', function (cb) {
  //... cb() 
})

gulp.task('d', function (cb) {
  //... cb() 
})

gulp.task('e', function (cb) {
  //... cb() 
})

gulp.task('f', function () {
  // return stream 
  return gulp.src('*.js')
})

// usage 1, recommend 
// 1. run 'a', 'b' in parallel; 
// 2. run 'c' after 'a' and 'b'; 
// 3. run 'd', 'e' in parallel after 'c'; 
// 3. run 'f' after 'd' and 'e'. 
gulp.task('sequence-1', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'))

// usage 2 
gulp.task('sequence-2', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f', cb)
})

// usage 3 
gulp.task('sequence-3', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f')(cb)
})

gulp.task('gulp-sequence', gulpSequence('sequence-1', 'sequence-2', 'sequence-3'))

简单使用方式 :

var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var fs = require('fs');

// This will run in this order:
// * build-clean
// * build-scripts and build-styles in parallel
// * build-html
// * Finally call the callback function
gulp.task('build', function(callback) {
  runSequence('build-clean',
              ['build-scripts', 'build-styles'],
              'build-html',
              callback);
});