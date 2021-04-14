/*
 * @Author: lize
 * @Date: 2019/9/23
 * @Description :
 * @Parames :
 * @Example : onFileChange(event) {
        readFileTools.readFile(event.target.files[0],(e) =>{
          console.log(e);  //  这里返回上传进度
        })
            .then((e) =>{
              console.log(e);  //读取完的汉子
            })
              .catch((er) =>{
                console.log(er);  //出错时
              })
      }
 * @Last Modified by: lize
 * @Last Modified time: 2019/9/23
 */
var fs=require('fs');
class readFileTools{
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
    binaryToStr(str){
        var result = [];
        var list = str.split(" ");
        for(var i=0;i<list.length;i++){
            var item = list[i];
            var asciiCode = parseInt(item,2);
            var charValue = String.fromCharCode(asciiCode);
            result.push(charValue);
        }
        return result.join("");
    }
    readFile (file,cb){
        console.log(file)
        let size = file.size;
        let type = file.type && file.type!='text/plain' ? true : false;
        // let fileDatas = this.judgeType(file);
        return new Promise((resolve, reject) =>{
            if(!file){
                reject("file对象为空！");
            }
            let fileReader = new FileReader();
            //读取开始时
            fileReader.onloadstart = (e) => {
                console.log("开始读取文件……");
            };
            fileReader.onload = (e) =>{
                console.log("读取完毕，解析中……");
                try {
                    let data = e.target.result;
                    if(!type){
                        resolve(data)
                    }else{
                        resolve(readFileTools.fixdata(data))
                    }
                }
                catch (er){
                    reject(er);
                }
            };
            fileReader.onprogress = (event) =>{
                cb ? cb(`${event.loaded / event.total * 100}%`) : false;
            }
            fileReader.onerror = (er) =>{
                reject(er);
            }
            // if(!type){
                // fileReader.readAsText(file, 'utf-8');
                fileReader.readAsText(file,"gb2312");
                // file.readAsText(file,"GBK");    //编码格式utf-8 国际标准 日韩中通用  GBK国标中国标准(本土化)  gb2312基本汉字码
            // }else{
            //     fileReader.readAsArrayBuffer(file);
            //     fileReader.readAsBinaryString(file);
            //     fileReader.readAsBinaryString(file);
            // }
        })
    }
    judgeType(file){
        let fileReader = new FileReader();
        let obj = {
            content:'',
            type:''
        }
        fileReader.onload = (e) =>{
            try {
                let data = e.target.result;
                obj.type = data[0].charCodeAt()!=0xefbb
            }
            catch (er){
                console(er);
            }
        };
        fileReader.readAsText(file,"gb2312");
        return obj
    }
}
export default new readFileTools();
