/**
 *  2018/10/17  lize
 */
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const pageConfigPath = "./utils/pageConfig.json" // 旧的用
const pageInfoPath = './utils/pageInfo.json'; // 旧的用
const moduleInfoPath = './utils/moduleInfoPath.json'; // 新的用
module.exports = {
    //分模块打包
    subpackage:() =>{
        let pageconfig = JSON.parse(fs.readFileSync(pageConfigPath, "utf-8"));
        let pageInfo = JSON.parse(fs.readFileSync(pageInfoPath, "utf-8"));
        let pageNum = 0;
        let pages = {};
        for(let i in pageInfo){
          if(pageInfo[i].entry.split("/")[pageInfo[i].entry.split("/").length-3] == pageconfig.module) {
            pages[i] = pageInfo[i];
            pageNum++;
          }
        }
        if(!pageNum){
          throw new Error(`The ${pageconfig.module} module was not found`);
        }else{
          let configInfo =  {
            publicPath:'./',
            outputDir:`dist/${pageconfig.module}`,
            assetsDir:'',
            pages:pages,
          }
          console.log(configInfo,'本次打包的模块页面！');
          return configInfo
        }
      },
    //不带UI方法
    getPages: () => {
        const globPathHtml = ["./src/**/index.html"]; // 入口模板正则
        const globPathJs = ["./src/**/main.js"]; // 入口脚本正则
        const splitArray = list => {
            let newAry = [];
            if (list.length > 0) {

                for (let entry of list) {

                    entry = entry.substring(0, entry.lastIndexOf("/"));

                    newAry.push(entry);

                }

            }
            return newAry;
        };
        const WriteFileFn = (src, path, writeContent) => {

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

        };
        const fileExist = (filePath) => {

            return fs.existsSync(filePath, (exist) => {

                return exist;

            })

        };
        const uniqueArr = (arr1, arr2) => {

            let arr3 = arr1.concat(arr2);

            let arr4 = [];

            for (let i = 0, len = arr3.length; i < len; i++) {

                if (arr4.indexOf(arr3[i]) === -1) {

                    arr4.push(arr3[i])

                }

            }

            return arr4;

        };
        let iSError = false;
        let pages = {};
        let PageDetal = "";
        let PageCount = {};
        let confDemo = {};
        let PageNameList = [];
        let CBIMPACKAGECONF = {AllPAGEAGE: false};
        let fileHtmlList = splitArray(glob.sync(...globPathHtml));
        let fileJsList = splitArray(glob.sync(...globPathJs));
        CBIMPACKAGECONF = fs.readFileSync("./src/cbim.package.conf.json", "utf-8") ? JSON.parse(fs.readFileSync("./src/cbim.package.conf.json", "utf-8")) : CBIMPACKAGECONF;
        for (let entry of fileHtmlList) {

            if (fileJsList.indexOf(entry) >= 0) {

                if (!entry.includes("demo")) {

                    let paths = entry + "/conf.json";

                    let data = {

                        "title": entry.split("/")[entry.split("/").length - 1],

                        "filename": entry.split("/")[entry.split("/").length - 1],

                        "description": entry.split("/")[entry.split("/").length - 1],

                        "package": true,

                    };

                    if (fileExist(paths)) {

                        data = JSON.parse(fs.readFileSync(paths, "utf-8"));

                    } else {

                        fs.writeFile(paths, JSON.stringify(data), "utf8", error => {

                            if (error) return console.log(error);

                        });

                    }

                    if (!CBIMPACKAGECONF.AllPAGEAGE || !CBIMPACKAGECONF) {

                        if (data.package == undefined) {

                            data.package = true;

                        }

                        if ((data.package || data.package == undefined) && data.package != null) {

                            if (!PageNameList.includes(data.filename)) {

                                PageNameList.push(data.filename);

                                pages[data.filename] = {

                                    entry: `${entry}/main.js`,

                                    template: `${entry}/index.html`,

                                    filename: `${data.filename}.html`,

                                    title: `${data.title}`

                                };

                                if (data.chunks && CBIMPACKAGECONF.chunks) {

                                    pages[data.filename].chunks = uniqueArr(data.chunks, CBIMPACKAGECONF.chunks).concat([data.filename]);

                                } else {

                                    if (data.chunks) {

                                        pages[data.filename].chunks = data.chunks.concat([data.filename]);

                                    } else if (CBIMPACKAGECONF.chunks) {

                                        pages[data.filename].chunks = CBIMPACKAGECONF.chunks.concat([data.filename])

                                    }

                                }
                                confDemo[data.filename] = `${data.filename}.html`;

                                PageCount[entry.split("/")[entry.split("/").length - 1]] = data;

                                PageDetal += "#### " + entry.split("/")[entry.split("/").length - 1] + "：" + data.title + "\n>`\n文件名：" + data.filename + "\n`\n\n>`\n文件描述：" + data.description + "\n`\n";

                            } else {

                                iSError = true;

                                break;

                            }

                        }

                    } else {

                        if (!PageNameList.includes(data.filename)) {

                            PageNameList.push(data.filename);

                            pages[data.filename] = {

                                entry: `${entry}/main.js`,

                                template: `${entry}/index.html`,

                                filename: `${data.filename}.html`,

                                title: `${data.title}`

                            };

                            if (data.chunks && CBIMPACKAGECONF.chunks) {

                                pages[data.filename].chunks = uniqueArr(data.chunks, CBIMPACKAGECONF.chunks).concat([data.filename]);

                            } else {

                                if (data.chunks) {

                                    pages[data.filename].chunks = data.chunks.concat([data.filename]);

                                } else if (CBIMPACKAGECONF.chunks) {

                                    pages[data.filename].chunks = CBIMPACKAGECONF.chunks.concat([data.filename])

                                }

                            }

                            confDemo[data.filename] = `${data.filename}.html`;

                            PageCount[entry.split("/")[entry.split("/").length - 1]] = data;

                            PageDetal += "#### " + entry.split("/")[entry.split("/").length - 1] + "：" + data.title + "\n>`\n文件名：" + data.filename + "\n`\n\n>`\n文件描述：" + data.description + "\n`\n";

                        } else {

                            iSError = true;

                            break;

                        }

                    }

                }

            }

        }
        if (iSError) {
            throw new Error("The page name is not unique");
        } else {
            let stringConfdemo = JSON.stringify({
                code: 200,
                success: true,
                message: "",
                data: confDemo
            });
            WriteFileFn("./public", "./public/RouterInfo.conf.json", stringConfdemo);
            WriteFileFn("./src/pages", "./src/pages/Page.description.md", PageDetal);
            // console.log(pages, "这里是单页对象");
            // console.log(confDemo, "这里是配置模板");
            return pages;
        }
    },
    //带UI方法
    getPagesByGUI:() =>{
      const fileExist = (filePath)=>{
        return fs.existsSync(filePath,(exist) =>{
          return exist;
        })
      };
      const WriteFileFn = (src, path, writeContent) => {
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
      };
      let paths = "./utils/Page.json";
      if(!fileExist(paths)){
        throw new Error("the Page.json undefined ,you should first run 'app-win.exe or app-macos or app-linux'");
      }
      let confDemo = {};
      let data = JSON.parse(fs.readFileSync(paths, "utf-8"));
      for(let i in data.data){
        confDemo[i] = data.data[i].filename
      };
      let stringConfdemo = JSON.stringify({
        code: 200,
        success: true,
        message: "",
        data: confDemo
      });
      console.log(data.data);
      console.log(confDemo);
      WriteFileFn("./public", "./public/RouterInfo.conf.json", stringConfdemo);
      return data.data;
    },
};
