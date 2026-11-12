onPlayerLeave = (myId) => {
    hidePlayerFire(myId);
};

deleteAll();

globalThis.playerFires = {};
function showPlayerFire(myId) {
    let playerFire = playerFires[myId];

    let spread = 3;
    if (!playerFire || !api.checkValid(playerFire)) {
        playerFire = api.attemptCreateMeshEntity("ParticleEmitter", {
            texture: "square_particle",

            width: 0.5,
            height: 0.5,
            depth: 0.5,

            emitRate: 500,

            minLifeTime: 0.3,
            maxLifeTime: 0.5,

            minEmitPower: 2,
            maxEmitPower: 2,

            minSize: 0.1,
            maxSize: 0.15,

            gravity: [0, -10, 0],

            dir1: [-spread, -1, -spread],
            dir2: [spread, 0, spread],

            blendMode: 1,

            colorGradients: [
                {
                    timeFraction: 0,
                    minColor: [255, 0, 0, 1],
                    maxColor: [255, 255, 0, 1],
                },
                {
                    timeFraction: 1,
                    minColor: [255, 0, 0, 0],
                    maxColor: [255, 255, 0, 0],
                },
            ],
            velocityGradients: [
                {
                    timeFraction: 0,
                    factor: 1,
                    factor2: 1,
                },
            ],
        }); playerFires[myId] = playerFire;
    }
    return playerFire;
}

function hidePlayerFire(myId) {
    let playerFire = playerFires[myId];

    if (playerFire && api.checkValid(playerFire)) {
        api.deleteMeshEntity(playerFire);
        delete playerFires[myId];
    }
}

playerCommand = (myId, cmd) => {
    let gamemode = api.getPlayerGamemode(myId);
    if (cmd === "kit") {
        if (gamemode === "creative") {
            api.clearInventory(myId);
            api.deletePlayerDbValue(myId, "jetpackInfo");
            applyJetpack(myId)

            api.giveItem(myId, "Sky Pack", 1, {
                customAttributes: {
                    bar: { fraction: 1, colour: getColorForItemBar(1) },

                    maxFuel: maxFuelInJetpack,
                    fuelLeft: maxFuelInJetpack,

                    enchantmentTier: "Tier 5"
                }
            });

            api.giveItem(myId, "Voltite Cell", 999);

            api.sendMessage(myId, [{ str: `Have fun!`, style: { color: c.greenUiText } }]);
        } else {
            api.sendMessage(myId, [{ str: `/kit only works in creative mode. If you're the owner, you can run /gm c in chat.`, style: { color: c.redUiText } }]);
        }

        return true;
    }
};

globalThis.jetpackBoostKey = "F";
globalThis.maxFuelInJetpack = 500;

function getCraftingTextForItem(myId, recipe, itemName) {
    let craftingText = [];

    let hasAll = true;
    craftingText.push({ str: "\n• Crafting progress for ", style: style.sidebarBody }, { icon: `${itemName}` });
    for (let requiredItem of recipe) {
        let { amt, items } = requiredItem;
        let itemName = items[0];
        let hasAmt = api.getInventoryItemAmount(myId, itemName);

        if (hasAmt < amt) {
            hasAll = false;
            craftingText.push(
                { str: `\n` },
                { icon: itemName }, { str: `${hasAmt}`, style: { color: c.redUiText } },
                { type: "ProgressBar", progress: hasAmt / amt, colours: [c.redUiText, c.greenUiText] },
                { icon: itemName }, { str: `${amt}`, style: { color: c.greenUiText } }
            );
        } else {
            craftingText.push(
                { str: `\n` },
                { icon: itemName }, { str: `${amt}`, style: { color: c.greenUiText } }, { icon: `fa-solid fa-check`, style: { color: c.greenUiText } }
            );
        }
    }

    if (hasAll) {
        craftingText = [{ str: "\n• Go over to a ", style: style.sidebarBody }, { icon: "Workbench" }, { str: ", press\n", style: style.sidebarBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.sidebarBinding }, { str: ", and craft a ", style: style.sidebarBody }, { icon: itemName }];
    }
    return craftingText;
}

globalThis.tNum = 0;
tick = (ms) => {
    tNum = (tNum + 1) % 2;
    if (tNum !== 0 || api.isNearInterrupt()) { return; }
    for (let myId of api.getPlayerIds()) {
        let sidebarText = [...baseSidebarText];

        if (hasJetpack(myId)) {
            if (api.isPlayerCrouching(myId)) { removeJetpack(myId); return; }
            let jetpackInfo = getPlayerDbObject(myId, "jetpackInfo");
            let { maxFuel, fuelLeft } = jetpackInfo;
            let fuelPercentage = fuelLeft / maxFuel;
            let hasMouseDown = mouseDown[myId];
            let hud = [];

            let [dx, dy, dz] = api.getPlayerFacingInfo(myId).dir;
            let [vx, vy, vz] = api.getVelocity(myId);

            let batteriesLeft = api.getInventoryItemAmount(myId, "Voltite Cell");

            if (hasMouseDown) {
                if (fuelLeft <= 0) {
                    if (api.hasItem(myId, "Voltite Cell")) {
                        api.removeItemName(myId, "Voltite Cell", 1);
                        jetpackInfo.fuelLeft = maxFuel;
                        fuelLeft = maxFuel;

                        batteriesLeft = api.getInventoryItemAmount(myId, "Voltite Cell");
                        api.sendMessage(myId, [{ str: `Refueled with a battery from your inventory. You have ${batteriesLeft} left.`, style: { color: c.greenUiText } }]);
                    } else {
                        api.sendMessage(myId, [{ str: `Out of fuel!`, style: { color: c.redUiText } }]);
                    }
                } else {
                    jetpackInfo.fuelLeft--;

                    api.applyImpulse(myId, dx * 1, (dy + 0.5) * 1, dz * 1);
                }
            }

            let style2 = {
                keybinding: { fontSize: "1rem" },
                body: { fontSize: "2rem", color: c.serverUiText },
                subtitle: { fontSize: "1.5rem", color: c.serverUiText, fontStyle: "italic" },
                subtitleGreen: { fontSize: "1.5rem", color: c.greenUiText, fontStyle: "italic", fontWeight: "800" },
                subtitleRed: { fontSize: "1.5rem", color: c.redUiText, fontStyle: "italic", fontWeight: "800" },
                subtitleIcon: { fontSize: "1.6rem", color: c.serverUiText }
            };

            let isBoosting = false;
            if (boostInfo[myId]) {
                let { boosting, lastBoosted } = boostInfo[myId];
                let consuming = 10;

                if (boosting && fuelLeft - consuming >= 0) { isBoosting = true; }
                if (boosting && lastBoosted + 500 < api.now()) {
                    boostInfo[myId].lastBoosted = api.now();
                    if (fuelLeft - consuming >= 0) {
                        let [dx, dy, dz] = api.getPlayerFacingInfo(myId).dir;
                        let [vx, vy, vz] = api.getVelocity(myId);
                        api.applyImpulse(myId, dx * 10, (dy + 0.5) * 5, dz * 10);

                        jetpackInfo.fuelLeft -= consuming;
                        setPlayerDbObject(myId, "jetpackInfo", jetpackInfo);
                    } else {
                        if (api.hasItem(myId, "Voltite Cell")) {
                            let alreadySubtracted = fuelLeft;
                            consuming -= alreadySubtracted;

                            api.removeItemName(myId, "Voltite Cell", 1);
                            jetpackInfo.fuelLeft = maxFuel - consuming;
                            fuelLeft = maxFuel;

                            batteriesLeft = api.getInventoryItemAmount(myId, "Voltite Cell");
                            api.sendMessage(myId, [{ str: `Refueled with a battery from your inventory. You have ${batteriesLeft} left.`, style: { color: c.greenUiText } }]);
                        } else {
                            api.sendMessage(myId, [{ str: `Not enough fuel!`, style: { color: c.redUiText } }]);
                        }
                    }
                }
            }


            if (isBoosting) {
                api.setClientOptions(myId, {
                    cameraTint: [255, 255, 0, 0.1],
                    gameCamera: { mode: "default", letterbox: true, hideHud: true },
                });
            } else if (fuelLeft <= 0) {
                api.setClientOptions(myId, {
                    cameraTint: [255, 0, 0, 0.3],
                    gameCamera: { mode: "default", letterbox: false, hideHud: false },
                });
            } else {
                api.setClientOptions(myId, {
                    cameraTint: null,
                    gameCamera: { mode: "default", letterbox: false, hideHud: false },
                });
            }

            if (fuelLeft > 0) {
                hud = [
                    { str: `Hold `, style: style2.body }, { type: "StyledKeyBinding", action: "primary-fire", style: style2.keybinding }, { str: `/`, style: style2.body }, { type: "StyledKeyBinding", action: "alt-fire", style: style2.keybinding }, { str: ` to fly where you look`, style: style2.body },

                    { str: `    •    Press `, style: style2.body },
                    { type: "StyledKeyBinding", action: "crouch", style: style2.keybinding },
                    { str: ` to un-equip`, style: style2.body },

                    { str: `\n`, style: style2.body },
                    { str: `${formatFuelNumber(fuelLeft)}`, style: { fontSize: "2rem", color: getColorForItemBar(fuelPercentage) } }, { type: "ProgressBar", progress: fuelPercentage, width: "45rem", colours: [getColorForItemBar(fuelPercentage)] }, { str: `${Math.ceil(maxFuel)}`, style: { fontSize: "2rem", color: getColorForItemBar(1) } },

                    { str: `\n`, style: style2.body },
                    { str: `You have `, style: style2.subtitle }, { str: `${batteriesLeft}`, style: batteriesLeft ? style2.subtitleGreen : style2.subtitleRed }, { icon: "Voltite Cell", style: style2.subtitleIcon }, { str: ` left to auto-refuel your Jetpack.`, style: style2.subtitle }
                ];

                api.setClientOptions(myId, {
                    gravityMultiplier: 0.1,
                    airFrictionScale: 0.1,
                });

                if (api.getBlockTypesPlayerStandingOn(myId)?.length === 0 && fuelLeft > 0) {
                    let [x, y, z] = api.getPosition(myId);
                    let myFire = showPlayerFire(myId);

                    jetpackInfo.fuelLeft -= 0.05;

                    if (jetpackInfo.fuelLeft <= 0) {
                        if (api.hasItem(myId, "Voltite Cell")) {
                            api.removeItemName(myId, "Voltite Cell", 1);
                            jetpackInfo.fuelLeft = maxFuel;

                            batteriesLeft = api.getInventoryItemAmount(myId, "Voltite Cell");
                            api.sendMessage(myId, [{ str: `Refueled with your battery. You have ${batteriesLeft} left.`, style: { color: c.greenUiText } }]);
                        }
                    }

                    api.addFollowingEntityToPlayer(myId, myFire, [-dx / 5, 0.3, -dz / 5]);
                } else {
                    hidePlayerFire(myId);
                }
            } else {
                if (api.hasItem(myId, "Voltite Cell")) {
                    api.removeItemName(myId, "Voltite Cell", 1);
                    jetpackInfo.fuelLeft = maxFuel;

                    batteriesLeft = api.getInventoryItemAmount(myId, "Voltite Cell");
                    api.sendMessage(myId, [{ str: `Refueled with your battery. You have ${batteriesLeft} left.`, style: { color: c.greenUiText } }]);
                } else {
                    hud = [
                        { str: `Out of fuel! Collect more `, style: style2.subtitleRed }, { icon: "Voltite Cell", style: style2.subtitleIcon }, { str: ` to re-fuel, or press `, style: style2.subtitleRed },
                        { type: "StyledKeyBinding", action: "crouch", style: style2.keybinding },
                        { str: ` to un-equip.`, style: style2.subtitleRed },
                    ];

                    api.setClientOptions(myId, {
                        gravityMultiplier: 1,
                        airFrictionScale: 1,
                    });
                }
            }

            api.setClientOptions(myId, {
                middleTextLower: {
                    content: hud,
                    showBackground: false,
                }
            });

            sidebarText.push({ str: "\n• Congrats! You're\nwearing a Jetpack.", style: style.sidebarBody });


            if (fuelLeft < 0) { jetpackInfo.fuelLeft = 0; }
            setPlayerDbObject(myId, "jetpackInfo", jetpackInfo);
        } else {
            api.setClientOptions(myId, {
                middleTextLower: {
                    content: [],
                    showBackground: false,
                },
                gravityMultiplier: 1,
                airFrictionScale: 1,
                cameraTint: null,
                gameCamera: { mode: "default", letterbox: false, hideHud: false },
            });

            let currentButtons = api.getClientOption(myId, "customButtons");
            if (currentButtons?.length > 0) {
                api.setClientOptions(myId, {
                    customButtons: [],
                });
            }

            if (api.hasItem(myId, "Sky Pack")) {
                sidebarText.push({ str: "\n• Press ", style: style.sidebarBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.sidebarBinding }, { str: " while holding\n", style: style.sidebarBody }, { icon: "Sky Pack" }, { str: " to equip.", style: style.sidebarBody });
            } else {
                sidebarText.push(...getCraftingTextForItem(myId, requiredForJetpackRecipe, "Sky Pack"));
            }
        }

        if (api.hasItem(myId, "Voltite Cell")) {
        } else {
            sidebarText.push(...getCraftingTextForItem(myId, requiredForBatteryRecipe, "Voltite Cell"));
        }

        api.setClientOptions(myId, {
            RightInfoText: {
                content: sidebarText,
                showBackground: false,
            },
        });
    }
};

function formatFuelNumber(fuelLeft) {
    return `${Math.ceil(fuelLeft)}`.padStart(maxFuelInJetpack.toString().length, "0");
}

globalThis.mouseDown = {};

globalThis.requiredForJetpackRecipe = [
    { amt: 3, items: ["Iron Bar"] },
    { amt: 2, items: ["Vines"] },
    { amt: 1, items: ["Voltite Cell"] },
];

globalThis.requiredForBatteryRecipe = [
    { amt: 1, items: ["Coal"] },
    { amt: 2, items: ["Iron Bar"] },
];

onPlayerReleasedButton = (myId, buttonId) => {
    if (buttonId === "jetpackBoost") {
        delete boostInfo[myId];
    }
};

onPlayerPressedButton = (myId, buttonId) => {
    if (buttonId === "jetpackBoost") {
        boostInfo[myId] = { boosting: true, lastBoosted: api.now() };
        let jetpackInfo = getPlayerDbObject(myId, "jetpackInfo");
    }
};
globalThis.boostInfo = {};

function removeJetpack(myId) {
    let jetpackInfo = getPlayerDbObject(myId, "jetpackInfo");
    if (jetpackInfo) {
        let { maxFuel, fuelLeft } = jetpackInfo;

        api.giveItem(myId, "Sky Pack", 1, {
            customAttributes: {
                bar: { fraction: fuelLeft / maxFuel, colour: getColorForItemBar(fuelLeft / maxFuel) },

                maxFuel: maxFuel,
                fuelLeft: fuelLeft,

                enchantmentTier: "Tier 5"
            }
        });

        api.deletePlayerDbValue(myId, "jetpackInfo");
        applyJetpack(myId);

        api.sendMessage(myId, [{ str: `Removed jetpack.`, style: { color: c.greenUiText } }]);
    }
}


onPlayerJoin = (myId, fromReset) => {
    applyJetpack(myId);

    api.setClientOptions(myId, {
        RightInfoText: {
            content: baseSidebarText,
            showBackground: false,
        },
    });

    api.setItemStat(myId, "Sky Pack", "displayName", "Jetpack");
    api.setItemStat(myId, "Sky Pack", "description", "Right-click while holding to equip.");

    api.setItemStat(myId, "Voltite Cell", "displayName", "Battery");
    api.setItemStat(myId, "Voltite Cell", "description", "Refuels your Jetpack when it runs out.");


    api.editItemCraftingRecipes(myId, "Voltite Cell", [{
        isStarterRecipe: true,
        produces: 1,
        requires: requiredForBatteryRecipe,
        station: "Workbench",
        onCraftedAura: 10,
    }]);

    api.editItemCraftingRecipes(myId, "Sky Pack", [{
        isStarterRecipe: true,
        produces: 1,
        requires: requiredForJetpackRecipe,
        station: "Workbench",
        attributes: {
            customAttributes: {
                bar: { fraction: 1, colour: getColorForItemBar(1) },

                maxFuel: maxFuelInJetpack,
                fuelLeft: maxFuelInJetpack,

                enchantmentTier: "Tier 5"
            }
        },
        onCraftedAura: 500,
    }]);
};

onPlayerCraft = (myId, itemName, craftingIdx, recipe, craftTimes) => {
    if (itemName === "Sky Pack") {
        api.giveItem(myId, "Voltite Cell", 1);
        api.sendMessage(myId, [{ str: `Congrats! You've crafted a Jetpack.`, style: { color: c.greenUiText } }]);
    }
};

globalThis.style = {
    sidebarBody: { color: "#cef3ff", fontSize: "1.2rem" },
    sidebarBinding: { color: "#cef3ff", fontSize: "0.8rem" },

    crosshairTextBody: { color: "#cef3ff", fontWeight: "600" },
    crosshairTextBinding: { color: "#cef3ff", fontWeight: "600", fontSize: "1rem" },
};
globalThis.baseSidebarText = [
    { icon: "Sky Pack", style: { fontSize: "2.4rem" } },
    { str: "Jetpacks", style: { color: "#ceeff0", fontSize: "2rem", fontWeight: "800" } },

    { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

    { str: "\n\n• Craft and use a Jetpack!", style: style.sidebarBody },
    { str: "\n• Auto-refuels with the\nbatteries in your inventory\nwhen you run out of power.", style: style.sidebarBody },
];

function hasJetpack(myId) {
    let jetpackInfo = getPlayerDbObject(myId, "jetpackInfo");
    if (jetpackInfo) { return true; }
    return false;
}

function applyJetpack(myId) {
    if (hasJetpack(myId)) {
        let jetpackInfo = getPlayerDbObject(myId, "jetpackInfo");
        let { maxFuel, fuelLeft } = jetpackInfo;

        api.changePlayerIntoSkin(myId, "back", "back_none");
        api.updateEntityNodeMeshAttachment(myId, "TorsoNode", "BloxdBlock", {
            size: 0.4,
            blockName: "Sky Pack",
        }, [0, 0.3, -0.2]);

        api.setClientOptions(myId, {
            customButtons: [
                {
                    icon: "Speed",
                    id: "jetpackBoost",
                    keycode: `Key${jetpackBoostKey}`,
                    description: "Press and hold to fly faster for a higher fuel cost."
                }
            ],
        });
    } else {
        hidePlayerFire(myId);
        api.updateEntityNodeMeshAttachment(myId, "TorsoNode", null);
    }
}

function getColorForItemBar(barFraction) {
    if (barFraction <= 0.1) {
        return "#ff0000";
    } else if (barFraction <= 0.25) {
        return "#ff5500";
    } else if (barFraction <= 0.5) {
        return "#f07f29";
    } else if (barFraction <= 0.75) {
        return "#f0cf29";
    } else if (barFraction <= 0.9) {
        return "#7cf029";
    } else if (barFraction > 0.9) {
        return "#0ced1b";
    }
};

onPlayerClickUp = (myId, rc, x, y, z, block, targetEId) => {
    mouseDown[myId] = false;
};
onPlayerClick = (myId, rc, x, y, z, block, targetEId) => {
    let held = api.getHeldItem(myId);
    let heldIdx = api.getSelectedInventorySlotI(myId);

    mouseDown[myId] = true;

    if (held?.name === "Sky Pack" && held?.attributes?.customAttributes) {
        if (api.isPlayerCrouching(myId)) {
            api.sendMessage(myId, [{ str: `You can't be crouching while you equip the Jetpack, because crouching dismounts.`, style: { color: c.redUiText } }]);
            return;
        }
        let { maxFuel, fuelLeft } = held?.attributes?.customAttributes;
        api.setItemSlot(myId, heldIdx, "Air");

        setPlayerDbObject(myId, "jetpackInfo", {
            maxFuel, fuelLeft,
        });
        applyJetpack(myId);
        api.sendMessage(myId, [
            { str: `Equipped jetpack. Press `, style: { color: c.greenUiText } },
            { type: "StyledKeyBinding", action: "crouch", style: style.sidebarBinding },
            { str: ` to un-equip it.`, style: { color: c.greenUiText } },
        ]);
        mouseDown[myId] = false;
    }
};


function pushToPlayerDbList(myId, key, value) {
    let list = getPlayerDbList(myId, key) ?? [];
    list.push(value);
    setPlayerDbList(myId, key, list);
}

function pushToLobbyDbList(myId, key, value) {
    let list = getLobbyDbList(myId, key) ?? [];
    list.push(value);
    setLobbyDbList(myId, key, list);
}

function getPlayerDbList(myId, key) {
    let raw = api.getPlayerDbValue(myId, key);
    let value = JSON.parse(raw) ?? [];

    return value;
}

function setPlayerDbList(myId, key, value) {
    api.setPlayerDbValue(myId, key, JSON.stringify(value));
}

function getLobbyDbList(key) {
    let raw = api.getLobbyDbValue(key);
    let value = JSON.parse(raw) ?? [];

    return value;
}

function setLobbyDbList(key, value) {
    api.setLobbyDbValue(key, JSON.stringify(value));
}

function getPlayerDbObject(myId, key) {
    let raw = api.getPlayerDbValue(myId, key);
    let value = JSON.parse(raw);

    return value;
}

function setPlayerDbObject(myId, key, value) {
    api.setPlayerDbValue(myId, key, JSON.stringify(value));
}

function getLobbyDbObject(key) {
    let raw = api.getLobbyDbValue(key);
    let value = JSON.parse(raw);

    return value;
}

function setLobbyDbObject(key, value) {
    api.setLobbyDbValue(key, JSON.stringify(value));
}

globalThis.c = {
    serverUiText: "#cef3ff",
    goldUiText: "#f5d142",
    redUiText: "#ff9d87",
    blueUiText: "#2671d7",
    greenUiText: "#2eeb82",
    yellowUiText: "#f3f351",
    cyanUiText: "#4feded",
    whiteUiText: "#e7e7e7",
    pinkUiText: "#e74de7",
    grayUiText: "#c7c7c7",
    blackUiText: "#000000",
    orangeUiText: "#e19835",
    lilacUiText: "#ce91ce",
    purpleUiText: "#800080",
    magentaUiText: "#ff23ff",
    brownUiText: "#B2614A",
    limeUiText: "#A1FF35",
    lightGrayUiText: "#d7d7d7",
    lightBlueUiText: "#84E0FF",
    damageNumber: "#ffffff",
    criticalDamageNumber: "#e86767",
    pointsNumber: "#FFD700",
    defaultNameTagBackground: "#22283b",
    greenNameTagBackground: "#0d730d",
    partyPurpleNameTagBackground: "#9b39d5",
    redBackground: "#e74d4d",
    blueBackground: "#4d4de7",
    greenBackground: "#4fed4f",
    whiteBackground: "#e7e7e7",
    pinkBackground: "#e74de7",
    redTeam: "#e74d4d",
    blueTeam: "#4d4de7",
    greenTeam: "#4fed4f",
    yellowTeam: "#f3f351",
    cyanTeam: "#4feded",
    whiteTeam: "#e7e7e7",
    pinkTeam: "#e74de7",
    grayTeam: "#4d4d4d",
    blackTeam: "#000000",
    orangeTeam: "#ffa500",
    lilacTeam: "#c8a2c8",
    purpleTeam: "#800080",
    magentaTeam: "#ff00ff",
    brownTeam: "#774433",
    limeTeam: "#A9FF21",
    lightGrayTeam: "#999999",
    lightBlueTeam: "#84E0FF"
};

function deleteAll() {
    for (let e of api.getEntitiesInRect([-100000, -100000, -100000], [100000, 100000, 100000])) { try { api.deleteEntity(e); } catch { } }
};