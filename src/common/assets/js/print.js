/*
 * @Author: lize
 * @Date: 2019/9/26
 * @Description : // 打印类属性、方法定义  给需要打印的div 加上ref，例如print,  然后在后面 this.$print(this.$refs.print,{}) 这样调用。
 *                 如需要手动分页，请在该元素的后一个元素上添加class  '.print-page'。
 * @Parames : object {   //传了watermark  将使用Iframe,这样打印会出现网址，不传此属性则不会存在网址，但是会打开新页面。不过打印完后会帮你关掉。
 *          noPrint:'.no-print',  需要过滤，不打印的元素设置特殊的class,   该字段默认值为'.no-print'。如需要自定义，用该字段传入。
 *          backgroundclass:'cbim-table-warp' 如果你项目当中有设置background的div。  将其class传入。
 *          watermark:{   水印对象
 *            text:'CBIM',  水印字样
 *            font：'16px Microsoft JhengHei',
 *            textColor:'rgba(180, 180, 180, 0.3)'  //水印颜色,
 *            imgUrl:''   如果水印是图片， 这里面传图片地址
 *          }
 * }
 * @Example : this.$print(this.$refs.prints,{
                    backgroundclass:'cbim-table-warp',
                    watermark:{
                    text:'CBIM',
                    textColor:'rgba(180, 180, 180, 0.3)'
             }
      })
 * @Last Modified by: lize
 * @Last Modified time: 2019/9/26
 */
/* eslint-disable */
const Print = function (dom, options) {
    if (!(this instanceof Print)) return new Print(dom, options);

    this.options = this.extend({
        'noPrint': '.no-print',
    }, options);

    if ((typeof dom) === "string") {
        this.dom = document.querySelector(dom);
    } else {
        this.isDOM(dom)
        this.dom = this.isDOM(dom) ? dom : dom.$el;
    }

    this.init();
};
Print.prototype = {
    init: function () {
        var content = this.getStyle() + this.getHtml();
        if(this.options.watermark){
            this.writeIframe(content);
        }else{
            this.openPage(content);
        }
    },
    extend: function (obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    },
    getStyle: function () {
        var str = "",
            styles = document.querySelectorAll('style,link');
        for (var i = 0; i < styles.length; i++) {
            str += styles[i].outerHTML;
        }
        str += "<style>" + (this.options.noPrint ? this.options.noPrint : '.no-print') + "{display:none !important;}</style>";
        str += "<style>html,body,div{height: auto!important;}</style>";
        str +="<style>.bm-view{height: 100%!important;} .bm-view div{height: 100%!important;}</style>"
        str +="<style>.ivu-select-placeholder{display: none!important;}</style>"
        return str;
    },
    getHtml: function () {
        var inputs = document.querySelectorAll('input');
        var textareas = document.querySelectorAll('textarea');
        var selects = document.querySelectorAll('select');
        for (var k = 0; k < inputs.length; k++) {
            if (inputs[k].type == "checkbox" || inputs[k].type == "radio") {
                if (inputs[k].checked == true) {
                    inputs[k].setAttribute('checked', "checked")
                } else {
                    inputs[k].removeAttribute('checked')
                }
            } else if (inputs[k].type == "text") {
                inputs[k].setAttribute('value', inputs[k].value)
            } else {
                inputs[k].setAttribute('value', inputs[k].value)
            }
            inputs[k].setAttribute('placeholder','');
        }

        for (var k2 = 0; k2 < textareas.length; k2++) {
            if (textareas[k2].type == 'textarea') {
                textareas[k2].innerHTML = textareas[k2].value
            }
            textareas[k2].setAttribute('placeholder','');
        }

        for (var k3 = 0; k3 < selects.length; k3++) {
            if (selects[k3].type == 'select-one') {
                var child = selects[k3].children;
                for (var i in child) {
                    if (child[i].tagName == 'OPTION') {
                        if (child[i].selected == true) {
                            child[i].setAttribute('selected', "selected")
                        } else {
                            child[i].removeAttribute('selected')
                        }
                    }
                }
            }
            selects[k3].setAttribute('placeholder','');
        }
        return `<div class = "create-print-wrap">${this.dom.outerHTML}</div>`
    },
    addWaterMarker(obj){
        var can = document.createElement('canvas');
        can.width = 200;
        can.height = 100;
        can.style.display = 'none';
        var cans = can.getContext('2d');
        cans.rotate(-20 * Math.PI / 180);
        cans.fillStyle = obj.textColor || "rgba(180, 180, 180, 0.3)";
        return new Promise((resolve,reject) =>{
            if(obj.imgUrl){
                can.width = 480;
                can.height = 240;
                console.log(obj.imgUrl)
                let img = new Image();
                img.src = obj.imgUrl;
                img.onload = function () {
                    cans.drawImage(img, can.width / 6, can.height / 2);
                    resolve(can.toDataURL("image/png"))
                }
            }else{
                cans.font = obj.font || "16px Microsoft JhengHei";
                cans.textAlign = 'left';
                cans.textBaseline = 'Middle';
                cans.fillText(obj.text, can.width / 3, can.height / 2);
                resolve(can.toDataURL("image/png"))
            }
        });
    },
    openPage: function (content) {
        let win = window.open('','_blank');
        let doc = win.document;
        content+="<title></title>"
        doc.write(content);
        setTimeout(() =>{
            this.toPrint(win);
        },20)
    },
    writeIframe: function (content) {
        var w, doc, iframe = document.createElement('iframe'),
            f = document.body.appendChild(iframe);
        iframe.id = "myIframe";
        iframe.name = "print"
        //iframe.style = "position:absolute;width:0;height:0;top:-10px;left:-10px;";
        iframe.setAttribute('style', 'position:absolute;width:0;height:0;top:-10px;left:-10px;');
        w = f.contentWindow || f.contentDocument;
        doc = f.contentDocument || f.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
        var _this = this;
        iframe.onload = async function(){
            if(_this.options.watermark){
                let backgroundUrl =  await _this.addWaterMarker(_this.options.watermark);
                if(_this.options.backgroundclass){
                    let backgroundNode = w.document.querySelector(`.${_this.options.backgroundclass}`);
                    if(backgroundNode){
                        backgroundNode.style.backgroundImage =  `url(${backgroundUrl})`
                    }else{
                        doc.body.children[0].style.backgroundImage =  `url(${backgroundUrl})`
                    }
                }else{
                    doc.body.children[0].style.backgroundImage =  `url(${backgroundUrl})`
                }
            }
            _this.toPrint(w);
            setTimeout(function () {
                document.body.removeChild(iframe)
            }, 10)
        }
    },
    toPrint: function (frameWindow) {
        try {
            setTimeout(function () {
                frameWindow.focus();
                try {
                    if (!frameWindow.document.execCommand('print', false, null)) {
                        frameWindow.print();
                    }
                } catch (e) {
                    frameWindow.print();
                }
                frameWindow.close()
            }, 100);
        } catch (err) {
            console.log('err', err);
        }
    },
    isDOM: (typeof HTMLElement === 'object') ?
        function (obj) {
            return obj instanceof HTMLElement;
        } :
        function (obj) {
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        }
};
const MyPlugin = {}
MyPlugin.install = function (Vue, options) {
    // 4. 添加实例方法
    Vue.prototype.$print = Print
}
export default MyPlugin
