/**
 *  2019/9/12  lize
 */
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const child_process = require('child_process');
const pageInfoPath = './utils/pageInfo.json';
const pageConfigPath = "./utils/pageConfig.json";
const fileExist =  (filePath) =>{
  return fs.existsSync(filePath, (exist) => {
    return exist;
  })
}
const WriteFileFn = (src, path, writeContent) =>{
  fs.exists(src, publicxists => {
    if (publicxists) {
      fs.writeFile(path, writeContent, "utf8", error => {
        if (error) return console.log(error);
      });
    } else {
      fs.mkdir(src, err => {
        if (err) return console.error(err);
        fs.writeFile(path, writeContent, "utf8", error => {
          if (error) return console.log(error);
        });
      });
    }
  });
}
let packageNum = 0;
class packageTool {
  constructor(opt){
    this.module = opt.argv && opt.argv.length ? opt.argv : [];
    this.iSError = false;
    this.pages = {};
    this.PageDetal = "";
    this.PageCount = {};
    this.confDemo = {};
    this.PageNameList = [];
    this.CBIMPACKAGECONF = {AllPAGEAGE: true};
    this.fileHtmlList = '';
    this.fileJsList = '';
    this.Init();
  }
  static globPathHtml = ["./src/**/index.html"]; // 入口模板正则
  static globPathJs = ["./src/**/main.js"]; // 入口脚本正则
  static splitArray (list){
    let newAry = [];
    if (list.length > 0) {
      for (let entry of list) {
        entry = entry.substring(0, entry.lastIndexOf("/"));
        newAry.push(entry);
      }
    }
    return newAry;
  }
  static splitArray (list){
    let newAry = [];
    if (list.length > 0) {
      for (let entry of list) {
        entry = entry.substring(0, entry.lastIndexOf("/"));
        newAry.push(entry);
      }
    }
    return newAry;
  }
  static uniqueArr (arr1, arr2) {
    let arr3 = arr1.concat(arr2);
    let arr4 = [];
    for (let i = 0, len = arr3.length; i < len; i++) {
    
      if (arr4.indexOf(arr3[i]) === -1) {
      
        arr4.push(arr3[i])
      
      }
    
    }
    return arr4;
  }
  Init(){
    this.fileHtmlList = packageTool.splitArray(glob.sync(...packageTool.globPathHtml));
    this.fileJsList = packageTool.splitArray(glob.sync(...packageTool.globPathJs));
    this.CBIMPACKAGECONF = fs.readFileSync("./src/cbim.package.conf.json", "utf-8") ? JSON.parse(fs.readFileSync("./src/cbim.package.conf.json", "utf-8")) : this.CBIMPACKAGECONF;
    this.assemblyPages();
  }
  assemblyPages(){
    for(let entry of this.fileHtmlList){
      if(this.fileJsList.indexOf(entry) >= 0){
        if(!entry.includes("demo")){
          let paths = entry + "/conf.json";
          let data = {
            title:entry.split("/")[entry.split("/").length - 1],
            filename:entry.split("/")[entry.split("/").length - 1],
            description:entry.split("/")[entry.split("/").length - 1],
            package:true,
            chunk:[entry.split("/")[entry.split("/").length - 1]],
          }
          if( fileExist(paths)){
            data = JSON.parse(fs.readFileSync(paths, "utf-8"));
          }else{
            fs.writeFile(paths, JSON.stringify(data), "utf8", error => {
              if (error) return console.log(error);
            });
          }
          // if(!this.CBIMPACKAGECONF.AllPAGEAGE){
          //   if(data.package !=true || data.package!=false){
          //     data.package = true;
          //   }
          // }else{
            data.package = true;
          // }
          if(!this.PageNameList.includes(data.filename)) {
            this.PageNameList.push(data.filename);
            this.pages[data.filename] = {
              entry: `${entry}/main.js`,
              template: `${entry}/index.html`,
              filename: `${data.filename}.html`,
              title: `${data.title}`
            };
            if (data.chunks && this.CBIMPACKAGECONF.chunks) {
              this.pages[data.filename].chunks = JSON.stringify(packageTool.uniqueArr(data.chunks, this.CBIMPACKAGECONF.chunks).concat([data.filename]));
            } else {
              if (data.chunks) {
                this.pages[data.filename].chunks = JSON.stringify(data.chunks.concat([data.filename]));
              } else if (this.CBIMPACKAGECONF.chunks) {
                this.pages[data.filename].chunks = JSON.stringify(this.CBIMPACKAGECONF.chunks.concat([data.filename]))
              }
            }
            this.confDemo[data.filename] = `${data.filename}.html`;
          }else{
            this.iSError = true;
            break;
          }
        }
      }
    }
    if(this.iSError){
      throw new Error("The page name is not unique");
    }else{
      // console.log(this.pages, "这里是单页对象");
      // console.log(this.confDemo, "这里是配置模板");
     WriteFileFn("./utils", pageInfoPath, JSON.stringify(this.pages));
    }
  }
}
(function(){
  const sheelModule = (type) =>{
    return new Promise((resolve,reject) =>{
      let order = !type || type == 'development' || type == 'production' ? `npx vue-cli-service build` : `npx vue-cli-service build --mode ${type}`;
      // let order = !type || type == 'development' || type == 'production' ? `npm run build` : `npm run build --mode ${type}`;
      setTimeout(() =>{
        let work_child_process= child_process.exec(order,{cwd:process.cwd()},(error) =>{
          if(error){
            reject({success:false,data:error})
          }
        });
        let progressBar = '';
        work_child_process.stdout.on('data',(stdout) =>{
          progressBar = !progressBar ? 2 : 0;
          if(!progressBar){
            setTimeout(() =>{
              resolve({success:true,data:stdout})
            },1000)
          }else{
            progressBar = 0;
          }
          console.log(`stdout ${stdout}`)
        });
        work_child_process.stderr.on('data',(stderr) =>{
          progressBar = 1;
        });
        work_child_process.on('exit',(close) =>{
          reject({success:true,data:'close'})
        });
      },500);
    })
  };
  const argv = process.argv.splice(2,process.argv.length);
  let NODE_ENVAry = argv.filter(i => i.includes('NODE_ENVssss'));
  let NODE_ENV = NODE_ENVAry.length ? NODE_ENVAry[NODE_ENVAry.length-1].split('NODE_ENV')[1] : '' ;
  console.log(argv, 'ss', NODE_ENVAry, ']]', NODE_ENV);
  let moduleAry = argv.filter(i => !i.includes('NODE_ENV'));
  let pageConfigInfo = JSON.parse(JSON.stringify({moduleAry,NODE_ENV}));
  console.log(moduleAry,'----', pageConfigInfo);
  new packageTool({argv});
  const qwe = (type) =>{
    if(packageNum < pageConfigInfo.moduleAry.length){
      let WriteDatas = {module:pageConfigInfo.moduleAry[packageNum]}
      WriteFileFn("./utils",pageConfigPath,JSON.stringify(WriteDatas));
      sheelModule(type).then((e) =>{
        console.log(e);
        packageNum++;
        qwe(type);
      })
        .catch((er) =>{
          console.log(er);
        })
    }else{
      fs.unlink(pageConfigPath,(err)=>{
        if(err){
          throw err;
        }
        console.log('文件:'+pageConfigPath+'删除成功！');
      })
    }
  };
  qwe(NODE_ENV);
})()

