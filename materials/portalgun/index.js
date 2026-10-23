globalThis.portalTeleportLocked = {};
globalThis.otherEntPortalCooldowns = {};
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
        let dirTpOffsets = {
            top: [0, -1.5, 0],
            front: [-0.5, 0, 0],
            back: [0.5, 0, 0],
            left: [0, 0, 0.5],
            right: [0, 0, -0.5]
        };
        for (let ownerId in sessionPortalData) {
            let targetedPortalData = sessionPortalData[ownerId];
            let { blue, orange } = targetedPortalData;

            if (blue) {
                let { id, dir } = blue;
                let cooldown = 1500;
                if (dir === "top" || dir === "bottom") { cooldown = 2200; }

                if (
                    (ent1 === id || ent2 === id) &&
                    (
                        (
                            !portalTeleportLocked[playerColliding] &&
                            (!lastPortalTouched[playerColliding]?.at || lastPortalTouched[playerColliding].at + cooldown < api.now()) &&
                            (!portalCooldown[playerColliding] || portalCooldown[playerColliding] + 1000 < api.now()) &&
                            !api.hasEffect(playerColliding, "NOMILK_portalCooldown")
                        ) ||
                        (
                            !isPlayer &&
                            (!otherEntPortalCooldowns[id] || otherEntPortalCooldowns[id] + 500 < api.now())
                        )
                    )
                ) {
                    if (orange && api.checkValid(orange.id)) {
                        let orangeId = orange.id;
                        let orangePos = api.getPosition(orangeId);
                        let [ox, oy, oz] = orangePos;

                        let tpOffset = dirTpOffsets[orange.dir] ?? [0, 0, 0];

                        api.setPosition(playerColliding, [ox + tpOffset[0], oy + tpOffset[1], oz + tpOffset[2]]);
                        playPortalTransferParticles([ox, oy, oz], "orange");

                        if (isPlayer) {
                            portalTeleportLocked[playerColliding] = true;
                            api.sendMessage(playerColliding, [{ str: `Successfully teleported!`, style: { color: "#cef3ff" } }]);
                            api.sendFlyingMiddleMessage(playerColliding, [{ str: `Successfully teleported!`, style: { color: "#cef3ff" } }], 100, 3000);

                            lastPortalTouched[playerColliding] = { id: orangeId, at: api.now() };
                            api.applyEffect(playerColliding, "NOMILK_portalCooldown", 500, { displayName: "Portal Cooldown", icon: "Orange Portal" });
                            portalCooldown[playerColliding] = api.now();
                        }
                        return;
                    } else {
                        if (isPlayer) {
                            api.sendMessage(playerColliding, [{ str: `This portal isn't connected to any others.`, style: { color: "#cef3ff" } }]);
                            api.sendFlyingMiddleMessage(playerColliding, [{ str: `This portal isn't connected to any others.`, style: { color: "#cef3ff" } }], 100, 3000);

                            lastPortalTouched[playerColliding] = { id: id, at: 1 };
                            portalCooldown[playerColliding] = api.now();
                        } else {
                            otherEntPortalCooldowns[id] = api.now();
                        }
                        return;
                    }
                }
            }
            if (orange) {
                let { id, dir } = orange;
                let cooldown = 1500;
                if (dir === "top" || dir === "bottom") { cooldown = 2200; }

                if (
                    (ent1 === id || ent2 === id) &&
                    (
                        (
                            !portalTeleportLocked[playerColliding] &&
                            (!lastPortalTouched[playerColliding]?.at || lastPortalTouched[playerColliding].at + cooldown < api.now()) &&
                            (!portalCooldown[playerColliding] || portalCooldown[playerColliding] + 1000 < api.now()) &&
                            !api.hasEffect(playerColliding, "NOMILK_portalCooldown")
                        ) ||
                        (
                            !isPlayer &&
                            (!otherEntPortalCooldowns[id] || otherEntPortalCooldowns[id] + 500 < api.now())
                        )
                    )
                ) {
                    if (blue && api.checkValid(blue.id)) {
                        let blueId = blue.id;
                        let bluePos = api.getPosition(blueId);
                        let [bx, by, bz] = bluePos;

                        let tpOffset = dirTpOffsets[blue.dir] ?? [0, 0, 0];

                        api.setPosition(playerColliding, [bx + tpOffset[0], by + tpOffset[1], bz + tpOffset[2]]);
                        playPortalTransferParticles([bx, by, bz], "blue");

                        if (isPlayer) {
                            portalTeleportLocked[playerColliding] = true;
                            api.sendMessage(playerColliding, [{ str: `Successfully teleported!`, style: { color: "#cef3ff" } }]);
                            api.applyEffect(playerColliding, "NOMILK_portalCooldown", 500, { displayName: "Portal Cooldown", icon: "Blue Portal" });
                            api.sendFlyingMiddleMessage(playerColliding, [{ str: `Successfully teleported!`, style: { color: "#cef3ff" } }], 100, 3000);

                            lastPortalTouched[playerColliding] = { id: blueId, at: api.now() };
                            portalCooldown[playerColliding] = api.now();
                        } else {
                            otherEntPortalCooldowns[id] = api.now();
                        }
                        return;
                    } else {
                        if (isPlayer) {
                            api.sendMessage(playerColliding, [{ str: `This portal isn't connected to any others.`, style: { color: "#cef3ff" } }]);
                            api.sendFlyingMiddleMessage(playerColliding, [{ str: `This portal isn't connected to any others.`, style: { color: "#cef3ff" } }], 100, 3000);

                            lastPortalTouched[playerColliding] = { id: id, at: 1 };
                            portalCooldown[playerColliding] = api.now();
                        }
                        return;
                    }
                }
            }
        }
    };
};

function raycastForBlock(fromPos, dir, myId, maxNum = 1000) {
    let relativePortalDir = "front";
    let [fx, fy, fz] = fromPos;
    let [x, y, z] = fromPos;
    let [dx, dy, dz] = dir;
    let prevNewBlockPos;
    for (let n = 1; n <= maxNum; n++) {
        if (!myId || !api.checkValid(myId)) { return; }
        let increment = [dx * n, dy * n, dz * n];
        let newPos = [x + increment[0] - 0.5, y + increment[1] + 0.5, z + increment[2] - 0.5];
        let newBlockPos = [Math.round(newPos[0]), Math.round(newPos[1]), Math.round(newPos[2])];

        let [nx, ny, nz] = newBlockPos;
        let blockName = api.getBlock(newBlockPos);
        let isSolid = api.getBlockSolidity(newBlockPos);

        if (blockName === "Unloaded") { return false; }

        if (isSolid) {
            let placePos;
            placePos = prevNewBlockPos;

            if (prevNewBlockPos) {
                let [px, py, pz] = prevNewBlockPos;

                let diffX = nx - px;
                let diffY = ny - py;
                let diffZ = nz - pz;

                let absX = Math.abs(dx);
                let absY = Math.abs(dy) * 1.25;
                let absZ = Math.abs(dz);

                if (diffY !== 0 && absY >= absX && absY >= absZ) {
                    relativePortalDir = diffY > 0 ? "top" : "bottom";
                } else if (diffX !== 0 && absX >= absZ) {
                    relativePortalDir = diffX > 0 ? "front" : "back";
                } else if (diffZ !== 0) {
                    relativePortalDir = diffZ > 0 ? "right" : "left";
                } else if (diffY !== 0) {
                    relativePortalDir = diffY > 0 ? "top" : "bottom";
                }

                return {
                    pos: prevNewBlockPos,
                    blockName: blockName,
                    dir: relativePortalDir,
                };
            } else {
                let startBlockName = api.getBlock(fromPos);
                let startBlockIsSolid = api.getBlockSolidity(fromPos);
                if (!startBlockIsSolid) {
                    return {
                        pos: fromPos,
                        blockName: blockName,
                        dir: relativePortalDir,
                    };
                } else {
                    return false;
                }
            }
        }

        let curPortalColor = api.getPlayerDbValue(myId, "curPortalColor") ?? "blue";
        sendFlyingPortalParticles(newPos, [dx, dy, dz], curPortalColor);

        prevNewBlockPos = newBlockPos;
    }
    return false;
}

function renderPlayerPortals() {
    for (let e of api.getEntitiesInRect([10000, 10000, 10000], [-10000, -10000, -10000])) {
        if (e && api.checkValid(e)) {
            try {
                let name = api.getEntityName(e);
                let type = api.getEntityType(e);
                if (type === "Mesh") {
                    if (name.includes("Portal")) {
                        api.deleteMeshEntity(e);
                    }
                }
            } catch { }
        }
    }

    for (let myId of api.getPlayerIds()) {
        sessionPortalData[myId] = {};

        let name = api.getEntityName(myId);
        let portals = getPlayerDbObject(myId, "portals") ?? {};
        let { orange, blue } = portals;

        if (orange) {
            let { pos, dir } = orange;
            if (!api.isBlockInLoadedChunk(...pos)) { api.getBlock(pos); }

            let height = depth = width = 1;
            let heightExpandAmt = 0;
            let offset = [0, 0, 0];
            let thickness = 0.2;

            if (dir === "top") {
                height = thickness + 0.1;
                depth = 2;
                offset = [0, 1 - thickness - 0.1, -0.5];
            } else if (dir === "bottom") {
                height = thickness;
                depth = 2;
                offset = [0, 0, -0.5];
            } else if (dir === "left") {
                height = 2;
                depth = thickness;
                offset = [0, 0, -0.2 - thickness];
            } else if (dir === "right") {
                height = 2;
                depth = thickness;
                offset = [0, 0, 0.2 + thickness];
            } else if (dir === "front") {
                height = 2;
                width = thickness;
                offset = [0.2 + thickness, 0, 0];
            } else if (dir === "back") {
                height = 2;
                width = thickness;
                offset = [-0.2 - thickness, 0, 0];
            }

            let orangePortalEnt = api.attemptCreateMeshEntity("Box", {
                size: [1, 1, 1],
                texture: "Orange Portal",
                animateTexture: true,
                hideDist: 1000,

                height: height,
                depth: depth,
                width: width,
            }, `Orange Portal`, {
                doPhysics: false,
                collidesEntities: true,
                collideBits: 1,
                collideMask: 1,
                heightExpandAmt: heightExpandAmt ?? height === 2 ? 2 : 1,
            });
            let [ox, oy, oz] = pos;
            api.setPosition(orangePortalEnt, [ox + 0.5 + offset[0], oy + offset[1], oz + 0.5 + offset[2]]);
            api.setTargetedPlayerSettingForEveryone(orangePortalEnt, "nameTagInfo", {
                subtitle: [{ str: `Created by ${name}` }]
            });
            api.setTargetedPlayerSettingForEveryone(orangePortalEnt, "canAttack", true);

            api.setOtherEntitySetting(myId, orangePortalEnt, "nameTagInfo", {
                subtitle: [{ str: `Your portal` }]
            });
            api.setOtherEntitySetting(myId, orangePortalEnt, "hasPriorityNametag", true);

            sessionPortalData[myId].orange = {
                id: orangePortalEnt,
                dir: dir,
            };
        }
        if (blue) {
            let { pos, dir } = blue;
            if (!api.isBlockInLoadedChunk(...pos)) { api.getBlock(pos); }

            let height = depth = width = 1;
            let offset = [0, 0, 0];
            let thickness = 0.2;

            if (dir === "top") {
                height = thickness;
                depth = 2;
                offset = [0, 1 - thickness, -0.5];
            } else if (dir === "bottom") {
                height = thickness;
                depth = 2;
                offset = [0, 0, -0.5];
            } else if (dir === "left") {
                height = 2;
                depth = thickness;
                offset = [0, 0, -0.2 - thickness];
            } else if (dir === "right") {
                height = 2;
                depth = thickness;
                offset = [0, 0, 0.2 + thickness];
            } else if (dir === "front") {
                height = 2;
                width = thickness;
                offset = [0.2 + thickness, 0, 0];
            } else if (dir === "back") {
                height = 2;
                width = thickness;
                offset = [-0.2 - thickness, 0, 0];
            }

            let bluePortalEnt = api.attemptCreateMeshEntity("Box", {
                size: [1, 1, 1],
                texture: "Blue Portal",
                animateTexture: true,
                hideDist: 1000,

                height: height,
                depth: depth,
                width: width,
            }, `Blue Portal`, {
                doPhysics: false,
                collidesEntities: true,
                collideBits: 1,
                collideMask: 1,
                heightExpandAmt: height === 2 ? 2 : 1,
            });

            let [bx, by, bz] = pos;
            api.setPosition(bluePortalEnt, [bx + 0.5 + offset[0], by + offset[1], bz + 0.5 + offset[2]]);
            api.setTargetedPlayerSettingForEveryone(bluePortalEnt, "nameTagInfo", {
                subtitle: [{ str: `Created by ${name}` }]
            });
            api.setTargetedPlayerSettingForEveryone(bluePortalEnt, "canAttack", true);

            api.setOtherEntitySetting(myId, bluePortalEnt, "nameTagInfo", {
                subtitle: [{ str: `Your portal` }]
            });
            api.setOtherEntitySetting(myId, bluePortalEnt, "hasPriorityNametag", true);

            sessionPortalData[myId].blue = {
                id: bluePortalEnt,
                dir: dir,
            };
        }
    }
}

onBlockStandStop = (myId, x, y, z, blockName) => {
    if (!api.hasEffect(myId, "NOMILK_portalCooldown")) {
        if (lastPortalTouched[myId] && !lastPortalTouched[myId].at && (portalCooldown[myId] && portalCooldown[myId] + 500 < api.now())) {
            lastPortalTouched[myId].at = api.now();
        }
        portalTeleportLocked[myId] = false;
    }
};

onPlayerJump = (myId) => {
    if (!api.hasEffect(myId, "NOMILK_portalCooldown")) {
        if (lastPortalTouched[myId] && !lastPortalTouched[myId].at && (portalCooldown[myId] && portalCooldown[myId] + 500 < api.now())) {
            lastPortalTouched[myId].at = api.now();
        }
        portalTeleportLocked[myId] = false;
    }
};

function deleteAll() {
    for (let e of api.getEntitiesInRect([-100000, -100000, -100000], [100000, 100000, 100000])) { try { api.deleteEntity(e); } catch { } }
}; deleteAll();

globalThis.lastPortalTouched = {};
globalThis.portalCooldown = {};

onPlayerClick = (myId, rc, tx, ty, tz, block, targetEId) => {
    let item = api.getHeldItem(myId) ?? {};
    if (item.name === "Astral Crossbow") {
        let dir = api.getPlayerFacingInfo(myId);
        let [dx, dy, dz] = dir.dir;

        let pos = api.getPosition(myId);
        let [x, y, z] = pos;

        let raycastResult = raycastForBlock([x, y, z], [dx, dy, dz], myId);
        if (raycastResult) {
            let { pos, blockName, dir } = raycastResult;
            let [x, y, z] = pos;

            let curPortalColor = api.getPlayerDbValue(myId, "curPortalColor") ?? "blue";
            let portals = getPlayerDbObject(myId, "portals") ?? {};
            if (curPortalColor === "blue") {
                api.setPlayerDbValue(myId, "curPortalColor", "orange");

                portals.blue = {
                    pos: [x, y, z],
                    dir: dir,
                };

                api.sendMessage(myId, [{ str: `Fired a blue portal.`, style: { color: "#cef3ff" } }]);
                api.sendFlyingMiddleMessage(myId, [{ str: `Fired a blue portal.`, style: { color: "#cef3ff" } }], 100, 3000);
            } else {
                api.setPlayerDbValue(myId, "curPortalColor", "blue");

                portals.orange = {
                    pos: [x, y, z],
                    dir: dir,
                };

                api.sendMessage(myId, [{ str: `Fired an orange portal.`, style: { color: "#cef3ff" } }]);
                api.sendFlyingMiddleMessage(myId, [{ str: `Fired an orange portal.`, style: { color: "#cef3ff" } }], 100, 3000);
            }

            setPlayerDbObject(myId, "portals", portals);
            renderPlayerPortals();
        } else {
            api.sendMessage(myId, [{ str: `Fire at a block to create a portal.`, style: { color: "#ff9d87" } }]);
            api.sendFlyingMiddleMessage(myId, [{ str: `Fire at a block to create a portal.`, style: { color: "#ff9d87" } }], 100, 3000);
        }
    }

    for (let ownerId in sessionPortalData) {
        let targetedPortalData = sessionPortalData[ownerId];
        let { blue, orange } = targetedPortalData;

        if (blue) {
            let { id } = blue;

            if (targetEId === id && !rc) {
                let pos = api.getPosition(id);

                let portals = getPlayerDbObject(ownerId, "portals") ?? {};
                delete portals.blue;

                setPlayerDbObject(ownerId, "portals", portals);
                api.setPlayerDbValue(ownerId, "curPortalColor", "blue");

                api.sendMessage(myId, [{ str: `Blue portal destroyed.`, style: { color: "#cef3ff" } }]);
                api.sendFlyingMiddleMessage(myId, [{ str: `Blue portal destroyed.`, style: { color: "#cef3ff" } }], 100, 3000);

                playPortalBreakParticles(pos, "blue");

                renderPlayerPortals();
            }
        }
        if (orange) {
            let { id } = orange;

            if (targetEId === id && !rc) {
                let pos = api.getPosition(id);

                let portals = getPlayerDbObject(ownerId, "portals") ?? {};
                delete portals.orange;

                setPlayerDbObject(ownerId, "portals", portals);
                api.setPlayerDbValue(ownerId, "curPortalColor", "orange");

                api.sendMessage(myId, [{ str: `Orange portal destroyed.`, style: { color: "#cef3ff" } }]);
                api.sendFlyingMiddleMessage(myId, [{ str: `Orange portal destroyed.`, style: { color: "#cef3ff" } }], 100, 3000);

                playPortalBreakParticles(pos, "orange");

                renderPlayerPortals();
            }
        }
    }
};


let tNum = 0;
tick = (ms) => {
    tNum = (tNum + 1) % 8;

    if (tNum === 0) {
    }
};

globalThis.hitboxes = {};
globalThis.sessionPortalData = {};

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

onPlayerJoin = (myId, fromReset) => {
    let style = {
        body: { color: "#cef3ff", fontSize: "1.2rem", fontWeight: "600" }
    };
    api.setClientOptions(myId, {
        RightInfoText: {
            content: [
                { icon: "Orange Portal", style: { fontSize: "2.4rem" } },
                { str: "Portal", style: { color: "#f58d42", fontSize: "2rem", fontWeight: "800" } },
                { str: " Guns", style: { color: "#4293f5", fontSize: "2rem", fontWeight: "800" } },
                { icon: "Blue Portal", style: { fontSize: "2.4rem" } },

                { str: "\nCoded by @BloxdioCannoli on YT", style: { color: "#d9d9d9", fontSize: "0.8rem", fontWeight: "700", fontStyle: "italic" } },

                { str: "\n\nYour ", style: style.body },
                { icon: "Astral Crossbow", style: style.body },
                { str: " is a portal gun. Hold it and\nclick to fire a portal ray and\nshoot out a blue, then orange\nportal.", style: style.body },

                { str: "\n\nHit a portal to break it.", style: style.body },

                { str: "\n\nWalk into a ", style: style.body },
                { icon: "Blue Portal", style: style.body },
                { str: " in order to teleport\nto a ", style: style.body },
                { icon: "Orange Portal", style: style.body },
                { str: ", and vice versa.", style: style.body },

                { str: "\n\nEach portal is connected to the\nother portal their owner made.\nOnly 1 pair of portals can be open\nat a time, per player.", style: style.body },
            ],
            showBackground: false,
        }
    });

    api.setItemSlot(myId, 0, "Astral Crossbow", 1, {
        customDisplayName: "Portal Gun",
        customDescription: "Right-click to make portals!",
        customAttributes: {
            enchantmentTier: "Tier 4"
        }
    });

    renderPlayerPortals();
    giveHitBox(myId);
    portalCooldown[myId] = 1;
    lastPortalTouched[myId] = { at: 1 };
};

onPlayerLeave = (myId, serverIsShuttingDown) => {
    if (hitboxes[myId] && api.checkValid(hitboxes[myId])) {
        api.deleteMeshEntity(hitboxes[myId]);
        delete hitboxes[myId];
    }

    renderPlayerPortals();
};

function playPortalTransferParticles(pos, type) {
    let [x, y, z] = pos;
    x -= 0.5; z -= 0.5;

    api.playParticleEffect({
        dir1: [-1, -1, -1],
        dir2: [1, 1, 1],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "glint",
        minLifeTime: 0.2,
        maxLifeTime: 0.6,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.25,
        maxSize: 0.35,
        manualEmitCount: 20,
        gravity: [0, -10, 0],
        colorGradients: particleColorGradients[type],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1,
    });
}

function playPortalBreakParticles(pos, type) {
    let [x, y, z] = pos;
    x -= 0.5; z -= 0.5;

    api.playParticleEffect({
        dir1: [-1, -1, -1],
        dir2: [1, 1, 1],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "critical_hit",
        minLifeTime: 0.2,
        maxLifeTime: 0.6,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.25,
        maxSize: 0.35,
        manualEmitCount: 20,
        gravity: [0, -10, 0],
        colorGradients: particleColorGradients[type],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1,
    });
}

function sendFlyingPortalParticles(pos, dir, type) {
    let [dx, dy, dz] = dir;
    let [x, y, z] = pos;

    api.playParticleEffect({
        dir1: [dx / 2, dy / 2, dz / 2],
        dir2: [dx * 2, dy * 2, dz * 2],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "square_particle",
        minLifeTime: 0.2,
        maxLifeTime: 0.4,
        minEmitPower: 2,
        maxEmitPower: 3,
        minSize: 0.15,
        maxSize: 0.2,
        manualEmitCount: 10,
        gravity: [0, 0, 0],
        colorGradients: particleColorGradients[type],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
        ],
        blendMode: 1,
    });
}

globalThis.particleColorGradients = {
    orange: [
        {
            timeFraction: 0,
            minColor: [217, 123, 15, 1],
            maxColor: [252, 136, 3, 1],
        },
        {
            timeFraction: 1,
            minColor: [217, 123, 15, 0],
            maxColor: [252, 136, 3, 0],
        },
    ],
    blue: [
        {
            timeFraction: 0,
            minColor: [21, 147, 214, 1],
            maxColor: [3, 165, 252, 1],
        },
        {
            timeFraction: 1,
            minColor: [21, 147, 214, 0],
            maxColor: [3, 165, 252, 0],
        },
    ]
};

onPlayerStartChargingItem = (myId, itemName) => {
    if (itemName === "Astral Crossbow") {
        return "preventCharge";
    }
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

function isInsideCube(pos, pos1, pos2) {
    const [x1, y1, z1] = pos1;
    const [x2, y2, z2] = pos2;
    const [x, y, z] = pos;

    const inX = x >= Math.min(x1, x2) && x <= Math.max(x1, x2);
    const inY = y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
    const inZ = z >= Math.min(z1, z2) && z <= Math.max(z1, z2);

    if (inX && inY && inZ) {
        return true;
    }
    return false;
}
// code ends here