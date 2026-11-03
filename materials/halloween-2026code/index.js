deleteAll();

globalThis.style = {
        sidebarBody: { color: "#cef3ff", fontSize: "1.2rem", fontWeight: "600" },
        crosshairTextBody: { color: "#cef3ff", fontWeight: "600" },
        crosshairTextBinding: { color: "#cef3ff", fontWeight: "600", fontSize: "1rem" },
    };
function showFullSidebar(myId) {
    sidebarToggles[myId] = true;
    api.setClientOptions(myId, {
        RightInfoText: {
            content: [
                { icon: "Jack o'Lantern", style: { fontSize: "2.4rem" } },
                { str: "Happy Halloween!", style: { color: "#e3830e", fontSize: "2rem", fontWeight: "800" } },

                { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

                { str: "\n\n• Ambient effects", style: style.sidebarBody },
                { str: "\n• Carve pumpkins without needing\nto craft", style: style.sidebarBody },
                { str: "\n• Wear a ", style: style.sidebarBody }, { icon: "Carved Pumpkin", style: style.sidebarBody }, { str: " on your head", style: style.sidebarBody },
                { str: "\n• Place candles, gravestones,\nand bone piles", style: style.sidebarBody },
                { str: "\n• When a player leaves, their\ncustom blocks disappear\nuntil they rejoin", style: style.sidebarBody },
                { str: "\n• Ghosts sometimes spawn when\nyou kill mobs", style: style.sidebarBody },
                { str: "\n• Craft broomsticks with a ", style: style.sidebarBody }, { icon: "Potion Table", style: style.sidebarBody },
                { str: "\n• /toggleSidebar to minimize", style: style.sidebarBody },
                { str: "\n• /kit while in creative to\nget the custom items", style: style.sidebarBody },
            ],
            showBackground: false,
        },
    });
}

function showMinimizedSidebar(myId) {
    sidebarToggles[myId] = false;
    api.setClientOptions(myId, {
        RightInfoText: {
            content: [
                { icon: "Jack o'Lantern", style: { fontSize: "2.4rem" } },
                { str: "Happy Halloween!", style: { color: "#e3830e", fontSize: "2rem", fontWeight: "800" } },

                { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

                { str: "\n\n• Enjoy a bunch of custom\nhalloween goodies!", style: style.sidebarBody },
                { str: "\n• /toggleSidebar to expand", style: style.sidebarBody },
                { str: "\n• /help for more commands", style: style.sidebarBody },
            ],
            showBackground: false,
        },
    });
}

globalThis.sidebarToggles = {};
playerCommand = (myId, cmd) => {
    if (cmd === "help") {
        api.sendMessage(myId, [{ str: `Additionally, you can use the commands /toggleSidebar and /kit.`, style: { color: "#c3f3ff" } }]);
    } else if (cmd === "toggleSidebar") {
        if (sidebarToggles[myId]) {
            showMinimizedSidebar(myId);
            api.sendMessage(myId, [{ str: `Sidebar minimized.`, style: { color: "#c3f3ff" } }]);
            sidebarToggles[myId] = false;
        } else {
            showFullSidebar(myId);
            api.sendMessage(myId, [{ str: `Sidebar shown.`, style: { color: "#c3f3ff" } }]);
            sidebarToggles[myId] = true;
        }
        return true;
    } else if (cmd === "kit") {
        if (api.getPlayerGamemode(myId) === "creative") {
            api.setItemSlot(myId, 0, "Bone", 999);
            api.setItemSlot(myId, 1, "Tarpon", 999);
            api.setItemSlot(myId, 2, "Coal", 999);
            api.setItemSlot(myId, 3, "Ghost Chest", 999);
            api.setItemSlot(myId, 4, "Stick", 1, {
                customDisplayName: "Broomstick",
                customDescription: "Right-click to fly! Click while mounted to boost yourself in the direction you face. Crouch while mounted to dismount.",
                customAttributes: {
                    isBroom: true,
                }
            });
            api.setItemSlot(myId, 5, "Pumpkin", 999);
            api.setItemSlot(myId, 6, "Carved Pumpkin", 999);
            api.setItemSlot(myId, 7, "Shears", 1);
            api.setItemSlot(myId, 8, "Draugr Zombie Spawn Orb", 999);
            api.setItemSlot(myId, 9, "Minigun", 1);

            api.sendMessage(myId, [{ str: `Kitted!`, style: { color: "#c3f3ff" } }]);
        } else {
            api.sendMessage(myId, [{ str: `/kit only works in creative mode.`, style: { color: "#c3f3ff" } }]);
        }
        return true;
    }
};

onPlayerChangeBlock = (myId, x, y, z, from, to, dropped, fromInfo, toInfo) => {
    let myPos = api.getPosition(myId);
    let blockPos = [x, y, z];
    let targetInfo = api.getPlayerTargetInfo(myId) ?? {};
    let tpos = targetInfo.position;
    let tnormal = targetInfo.normal;
    let tadjacent = targetInfo.adjacent;
    let dir = getBlockPlaceDir(myPos, blockPos);

    if (to === "Air") {
        let data = api.getBlockData(...blockPos)?.persisted?.shared;
        if (data) {
            let { type, ownerId, id } = data;
            if (ownerId && api.checkValid(ownerId)) {
                let dbLists = {
                    gravestone: "gravestones",
                    candles: "candles",
                    bonePile: "bonePiles"
                };
                let dropNames = {
                    gravestone: "Ghost Chest",
                    candles: "Tarpon",
                    bonePile: "Bone"
                };
                let ownerMeshes = getPlayerDbList(ownerId, dbLists[type]);

                let hasUpdated = false;
                for (let meshNum = ownerMeshes.length - 1; meshNum >= 0; meshNum--) {
                    let mesh = ownerMeshes[meshNum];
                    let thisMeshId = mesh.id;
                    if (thisMeshId === id) {
                        let { amt } = mesh;

                        if (!amt || amt === 1) {
                            ownerMeshes.splice(meshNum, 1);
                        } else {
                            ownerMeshes[meshNum].amt--;
                        }

                        if (api.getPlayerGamemode(myId) !== "creative") {
                            let [dropX, dropY, dropZ] = blockPos;
                            dropX += 0.5; dropY += 0.5; dropZ += 0.5;
                            api.createItemDrop(dropX, dropY, dropZ, dropNames[type], 1);
                        }

                        setPlayerDbList(ownerId, dbLists[type], ownerMeshes);
                        renderCustomMeshPerPlayer();
                    }
                }
            }
        }
    }

    else if (to === "Ghost Chest") {
        let gravestones = getPlayerDbList(myId, "gravestones");
        if (gravestones.length >= 20) {
            api.sendMessage(myId, [{ str: `You've placed too many gravestones. Break some to place more!`, style: { color: "#ff9d87" } }]);
            return "preventChange";
        }

        if (api.getPlayerGamemode(myId) !== "creative") {
            api.removeItemName(myId, "Ghost Chest", 1);
        }

        pushToPlayerDbList(myId, "gravestones", {
            dir: dir,
            pos: [x, y, z],
            id: getCurrentCustomMeshId()
        });
        incrementCurrentCustomMeshId();
        renderCustomMeshPerPlayer();

        return "preventChange";
    }
};

function createCandles(pos, num, lit) {
    let [x, y, z] = pos;
    x += 0.5; z += 0.5;

    if (num === 1) {
        newCandle([x, y, z]);
    } else if (num === 2) {
        newCandle([x + 0.2, y, z + 0.2]);
        newCandle([x - 0.2, y, z - 0.2]);
    } else if (num === 3) {
        newCandle([x, y, z - 0.2]);
        newCandle([x - 0.2, y, z + 0.2]);
        newCandle([x + 0.2, y, z + 0.2]);
    }

    function newCandle(pos) {
        let [x, y, z] = pos;
        let parts = [{
            type: "BloxdBlock",
            opts: {
                size: [0.01, 0.5, 0.01],
                blockName: "White Wool"
            },
            onCreate: (candleString) => {
                api.setPosition(candleString, x, y, z);
            }
        }];

        if (lit) {
            parts.push({
                type: "ParticleEmitter",
                opts: {
                    texture: "glint",

                    width: 0.1,
                    height: 0.1,
                    depth: 0.1,

                    emitRate: 8,
                    minLifeTime: 1.5,
                    maxLifeTime: 2,

                    minEmitPower: 1,
                    maxEmitPower: 1.2,

                    minSize: 0.05,
                    maxSize: 0.08,

                    gravity: [0, 0.25, 0],

                    dir1: [-0.5, 0, -0.5],
                    dir2: [0.5, 0, 0.5],

                    blendMode: 1,

                    colorGradients: [
                        {
                            timeFraction: 0,
                            minColor: [224, 71, 20, 1],
                            maxColor: [224, 71, 20, 1],
                        },
                        {
                            timeFraction: 0.5,
                            minColor: [240, 111, 31, 0.8],
                            maxColor: [240, 111, 31, 0.8],
                        },
                        {
                            timeFraction: 1,
                            minColor: [247, 190, 17, 0],
                            maxColor: [247, 190, 17, 0],
                        },
                    ],
                    velocityGradients: [
                    ],
                },
                srcOffset: [0, 0.5, 0],
                onCreate: (flame) => {

                }
            });
        }

        createMeshSystem(parts, {
            type: "BloxdBlock",
            opts: {
                size: [0.15, 0.45, 0.15],
                blockName: "Bone Block"
            },
            onCreate: (candleBody) => {
                api.setPosition(candleBody, x, y, z);
            }
        });
    }
};

onPlayerClick = (myId, rc) => {
    let targetInfo = api.getPlayerTargetInfo(myId) ?? {};
    let tpos = targetInfo.position;
    let tnormal = targetInfo.normal;
    let tadjacent = targetInfo.adjacent;

    let held = api.getHeldItem(myId) ?? {};
    let slotNum = api.getSelectedInventorySlotI(myId);

    if (tpos) {
        let targetedData = api.getBlockData(...tpos)?.persisted?.shared;
        if (targetedData) {
            let { type, ownerId, id } = targetedData;
            if (ownerId && api.checkValid(ownerId)) {
                let dbLists = {
                    gravestone: "gravestones",
                    candles: "candles",
                    bonePile: "bonePiles"
                };
                let dropNames = {
                    gravestone: "Ghost Chest",
                    candles: "Tarpon",
                    bonePile: "Bone"
                };
                let ownerMeshes = getPlayerDbList(ownerId, dbLists[type]);

                let didUpdate = false;
                for (let meshNum = ownerMeshes.length - 1; meshNum >= 0; meshNum--) {
                    let mesh = ownerMeshes[meshNum];
                    let thisMeshId = mesh.id;
                    if (thisMeshId === id) {
                        if (type === "candles") {
                            let { lit, amt } = mesh;

                            if (held.name === "Tarpon" && amt < 3) {
                                mesh.amt++;
                                if (api.getPlayerGamemode(myId) !== "creative") {
                                    api.removeItemName(myId, "Tarpon", 1);
                                }
                                didUpdate = true;
                            }

                            if (held.name === "Coal" && !lit) {
                                mesh.lit = true;
                                if (api.getPlayerGamemode(myId) !== "creative") {
                                    api.removeItemName(myId, "Coal", 1);
                                }
                                didUpdate = true;
                            }
                            if (!held.name && lit) {
                                mesh.lit = false;
                                if (api.getPlayerGamemode(myId) !== "creative") {
                                    let [dropX, dropY, dropZ] = tpos;
                                    dropX += 0.5; dropY += 0.5; dropZ += 0.5;
                                    api.createItemDrop(dropX, dropY, dropZ, "Coal");
                                }
                                didUpdate = true;
                            }
                        } else if (type === "bonePile") {
                            let { amt } = mesh;

                            if (held.name === "Bone" && amt < 3) {
                                mesh.amt++;
                                if (api.getPlayerGamemode(myId) !== "creative") {
                                    api.removeItemName(myId, "Bone", 1);
                                }
                                didUpdate = true;
                            }
                        }
                    }
                }

                if (didUpdate) {
                    setPlayerDbList(ownerId, dbLists[type], ownerMeshes);
                    renderCustomMeshPerPlayer();
                    return;
                }
            }
        }
    }


    if (held.name === "Stick" && held.attributes?.customAttributes?.isBroom) {
        if (isRidingBroomstick[myId]) {
            let dir = api.getPlayerFacingInfo(myId).dir;
            let [dx, dy, dz] = dir;

            api.removeEffect(myId, "Air Walk");
            api.applyImpulse(myId, dx * 80, Math.max(dy * 80, -50), dz * 80);
        }
        if (rc) {
            if (api.isPlayerCrouching(myId)) {
                api.sendMessage(myId, [{ str: "You can't be crouching while you mount the broom, because crouching dismounts.", style: { color: "#cef3ff" } }]);
            } else {
                if (!isRidingBroomstick[myId]) {
                    isRidingBroomstick[myId] = true;
                    api.sendMessage(myId, [{ str: "You're ready! Click while holding the broom to launch yourself forward.", style: { color: "#cef3ff" } }]);
                    let broomPartsCreated = createMeshSystem([
                        {
                            type: "BloxdBlock",
                            opts: {
                                size: 0.4,
                                blockName: "Wheat"
                            },
                            onCreate: (broomBrush) => {
                                api.setEntityRotation(broomBrush, 0, Math.PI / 2, Math.PI / 4);
                            },
                            name: "dontdelete",
                            srcOffset: [0, 0.05, -0.8],
                        }
                    ], {
                        type: "BloxdBlock",
                        opts: {
                            size: 0.5,
                            blockName: "Stick"
                        },
                        onCreate: (broomHandle) => {
                            api.setEntityRotation(broomHandle, Math.PI, Math.PI / 2, Math.PI / 4);
                            api.addFollowingEntityToPlayer(myId, broomHandle, [0, 1.3, -0.1], false);
                        },
                        name: "dontdelete",
                    });
                    ridingBroomIds[myId] = broomPartsCreated;
                    api.setClientOptions(myId, {
                        gravityMultiplier: 0,
                        customButtons: [
                            {
                                icon: "Jump Boost",
                                id: "flyUp",
                                keycode: "KeyJ",
                            }
                        ]
                    });
                    api.applyEffect(myId, "NOMILK_broomRiding", null, { icon: "Stick", displayName: "Broom Riding" });
                    api.setPlayerPose(myId, "sitting", [0, 1, 0]);
                }
            }
        }
    }

    if (rc) {
        if (held.name === "Tarpon" && tadjacent) {
            let candles = getPlayerDbList(myId, "candles");
            if (candles.length >= 20) {
                api.sendMessage(myId, [{ str: `You've placed too many candles. Break some to place more!`, style: { color: "#ff9d87" } }]);
                return;
            }

            let [ax, ay, az] = tadjacent;

            if (api.getPlayerGamemode(myId) !== "creative") {
                api.removeItemName(myId, "Tarpon", 1);
            }

            pushToPlayerDbList(myId, "candles", {
                lit: false,
                amt: 1,
                pos: [ax, ay, az],
                id: getCurrentCustomMeshId()
            });
            incrementCurrentCustomMeshId();
            renderCustomMeshPerPlayer();
        }
        if (held.name === "Bone" && tadjacent) {
            let bones = getPlayerDbList(myId, "bonePiles");
            if (bones.length >= 20) {
                api.sendMessage(myId, [{ str: `You've placed too many bones. Break some to place more!`, style: { color: "#ff9d87" } }]);
                return;
            }

            let [ax, ay, az] = tadjacent;

            if (api.getPlayerGamemode(myId) !== "creative") {
                api.removeItemName(myId, "Bone", 1);
            }

            pushToPlayerDbList(myId, "bonePiles", {
                amt: 1,
                pos: [ax, ay, az],
                id: getCurrentCustomMeshId()
            });
            incrementCurrentCustomMeshId();
            renderCustomMeshPerPlayer();
        }
        if ((held.name === "Carved Pumpkin" || held.name === "Jack o'Lantern" || held.name === "Pumpkin") && !tpos) {
            if (!api.getPlayerDbValue(myId, "equippedPumpkin")) {
                equipPumpkinHead(myId, held.name);
                api.removeItemName(myId, held.name, 1);
            }
        }
        if (!held.name) {
            if (api.getPlayerDbValue(myId, "equippedPumpkin")) {
                removePumpkinHead(myId);
                api.giveItem(myId, api.getPlayerDbValue(myId, "headBlockName"), 1);
            }
        }

        if (tpos && !api.isPlayerCrouching(myId)) {
            let tblock = api.getBlock(tpos);
            if (held.name === "Shears" && tblock === "Pumpkin" && tnormal && tadjacent) {
                let rot = getRotWhenFacingBlock(tnormal);

                if (rot) {
                    api.setBlock(tpos, `Carved Pumpkin|meta|rot${rot}`);
                } else {
                    api.setBlock(tpos, "Carved Pumpkin");
                }

                let [dropX, dropY, dropZ] = tadjacent;
                dropX += 0.5; dropY += 0.5; dropZ += 0.5;
                api.createItemDrop(dropX, dropY, dropZ, "Orange Paintball", 1, true, {
                    customAttributes: { isPumpkinGuts: true },
                    customDescription: "Right-click on a Carved Pumpkin to fill it in!",
                    customDisplayName: "Pumpkin Guts"
                });
            }
            if (held.name === "Coal" && tblock.includes("Carved Pumpkin")) {
                let prevMetaInfo = api.getMetaInfo(tblock);
                let { rot } = prevMetaInfo;
                if (rot) {
                    api.setBlock(tpos, `Jack o'Lantern|meta|rot${rot}`);
                } else {
                    api.setBlock(tpos, `Jack o'Lantern`);
                }
                api.removeItemName(myId, "Coal", 1);
            }

            if (held.attributes?.customAttributes?.isPumpkinGuts && held.name === "Orange Paintball" && tblock.includes("Carved Pumpkin") && tpos) {
                api.setBlock(tpos, "Pumpkin");
                api.removeItemName(myId, "Orange Paintball", 1);
            }

            if (!held.name && tblock.includes("Jack o'Lantern") && tadjacent) {
                let prevMetaInfo = api.getMetaInfo(tblock);
                let { rot } = prevMetaInfo;
                if (rot) {
                    api.setBlock(tpos, `Carved Pumpkin|meta|rot${rot}`);
                } else {
                    api.setBlock(tpos, `Carved Pumpkin`);
                }

                let [dropX, dropY, dropZ] = tadjacent;
                dropX += 0.5; dropY += 0.5; dropZ += 0.5;
                api.createItemDrop(dropX, dropY, dropZ, "Coal");
            }
        }
    }
};

onPlayerPressedButton = (myId, buttonId) => {
    if (buttonId === "flyUp") {
        api.applyImpulse(myId, 0, 20, 0);
    }
};

globalThis.savedBoneNum = {};
globalThis.savedCandleNum = {};
globalThis.savedGravestoneNum = {};
globalThis.savedMyIdNum = 0;

globalThis.needsToRenderCustomMesh = false;

function clearDynamicBlocks() {
    for (let pos of dynamicBlockPositions) {
        api.setBlock(pos, "Air");
    }; dynamicBlockPositions = [];
}

function renderCustomMeshPerPlayer(skipDeletion) {
    needsToRenderCustomMesh = true;
    if (!skipDeletion) {
        for (let e of api.getEntitiesInRect([10000, 10000, 10000], [-10000, -10000, -10000])) {
            if (e && api.checkValid(e)) {
                try {
                    let name = api.getEntityName(e);
                    let type = api.getEntityType(e);
                    if (type === "Mesh") {
                        if (!name.includes("dontdelete") && !name.includes("hitbox")) {
                            api.deleteMeshEntity(e);
                        }
                    }
                } catch { }
            }
        }

        clearDynamicBlocks();
    }

    for (let myIdNum = savedMyIdNum ?? 0; myIdNum <= api.getPlayerIds().length - 1; myIdNum++) {
        let myId = api.getPlayerIds()[myIdNum];
        sessionData[myId] = {};
        savedMyIdNum = myIdNum;

        let username = api.getEntityName(myId);

        let candles = getPlayerDbList(myId, "candles");
        let gravestones = getPlayerDbList(myId, "gravestones");
        let bonePiles = getPlayerDbList(myId, "bonePiles");


        for (let boneNum = savedBoneNum[myId] ?? 0; boneNum <= bonePiles.length - 1; boneNum++) {
            let bone = bonePiles[boneNum];
            let { pos, amt, id } = bone;
            let [x, y, z] = pos;

            savedBoneNum[myId] = boneNum;
            if (!api.isBlockInLoadedChunk(...pos)) { return; }

            createBonePile(pos, amt);
            api.setBlock(pos, "Invisible Solid");
            api.setBlockData(...pos, {
                persisted: {
                    shared: {
                        type: "bonePile",
                        ownerId: myId,
                        id: id,
                    }
                }
            });
            dynamicBlockPositions.push(pos);
        }

        for (let candleNum = savedCandleNum[myId] ?? 0; candleNum <= candles.length - 1; candleNum++) {
            let candle = candles[candleNum];
            let { pos, amt, lit, id } = candle;
            let [x, y, z] = pos;

            savedCandleNum[myId] = candleNum;
            if (!api.isBlockInLoadedChunk(...pos)) { return; }

            createCandles(pos, amt, lit);
            if (lit) {
                api.setBlock(pos, "Invisible Orange Light");
            } else {
                api.setBlock(pos, "Invisible Solid");
            }
            api.setBlockData(...pos, {
                persisted: {
                    shared: {
                        type: "candles",
                        ownerId: myId,
                        id: id,
                    }
                }
            });
            dynamicBlockPositions.push(pos);
        }

        for (let gravestoneNum = savedGravestoneNum[myId] ?? 0; gravestoneNum <= gravestones.length - 1; gravestoneNum++) {
            let gravestone = gravestones[gravestoneNum];
            let { id, pos, dir } = gravestone;
            let [x, y, z] = pos;

            savedGravestoneNum[myId] = gravestoneNum;
            if (!api.isBlockInLoadedChunk(...pos)) { return; }

            createGravestone(pos, dir);
            api.setBlock(pos, "Invisible Solid");
            dynamicBlockPositions.push(pos);
            api.setBlockData(...pos, {
                persisted: {
                    shared: {
                        type: "gravestone",
                        ownerId: myId,
                        id: id,
                    }
                }
            });
        }

        savedBoneNum[myId] = 0;
        savedCandleNum[myId] = 0;
        savedGravestoneNum[myId] = 0;
    }
    savedMyIdNum = 0;
    needsToRenderCustomMesh = false;
}

function getCurrentCustomMeshId() {
    let meshesCreated = api.getLobbyDbValue("meshesCreated") ?? 0;
    return meshesCreated + 1;
}
function incrementCurrentCustomMeshId() {
    let meshesCreated = api.getLobbyDbValue("meshesCreated") ?? 0;
    api.setLobbyDbValue("meshesCreated", meshesCreated + 1);
}

globalThis.dynamicBlockPositions = [];
globalThis.ghosts = [];

onPlayerKilledMob = (killerId, mobId, dmg, withItem) => {
    let pos = api.getPosition(mobId);
    let spawnGhost = random(1, 10) === 1; // make the range shorter to increase spawn chances of ghosts
    if (spawnGhost) {
        createGhost(pos);
        return "preventDrop";
    }
};

tick = (ms) => {
    tNum = (tNum + 1) % 8;

    if (needsToRenderCustomMesh) { renderCustomMeshPerPlayer(true); }

    if (tNum === 0) {

    }

    if (ghosts.length > 0) {
        for (let ghostNum = ghosts.length - 1; ghostNum >= 0; ghostNum--) {
            let ghost = ghosts[ghostNum];
            let { parts, spawnedAt } = ghost;

            if (spawnedAt + 60000 <= api.now()) { // Change `60000` to something else to configure ghost despawns. Larger number = longer until despawn.
                for (let part of parts) {
                    if (part && api.checkValid(part)) { api.deleteEntity(part); }
                }
                ghosts.splice(ghostNum, 1);
            }
        }
    }

    for (let myId of api.getPlayerIds()) {
        api.setClientOption(myId, "music", "spooky");

        if (isRidingBroomstick[myId]) {
            if (api.isPlayerCrouching(myId)) {
                api.setPlayerPose(myId, "standing", [0, 0, 0]);
                api.setClientOptions(myId, {
                    gravityMultiplier: 1,
                    customButtons: []
                });
                api.sendMessage(myId, [{ str: "Broom dismounted by crouching.", style: { color: "#cef3ff" } }]);
                api.removeEffect(myId, "NOMILK_broomRiding");

                for (let id of ridingBroomIds[myId]) {
                    if (id && api.checkValid(id)) {
                        api.deleteMeshEntity(id);
                    }
                }; delete ridingBroomIds[myId];

                isRidingBroomstick[myId] = false;
            } else {
                let blocksStanding = api.getBlockTypesPlayerStandingOn(myId);
                let [vx, vy, vz] = api.getVelocity(myId);

                if (blocksStanding.length > 0) {
                    api.applyImpulse(myId, 0, 10, 0);
                }
            }
        }

    }
};

function createMeshSystem(meshes, sourceMeshConfig) {
    let created = [];
    let srcMesh = null;
    if (sourceMeshConfig) {
        let { opts, type, name, onCreate, sourceOffset } = sourceMeshConfig;
        let meshId = api.attemptCreateMeshEntity(type, opts, name ?? "");
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

onPlayerJoin = (myId, fromReset) => {
    if (api.getPlayerDbValue(myId, "equippedPumpkin")) { equipPumpkinHead(myId, api.getPlayerDbValue(myId, "headBlockName")) }

    api.editItemCraftingRecipes(myId, "Tarpon", [
        {
            requires: [
                { items: ["White Wool"], amt: 1 },
                { items: ["Bone Block"], amt: 1 },
            ],
            produces: 1,
            station: "Workbench",
            isStarterRecipe: true,
        },
    ]);

    api.editItemCraftingRecipes(myId, "Ghost Chest", [
        {
            requires: [
                { items: ["Stone Slab", "Andesite Slab", "Diorite Slab", "Granite Slab"], amt: 2 },
            ],
            produces: 1,
            station: "Workbench",
            isStarterRecipe: true,
        },
    ]);

    api.editItemCraftingRecipes(myId, "Stick", [
        {
            requires: [
                { items: ["Stick"], amt: 1 },
                { items: ["Wheat"], amt: 1 },
                { items: ["Moonstone"], amt: 1 },
            ],
            produces: 1,
            onCraftedAura: 50,
            station: "Potion Table",
            isStarterRecipe: true,
            attributes: {
                customDisplayName: "Broomstick",
                customDescription: "Right-click to fly! Click while mounted to boost yourself in the direction you face. Crouch while mounted to dismount.",
                customAttributes: {
                    isBroom: true,
                }
            }
        },
        {
            requires: [
                { items: allWoodPlanks, amt: 1 },
            ],
            produces: 2,
            station: "Workbench",
        }
    ]);

    api.setWalkThroughType(myId, "Invisible Solid");

    api.setItemStat(myId, "Invisible Solid", "ttb", 250);
    api.setItemStat(myId, "Invisible Solid", "CrosshairText", []);

    api.setItemStat(myId, "Invisible Orange Light", "ttb", 250);
    api.setItemStat(myId, "Invisible Orange Light", "CrosshairText", []);

    api.setItemStat(myId, "Bone", "description", "Right-click on the ground to make a bone pile.");
    api.setItemStat(myId, "Tarpon", "displayName", "Candle");
    api.setItemStat(myId, "Tarpon", "description", "Right-click on the ground to make a candle pile. Click on a candle pile with coal to light it. Click again to snuff it out.");
    api.setItemStat(myId, "Ghost Chest", "displayName", "Gravestone");
    api.setItemStat(myId, "Ghost Chest", "description", "Right-click on the ground to place a gravestone.");

    api.setItemStat(myId, "Pumpkin", "CrosshairText", [{ str: `Press `, style: style.crosshairTextBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.crosshairTextBinding }, { str: ` while holding `, style: style.crosshairTextBody }, { icon: "Shears" }, { str: ` to carve`, style: style.crosshairTextBody }]);
    api.setItemStat(myId, "Carved Pumpkin", "CrosshairText", [
        { str: `Press `, style: style.crosshairTextBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.crosshairTextBinding }, { str: ` while holding `, style: style.crosshairTextBody }, { icon: "Coal" }, { str: ` to light`, style: style.crosshairTextBody },
        { str: `\nPress `, style: style.crosshairTextBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.crosshairTextBinding }, { str: ` while holding `, style: style.crosshairTextBody }, { icon: "Orange Paintball" }, { str: ` to fill`, style: style.crosshairTextBody }
    ]);
    api.setItemStat(myId, "Jack o'Lantern", "CrosshairText", [{ str: `Press `, style: style.crosshairTextBody }, { type: "StyledKeyBinding", action: "alt-fire", style: style.crosshairTextBinding }, { str: ` while holding nothing to take `, style: style.crosshairTextBody }, { icon: "Coal" }]);

    showMinimizedSidebar(myId);
    api.setClientOptions(myId, {
        skyLightColourOverride: "#ffe9d9",
        skyBox: "space_white"
    });

    let leaves = api.attemptCreateMeshEntity("ParticleEmitter", {
        texture: "generic_2",

        width: 150,
        height: 30,
        depth: 150,

        emitRate: 250,
        minLifeTime: 5,
        maxLifeTime: 5,

        minEmitPower: 1,
        maxEmitPower: 1.2,

        minSize: 0.5,
        maxSize: 0.8,

        gravity: [0, -3, 0],

        dir1: [-0.01, 0, -0.01],
        dir2: [0.01, 0, 0.01],

        blendMode: 1,

        colorGradients: [
            {
                timeFraction: 0,
                minColor: [232, 118, 30, 1],
                maxColor: [232, 118, 30, 1],
            },
            {
                timeFraction: 0.8,
                minColor: [245, 144, 66, 0],
                maxColor: [245, 144, 66, 0],
            },
        ],
        velocityGradients: [
        ],
    }, "dontdelete");
    cleanName(leaves);

    api.addFollowingEntityToPlayer(myId, leaves, [0, 0, 0], true);

    renderCustomMeshPerPlayer();
    giveHitBox(myId);
};

api.setMaxPlayers(10, 10); // Careful! Increasing this number can break things. If it's higher, more total meshes can be attempted to be placed, but Bloxd might not like that :(

globalThis.isRidingBroomstick = {};
globalThis.ridingBroomIds = {};

globalThis.allWoodPlanks = ["Pine Wood Planks", "Plum Wood Planks", "Palm Wood Planks", "Pear Wood Planks", "Maple Wood Planks", "Cedar Wood Planks", "Aspen Wood Planks", "Mango Wood Planks", "Jungle Wood Planks", "Cherry Wood Planks", "Spectral Wood Planks"];

function equipPumpkinHead(myId, blockName) {
    api.setPlayerDbValue(myId, "equippedPumpkin", 1);
    api.setPlayerDbValue(myId, "headBlockName", blockName);
    api.updateEntityNodeMeshAttachment(myId, "HeadMesh", "BloxdBlock", {
        size: 0.6,
        blockName: blockName,
    }, [0, 0.28, 0]);

    api.sendMessage(myId, [{ str: `Right-click without holding anything to remove your pumpkin head.`, style: { color: "#cef3ff" } }]);
}

function removePumpkinHead(myId) {
    api.setPlayerDbValue(myId, "equippedPumpkin", 0);
    api.updateEntityNodeMeshAttachment(myId, "HeadMesh", null);

    api.sendMessage(myId, [{ str: `Pumpkin head removed.`, style: { color: "#cef3ff" } }]);
}

onPlayerLeave = (myId, serverIsShuttingDown) => {
    if (hitboxes[myId] && api.checkValid(hitboxes[myId])) {
        api.deleteMeshEntity(hitboxes[myId]);
        delete hitboxes[myId];
    }

    renderCustomMeshPerPlayer();
    if (api.getNumPlayers() <= 1) { clearDynamicBlocks(); }
};

onEntityCollision = (ent1, ent2) => {
    let playerColliding;
    let isPlayer = true;
    for (let myId in hitboxes) {
        let hitboxId = hitboxes[myId];

        if (ent1 === hitboxId || ent2 === hitboxId) {
            playerColliding = myId; break;
        }
    }
    if (api.getEntityType(ent1) !== "Player" && api.getEntityType(ent1) !== "Mesh") { playerColliding = ent1; isPlayer = false; }
    if (api.getEntityType(ent2) !== "Player" && api.getEntityType(ent2) !== "Mesh") { playerColliding = ent2; isPlayer = false; }

    if (playerColliding && api.checkValid(playerColliding)) {

    };
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

function getDirection(pos1, pos2) {
    let [x1, y1, z1] = pos1;
    let [x2, y2, z2] = pos2;

    let diffX = x1 - x2;
    let diffY = y1 - y2;
    let diffZ = z1 - z2;

    let absX = Math.abs(diffX);
    let absY = Math.abs(diffY) * 1.25;
    let absZ = Math.abs(diffZ);
    let dir;

    if (diffY !== 0 && absY >= absX && absY >= absZ) {
        dir = diffY > 0 ? "top" : "bottom";
    } else if (diffX !== 0 && absX >= absZ) {
        dir = diffX > 0 ? "front" : "back";
    } else if (diffZ !== 0) {
        dir = diffZ > 0 ? "right" : "left";
    } else if (diffY !== 0) {
        dir = diffY > 0 ? "top" : "bottom";
    }
    return dir;
}

function deleteAll() {
    for (let e of api.getEntitiesInRect([-100000, -100000, -100000], [100000, 100000, 100000])) { try { api.deleteEntity(e); } catch { } }
};

globalThis.tNum = 0;
globalThis.hitboxes = {};
globalThis.sessionData = {
    "world": {}
};

function giveHitBox(myId) {
    if (hitboxes[myId] && api.checkValid(hitboxes[myId])) {
        api.deleteMeshEntity(hitboxes[myId]);
        delete hitboxes[myId];
    }

    let hitbox = api.attemptCreateMeshEntity(
        "Box",
        { width: 1, height: 2, depth: 1, diffuseColor: [0, 255, 0] },
        "hitbox",
        {
            doPhysics: true,
            collidesEntities: true,
            collideBits: 1,
            collideMask: 1,
        },
    );
    api.setTargetedPlayerSettingForEveryone(hitbox, "nameTagInfo", { content: [{ str: `` }] });
    api.setTargetedPlayerSettingForEveryone(hitbox, "canSee", false);

    api.addFollowingEntityToPlayer(myId, hitbox, [0, 0, 0], true);
    hitboxes[myId] = hitbox;
}

function getRotWhenFacingBlock(normal) {
    let [tx, ty, tz] = normal;

    let rot = 0;
    if (tx === 1) {
        rot = 2;
    } else if (tx === -1) {
        rot = 4;
    } else if (ty === 1) {
        rot = 0;
    } else if (ty === -1) {
        rot = 0;
    } else if (tz === 1) {
        rot = 0;
    } else if (tz === -1) {
        rot = 3;
    }

    return rot;
}

function getBlockPlaceDir(pos1, pos2) {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];

    if (Math.abs(dx) > Math.abs(dz)) {
        return dx > 0 ? "right" : "left";
    }

    return dz > 0 ? "back" : "front";
}

function cleanName(id) {
    let name = api.getEntityName(id);
    if (name) {
        let newName = name.replaceAll("dontdelete", "");
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

function createGhost(pos) {
    let [x, y, z] = pos;
    let srcMesh = null;

    let ghostMeshParts = createMeshSystem([
        {
            type: "ParticleEmitter",
            opts: {
                texture: "soul_0",

                width: 1,
                height: 1,
                depth: 1,

                emitRate: 5,
                minLifeTime: 1,
                maxLifeTime: 1,

                minEmitPower: 0,
                maxEmitPower: 0,

                minSize: 0.5,
                maxSize: 0.8,

                gravity: [0, -1, 0],

                dir1: [0, 0, 0],
                dir2: [0, 0, 0],

                blendMode: 1,

                colorGradients: [
                    {
                        timeFraction: 0,
                        minColor: [255, 255, 255, 1],
                        maxColor: [255, 255, 255, 1],
                    },
                    {
                        timeFraction: 1,
                        minColor: [255, 255, 255, 0],
                        maxColor: [255, 255, 255, 0],
                    },
                ],
                velocityGradients: [
                ],
            },
            name: "dontdelete",
            srcOffset: [0, -1, 0]
        }
    ], {
        type: "ParticleEmitter",
        opts: {
            texture: "scary_face",

            width: 0.01,
            height: 0.01,
            depth: 0.01,

            emitRate: 1,
            minLifeTime: 1.05,
            maxLifeTime: 1.05,

            minEmitPower: 0,
            maxEmitPower: 0,

            minSize: 2,
            maxSize: 2,

            gravity: [0, 0, 0],

            dir1: [0, 0, 0],
            dir2: [0, 0, 0],

            blendMode: 1,

            colorGradients: [
                {
                    timeFraction: 0,
                    minColor: [255, 255, 255, 1],
                    maxColor: [255, 255, 255, 1],
                },
            ],
            velocityGradients: [
            ],
        },
        name: "dontdelete",
        onCreate: (faceId) => {
            srcMesh = faceId;
        }
    });

    let srcMob = api.attemptSpawnMob("Pig", x, y + 1, z, { playSoundOnSpawn: false });

    if (srcMob) {
        api.setTargetedPlayerSettingForEveryone(srcMob, "canSee", false);
        api.addFollowingEntityToPlayer(srcMob, srcMesh, [0, 2, 0]);
        api.setMobSetting(srcMob, "idleSound", "zapAccent2");

        let audioEntity = api.attemptCreateAudioEntity(x, y, z, "horrorMaleDrone", 1, {
            maxHearDist: 15,
        });
        if (audioEntity) {
            api.addFollowingEntityToPlayer(srcMesh, audioEntity, [0, 0, 0]);
        }

        ghosts.push({
            parts: [...ghostMeshParts, audioEntity, srcMob],
            spawnedAt: api.now()
        });
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBonePile(pos, num) {
    let [x, y, z] = pos;
    x += 0.5; z += 0.5;

    if (num === 1) {
        newBone([x, y, z], 0.25, 0.5);
    } else if (num === 2) {
        newBone([x - 0.2, y, z - 0.1], 0.25, 0.5);
        newBone([x + 0.1, y, z + 0.2], 0.25, -2);
    } else if (num === 3) {
        newBone([x - 0.2, y, z - 0.1], 0.25, 0.5);
        newBone([x + 0.1, y, z + 0.2], 0.25, -1.5);

        createMeshSystem([
            {
                type: "BloxdBlock",
                opts: {
                    size: 0.3,
                    blockName: "Bone Block"
                },
                onCreate: (bone) => {
                    api.setPosition(bone, x - 0.3, y, z + 0.3);
                    api.setEntityRotation(bone, 0, 0.3, 0);
                }
            }
        ]);
    }

    function newBone(pos, size, rotation) {
        let [x, y, z] = pos;
        createMeshSystem([
            {
                type: "BloxdBlock",
                opts: {
                    size: size,
                    blockName: "Bone"
                },
                onCreate: (bone) => {
                    api.setPosition(bone, x, y - 0.1, z);
                    api.setEntityRotation(bone, Math.PI / 2, 0, rotation);
                }
            }
        ]);
    }
};

function createGravestone(pos, dir) {
    let [x, y, z] = pos;
    x += 0.5; z += 0.5;

    let stoneSize;
    let stoneOffset;
    let headSize;

    if (dir === "front") {
        headRot = 2;
        stoneSize = [0.7, 0.7, 0.1];
        headSize = [0.65, 0.1, 0.1];
        stoneOffset = [0, 0, 0.3];
    } else if (dir === "back") {
        headRot = 0;
        stoneSize = [0.7, 0.7, 0.1];
        headSize = [0.65, 0.1, 0.1];
        stoneOffset = [0, 0, -0.3];
    } else if (dir === "left") {
        stoneSize = [0.1, 0.7, 0.7];
        headSize = [0.1, 0.1, 0.65];
        stoneOffset = [0.3, 0, 0];
    } else if (dir === "right") {
        stoneSize = [0.1, 0.7, 0.7];
        headSize = [0.1, 0.1, 0.65];
        stoneOffset = [-0.3, 0, 0];
    }

    let [sox, soy, soz] = stoneOffset;
    let [ssx, ssy, ssz] = stoneSize;
    let [hsx, hsy, hsz] = headSize;

    createMeshSystem([
        {
            type: "BloxdBlock",
            opts: {
                size: [ssx, ssy, ssz],

                blockName: "Engraved Stone",
            },
            srcOffset: [sox, soy, soz],
        },
        {
            type: "BloxdBlock",
            opts: {
                size: [hsx, hsy, hsz],

                blockName: `Smooth Stone`,
            },
            srcOffset: [sox, 0.7, soz],
        }
    ], {
        type: "BloxdBlock",
        opts: {
            size: [1, 0.1, 1],
            blockName: "Messy Dirt"
        },
        onCreate: (dirt) => {
            api.setPosition(dirt, x, y, z);
        }
    });
};