(function() {

    if (typeof ns != 'undefined') return;
    var ns = {};
    //
    var pt = Object.prototype,
        class2type = {},
        toString = pt.toString,
        hasOwn = pt.hasOwnProperty;

    "Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function(i, item) {
        class2type['[object ' + i + ']'] = i;
    });
    var type = function(obj) {
        return obj == null ? "" : class2type[toString.call(obj)] || "object";
    }

    //module  模块管理
    var module = {
        modules: {}
    };
    module.emit = function() {

    };
    module.get = function(dep) {
        return module.modules[dep] || "";
    };
    module.set = function(dep, callback) {
        if (module.modules[dep]) return;
        var script = document.createElement('script');
        'onload' in script ? script.onload = function(data) {
            module.modules[dep] = callback();
        } : "";
        script.src = dep;
        document.getElementsByTagName('head')[0].appendChild(script);
        module.modules[dep] = 1;
    };
    module.emit = function() {

    };

    //util  字符操作函数
    var util = {};
    var reqReg = /require\(["'](.+)["']\)/,
        annReg = /^\/\*.+\*\/|\/\/.+/g;
    util.serialize = function(str) {
        var matchs = reqReg.exec(str);
        return matchs ? matchs[1] : "";
    };
    util.filterAnn = function(str, rep) {
        return str.replace(annReg, '');
    }

    //ns
    ns.require = function(deps, callback) {
        if (module.modules[deps]) return module.modules[deps];
        type(deps) == 'Function' && (callback = deps, deps = []);
        if (type(deps) == 'String') {
            deps = [deps];
        }
        if (type(deps) == 'Array') {
            deps.forEach(function(item, i) {
                module.get(item, callback) || module.set(item, callback);
            });
        }
        var callbackStr = callback.toString();
        var serStr;
        //util.filterAnn(callbackStr)
        (serStr = util.serialize(callbackStr)) ? ns.require(serStr, callback): callback();

    };
    ns.exports = function() {

    };
    ns.define = function(deps, callback) {
        if (typeof callback == 'undefined') {
            ns.require(deps);
        } else {
            ns.require(deps, callcack);
        }
    };


    this.require = ns.require;
    this.define = ns.define;
})(this);