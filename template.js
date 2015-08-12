(function() {
    var root = this,
        Tmp = {};
    var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },
        escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    var nativeKeys = Object.keys,
        nativeForEach = ArrayProto.forEach;
    // Create quick reference variables for speed access to core prototypes.
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    Tmp.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    Tmp.each = Tmp.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (Tmp.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };
    // Fill in a given object with default properties.
    Tmp.defaults = function(obj) {
        Tmp.each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] == null) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
    // Invert the keys and values of an object. The values must be serializable.
    Tmp.invert = function(obj) {
        var result = {};
        for (var key in obj)
            if (Tmp.has(obj, key)) result[obj[key]] = key;
        return result;
    };
    Tmp.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj)
            if (Tmp.has(obj, key)) keys[keys.length] = key;
        return keys;
    };
    // List of HTML entities for escaping.
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        },
    };
    entityMap.unescape = Tmp.invert(entityMap.escape);
    // Regexes containing the keys and values listed immediately above.
    var entityRegexes = {
        escape: new RegExp('[' + Tmp.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + Tmp.keys(entityMap.unescape).join('|') + ')', 'g')
    };
    // Functions for escaping and unescaping strings to/from HTML interpolation.
    Tmp.each(['escape', 'unescape'], function(method) {
        Tmp[method] = function(string) {
            if (string == null) return '';
            return ('' + string).replace(entityRegexes[method], function(match) {
                return entityMap[method][match];
            });
        };
    });
    Tmp.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    Tmp.template = function(text, data, settings) {
        var render;
        settings = Tmp.defaults({}, settings, Tmp.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "TmpTmpp+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function(match) {
                    return '\\' + escapes[match];
                });

            if (escape) {
                source += "'+\n((TmpTmpt=(" + escape + "))==null?'':Tmp.escape(TmpTmpt))+\n'";
            }
            if (interpolate) {
                source += "'+\n((TmpTmpt=(" + interpolate + "))==null?'':TmpTmpt)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\nTmpTmpp+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var TmpTmpt,TmpTmpp='',TmpTmpj=Array.prototype.join," +
            "print=function(){TmpTmpp+=TmpTmpj.call(arguments,'');};\n" +
            source + "return TmpTmpp;\n";

        try {
            render = new Function(settings.variable || 'obj', 'Tmp', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data, Tmp);
        var template = function(data) {
            return render.call(this, data, Tmp);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Tem;
        }
        exports.Tmp = Tmp;
    } else {
        root.Tmp = Tmp;
    }

}).call(this);