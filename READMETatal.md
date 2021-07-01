下载官网上的文件，我们能看到以下CesiumJS库结构：
Source/: Cesium应用程序代码及数据
ThirdParty/：外部依赖库，不同于Cesium的第三方库
LICENSE.md：Cesium的License介绍
index.html：Web首页，需要按照Cesium要求定义页面，同时添加Cesium依赖库
server.js：基于node.js的web服务应用

Cesium的源码结构还是很清晰的。
1 Source/Widgets 主要存放的就是Cesium的UI控件,例如我们平时用的CesiumWidget()等等。。。。
2 Source/DataSource 主要存放Entity和DataSource相关最接近用户使用的API，包括geojson的加载等等
3 Source/Scene 则是建立的一个三维场景，并提供基础的三维图元
4 Source/Renderer 则是对WebGL底层函数的封装
5 Source/Core 各种算法、基础类
6 Source/Workers 工作线程，主要用于几何体的创建等
7 Source/WorkersES6 工作线程，主要针对于ES6语法重新构建用于几何体的创建等

Cesium的最终性能优化在于两个方面：
  1、数据的优化，
  2、cesium调度和渲染引擎的优化。
    基于现阶段来说，我觉得后者已经到了一个目前软硬件环境下的较高水平了，即便你源码滚瓜烂熟，你也不可能提升一个量级的性能。所以如果你是一个行业的研发人员，那么更应该结合你自己的数据，遵循3dtiles的标准，去优化数据，而不是反其道去优化源码。