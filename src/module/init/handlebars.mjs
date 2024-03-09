export const registerHelpers = () => {
    Handlebars.registerHelper("capFirst", function capitalizeFirst(string) {
        if (typeof string === 'string') {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        return string;
    });

    Handlebars.registerHelper('contains', function(needle, haystack, options) {
        needle = Handlebars.escapeExpression(needle).toLowerCase();
        haystack = Handlebars.escapeExpression(haystack).toLowerCase();
        return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('combine', function(...values) {
        const options = values.pop();
        const join = options.hash?.join || "";
        return new Handlebars.SafeString(values.join(join));
    } );

    // **** Error handling helpers ****

/*    Handlebars.registerHelper('helperMissing', function( /!* dynamic arguments *!/) {
        var options = arguments[arguments.length-1];
        var args = Array.prototype.slice.call(arguments, 0,arguments.length-1)
        return new Handlebars.SafeString("Missing: "+options.name+"("+args+")")
    });

    Handlebars.registerHelper('blockHelperMissing', function(context, options) {
        return "Helper '"+options.name+"' not found. "
            + "Printing block: " + options.fn(context);
    });*/
}


