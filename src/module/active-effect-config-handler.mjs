export const renderActiveEffectConfigHandler = (config, html, data) => {
    const timeInput = html.find("[name='duration.seconds']");
    const startTimeInput = html.find("[name='duration.startTime");

    const seconds = data.effect.duration.seconds;
    const startTime = data.effect.duration.startTime;

    const timeSpan = seconds ? TimeSpan.FromSeconds(seconds) : new TimeSpan();

    timeInput.parent(".form-fields").css("gap", "0.4em");
    timeInput.parent(".form-fields").addClass("time-fields");
    timeInput.parent(".form-fields").addClass("text-centered");

    timeInput.replaceWith(`${game.i18n.localize("aoa.effect.days")}:<input type='number' name='days' value=${timeSpan.days()}>
                           ${game.i18n.localize("aoa.effect.hours")}:<input type='number' name='hours' value=${timeSpan.hours()}>
                           ${game.i18n.localize("aoa.effect.minutes")}:<input type='number' name='minutes' value=${timeSpan.minutes()}>
                           ${game.i18n.localize("aoa.effect.seconds")}:<input type='number' name='seconds' value=${timeSpan.seconds()}>`);

    const startFormatted = SimpleCalendar.api.formatTimestamp(startTime);

    startTimeInput.replaceWith(`<span class="start-date" data-start-time="${startTime}"><span class="time-string">${startFormatted.date} ${startFormatted.time}</span> <a><i class="fa-solid fa-clock"></i></a></span>`);

    html.find(".start-date a").click(function() {
        const element = html.find(".start-date");

        element.data("start-time", game.time.worldTime);
        const formattedDate = SimpleCalendar.api.formatTimestamp(game.time.worldTime);

        element.find(".time-string").text(`${formattedDate.date} ${formattedDate.time}`);
    });

    const durationTab = html.find(".tab[data-tab='duration']");
    html.find(".time-fields > input").change(inputChanged);

    durationTab.find("> .form-group").filter(index => index > 1).remove();

    durationTab.append(`<div class='form-group'>
                        <label class="rounds-label">${game.i18n.localize("COMBAT.Rounds")}:</label>
                            <div class="form-fields">
                                <a class="add" style="flex: 0;"><i class="fa-solid fa-plus"></i></a>
                                <a class="subtract" style="flex: 0;"><i class="fa-solid fa-minus"></i></a>
                            </div>
                        </div>`);


    function inputChanged() {
        actualizeRounds();
    }

    const simpleCalendarSettings = game.settings.get("foundryvtt-simple-calendar", "global-configuration");
    const secondsInCombatRound = simpleCalendarSettings ? simpleCalendarSettings.secondsInCombatRound : 6;

    function actualizeRounds() {
        const roundsLabel = html.find(".rounds-label");
        const days = Number.parseInt(html.find("[name='days']").val())
        const hours = Number.parseInt(html.find("[name='hours']").val())
        const minutes = Number.parseInt(html.find("[name='minutes']").val())
        const seconds = Number.parseInt(html.find("[name='seconds']").val())

        const ts = new TimeSpan(0,seconds, minutes, hours, days);
        const rounds = ts.totalSeconds() / secondsInCombatRound;

        roundsLabel.text(`${game.i18n.localize("COMBAT.Rounds")} (${rounds}):`);
    }

    actualizeRounds();

    durationTab.find(".add").click(function () {
        const input = html.find("[name='seconds']");

        input.val(Number.parseInt(input.val()) + secondsInCombatRound);
        actualizeRounds();
    });

    durationTab.find(".subtract").click(function () {
        const input = html.find("[name='seconds']");

        input.val(Number.parseInt(input.val()) - secondsInCombatRound);
        actualizeRounds();
    });

};

export const closeActiveEffectConfigHandler = async (config, html) => {
    const formElement = html[0].querySelector("form");
    const formData = new FormDataExtended(formElement);

    const timeSpan = new TimeSpan(0, formData.object.seconds, formData.object.minutes, formData.object.hours, formData.object.days);
    const startTime = Number.parseInt(html.find(".start-date").data("start-time"));

    const updateData = {
        duration: {}
    };

    if(config.object.duration.seconds !== (timeSpan.totalSeconds() > 0 ? timeSpan.totalSeconds() : null)) {
        updateData.duration.seconds = timeSpan.totalSeconds() > 0 ? timeSpan.totalSeconds() : null;
    }

    if(config.object.duration.startTime !== startTime) {
        updateData.duration.startTime = startTime;
    }

    await config.object.update(updateData);
};



