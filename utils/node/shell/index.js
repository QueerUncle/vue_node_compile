/**
 *  2019/5/6  lize
 */
const child_process = require('child_process');

const path = require('path');

var kill =  require("tree-kill");

// let variate = process.cwd().includes("node") ? ".." : "" ;

// const currentPath = path.resolve(process.cwd(), '..', );
//
// console.log(process.cwd(),'process.cwd()process.cwd()process.cwd()process.cwd()')
//
// console.log(currentPath,'currentPathcurrentPathcurrentPathcurrentPath');

module.exports = {
  
  sheelJs(type){
    
    return new Promise((resolve,reject) =>{
      
      let order = "";
  
      if(type){
  
        // order = type == 'serve' ? `npm run serve` : type == "production" ? `npm run build` : `npm run build --mode ${type}`;
        
        order = type == 'serve' ? `npx vue-cli-service serve` : type == "production" ? `npx vue-cli-service build` : `npx vue-cli-service build --mode ${type}`;
        
      }else{
        
        reject({success:false,data:'type is undefined'})
        
      }
      
      if(global.child_process && global.child_process.length && type == 'serve'){
  
        this.StopSheelJs();
        
      }
      
      setTimeout(() =>{
        console.log('我来到这啦', global.PROJECT_ROOT_DIRECTORY, 'asdasd', child_process);
        
        let work_child_process= child_process.exec(order,{cwd:global.PROJECT_ROOT_DIRECTORY},(error) =>{
    
          if(error){
            console.log('我发生了错误', error);
            
            reject({success:false,data:error})
      
          }
    
        });
  
        global.child_process = [{name:'work_child_process',pid:work_child_process.pid}];
  
        let progressBar = '';
  
        work_child_process.stdout.on('data',(stdout) =>{
    
          progressBar = !progressBar ? 2 : 0;
    
          if(!progressBar){
      
            resolve({success:true,data:stdout})
      
          }else{
      
            progressBar = 0;
      
          }
    
          console.log(`stdout ${stdout}`)
    
        });
  
        work_child_process.stderr.on('data',(stderr) =>{
    
          progressBar = 1;
    
          // console.log(`stderr ${stderr}`)
    
        });
  
        work_child_process.on('exit',(close) =>{
    
          reject({success:true,data:'close'})
    
        });
        
      },500);

    })
    
  },
  
  StopSheelJs(){
    
    kill(global.child_process[0].pid,(e,err) =>{
      
      if(err){}

    });
    
  }
  
};
