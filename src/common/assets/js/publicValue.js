/*
    Vue组件 -- 跨页面保存传输变量模块
    一个VUE中不支持创建多实例, 只能创建单一实例
    注意: 
    1. 
    2. 请用 '$SV.read.变量名' 来读取全局数据
    3. 请用 '$SV.write.变量名' 来写入全局数据
*/
;

import Vue from 'vue'

let __SSV__ = (function() {
    /*
        引入了base64.js的源码,增加字符串base64编码
        调整为闭包内部使用
    */
    let code = (function(global) {
        'use strict';

        // existing version for noConflict()
        var _Base64 = global.Base64;
        var version = "2.4.9";
        // if node.js and NOT React Native, we use Buffer
        var buffer;
        if (typeof module !== 'undefined' && module.exports) {
            try {
                buffer = eval("require('buffer').Buffer");
            } catch (err) {
                buffer = undefined;
            }
        }
        // constants
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var b64tab = function(bin) {
            var t = {};
            for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
            return t;
        }(b64chars);
        var fromCharCode = String.fromCharCode;
        // encoder stuff
        var cb_utob = function(c) {
            if (c.length < 2) {
                var cc = c.charCodeAt(0);
                return cc < 0x80 ? c :
                    cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) +
                        fromCharCode(0x80 | (cc & 0x3f))) :
                    (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
                        fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                        fromCharCode(0x80 | (cc & 0x3f)));
            } else {
                var cc = 0x10000 +
                    (c.charCodeAt(0) - 0xD800) * 0x400 +
                    (c.charCodeAt(1) - 0xDC00);
                return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
                    fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
                    fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                    fromCharCode(0x80 | (cc & 0x3f)));
            }
        };
        var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
        var utob = function(u) {
            return u.replace(re_utob, cb_utob);
        };
        var cb_encode = function(ccc) {
            var padlen = [0, 2, 1][ccc.length % 3],
                ord = ccc.charCodeAt(0) << 16 |
                ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
                ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
                chars = [
                    b64chars.charAt(ord >>> 18),
                    b64chars.charAt((ord >>> 12) & 63),
                    padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                    padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
                ];
            return chars.join('');
        };
        var btoa = global.btoa ? function(b) {
            return global.btoa(b);
        } : function(b) {
            return b.replace(/[\s\S]{1,3}/g, cb_encode);
        };
        var _encode = buffer ?
            buffer.from && Uint8Array && buffer.from !== Uint8Array.from ?

            function(u) {
                return (u.constructor === buffer.constructor ? u : buffer.from(u))
                    .toString('base64')
            } :
            function(u) {
                return (u.constructor === buffer.constructor ? u : new buffer(u))
                    .toString('base64')
            } :
            function(u) { return btoa(utob(u)) };
        var encode = function(u, urisafe) {
            return !urisafe ?
                _encode(String(u)) :
                _encode(String(u)).replace(/[+\/]/g, function(m0) {
                    return m0 == '+' ? '-' : '_';
                }).replace(/=/g, '');
        };
        var encodeURI = function(u) { return encode(u, true) };
        // decoder stuff
        var re_btou = new RegExp([
            '[\xC0-\xDF][\x80-\xBF]',
            '[\xE0-\xEF][\x80-\xBF]{2}',
            '[\xF0-\xF7][\x80-\xBF]{3}'
        ].join('|'), 'g');
        var cb_btou = function(cccc) {
            switch (cccc.length) {
                case 4:
                    var cp = ((0x07 & cccc.charCodeAt(0)) << 18) |
                        ((0x3f & cccc.charCodeAt(1)) << 12) |
                        ((0x3f & cccc.charCodeAt(2)) << 6) |
                        (0x3f & cccc.charCodeAt(3)),
                        offset = cp - 0x10000;
                    return (fromCharCode((offset >>> 10) + 0xD800) +
                        fromCharCode((offset & 0x3FF) + 0xDC00));
                case 3:
                    return fromCharCode(
                        ((0x0f & cccc.charCodeAt(0)) << 12) |
                        ((0x3f & cccc.charCodeAt(1)) << 6) |
                        (0x3f & cccc.charCodeAt(2))
                    );
                default:
                    return fromCharCode(
                        ((0x1f & cccc.charCodeAt(0)) << 6) |
                        (0x3f & cccc.charCodeAt(1))
                    );
            }
        };
        var btou = function(b) {
            return b.replace(re_btou, cb_btou);
        };
        var cb_decode = function(cccc) {
            var len = cccc.length,
                padlen = len % 4,
                n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
                (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
                (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
                (len > 3 ? b64tab[cccc.charAt(3)] : 0),
                chars = [
                    fromCharCode(n >>> 16),
                    fromCharCode((n >>> 8) & 0xff),
                    fromCharCode(n & 0xff)
                ];
            chars.length -= [0, 0, 2, 1][padlen];
            return chars.join('');
        };
        var atob = global.atob ? function(a) {
            return global.atob(a);
        } : function(a) {
            return a.replace(/[\s\S]{1,4}/g, cb_decode);
        };
        var _decode = buffer ?
            buffer.from && Uint8Array && buffer.from !== Uint8Array.from ?

            function(a) {
                return (a.constructor === buffer.constructor ?
                    a : buffer.from(a, 'base64')).toString();
            } :
            function(a) {
                return (a.constructor === buffer.constructor ?
                    a : new buffer(a, 'base64')).toString();
            } :
            function(a) { return btou(atob(a)) };
        var decode = function(a) {
            return _decode(
                String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
            );
        };
        var noConflict = function() {
            var Base64 = global.Base64;
            global.Base64 = _Base64;
            return Base64;
        };
        // export Base64
        global.Base64 = {
            VERSION: version,
            atob: atob,
            btoa: btoa,
            fromBase64: decode,
            toBase64: encode,
            utob: utob,
            encode: encode,
            encodeURI: encodeURI,
            btou: btou,
            decode: decode,
            noConflict: noConflict,
            __buffer__: buffer
        };
        // if ES5 is available, make Base64.extendString() available
        if (typeof Object.defineProperty === 'function') {
            var noEnum = function(v) {
                return { value: v, enumerable: false, writable: true, configurable: true };
            };
            global.Base64.extendString = function() {
                Object.defineProperty(
                    String.prototype, 'fromBase64', noEnum(function() {
                        return decode(this)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64', noEnum(function(urisafe) {
                        return encode(this, urisafe)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64URI', noEnum(function() {
                        return encode(this, true)
                    }));
            };
        }
        //
        // export Base64 to the namespace
        //
        if (global['Meteor']) { // Meteor.js
            Base64 = global.Base64;
        }
        // module.exports and AMD are mutually exclusive.
        // module.exports has precedence.
        if (typeof module !== 'undefined' && module.exports) {
            module.exports.Base64 = global.Base64;
        } else if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define([], function() { return global.Base64 });
        }
        // that's it!
        return { Base64: global.Base64 }
    })(function() {})

    /*
        本地存储中的变量识别名
    */
    const ValueName = "Chunk:chunkx-store-box"
    let self = ""
    let sv = window.sessionStorage
    let SplitTag = "\/--\/"

    // 全局变量名
    let ValueStore = {}

    // 判断变量类型
    function tf(val) {
        return Object.prototype.toString.call(val).split(" ")[1].replace("]", "").toLocaleLowerCase()
    }

    // 验证数据是否是可存数据
    function verifyData(v) {
        switch (tf(v)) {
            case "string":
            case "number":
                // case "object":
            case "boolean":
            case "array":
                return true
                break

            default:
                return false
        }
    }

    // 统一获得本地存储
    function GetData() {
        let d = sv.getItem(ValueName)
        if (d === null) {
            return {}
        }
        d = JSON.parse(code.Base64.decode(d))
        for (let x in d) {
            let tmp = d[x].split(SplitTag)
            if (tmp.length < 1) {
                d[x] = ''
            } else {
                if (tmp[1] === 'string') {
                    d[x] = tmp[0]
                } else {
                    d[x] = JSON.parse(tmp[0])
                }
            }
        }
        return d
    }

    // 保存至本地存储本地存储
    function SaveData() {
        let d = JSON.parse(JSON.stringify(ValueStore))
        for (let x in d) {
            if (verifyData(d[x])) {
                let typeName = tf(d[x])
                d[x] = typeName === 'string' ? d[x] + SplitTag + typeName : JSON.stringify(d[x]) + SplitTag + typeName
            } else {
                delete d[x]
            }
        }
        sv.setItem(ValueName, code.Base64.encode(JSON.stringify(d)))
    }

    // 从session storage初始化数据
    function InitPV() {
        let d = GetData()
        for (let x in d) {
            ValueStore[x] = d[x]
        }
    }

    // 检测IFrame, 如果没有则添加一个, 激活onstorage监听
    function CheckIframeOpenOnstorage() {
        let n = document.querySelectorAll('iframe').length
        if (n < 1) {
            let node = document.createElement('iframe')
            node.src = "about:blank"
            node.name = "OnStorageOpen"
            node.style.display = "none"

            node.onload = function() {
                let form = window.frames["OnStorageOpen"]
                let str = "(function(){ window.addEventListener('storage', function(e) { }) })()"
                let scriptNode = form.document.createElement('script')
                scriptNode.type = 'text/javascript'
                scriptNode.text = str
                form.document.body.appendChild(scriptNode)
            }
            document.body.appendChild(node)
        }
    }

    // get: 读取变量
    function get(target, name, receiver) {
        return ValueStore[name]
    }

    // set: 设置变量
    function set(target, name, value, receiver) {
        if (verifyData(value)) {
            ValueStore[name] = value
            SaveData()
            return true
        } else {
            console.log('只能保存string,number,array类型变量')
            return false
        }
    }

    // 不被允许的操作拦截
    function none() {
        console.log('该行为的操作不被允许!')
    }

    function publicValue(option) {
        self = this

        // 写方法
        Object.defineProperty(self, 'write', {
            value: new Proxy(ValueStore, {
                set: set,
                get: none
            })
        })

        // 读方法
        Object.defineProperty(self, 'read', {
            value: ValueStore,
            writable: false
        })

        // 初始化全部变量
        InitPV()

        // 创建移仓IFRAME 保证 onstorage 的激活
        CheckIframeOpenOnstorage()
    }

    publicValue.prototype = {

        // 清除全部变量
        clear: function() {
            sv.removeItem(ValueName)
            ValueStore = {}
        }

    }

    // 本地存储的监听
    window.addEventListener('storage', function(e) {
        if (e.key === ValueName) {
            InitPV()
        }
    })

    return publicValue
})()

export default {
    install(Vue, options) {
        Vue.prototype.$SV = new __SSV__()
    }
}