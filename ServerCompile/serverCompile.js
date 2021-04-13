/*
  @Author: lize
  @Date: 2021/4/12
  @Description : vue 打包工具
  @Parames :
  @Example :
  @Last Modified by: lize
  @Last Modified time: 2021/4/12
 */
const program = require('commander'); // 命令行参数解析工具
const chalk = require('chalk'); // 输出颜色工具
const ora = require('ora'); // 进度条
const glob = require("glob"); // 匹配模版工具
const fs = require("fs"); // 读写模块
const child_process = require('child_process');
const pageInfoPath = './utils/pageInfo.json'; // 页面信息文件地址
const moduleInfoPath = './utils/moduleInfo.json'; // 模块文件地址
const packConfigPath = './utils/packConfig.json'; // 打包基本配置文件地址
// 判断路径是否存在
const fileExist =  (filePath) =>{
    return fs.existsSync(filePath, (exist) => {
        return exist;
    })
}
// 写具体路径下写文件
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
// 删除文件
const delDir = (path) => {
    let files = [];
    if(fileExist(path)){
        files = fs.readdirSync(path); // 获取模块下所有的文件
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){ // 判断是不是文件夹
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}
// 超找并生成页项目页面集合
class PackageTool {
    // public下是否有index.html
    static publicIndexExists = fileExist('./public/index.html');
    // 打包配置信息
    static packConfig = {};
    // 入口模板正则
    static globPathHtml = ["./src/**/index.html"];
    // 入口脚本正则
    static globPathJs = ["./src/**/main.?(j|t)s"];
    // 把匹配出来的文件，变为对象格式
    static TemplateFormat = (list) => {
        if (!list || !list.length) return [];
        const newAry = [];
        for (let i = 0; i < list.length; i += 1) {
           const filePath = list[i].substring(0, list[i].lastIndexOf("/"));
           const filePathAry = list[i].split('/');
           const moduleName = filePathAry[filePathAry.length - 3];
           const pageName = filePathAry[filePathAry.length - 2];
           const obj = { pageName, moduleName, path: filePath.substring(0, filePath.lastIndexOf("/")) };
           obj[pageName] = {
               entry: list[i],
               template: '',
               filename: `${moduleName}-${pageName}.html`,
               title: `${pageName}`,
               chunks: [...PackageTool.packConfig.commonChunks, `${moduleName}-${pageName}`, `${pageName}`],
           };
            if (fileExist(`${filePath}/index.html`)) {
                obj[pageName]['template'] = `${filePath}/index.html`;
            } else if (PackageTool.publicIndexExists) {
                obj[pageName]['template'] = 'public/index.html';
            } else {
                throw new Error("template not found");
            }
           newAry.push(obj);
        }
        return newAry;
    }
    constructor(){
        this.pageInfo = { pages: {} }; // page信息
        this.moduleInfo = { _modules:[] }; // 模块信息
        this.fileHtmlList = '';
        this.fileJsList = '';
        if (!fileExist(packConfigPath)) {
            throw new Error("packConfig.json not found");
        }
        this.init();
    }
    // 初始化
    init(){
        PackageTool.packConfig = JSON.parse(fs.readFileSync(packConfigPath, "utf-8"));
        this.pageInfo = {...this.pageInfo, ...PackageTool.packConfig};
        this.fileJsList = PackageTool.TemplateFormat(glob.sync(...PackageTool.globPathJs));
        this.createPages(this.fileJsList);
    }
    // 创建页面集合
    createPages(fileJsList){
        const { moduleInfo } = this; // 模块信息
        for (let i = 0; i < fileJsList.length; i += 1) {
            this.pageInfo.pages[`${fileJsList[i].moduleName}-${fileJsList[i].pageName}`] = fileJsList[i][fileJsList[i].pageName];
            if (!Object.getOwnPropertyNames(moduleInfo).includes(fileJsList[i].moduleName)) {
                moduleInfo._modules.push(fileJsList[i].moduleName);
                moduleInfo[fileJsList[i].moduleName] = {
                    moduleName: `${fileJsList[i].moduleName}`,
                    description: `${fileJsList[i].moduleName}`,
                    publicPath: `${PackageTool.packConfig.publicPath}`,
                    assetsDir: `${PackageTool.packConfig.assetsDir}`,
                    outputDir: `${PackageTool.packConfig.outputDir}/${fileJsList[i].moduleName}`,
                    path: `${fileJsList[i].path}`,
                    pages: {},
                };
            }
            let target = JSON.parse(JSON.stringify(fileJsList[i][fileJsList[i].pageName]));
            target.filename = `${fileJsList[i].pageName}.html`;
            moduleInfo[fileJsList[i].moduleName]['pages'][fileJsList[i].pageName] = target;
        }
        WriteFileFn("./utils", moduleInfoPath, JSON.stringify(this.moduleInfo)); // 写入模块信息
    }
}
(() => {
    // 默认打包的开始变量
    let packageNum = 0;
    let packageTool = {};
    let moduleInfo = {}; // 模块信息
    let packModule = []; // 本次打包的模块
    const log = console.log;
    // 初始化
    const Initialize = () =>{
        packModule = [];
        packageTool =  new PackageTool();
        moduleInfo = packageTool.moduleInfo;
    };
    // sheel函数
    const shellModule = (type, mode) =>{
        return new Promise((resolve,reject) =>{
            // let order = !type || type === 'development'? `npx vue-cli-service` : type === 'production' ? `npx vue-cli-service build` : `npx vue-cli-service build --mode ${type}`;
            let order = `npx vue-cli-service ${type}`;
            if (mode) {
                order += ` --mode=${mode}`
            }
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
    // 打包函数
    const handlePack = (mode) =>{
        if (packageNum < packModule.length) {
            let nowModule = packModule[packageNum];
            WriteFileFn("./utils",pageInfoPath,JSON.stringify(nowModule));
            shellModule('build', mode).then(() =>{
                packageNum++;
                handlePack(mode);
            })
        }
    };
    // 日东函数
    const handleRun = (mode) => {
        WriteFileFn("./utils", pageInfoPath, JSON.stringify(packageTool.pageInfo)); // 写入页面信息
        shellModule('serve', mode).then((e) => console.log('启动完毕'))
    }
    // 更新单叶信息
    const handleUpdate = () => {
        const progressBar = ora('更新页面信息中......');
        progressBar.start();
        Initialize();
        setTimeout(() =>{
            progressBar.stop();
            log('更新完成')
        }, 500);
    }
    // 验证
    const Validation = (options) =>{
        if (!Object.keys(options).length) {
            log(chalk.red("未找到command参数"));
            log(program.help())
            return;
        }
        if (!options.cmd) {
            log(chalk.red("未找到command参数"));
            log(program.help())
            return;
        }
        Initialize();
        let mode = ''; // 环境
        let type = ''; // 命令
        if (options.cmd === 'list') {
            log(packageTool.moduleInfo)
            return;
        }
        if (options.cmd === 'update') {
            handleUpdate();
            return;
        }
        type = options.cmd;
        if (options.env) {
            mode = options.env;
        }
        if (
            !options.module ||
            !options.module.length ||
            (options.module.sort().toString() === moduleInfo._modules.sort().toString() && moduleInfo._modules.length)
        ) {
            moduleInfo._modules.forEach((item) => packModule.push(moduleInfo[item]));
        } else {
            for (let i = 0; i <  options.module.length; i += 1) {
                if (!moduleInfo._modules.includes(options.module[i])) {
                    log(chalk.red(`未找到${options.module[i]}模块！`));
                    return;
                } else {
                    packModule.push(moduleInfo[options.module[i]]);
                }
            }
        }
        if (type === 'build') {
            delDir('./dist');
            handlePack(mode);
            return;
        }
        handleRun(mode)
    };

    program
        .description("项目打包工具")
        .option("-c, --cmd [cmd]", "serve: 运行,build: 编译,update:更新,list：列出全部模块信息")
        .option("-e, --env [env]", "环境变量")
        .option("-m, --module <items>", "模块名称，多个用,号连接。不写蓦然全部",(val) => val.split(','))
        .action((options) => Validation(options));
    program.parse(process.argv);
})();
