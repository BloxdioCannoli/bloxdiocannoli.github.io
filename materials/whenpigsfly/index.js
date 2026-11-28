/*
Ever wondered why the video might look a bit different?

I sometimes change around values to look better on the video, but that might not work well for everyone.
🚨 Changing these values might lag the game, break the codes, or make them less balanced.
*/
globalThis.laserConfig = {
    eyeRange: 0.25, // The pig can't look up or down, so we limit the range of vertical laser movement so it looks realistic.
    laserDestroyRadius: 2, // The amount of blocks, mobs, and players around a laser impact site.
    damageAmount: 50, // The damage the laser deals to mobs and players when they get hit.
    maxWithoutHits: 1000, // The maxmium amount of blocks the laser can cross without hitting anything before stopping.
    maxHits: 10, // The amount of layers of blocks the laser can shoot through before stopping.
};

tick = (ms) => {
    tNum = (tNum + 1) % 2;
    if (tNum !== 0 || api.isNearInterrupt()) { return; }

    for (let myId of api.getPlayerIds()) {
        if (api.getPlayerPhysicsState(myId).tier === 0 && api.getPlayerPhysicsState(myId).type === 0 && ridingInfo[myId]) {
            delete ridingInfo[myId];

            unMountPig(myId);
        }

        if (ridingInfo[myId]) {
            let { isPig, ridingId } = ridingInfo[myId];

            let pressing = buttonsPressed[myId];
            if (pressing.fly) {
                let [vx, vy, vz] = api.getVelocity(myId);
                api.setVelocity(myId, vx, 10, vz);
            }
            if (pressing.laser) {
                let myDir = api.getPlayerFacingInfo(myId).dir;
                let [mdx, mdy, mdz] = myDir;

                let [x, y, z] = api.getPosition(myId);

                let heading = api.getEntityHeading(ridingId);
                //let [dx, dy, dz] = [Math.sin(heading), 0, Math.cos(heading)];
                let [dx, dy, dz] = api.getPlayerFacingInfo(myId).dir;
                let horizontalLength = Math.hypot(dx, dz) || 1;
                let forwardX = dx / horizontalLength;
                let forwardZ = dz / horizontalLength;

                let eyeX = -forwardZ * 0.12;
                let eyeZ = forwardX * 0.12;

                x += 0.5 + forwardX * 0.5;
                z += 0.5 + forwardZ * 0.5;
                y += 0.35;

                dy = Math.max(dy, -laserConfig.eyeRange);
                dy = Math.min(dy, laserConfig.eyeRange);

                shootLaser([x + eyeX, y, z + eyeZ], [dx, dy, dz], myId, [myId, ridingId]);
                shootLaser([x - eyeX, y, z - eyeZ], [dx, dy, dz], myId, [myId, ridingId]);

                api.sendHitmarker(myId, true);
            }
            if (pressing.down) {
                let [vx, vy, vz] = api.getVelocity(myId);
                api.setVelocity(myId, vx, -10, vz);
            }
        }
    }

    for (let mId of api.getMobIds()) {
        let type = api.getEntityType(mId);
        if (type === "Pig") {
            let ownerDbId = api.getMobSetting(mId, "ownerDbId") ?? "";
            let ownerId = api.getPlayerIdFromDbId(ownerDbId);
            if (ownerId && api.checkValid(ownerId)) {
                let ownerName = api.getEntityName(ownerId);
                initPig(mId);

                let mobDb = getMobDbObject(mId);

                if (api.getMobSetting(mId, "isRideable")) {
                    let name = api.getEntityName(mId);
                    let splitName = name.split(" ");
                    if (!splitName.includes("Flying") && splitName[splitName.length - 1] === "Pig") {
                        splitName.splice(1, 0, "Flying");
                        name = splitName.join(" ");

                        api.setTargetedPlayerSettingForEveryone(mId, "nameTagInfo", {
                            content: [{ str: name }],
                            subtitle: [{ str: `Owned by ${ownerName}` }]
                        });
                    }

                    let myRidingInfo = ridingInfo[ownerId];
                    if (myRidingInfo?.isPig && myRidingInfo?.ridingId === mId) {
                        let { isPig, ridingId } = myRidingInfo;

                        api.addFollowingEntityToPlayer(ownerId, ridingId, [0, 0, 0], false);
                        api.setMobAiState(ridingId, "idle", null, { hold: true });

                        api.setTargetedPlayerSettingForEveryone(ridingId, "lockHeadToBody", true);
                        api.setEntityHeading(ridingId, api.getEntityHeading(ownerId));

                        api.updateEntityNodeMeshAttachment(mId, "HeadMesh", null);
                        mountPig(ownerId);

                        let held = api.getHeldItem(ownerId);
                        let heldName = held?.name;

                        let [dx, dy, dz] = api.getPlayerFacingInfo(ownerId).dir;
                        let boostStrength = 30;

                        if (heldName === "Carrot") {
                            let [vx, vy, vz] = api.getVelocity(ownerId);
                            api.setVelocity(ownerId, dx * boostStrength, vy, dz * boostStrength);
                        }
                    } else {
                        if (myRidingInfo && !myRidingInfo?.isPig) {
                            unMountPig(ownerId);
                        }
                        api.updateEntityNodeMeshAttachment(mId, "HeadMesh", "BloxdBlock", {
                            blockName: "INTERNAL_MESH_Red Balloon",
                            size: 0.05,
                        }, [0, 0.5, 0.25]);
                    }

                } else {
                    let name = api.getEntityName(mId);

                    api.setTargetedPlayerSettingForEveryone(mId, "nameTagInfo", {
                        content: [{ str: name }],
                        subtitle: [{ str: `Owned by ${ownerName}` }]
                    });

                    api.updateEntityNodeMeshAttachment(mId, "HeadMesh", null);
                }
            }
        }
    }

    for (let pigInitialized in pigsInit) {
        if (!pigInitialized || !api.checkValid(pigInitialized)) {
            unInitPig(pigInitialized);
        }
    }
};

function mountPig(myId) {
    api.updateEntityNodeMeshAttachment(myId, "HeadMesh", "BloxdBlock", {
        blockName: "INTERNAL_MESH_Red Balloon",
        size: 0.1,
    }, [0, 1, 0]);
    api.setClientOptions(myId, {
        customButtons: [
            { id: "fly", icon: "Jump Boost", keycode: "Space", description: "Press and hold [SPACE] to fly up!" },
            { id: "down", icon: "VoidJump", keycode: "KeyC", description: "Press and hold [C] to fly down." },
            { id: "laser", icon: "Sanguine Blade", keycode: "KeyL", description: "Press and hold [L] to shoot a laser out of the pig's eyes. It damages and destroys anything it hits." }
        ],
        gravityMultiplier: 0.1,
    });
}

globalThis.sidebarToggles = {};

function showFullSidebar(myId) {
    sidebarToggles[myId] = true;
    api.setClientOptions(myId, {
        RightInfoText: {
            content: [
                { icon: "Pig Spawn Orb", style: { fontSize: "2.4rem" } },
                { str: "When pigs fly!", style: { color: "#ffa7a1", fontSize: "2rem", fontWeight: "800" } },

                { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

                { str: "\n\n• Tame pigs with ", style: style.sidebarBody }, { icon: "Apple", style: style.sidebarBody }, { str: " or ", style: style.sidebarBody }, { icon: "Carrot", style: style.sidebarBody },
                { str: "\n• Right-click a pig while\nholding a ", style: style.sidebarBody }, { icon: "Saddle", style: style.sidebarBody }, { str: " to be able to\nride it", style: style.sidebarBody },
                { str: "\n• Right-click a pig while\nmounting to dismount", style: style.sidebarBody },
                { str: "\n• Right-click your saddled\npig and press [SPACE] to fly", style: style.sidebarBody },
                { str: "\n• Press [L] to shoot a laser\nfrom the pig's eyes", style: style.sidebarBody },
                { str: "\n• Hold a ", style: style.sidebarBody }, { icon: "Carrot", style: style.sidebarBody }, { str: " to speed up the\npig", style: style.sidebarBody }
            ],
            showBackground: false,
        },
    });
}
function showSidebar(myId) {
    sidebarToggles[myId] = false;
    api.setClientOptions(myId, {
        RightInfoText: {
            content: [
                { icon: "Pig Spawn Orb", style: { fontSize: "2.4rem" } },
                { str: "When pigs fly!", style: { color: "#ffa7a1", fontSize: "2rem", fontWeight: "800" } },

                { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

                { str: "\n\n• Tame a pig and equip a ", style: style.sidebarBody }, { icon: "Saddle", style: style.sidebarBody },
                { str: "\n• Mount the saddled pig", style: style.sidebarBody },
                { str: "\n• Press [SPACE] to fly", style: style.sidebarBody },
                { str: "\n• Press [C] to descend", style: style.sidebarBody },
                { str: "\n• Press [L] to shoot a laser\nfrom the pig's eyes", style: style.sidebarBody },
                { str: "\n• Hold a ", style: style.sidebarBody }, { icon: "Carrot", style: style.sidebarBody }, { str: " to sprint\nwherever you look", style: style.sidebarBody }
            ],
            showBackground: false,
        },
    });
}

globalThis.buttonsPressed = {};
onPlayerPressedButton = (myId, buttonId) => {
    buttonsPressed[myId][buttonId] = true;
};

onPlayerReleasedButton = (myId, buttonId) => {
    delete buttonsPressed[myId][buttonId];
};

function unMountPig(myId) {
    api.setPlayerPhysicsState(myId, { tier: null, type: 0 });
    api.updateEntityNodeMeshAttachment(myId, "HeadMesh", null);
    api.setClientOptions(myId, {
        customButtons: [],
        gravityMultiplier: 1,
    });

    delete ridingInfo[myId];
}

onPlayerJoin = (myId, fromReset) => {
    unMountPig(myId);
    buttonsPressed[myId] = {};
    showSidebar(myId);

    initWorld();
};

onPlayerLeave = (myId) => {
    delete buttonsPressed[myId];
};

deleteAllSafelyDeletable();

globalThis.ridingInfo = {};

onPlayerClick = (myId, rc, x, y, z, block, targetEId) => {
    //shootLaser(api.getPosition(myId), api.getPlayerFacingInfo(myId).dir, myId);

    if (targetEId) {
        let type = api.getEntityType(targetEId);
        if (type === "Pig") {
            let ownerDbId = api.getMobSetting(targetEId, "ownerDbId");
            if (ownerDbId === api.getPlayerDbId(myId)) {
                let held = api.getHeldItem(myId);
                let heldName = held?.name;

                if (heldName === "Saddle" && !api.getMobSetting(targetEId, "isRideable")) {
                    api.removeItemName(myId, "Saddle", 1);
                    api.setMobSetting(targetEId, "isRideable", true);
                }
            }
        }
    }
};

onPlayerAttemptAltAction = (myId, x, y, z, block, targetEId) => {
    let held = api.getHeldItem(myId);
    let heldName = held?.name;

};

onPlayerAltAction = (myId, x, y, z, block, targetEId) => {
    let held = api.getHeldItem(myId);
    let heldName = held?.name;

    let state = api.getPlayerPhysicsState(myId);
    let { type, tier } = state;


    if (type === 5 && tier === 0) {
        if (targetEId && api.checkValid(targetEId) && !ridingInfo[myId]) {
            ridingInfo[myId] = {
                ridingId: targetEId,
                isPig: api.getEntityType(targetEId) === "Pig",
            };
        }
    }
    if (type === 0 && tier === 0) {
        if (ridingInfo[myId]) {
            if (ridingInfo[myId].ridingId === targetEId) {
                unMountPig(myId);

                delete ridingInfo[myId];
            }
        }
    }
};

globalThis.tNum = 0;

globalThis.pigsInit = {};

function unInitPig(mId) {
    if (!pigsInit[mId]) { return; }

    if (mId && api.checkValid(mId)) {
        let name = api.getEntityName(mId);

        let nametagInfo = {};
        nametagInfo.content = [{ str: name }];

        let ownerDbId = api.getMobSetting(mId, "ownerDbId");
        let ownerId = api.getPlayerIdFromDbId(ownerDbId);
        if (api.checkValid(ownerId)) {
            let ownerName = api.getEntityName(ownerId);
            if (ownerName) { nametagInfo.subtitle = [{ str: `Owned by ${ownerName}` }]; }
        }

        api.setTargetedPlayerSettingForEveryone(mId, "nameTagInfo", nameTagInfo);
    }

    delete pigsInit[mId];
}

function initPig(mId) {
    if (pigsInit[mId]) { return; }

    pigsInit[mId] = true;
}

globalThis.hasInitWorld = false;
function initWorld() {
    if (hasInitWorld) { return; }

    api.setDefaultMobSetting("Pig", "tameInfo", {
        probabilityOfTame: 1,
        tameItemName: ["Apple", "Carrot"],
        supportsFriendship: false,
    });

    api.setDefaultMobSetting("Pig", "attackItemName", "Diamond Sword");

    hasInitWorld = true;
}

globalThis.style = {
    sidebarBody: { color: "#cef3ff", fontSize: "1.2rem" },
    sidebarBinding: { color: "#cef3ff", fontSize: "0.8rem" },

    crosshairTextBody: { color: "#cef3ff", fontWeight: "600" },
    crosshairTextBinding: { color: "#cef3ff", fontWeight: "600", fontSize: "1rem" },
};

playerCommand = (myId, cmd) => {
    let gamemode = api.getPlayerGamemode(myId);
    if (cmd === "kit") {
        if (gamemode === "creative") {
            api.clearInventory(myId);

            api.giveItem(myId, "Pig Spawn Orb", 999);
            api.giveItem(myId, "Carrot", 999);
            api.giveItem(myId, "Apple", 999);
            api.giveItem(myId, "Saddle", 1);

            api.sendMessage(myId, [{ str: `Have fun!`, style: { color: c.greenUiText } }]);
        } else {
            api.sendMessage(myId, [{ str: `/kit only works in creative mode. If you're the owner, you can run /gm c in chat.`, style: { color: c.redUiText } }]);
        }

        return true;
    }
};

onWorldAttemptSpawnMob = (mobType, x, y, z) => {
    return "preventSpawn";
};

function deleteAllSafelyDeletable() {
    for (let e of api.getEntitiesInRect([-100000, -100000, -100000], [100000, 100000, 100000])) {
        try {
            let entityName = api.getEntityName(e);
            if (entityName.includes("candelete")) {
                api.deleteEntity(e);
            }
        } catch { }
    }
};

function deleteAll() {
    for (let e of api.getEntitiesInRect([-100000, -100000, -100000], [100000, 100000, 100000])) { try { api.deleteEntity(e); } catch { } }
};

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

function createMeshSystem(meshes, sourceMeshConfig) {
    let created = [];
    let srcMesh = null;
    if (sourceMeshConfig) {
        let { opts, type, name, onCreate, sourceOffset, physicsOpts } = sourceMeshConfig;
        let meshId = api.attemptCreateMeshEntity(type, {}, name ?? "");
        if (meshId && api.checkValid(meshId)) {
            srcMesh = meshId;

            cleanName(meshId);

            created.push(meshId);
            if (onCreate) { onCreate(meshId); }
        }
    }

    for (let meshConfig of meshes) {
        let { opts, type, name, onCreate, srcOffset } = meshConfig;
        let meshId = api.attemptCreateMeshEntity(type, opts, name ?? "");
        if (meshId && api.checkValid(meshId)) {
            if (srcMesh) {
                api.addFollowingEntityToPlayer(srcMesh, meshId, srcOffset ?? [0, 0, 0]);
            }

            cleanName(meshId);

            created.push(meshId);
            if (onCreate) { onCreate(meshId); }
        }
    }

    return created;
}

function cleanName(id) {
    let name = api.getEntityName(id);
    if (name) {
        let newName = name.replaceAll("candelete", "");
        if (newName) {
            api.setTargetedPlayerSettingForEveryone(id, "nameTagInfo", {
                content: [{ str: newName }]
            });
        } else {
            api.setTargetedPlayerSettingForEveryone(id, "nameTagInfo", {
                content: []
            });
        }
    }
}

function getMobDbObject(mobId) {
    let raw = api.getMobSetting(mobId, "metaInfo");
    let value;
    try {
        value = JSON.parse(raw);
        return value;
    } catch { return null; }
}

function setToMobDbObject(mobId, value) {
    let safeValue = JSON.stringify(value);
    api.setMobSetting(mobId, "metaInfo", value);
}

function shootLaser(fromPos, dir, myId, excludeFromDamage = [], maxWithoutHits = laserConfig.maxWithoutHits, maxHits = laserConfig.maxHits) {
    let previouslyImpactedEntities = [];
    let [fx, fy, fz] = fromPos;
    let [x, y, z] = fromPos;
    let [dx, dy, dz] = dir;
    let prevNewBlockPos;
    let hits = 0;
    for (let n = 0; n <= maxWithoutHits; n++) {
        if (!myId || !api.checkValid(myId)) { return; }
        let increment = [dx * n, dy * n, dz * n];
        let newPos = [x + increment[0] - 0.5, y + increment[1] + 0.5, z + increment[2] - 0.5];
        let [nx, ny, nz] = newPos;

        let newBlockPos = [Math.round(newPos[0]), Math.round(newPos[1]), Math.round(newPos[2])];
        let [nbx, nby, nbz] = newBlockPos;
        let blockName = api.getBlock(newBlockPos);
        let isSolid = api.getBlockSolidity(newBlockPos);

        let beamRadius = 0.05;
        api.playParticleEffect({
            dir1: [dx / 2, dy / 2, dz / 2],
            dir2: [dx * 2, dy * 2, dz * 2],
            pos1: [nx - beamRadius, ny - beamRadius, nz - beamRadius],
            pos2: [nx + beamRadius, ny + beamRadius, nz + beamRadius],
            texture: "glint",
            minLifeTime: 0.2,
            maxLifeTime: 0.4,
            minEmitPower: 2,
            maxEmitPower: 3,
            minSize: 0.15,
            maxSize: 0.2,
            manualEmitCount: 10,
            gravity: [0, 0, 0],
            colorGradients: [
                {
                    timeFraction: 0,
                    minColor: [255, 0, 0, 1],
                    maxColor: [255, 0, 0, 1],
                },
                {
                    timeFraction: 1,
                    minColor: [200, 0, 0, 0],
                    maxColor: [200, 0, 0, 0],
                },
            ],
            velocityGradients: [
                {
                    timeFraction: 0,
                    factor: 1,
                    factor2: 1,
                },
            ],
            blendMode: 1,
        });

        let impactRange = laserConfig.laserDestroyRadius;
        let pos1 = [nbx - impactRange, nby - impactRange, nbz - impactRange];
        let pos2 = [nbx + impactRange, nby + impactRange, nbz + impactRange];

        let impactedEntities = api.getEntitiesInRect(pos1, pos2);
        for (let e of impactedEntities) {
            if (previouslyImpactedEntities.includes(e)) { continue; }

            try {
                if (e && api.checkValid(e) && api.getHealth(e) && e !== myId && !excludeFromDamage.includes(e)) {
                    api.applyHealthChange(e, -laserConfig.damageAmount, { lifeformId: myId, withItem: "Pig Spawn Orb" });
                }
            } catch { }

            previouslyImpactedEntities.push(e);
        }

        if (blockName === "Unloaded") { return false; }

        if (isSolid) {
            if (hits >= maxHits) {
                return {
                    pos: fromPos,
                    blockName: blockName,
                };
            } else {
                api.setBlockRect(pos1, pos2, "Air");

                hits++;
            }
        }
    }
    return false;
}