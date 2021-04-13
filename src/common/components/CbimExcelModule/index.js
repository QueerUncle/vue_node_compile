/**
 * @name : 导入导出Excel插件封装组件
 
 * @Depend  xlsx、cptable、iview
 
 * @desc 1、支持导入 csv、xls、xlsx等格式的表格文件。
 
        2、支持每列数据验证（一列可支持多个验证，但错误信息只会显示一条，不会拼接）。
 
        3、支持下载 csv、xls、xlsx等格式的表格文件。
 
 * @Author: lize
 
 * @date : 2019/7/15
 
 * @methods importFile function (Object fileObject, Object ExcelRegulation)
 *
 *          该方法为excel导入   fileObject 为file对象    传入 event.target.files[0]
 *
 *                             ExcelRegulation  为验证规则    格式为：
 *                             [
 *                              {
 *                                sheet:'sheet1'  //为excel标签页
 *                                info:[
 *                                  {
 *                                    index: 0,  //代表第几列
 *                                    reg:[
 *                                      {
 *                                       name:'len40' //为函数名称   函数写在 改文件同级的Regular_Tmplate。js
 *                                      }
 *                                    ]
 *                                  }
 *                                ]
 *                              }
 *                              ]
 *             正确时 返回 Array    错误时返回String
 *
 * @example  可参考同级下的example.vue 调用法法
 *
 *
 * @methods  downloadExcel function ( String format, Array exceldatas, String filename)
 *
 *            该方法为excel下载   format 为：文件格式 默认csv
 *
 *                               exceldatas 需要下载的数据，格式和导入时外抛数据保持一致  例如
 *
 *                                      [
 *                                       {
 *                                        bodyData:[
 *                                           {
 *                                             key:value
 *                                           }
 *                                       ],
 *                                       headData:[
 *                                           {
 *                                             key:value
 *                                           }
 *                                       ]
 *                                      }
 *                                     ]
 *
 *                              filename 文件名称
 *
 *              正确时按返回 true   错误时返回  错误信息
 
 * @example 可参考同级下的example.vue 调用法法
 *
 */
import fs from './fs.js'

import XLSX from 'xlsx'

import cptable from 'codepage/dist/cpexcel.full.js'

class ExcelClass {
  
  //字符串转字符流
  static s2ab (s) {
    
    if (typeof ArrayBuffer !== 'undefined') {
      
      var buf = new ArrayBuffer(s.length);
      
      var view = new Uint8Array(buf);
      
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      
      return buf;
      
    } else {
      
      var buf = new Array(s.length);
      
      for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
      
      return buf;
      
    }
    
  }
  
  // 文件流转BinaryString
  static fixdata(data) {
  
    let o = "";
  
    let l = 0;
  
    let w = 10240;
  
    for (; l < data.byteLength / w; ++l) {
    
      o += String.fromCharCode.apply(
      
        null,
      
        new Uint8Array(data.slice(l * w, l * w + w))
    
      );
    
    }
  
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  
    return o;
  
  }
  
  //创建下载链接
  static saveAs(obj, fileName) {//当然可以自定义简单的下载文件实现方式
    
    var tmpa = document.createElement("a");
    
    tmpa.download = fileName || "下载";
    
    tmpa.href = URL.createObjectURL(obj); //绑定a标签
    
    tmpa.click(); //模拟点击实现下载
    
    setTimeout(function () { //延时释放
      
      URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
      
    }, 100);
    
  }
  //下载csv文件
  static dowloadCsvFile(obj){
    console.log(obj);
    let title = obj.title;
    let data = obj.data;
    let str = [];
    str.push(obj.title.join(",")+"\n");
    for(var i=0;i<data.length;i++){
      let temp = [];
      for(var j=0;j<title.length;j++){
        temp.push(data[i][title[j]]);
      }
      str.push(temp.join(",")+"\n");
    }
    console.log(str,'titletitletitletitletitletitletitletitletitletitletitletitletitle');
    let blob = new Blob(["\ufeff" + str.join('')], {
      type: 'type: application/vnd.ms-excel;charset=ANSI'
    });
    var link = document.createElement("a");
    link.innerHTML = 'export.csv';
    link.download = 'export.csv';
    link.href = URL.createObjectURL(blob);
    let evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    link.dispatchEvent(evt);
    // let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str.join(""));
    // let downloadLink = document.createElement("a");
    // downloadLink.href = uri;
    // downloadLink.download = "export.csv";
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
  }
  //导入文件
  importFile(fileObject,ExcelRegulation){
  
    this.ExcelRegulation = ExcelRegulation ? ExcelRegulation : [] ;
  
    let persons = []; // 存储获取到的数据
  
    let SheetsAry = []; // 存储获取到的标签
  
    let workbook = null; //二进制的表格内容
  
    let fromTo = ""; //表格范围，可用于判断表头是否数量是否正确
  
    return new Promise((resolve,reject) =>{
  
      if (!fileObject) {
  
        reject("file对象为空！");
    
      }
  
      if(fileObject.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileObject.type == 'application/vnd.ms-excel') {
    
        this.fileName = fileObject.name;
    
        this.fileSuffix = this.fileName.substring(this.fileName.lastIndexOf(".") + 1, this.fileName.length);
    
        this.fileSize = fileObject.size;
    
        this.fileType = fileObject.type;
    
        this.isCSV = this.fileSuffix == 'csv';
    
        let fileReader = new FileReader();
    
        //读取开始时
        fileReader.onloadstart = (e) =>{
      
          console.log('开始读取文件……')
      
        };
    
        //读取成功时
        fileReader.onload = (e) => {
      
          console.log("读取完毕，解析中……");
      
          try{
        
            let data = e.target.result;
        
            if(this.isCSV){
          
              data = new Uint8Array(data);
          
              let f = fs.isUTF8(data);
          
              if(f){
            
                data = e.target.result;
            
              }else{
            
                let str = cptable.utils.decode(936, data);
            
                workbook =XLSX.read(str, { type: "string",raw:true });
            
              }
          
            }
        
            if(!workbook){
          
              workbook = this.rABS || this.isCSV ? XLSX.read(btoa(ExcelClass.fixdata(data)), {type: "base64",raw:true}) : XLSX.read(data, {type: "binary",raw:true});
          
            }
        
          } catch (er) {
  
            reject("文件类型不正确,读取失败！");
        
          }
      
          //遍历每张表读取
          for (let sheet in workbook.Sheets) {
        
            let sheetAry = [];
        
            if (workbook.Sheets.hasOwnProperty(sheet)) {
          
              fromTo = workbook.Sheets[sheet]['!ref'];
          
              if(fromTo!=undefined){
            
                sheetAry = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
            
              }
          
              // break; // 如果只取第一张表，就取消注释这行
          
            }
        
            if(sheetAry.length>0){
          
              persons.push(sheetAry);
          
              SheetsAry.push({sheet:sheet})
          
            }
        
          }
  
  
          let Ary = this.verifyResult(persons);
          
          if(Ary && Ary.length){
  
            resolve(Ary)
  
          }else{
  
            reject(Ary);
            
          }
      
        };
    
        if (this.rABS || this.isCSV) {
      
          fileReader.readAsArrayBuffer(fileObject);
      
        } else {
      
          fileReader.readAsBinaryString(fileObject);
      
        }
    
        //读取失败时
        fileReader.onerror = (er) =>{
      
          console.log(er,"文件读取失败……");
  
          reject(er);
      
        };
    
      }else{
  
        reject("文件类型不正确！");
    
      }
      
    })
    
  }
  
  //验证结果
  verifyResult(e){
    
    if (e.length <= 0) {
      
      return "请导入正确信息！"
      
    }else{
      
      console.log("文件解析成功，渲染中……");
      
      let exceldatas = fs.pluralSheerAssemblyData(JSON.parse(JSON.stringify(e)),this.ExcelRegulation,"#000000","red"); //验证表格数据并改变数据结构
      
      if(exceldatas == "000000"){
        
        return "表结构错误！第一行不能有中文字符！"
        
      }
      
      if(exceldatas.length<=0){
        
        return "数据处理错误,请联系管理员！";
        
      };
      
      console.log("文件渲染成功！");
      
      this.excelReaderList = JSON.parse(JSON.stringify(exceldatas));
      
      this.excelReaderList[0].fileName = this.fileName;
      
      this.excelReaderList[0].fileSuffix = this.fileSuffix;
      
      this.excelReaderList[0].fileSize = this.fileSize;
      
      this.excelReaderList[0].fileType = this.fileType;
      
      return this.getExcelContents();
      
    }
    
  }
  
  //获取excel数据
  getExcelContents(){
    
    let exportAry = [];
    
    for(let i = 0; i<this.excelReaderList.length;i++){
  
      let excelobj = {
    
        headData:this.excelReaderList[i].tHead,
    
        bodyData:[],
    
        sheet:`sheet${i+1}`,
    
        fileName:this.excelReaderList[i].fileName,
    
        fileSuffix:this.excelReaderList[i].fileSuffix,
    
        fileSize:this.excelReaderList[i].fileSize,
    
        fileType:this.excelReaderList[i].fileType,
    
      };
  
      let tableBodyAry = JSON.parse(JSON.stringify(this.excelReaderList[i].tBody));
  
      for(let i = 0; i<tableBodyAry.length;i++){
    
        let obj = {};
    
        for(let j = 0; j<tableBodyAry[i].length; j++){
      
          obj[tableBodyAry[i][j].key] = tableBodyAry[i][j].innerText;
      
        }
    
        excelobj.bodyData.push(obj);
    
      }
      exportAry.push(excelobj);
  
    }
    
  
    return exportAry
  
  }
  
  //下载表格
  downloadExcel(format,exceldatas,filename){
  
    format = format ? format : 'csv';
    
    let SheetAry = [];
    
    let CopyExcelDatas = JSON.parse(JSON.stringify(exceldatas));
    
    for(let i = 0; i<CopyExcelDatas.length;i++){
      
      CopyExcelDatas[i].bodyData.unshift(CopyExcelDatas[i].headData[1]);
      
      SheetAry.push(CopyExcelDatas[i].bodyData)
      
    }
    
    return new Promise((resolve,reject) =>{
  
      if(SheetAry.length){

        if(this.analysisDownloadDatas(SheetAry,format,filename).success){

          resolve(true);

        }else{

          reject('下载失败');

        }
        
      }else{
  
        reject('需下载的数据为空！');
        
      }
      
    });
    
  }
  
  //下载
  analysisDownloadDatas(Ary,format,fileName){
    
    try{
      if(format == 'csv'){
        console.log(Ary[0])
        if(Ary){
          let obj = {
            title:Object.keys(Ary[0][0]),
            data:Ary[0],
          }
          ExcelClass.dowloadCsvFile(obj);
        }
      }else{
        let bookType = format == "xls" ? "biff2" : format ;
        const wopts = { bookType:bookType, bookSST:true, type:'binary'};
        // const wopts = { bookType:bookType, bookSST:true, type:'string'};
        const wb = { SheetNames: [], Sheets: {}, Props: {} };
        if(Ary){
          for(let i = 0 ;i < Ary.length; i++){
      
            // if(Ary[i] && Ary[i].length){
            //
            //   for(let j = 0; j<Ary[i].length;j++){
            //
            //     for(let o in Ary[i][j]){
            //
            //       Ary[i][j][o] =  "\t"+Ary[i][j][o];
            //
            //     }
            //
            //   }
            //
            // }
            wb.SheetNames.push('Sheet'+(i+1));
            let t = XLSX.utils.json_to_sheet(Ary[i]);
            // wb.Sheets['Sheet'+(i+1)] = XLSX.utils.sheet_to_csv(t);
            wb.Sheets['Sheet'+(i+1)] = XLSX.utils.json_to_sheet(Ary[i]);
          }
        }
        console.log(wb.Sheets,'wb.Sheets')
        //创建二进制对象写入转换好的字节流
        // let tmpDown =  new Blob([ExcelClass.s2ab(XLSX.write(wb, wopts))], { type: 'application/octet-stream',raw: true});
        // let tmpDown =  new Blob([ExcelClass.s2ab(XLSX.write(wb, wopts))], { type: 'text/csv,charset=UTF-8',raw: true});
        let tmpDown =  new Blob(["\ufeff"+XLSX.write(wb, wopts)], { type: 'application/octet-stream',raw: true});
        ExcelClass.saveAs(tmpDown,`${fileName}.${format}`);
        // 另一种下载的方式
        // XLSX.writeFile(wb,`${fileName}.${format}`)
        return {success:true};
      }
    }
    catch (er) {
      return {success:false,errorInfo:er}
    }
  }
}
export default new ExcelClass();
