export const renderSidebarDirectoryHandler = (directory) => {
    if(game.user.isGM)
        return;
    directory.element.find(".playlist").hide();
    directory.element.find(".currently-playing").hide();
}
