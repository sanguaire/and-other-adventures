export const readyHandler = async () =>{
    await game.aoa.effectsPanel.render(true);
    const panel = $("#effects-panel");
    $("#ui-top").append(panel);
    $("body").remove("#effects-panel");

    $("body").on("keydown", (e) => {
        game.aoa.showTooltip = e.originalEvent.altKey;
    });

    $("body").on("keyup", (e) => {
        game.aoa.showTooltip = e.originalEvent.altKey;
    });

    $("#logo").hide();
};
