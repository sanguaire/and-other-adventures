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
}


