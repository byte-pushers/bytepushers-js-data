/**
 * Created by tonte on 7/20/16.
 */
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

