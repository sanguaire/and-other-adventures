import {CONST} from "./const.mjs";
import {registerHelpers} from "./init/handlebars.mjs";
import {chatMessageHandler} from "./hooks/chat-message-handler.mjs";
import {registerSettings} from "./init/settings.mjs";
import {configure} from "./init/config.mjs";
import {updateActorHandler} from "./hooks/update-actor-handler.mjs";
import {updateItemHandler} from "./hooks/update-item-handler.mjs";
import {renderActiveEffectConfigHandler, closeActiveEffectConfigHandler} from "./hooks/active-effect-config-handler.mjs";
import {getSceneControlButtonsHandler} from "./hooks/get-scene-control-buttons-handler.mjs";
import {requestRollHandler} from "./request-roll-handler.mjs";
import {renderSceneControlsHandler} from "./hooks/render-scene-controls-handler.mjs";
import {registerSheets} from "./init/registerSheets.mjs";
import {loadHandlebarTemplates} from "./init/load-handlebar-templates.mjs";
import {EffectsPanel} from "./apps/effects-panel.mjs";
import {effectsPanelWrapping} from "./init/effects-panel-wrapping.mjs";
import {renderPauseHandler} from "./hooks/render-pause-handler.mjs";
import {readyHandler} from "./hooks/ready-handler.mjs";
import {CryptoRandom} from "./apps/crypto-random.mjs";
import {RollRequester} from "./apps/roll-requester.mjs";
import {tooltipWrapping} from "./init/tooltip-wrapping.mjs";
import {renderSidebarDirectoryHandler} from "./hooks/render-sidebar-directory-handler.mjs";
import {rollTableWrapping} from "./init/roll-table-wrapping.mjs";

let cryptoRandom = new CryptoRandom();
globalThis.CryptoRandom = cryptoRandom;

Hooks.once("socketlib.ready", () => {
    CONFIG.aoa = {
        socket: socketlib.registerSystem(CONST.MODULE_ID)
    };

    CONFIG.aoa.socket.register("requestRoll", requestRollHandler);
});

Hooks.once("init", async () => {
    game.aoa = {
        effectsPanel: new EffectsPanel(),
        rollRequester: RollRequester
    }
    
    registerSettings();
    registerHelpers();
    configure();
    registerSheets();
    effectsPanelWrapping();
    tooltipWrapping();
    // rollTableWrapping();
    await loadHandlebarTemplates();

    Hooks.once("ready", readyHandler);
    Hooks.on("renderChatMessage", chatMessageHandler );
    Hooks.on("updateActor", updateActorHandler);
    Hooks.on("updateItem", updateItemHandler);
    Hooks.on("renderActiveEffectConfig", renderActiveEffectConfigHandler);
    Hooks.on("closeActiveEffectConfig", closeActiveEffectConfigHandler);
    Hooks.on("getSceneControlButtons", getSceneControlButtonsHandler);
    Hooks.on("renderSceneControls", renderSceneControlsHandler);
    Hooks.on('updateWorldTime', (_total, _diff) => game.aoa.effectsPanel.refresh());
    Hooks.on("renderPause", renderPauseHandler);
    Hooks.on("renderSidebarDirectory", renderSidebarDirectoryHandler);
});






