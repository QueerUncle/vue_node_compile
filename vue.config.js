/**
 *  2019/7/22  lize
 */
//自动成成多页
const utils = require ('./utils/utils');
const pageInfo= require('./utils/pageInfo.json');

//获取当前时间戳
const Timestamp = new Date ().getTime ();
//是否自定义拆包
const splitChunksKey = false;
// 是否开启Gzip压缩
const CompressionWebpackPluginKey = true;
const CompressionWebpackPlugin = require ('compression-webpack-plugin');
// 是否开启分析工具
const AnalyzerKey = false;
const Analyzer = require ('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  publicPath: pageInfo.publicPath,
  outputDir: pageInfo.outputDir,
  assetsDir: pageInfo.assetsDir,
  pages: pageInfo.pages,
  // publicPath:'./', //部署应用包时的基本 URL。默认为 ./
  // publicPath: process.env.NODE_ENV == 'development' ? './' : utils.subpackage().publicPath, //部署应用包时的基本 URL。默认为 ./
  // // publicPath:utils.subpackage().publicPath, //部署应用包时的基本 URL。默认为 ./
  // // outputDir:'dist', // 生产环境构建文件的目录  默认 dist
  // outputDir: process.env.NODE_ENV == 'development' ? 'dist' : utils.subpackage().outputDir, // 生产环境构建文件的目录  默认 dist
  // // outputDir:utils.subpackage().outputDir, // 生产环境构建文件的目录  默认 dist
  // // assetsDir:'',  //放置生成的静态资源 (js、css、img、fonts) 的目录  默认为 ""
  // assetsDir: process.env.NODE_ENV == 'development' ? '' :  utils.subpackage().assetsDir,  //放置生成的静态资源 (js、css、img、fonts) 的目录  默认为 ""
  // // assetsDir:utils.subpackage().assetsDir,  //放置生成的静态资源 (js、css、img、fonts) 的目录  默认为 ""
  // // pages:utils.getPages (), //单页对象。  utils.getPages() 自动生成多页对象。
  // pages: process.env.NODE_ENV == 'development' ? utils.getPages () : utils.subpackage().pages, //单页对象。  utils.getPages() 自动生成多页对象。
  // pages:utils.subpackage().pages, //单页对象。  utils.getPages() 自动生成多页对象。
  // pages:utils.getPagesByGUI (), //单页对象。  utils.getPages() 自动生成多页对象。
  devServer:{  //该项参数较多，具体可参考vue_cli3的API,或者webpack的API
    // index:'index-index.html',
    port:8990, //项目启动监听的端口号，
    host:'0.0.0.0', //指定要使用的主机。默认情况下这是localhost. 如果您希望外部可以访问您的服务器，请设置为 0.0.0.0
    open:false, //配置是否默认打开浏览器，默认 false,
    // proxy:'',  //设置代理服务器地址。 有俩种写法，具体可参考vue_cli3的API,或者webpack的API。
  },
  configureWebpack:config =>{
    // 分析插件
    AnalyzerKey ? config.plugins.push(new Analyzer()): false;
    splitChunksKey ? config.optimization = {  //配置该项时,需在 src/pages/Page.description.json中添加chunks字段,并填写自定义包名
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks : {
        minSize  : 102400,
        minChunks: 2,
        cacheGroups: {
          lib   : {
            name    : 'lib',
            test    : /[vue|iview]/,
            priority: 0,
            chunks  : 'all'
          },
          common: {
            name  : 'common',
            chunks: 'initial'
          }
        }
      }
    } : false ;
    // 打包Gzip压缩
    CompressionWebpackPluginKey ? config.plugins.push (
      new CompressionWebpackPlugin ({
        filename : '[path].gz[query]',
        algorithm: 'gzip',
        test     : new RegExp ('\\.(js|css)$'),
        threshold: 10240,
        minRatio : 0.8
      })
    ) : false ;
    return {
      output: {
        // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
        filename     : `js/[name].${Timestamp}.js`,
        chunkFilename: `js/[name].${Timestamp}.js`
      }
    }
  }
};
