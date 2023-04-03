export const beautifyHeaders = (html) => {
    html.html(beautify);

    function beautify() {
        const el = $(this);

        if(el.children().length > 0){
            el.children().html(beautify);
        }
        else {
            return el
                .text()
                .replace(/[a-zä-ü]*/g, '<span class="move-up">$&</span>')
                .replace(/[A-ZÄ-Ü]/g, '<span class="caps">$&</span>');
        }
    }
}
