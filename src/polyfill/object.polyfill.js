/**
 * Created by tonte on 7/20/16.
 */
/*global BytePushers*/
(function (window, document) {
    'use strict';
    var BytePushers;

    if (window.BytePushers !== undefined && window.BytePushers !== null) {
        BytePushers = window.BytePushers;
    } else {
        window.BytePushers = {};
        BytePushers = window.BytePushers;
    }

    Object.isFunction = function (target) {
        var isFunction = false;

        if(Object.isDefined(target)) {
            if (typeof target === "function") {
                isFunction = true;
            }
        }

        return isFunction;
    };

    Object.isConstructorFunction = function(targetFunction) {
        var isConstructorFunction = false,
            isNotFirstLetterUppercase;

        if(Object.isFunction(targetFunction)) {
            isNotFirstLetterUppercase = !(/^[A-Z]/.test(targetFunction.name));
            isConstructorFunction = true;
        } else {
            throw new BytePushers.exceptions.InvalidParameterException("Function(" + targetFunction + ") is not a Function.");
        }

        if(isNotFirstLetterUppercase){
            throw new BytePushers.exceptions.InvalidParameterException("Fist letter of Function(" + targetFunction + ") name must be capitalized.");
        }

        return isConstructorFunction;
    };

    if (Function.prototype.name === undefined){
        // Add a custom property to all function values
        // that actually invokes a method to get the value
        Object.defineProperty(Function.prototype,'name',{
            get:function(){
                return /function ([^(]*)/.exec( this+"" )[1];
            }
        });
    }

    if(!String.prototype.substringBefore) {
        String.prototype.substringBefore = function(searchCriteria) {
            var searchResult = searchCriteria,
                searchedStringIndex = this.search(searchCriteria);

            if(searchedStringIndex > 0) {
                searchResult = this.substring(0, searchedStringIndex);
            }

            return searchResult;
        }
    }

    if(!String.prototype.substringAfter) {
        String.prototype.substringAfter = function(searchCriteria) {
            var searchResult = searchCriteria,
                searchedStringIndex = this.search(searchCriteria);

            if(searchedStringIndex > -1 && searchedStringIndex+searchCriteria.length <= this.length) {
                searchResult = this.substring(searchedStringIndex+searchCriteria.length, this.length);
            }

            return searchResult;
        }
    }
}(window, document));

(function(window, document) {
    'use strict';
    var BytePushers;

    if (window.BytePushers !== undefined && window.BytePushers !== null) {
        BytePushers = window.BytePushers;
    } else {
        window.BytePushers = {};
        BytePushers = window.BytePushers;
    }

    BytePushers.getFunctionCaller = function(functionCallerArguments) {
        var caller = null;

        if (Object.isDefined(functionCallerArguments)) {
            if (Object.isDefined(functionCallerArguments.callee)){
                if (Object.isDefined(functionCallerArguments.callee.caller)) {
                    caller = functionCallerArguments.callee.caller;
                }
            }
        }

        return caller;
    }
}(window, document));

(function(window, document, BytePushers) {

    if (window.BytePushers !== undefined && window.BytePushers !== null) {
        BytePushers = window.BytePushers;
    } else {
        window.BytePushers = {};
        BytePushers = window.BytePushers;
    }

    BytePushers.util = BytePushers.util || BytePushers.namespace("software.bytepushers.util");
    BytePushers.util.Reflection = function (){
        var getFunctionArguments = function(func) {

            var functionArgumentMatch = func.toString().match(/\(.+?(?=\))\)/),
                functionArguments = functionArgumentMatch[0].substring(1, functionArgumentMatch[0].length-1).split(",").map(function(arg) {
                    // Ensure no inline comments are parsed and trim the whitespace.
                    return arg.replace(/\/\*.*\*\//, '').trim();
                }).filter(function(arg){
                    // Ensure no undefined values are added.
                    return arg;
                }),
                functionArgumentList = "";

            functionArguments.forEach(function(arg, argIndex, argArray) {
                functionArgumentList +=  arg + ((argIndex < argArray.length-1)? "," : "");
            });

            return functionArgumentList;
        },
        wrapConstructorWithReflectionCapabilities = function(ClassRef) {
            var WrappedSuperClassWithReflectionCapabilitiesConstructor,
                wrappedSuperClassPrototypeMethods,
                WrappedClassWithReflectionCapabilitiesConstructor,
                wrappedClassWithReflectionCapabilitiesAsString = "",
                functionArguments = getFunctionArguments(ClassRef),
                originalClassAsString = ClassRef.toString(); //.replace(/\(.+?(?=\))\)/, "()");

            if(ClassRef.prototype.superclass) {
                WrappedSuperClassWithReflectionCapabilitiesConstructor = wrapConstructorWithReflectionCapabilities(ClassRef.prototype.superclass);
                wrappedSuperClassPrototypeMethods = getClassRefPrototypeMethods(ClassRef, WrappedSuperClassWithReflectionCapabilitiesConstructor, false);
                originalClassAsString = originalClassAsString.replace(/.*superclass\.apply\(this,\s*\[\s*.*\]\s*\)\s*;*/, "\t\tthis.__proto__.superclass.apply(this, [" + functionArguments + "]);");
                originalClassAsString = originalClassAsString.replace(/.*superclass\.call\(this\s*,?(\s\w*,?)*\s*\)\s*;?/, "\t\tthis.__proto__.superclass.call(this " + (functionArguments)? "," + functionArguments : "" + ");");
                Object.defineProperty(WrappedSuperClassWithReflectionCapabilitiesConstructor.prototype, 'getMethod', {
                    enumerable: false,
                    value: function(methodName) {
                        var reflectionMethod;

                        if (WrappedSuperClassWithReflectionCapabilitiesConstructor.prototype.superclass) {
                            WrappedSuperClassWithReflectionCapabilitiesConstructor.prototype.superclass.prototype.getMethod.apply(this, [methodName]);
                        }

                        if (!reflectionMethod) {
                            reflectionMethod = this["_privates"+WrappedSuperClassWithReflectionCapabilitiesConstructor.name][methodName];//SuperClassConstructor.prototype.getReflectionMethod.apply(this, [methodName]);
                        }

                        return reflectionMethod;
                    }
                });

                for (wrappedSuperClassPrototypeMethodName in wrappedSuperClassPrototypeMethods) {
                    if (wrappedSuperClassPrototypeMethodName) {
                        Object.defineProperty(WrappedSuperClassWithReflectionCapabilitiesConstructor.prototype, wrappedSuperClassPrototypeMethodName, {
                            enumerable: false,
                            value: wrappedSuperClassPrototypeMethods[wrappedSuperClassPrototypeMethodName]
                        });
                    }
                }
            }

            // To expose the private functions, we create
            // a new function that goes trough the functions string
            // we could have done all string parsing in this class and
            // only associate the functions directly with string
            // manipulation here and not inside the new class,
            // but then we would have to expose the functions as string
            // in the code, which could lead to problems in the eval since
            // string might have semicolons, line breaks etc.

            //funcString += "new (";
            //funcString += "return ";
            wrappedClassWithReflectionCapabilitiesAsString += originalClassAsString.substring(0, originalClassAsString.length - 3) + "\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\tthis._privates"+ClassRef.name+" = {};\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\tthis._initPrivates = function(f) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tvar fs = f.toString();\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tthis._privates"+ClassRef.name+" = {};\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tvar pf = fs.match(/function\\s*?(\\w.*?)\\(/g);\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tif (pf != null){\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\tfor (var i = 0, ii = pf.length; i < ii; i++) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\tvar fn = pf[i].replace(/function\\s+/, '').replace('(', '').trim();\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\tif (f.name != fn) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\ttry {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\tthis._privates"+ClassRef.name+"[fn] = eval(fn);\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t} catch (e) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\tif (e.name == 'ReferenceError') {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t\tcontinue;\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t} else {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t\tthrow e;\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tpf = fs.match(/\\w*?\\s+=\\s+function/g);\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\tif (pf != null) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\tfor (var i = 0, ii = pf.length; i < ii; i++) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\tvar fn = pf[i].replace(/var\\s*/, '').replace(' ', '').replace('=', '').replace(' ', '').replace('function', '').replace(' ', '').replace('(', '');\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\ttry {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\tthis._privates"+ClassRef.name+"[fn] = eval(fn);\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t} catch (e) {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\tif (e.name == 'ReferenceError') {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t\tcontinue;\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t} else {\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t\tthrow e;\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t\t}\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\t\t};\n\n";

            if(!ClassRef.prototype.superclass) {
                wrappedClassWithReflectionCapabilitiesAsString += "\t\tthis._initPrivates(this.__proto__.superclass);\n";
            } else {
                wrappedClassWithReflectionCapabilitiesAsString += "\t\tthis._initPrivates(this.__proto__.constructor);\n";
            }

            wrappedClassWithReflectionCapabilitiesAsString += "\t\tdelete this._initPrivates;\n";
            wrappedClassWithReflectionCapabilitiesAsString += "\n\t}";
            //funcString +=")();";

            WrappedClassWithReflectionCapabilitiesConstructor = new Function(functionArguments, 'return ' + wrappedClassWithReflectionCapabilitiesAsString)();
            if (WrappedSuperClassWithReflectionCapabilitiesConstructor) WrappedClassWithReflectionCapabilitiesConstructor.prototype = BytePushers.inherit(WrappedSuperClassWithReflectionCapabilitiesConstructor.prototype);
            if (ClassRef.prototype.superclass  && ClassRef.prototype.constructor) WrappedClassWithReflectionCapabilitiesConstructor.prototype.constructor = WrappedClassWithReflectionCapabilitiesConstructor;
            if (WrappedSuperClassWithReflectionCapabilitiesConstructor) WrappedClassWithReflectionCapabilitiesConstructor.prototype.superclass = WrappedSuperClassWithReflectionCapabilitiesConstructor;

            return WrappedClassWithReflectionCapabilitiesConstructor;
        },
        replaceConstructor = function(originalFunctionName, originalFunctionString, originalFunctionArguments, ReflectedConstructor, useSuperClassPrototype) {
            var reflectedFunctionAsString = originalFunctionString,
                reflectedFunction,
                matchResults,
                superMethodCalls = [];

            useSuperClassPrototype = (useSuperClassPrototype)? useSuperClassPrototype: false;

            matchResults = reflectedFunctionAsString.match(/[A-Za-z0-9\.]+\.prototype\.[A-Za-z0-9]+\.apply\(this,\s*\[\s*.*\]\s*\)/g);
            if(matchResults) {
                matchResults.forEach(function(match) {
                    if (match) {
                        superMethodCalls.push = {
                            key: match,
                            value: eval(match.replace(match, ReflectedConstructor +  match.substring(0, match.indexOf(".prototype"))))
                        };
                    }
                });

                superMethodCalls.forEach(function(superCallMethod){
                    reflectedFunctionAsString = reflectedFunctionAsString.replace(new RegExp(superCallMethod.key), superCallMethod.value);
                });
            }


            matchResults = reflectedFunctionAsString.match(/[A-Za-z0-9\.]+\.prototype\.[A-Za-z0-9]+\.call\(this\s*,?(\s\w*,?)*\s*\)/g);
            if(matchResults) {
                matchResults.forEach(function(match) {
                    if (match) {
                        superMethodCalls.push = {
                            key: match,
                            value: eval(match.replace(match, ReflectedConstructor +  match.substring(0, match.indexOf(".prototype"))))
                        };
                    }
                });

                superMethodCalls.forEach(function(superCallMethod){
                    reflectedFunctionAsString = reflectedFunctionAsString.replace(new RegExp(superCallMethod.key), superCallMethod.value);
                });
            }

            reflectedFunction =  new Function('return ' + reflectedFunctionAsString)();

            return reflectedFunction;
        },
        getClassRefPrototypeMethods = function(ClassRef, ReflectedConstructor, useSuperClassPrototype) {
            var classRefPrototypeMethods = {},
                classRefPrototypeMethod,
                classRefPrototypeMethodName;

            useSuperClassPrototype = (useSuperClassPrototype)? useSuperClassPrototype: false;

            for(classRefPrototypeMethodName in ClassRef.prototype) {
                if(classRefPrototypeMethodName !== "constructor" &&
                   classRefPrototypeMethodName !== "superclass" &&
                    Object.isFunction(ClassRef.prototype[classRefPrototypeMethodName])) {
                    classRefPrototypeMethod = ClassRef.prototype[classRefPrototypeMethodName];
                    classRefPrototypeMethods[classRefPrototypeMethodName] = replaceConstructor(classRefPrototypeMethodName, classRefPrototypeMethod.toString(), getFunctionArguments(classRefPrototypeMethod), ReflectedConstructor, useSuperClassPrototype);
                }
            }

            return classRefPrototypeMethods;
        };

        this.getInstance = function(ClassRef, classConstructorArguments){
            // get the functions as a string
            var WrappedClassWithReflectionCapabilitiesConstructor = wrapConstructorWithReflectionCapabilities(ClassRef),
                wrappedClassPrototypeMethods = getClassRefPrototypeMethods(ClassRef, WrappedClassWithReflectionCapabilitiesConstructor, true),
                wrappedClassWithReflectionCapabilitiesInstance,
                wrappedClassWithReflectionCapabilitiesInstanceJsonString;


            if (WrappedClassWithReflectionCapabilitiesConstructor) {
                Object.defineProperty(WrappedClassWithReflectionCapabilitiesConstructor.prototype, 'getMethod', {
                    enumerable: false,
                    value: function(methodName) {
                        var reflectionMethod;

                        if (WrappedClassWithReflectionCapabilitiesConstructor.prototype.superclass) {
                            reflectionMethod = WrappedClassWithReflectionCapabilitiesConstructor.prototype.superclass.prototype.getMethod.apply(this, [methodName]);
                        }

                        if (!reflectionMethod) {
                            reflectionMethod = this["_privates"+WrappedClassWithReflectionCapabilitiesConstructor.name][methodName];
                        }

                        return reflectionMethod;
                    }
                });

                for (wrappedClassPrototypeMethodName in wrappedClassPrototypeMethods) {
                    if (wrappedClassPrototypeMethodName) {
                        Object.defineProperty(WrappedClassWithReflectionCapabilitiesConstructor.prototype, wrappedClassPrototypeMethodName, {
                            enumerable: false,
                            value: wrappedClassPrototypeMethods[wrappedClassPrototypeMethodName]
                        });
                    }
                }

                wrappedClassWithReflectionCapabilitiesInstance = new WrappedClassWithReflectionCapabilitiesConstructor(classConstructorArguments); //var instance = eval(funcString);
                wrappedClassWithReflectionCapabilitiesInstanceJsonString = wrappedClassWithReflectionCapabilitiesInstance.toJSON();
                return wrappedClassWithReflectionCapabilitiesInstance;
            }

            throw "WrappedClassWithReflectionCapabilitiesConstructor was not successfully created.";
        };
    }
}(window, document, BytePushers));