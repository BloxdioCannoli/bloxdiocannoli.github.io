function onPlayerDropItem(myId, x, y, z, itemName, itemAmt, fromIdx) {
    if (itemName === "67 Statue") {
        item = api.createItemDrop(x, y - 0.5, z, "67 Statue", itemAmt, false, {}, 300000, myId, { size: 2 });
        if (item) {
            let dir = api.getPlayerFacingInfo(myId).dir;
            let [dx, dy, dz] = dir;

            let dc = 0.11;

            api.applyImpulse(item, dx * dc, dy * dc, dz * dc);

            return "allowButNoDroppedItemCreated";
        }
    }
}

function onItemDropCreated(itemEId, itemName, itemAmount, x, y, z) {
    burnCheck.push({
        id: itemEId,
        name: itemName,
        amt: itemAmount,
        iterations: 0,
    });
}

function placeKillTrap(x, y, z, dir = "front") {
    resetSpawnerMesh();

    y -= 2;
    if (dir === "front") {
        x -= 5; z -= 2;
    } else if (dir === "back") {
        x += 1; z -= 2;
    } else if (dir === "left") {
        x -= 2; z += 1;
    } else if (dir === "right") {
        x -= 2; z -= 5;
    }
    let wallsStart = [x, y - 2, z];
    let wallsEnd = [x + 4, y + 9, z + 4];
    api.setBlockRect(wallsStart, wallsEnd, "Stone Bricks");

    let emptyStart = [x + 1, y - 1, z + 1];
    let emptyEnd = [x + 3, y + 8, z + 3];
    api.setBlockRect(emptyStart, emptyEnd, "Air");

    let lavaPosStart = [x + 1, y - 1, z + 1];
    let lavaPosEnd = [x + 3, y + 1, z + 3];
    api.setBlockRect(lavaPosStart, lavaPosEnd, "Lava");

    let killSpikeStart = [x + 1, y + 2, z + 1];
    let killSpikeEnd = [x + 3, y + 2, z + 3];
    api.setBlockRect(killSpikeStart, killSpikeEnd, "Kill Spikes");

    let topSlabsStart = [x + 1, y + 8, z + 1];
    let topSlabsEnd = [x + 3, y + 8, z + 3];
    api.setBlockRect(topSlabsStart, topSlabsEnd, "Stone Bricks Slab|meta|rot1|top");

    let spawn67At = [x + 2, y + 4, z + 2];
    api.setBlock(spawn67At, "Empty Spawner Block");
    api.setLobbyDbValue("spawn67At", spawn67At.join(","));

    let windowStart;
    let windowEnd;
    if (dir === "front") {
        windowStart = [x + 4, y + 2, z + 1];
        windowEnd = [x + 4, y + 7, z + 3];
    } else if (dir === "back") {
        windowStart = [x, y + 2, z + 1];
        windowEnd = [x, y + 7, z + 3];
    } else if (dir === "left") {
        windowStart = [x + 1, y + 2, z];
        windowEnd = [x + 3, y + 7, z];
    } else if (dir === "right") {
        windowStart = [x + 1, y + 2, z + 4];
        windowEnd = [x + 3, y + 7, z + 4];
    }

    api.setBlockRect(windowStart, windowEnd, "Light Gray Glass");
}

globalThis.spawnTickNum = 0;
globalThis.burnCheck = [];
globalThis.currentSpawnerMesh = null;

function tick(ms) {
    if (api.isNearInterrupt()) { return; }
    let spawn67At = (api.getLobbyDbValue("spawn67At") ?? "").split(",").map(Number);
    let spawning67Freq = Number(api.getLobbyDbValue("spawn67Freq") ?? 100);

    if (spawn67At.length === 3) {
        let spawnerBlock = api.getBlock(spawn67At);
        if (spawnerBlock === "Empty Spawner Block") {
            let [x, y, z] = spawn67At;

            let meshExists = api.checkValid(currentSpawnerMesh);
            if (!currentSpawnerMesh || !meshExists) {
                let mesh = api.attemptCreateMeshEntity("BloxdBlock", {
                    blockName: "67 Statue",
                    size: 1,
                    autoRotate: true,
                });
                if (mesh) {
                    currentSpawnerMesh = mesh;

                    api.setPosition(mesh, x + 0.5, y - 0.45, z + 0.5);
                }
            }

            spawnTickNum = (spawnTickNum + 1) % spawning67Freq;
            if (spawnTickNum === 0) {
                let the67 = api.attemptSpawnMob("67", ...[x + 0.5, y + 1, z + 0.5]);
                let particle;
                if (the67) {
                    api.setLifeformScale(the67, 0.8);
                    particle = "mobSpawnerBlockHostile";
                } else {
                    particle = "mobSpawnerBlockFail";
                }
                api.playParticleEffect({
                    presetId: particle,
                    pos1: [x - 0.5, y - 0.5, z - 0.5],
                    pos2: [x + 1.5, y + 1.5, z + 1.5],
                });
            }
        } else {
            resetSpawnerMesh();
        }
    }

    for (let toBurnNum in burnCheck) {
        if (api.isNearInterrupt()) { return; }

        let toBurn = burnCheck[toBurnNum];
        let itemId = toBurn.id;
        let itemAmount = toBurn.amt;
        let itemName = toBurn.name;

        if (!api.checkValid(itemId) ||
            toBurn.iterations >= 30 ||
            itemName !== "67 Statue") {
            delete burnCheck[toBurnNum];
            continue;
        }

        let pos; let [x, y, z] = pos = api.getPosition(itemId);

        if (itemName === "67 Statue") {
            //y+=1
        }
        let block = api.getBlock(x, y, z);

        if (block === "Lava") {
            api.deleteItemDrop(itemId);

            api.createItemDrop(x, y - 0.5, z, "Rotten Brain");

            play67KillParticles(x - 0.5, y, z - 0.5);
        }

        toBurn.iterations++;
    }
}

function onPlayerChangeBlock(myId, x, y, z, fromName, toName, droppedName, fromInfo, toInfo) {
    let held = api.getHeldItem(myId);
    if (!held) { return; }

    if (held?.attributes?.customAttributes?.canSpawn67KillFarm && toName === "Red Seeking Paintball Explosive") {
        let dir = getDirRelativeToBlock(myId, [x, y, z]);
        placeKillTrap(x, y, z, dir);

        return "preventChange";
    }
}

function getDirRelativeToBlock(myId, blockPos) {
    let [tox, toy, toz] = blockPos;
    tox += 0.5; toy += 0.5; toz += 0.5;

    let [px, py, pz] = api.getPosition(myId);

    let dx = px - tox;
    let dz = pz - toz;

    if (Math.abs(dx) > Math.abs(dz)) {
        if (dx > 0) {
            return "front";
        } else {
            return "back";
        }
    } else {
        if (dz > 0) {
            return "right";
        } else {
            return "left";
        }
    }
}


function onPlayerJoin(myId) {

}

globalThis.itemsForDropdown = {
    "Select": [],
    "Explosive arrows": ["clearInventory", "explosiveInfo", "getBow", "getArrows", "67spawnOrb", "despawnMobs", "despawnItems"],
    "Kill spike trap": ["clearInventory", "kstrapInfo", "67killfarm", "67spawnOrb", "despawnMobs", "67killfarmfreq", "despawnItems"],
    "Minigun": ["clearInventory", "getMinigun", "minigunInfo", "67spawnOrb", "despawnMobs", "despawnItems"],
    "Statue burning": ["clearInventory", "statueBurningInfo", "67statue", "lavaBucket", "emptyBucket", "despawnItems"]
};
globalThis.selections = [
    "Explosive arrows",
    "Kill spike trap",
    "Minigun",
    "Statue burning"
];
globalThis.currentlySelected = {};

globalThis.lastBowFired = {};
globalThis.lastThrowableSpawnerUsed = {};
globalThis.throwableActions = {};
globalThis.fireDir = {};
globalThis.currentQueued = {};

let spawning67Freq = Number(api.getLobbyDbValue("spawn67Freq") ?? 100);

// Header Shop UI
api.createShopItem("67mod", "info", {
    image: "Bookshelf",
    customTitle: "Info",
    description: [{ str: "• Use any code from the original video by selecting from the dropdown.\n• The video is from @BloxdioCannoli's YT Channel. Subscribe!" }],
    sortPriority: 1000,
    canBuy: false,
});

api.createShopItem("67mod", "select", {
    image: "Name Tag",
    customTitle: "Select Code",
    description: [{ str: "Select a code to begin.", style: { fontWeight: "800" } }],
    sortPriority: 999,
    canBuy: true,
    userInput: {
        type: "dropdown",
        dropdownOptions: [
            "Select",
            ...selections
        ],
        initialValue: "Select",
        autoSubmit: true
    }
});

// Explosive Arrow Shop
api.createShopItem("67mod", "explosiveInfo", {
    image: "Book",
    customTitle: "Explosive Arrows Info",
    description: [{ str: "• Get an explosive bow and some arrows.\n• Get a 67 spawn orb.\n• EXPLODE\n• Don't fire your arrows too far away from your render distance, or they'll despawn!" }],
    sortPriority: 101,
    hidden: true,
    canBuy: false,
});

api.createShopItem("67mod", "getBow", {
    image: "Diamond Bow",
    amount: 1,
    customTitle: [{ str: "Explosive Bow" }],
    description: [{ str: "Use this to fire explosive arrows. You can use any arrows to explode, as long as you use this bow." }],
    buyButtonText: [{ str: "Free" }],

    sortPriority: 3,
    hidden: true,
});

api.createShopItem("67mod", "getArrows", {
    amount: 999,
    image: "Arrow",
    customTitle: [{ str: "Arrows" }],
    description: [{ str: "Get a stack of arrows." }],
    buyButtonText: [{ str: "Free" }],

    sortPriority: 1,
    hidden: true,
});

// Kill Spike Trap Shop
api.createShopItem("67mod", "kstrapInfo", {
    image: "Book",
    customTitle: "Kill Spike Trap Info",
    description: [{ str: "• Get a structure spawner to automatically spawn and kill 67's." }],
    sortPriority: 101,
    hidden: true,
    canBuy: false,
});

api.createShopItem("67mod", "67killfarm", {
    image: "Kill Spikes",
    customTitle: "Get Structure Spawner",
    description: [{ str: "Place this block to spawn a 67 farm structure where it gets placed." }, { str: "\n\nNote: Only 1 67 spawner may be active at a time. If you place multiple of these farms, only the most recently-placed one will function. This is intentional, to prevent lag.", style: { fontWeight: "700", fontStyle: "italic" } }],
    buyButtonText: "Free",
    sortPriority: 50,
    hidden: true,
});

api.createShopItem("67mod", "67killfarmfreq", {
    image: "Gold Clock",
    customTitle: "Spawning Frequency",
    description: [{ str: "Configure spawning frequency (how many ingame ticks it takes to spawn a 67)." }],
    buyButtonText: "Set",
    userInput: {
        type: "number",
        initialValue: `${spawning67Freq}`,
        placeholderText: "Default: 100"
    },
    sortPriority: 100,
    hidden: true,
});

// Minigun Shop
api.createShopItem("67mod", "minigunInfo", {
    image: "Book",
    customTitle: "Minigun Info",
    description: [{ str: "• Get an OP Minigun\n• Get a 67 spawn orb\n• SHOOT" }],
    sortPriority: 101,
    hidden: true,
    canBuy: false,
});

api.createShopItem("67mod", "getMinigun", {
    image: "Minigun",
    customTitle: "Get Minigun",
    description: "Kill those pesky 67's with a custom OP minigun.",
    buyButtonText: "Free",
    sortPriority: 50,
    hidden: true,
});

// Statue Burning Shop
api.createShopItem("67mod", "statueBurningInfo", {
    image: "Book",
    customTitle: "Statue Burning Info",
    description: [{ str: "• Get a 67 Statue\n• Get lava if you can't find a pool\n• BURN with satifying particles and item drops" }, { str: "\n\n• Inspired by the_ccccc's Burn a Brainrot!", style: { fontStyle: "italic" } }],
    sortPriority: 101,
    hidden: true,
    canBuy: false,
});

api.createShopItem("67mod", "67statue", {
    image: "67 Statue",
    customTitle: "67 Statue",
    description: "Get a statue of the 67 brainrot.",
    buyButtonText: "Free",
    amount: 999,
    sortPriority: 0,
    hidden: true,
});

api.createShopItem("67mod", "lavaBucket", {
    image: "Lava Bucket",
    customTitle: "Lava Bucket",
    description: "Get a lava bucket, for burning.",
    buyButtonText: "Free",
    amount: 1,
    sortPriority: 0,
    hidden: true,
});

api.createShopItem("67mod", "emptyBucket", {
    image: "Bucket",
    customTitle: "Empty Bucket",
    description: "Get an empty bucket, for cleaning up.",
    buyButtonText: "Free",
    amount: 1,
    sortPriority: -1,
    hidden: true,
});


// Universally used
api.createShopItem("67mod", "clearInventory", {
    image: "Bin",
    customTitle: "Clear Inventory",
    description: "Clear your inventory when you're done testing.",
    buyButtonText: "Free",
    amount: -1,
    sortPriority: 100,
    hidden: true,
});
api.createShopItem("67mod", "despawnMobs", {
    image: "Knight Sword",
    customTitle: "Despawn Mobs",
    description: "Despawn every mob.",
    buyButtonText: "Free",
    amount: -1,
    sortPriority: 100,
    hidden: true,
});
api.createShopItem("67mod", "despawnItems", {
    image: "Cross",
    customTitle: "Despawn Items",
    description: "Despawn every dropped item.",
    buyButtonText: "Free",
    amount: -1,
    sortPriority: 100,
    hidden: true,
});

api.createShopItem("67mod", "67spawnOrb", {
    image: "Cyan Paintball",
    customTitle: "67 Spawn Orb",
    description: "Spawn a herd of 5 67s at the landing location by throwing it. Don't spawn too many, or there might be lag/limiting!",
    buyButtonText: "Free",
    amount: 5,
    sortPriority: 0,
    hidden: true,
});

// Category Config
api.configureShopCategory("67mod", {
    autoSelectCategory: true,
    sortPriority: 1000,
    customTitle: "67 Mod",
    description: [{ str: "Use this to kill 67's in new and powerful ways. " }, { str: "Code by " }, { icon: "fa-brands fa-youtube" }, { str: "BloxdioCannoli on YT! Subscribe." }],
});

function onPlayerKilledMob(myId, mobId, dmg, withItem) {
    let type = api.getEntityType(mobId);
    let mobPos = api.getPosition(mobId);

    if (type === "67") {
        let [x, y, z] = mobPos;
        play67KillParticles(...mobPos);
    }
}

function onPlayerClick(myId, rc, ax, ay, az, block, targetEId) {
    let held = api.getHeldItem(myId);
    if (!held) { return; }

    let [px, py, pz] = playerPos = api.getPosition(myId);
    let [dx, dy, dz] = playerDir = api.getPlayerFacingInfo(myId).dir;

    if (held.attributes.customAttributes.canSpawn67) {
        let throwableId = api.attemptCreateThrowable(myId, "Pebble", [px, py + 1, pz], [dx, dy, dz], 1, 0, 1, {});
        throwableActions[throwableId] = "spawn67";
    }
}

function onPlayerBoughtShopItem(myId, catKey, itemKey, item, userInput) {
    if (catKey === "67mod") {
        if (itemKey === "select" && userInput !== "Select") {
            let prevSelected = currentlySelected[myId] ?? "";
            currentlySelected[myId] = userInput;

            api.updateShopItemForPlayer(myId, "67mod", "select", {
                userInput: {
                    type: "dropdown",
                    dropdownOptions: selections,
                    autoSubmit: true,
                },
                description: [{ str: "Selected: " }, { str: `${userInput}`, style: { fontWeight: "800" } }]
            });


            let toHide = itemsForDropdown[prevSelected] ?? [];
            for (let hideKey of toHide) {
                try {
                    api.updateShopItemForPlayer(myId, "67mod", `${hideKey}`, {
                        hidden: true,
                    });
                } catch { }
            }

            let toShow = itemsForDropdown[userInput];
            for (let showKey of toShow) {
                try {
                    if (showKey === "67killfarmfreq") {
                        let spawning67Freq = Number(api.getLobbyDbValue("spawn67Freq") ?? 100);
                        api.updateShopItemForPlayer(myId, "67mod", `${showKey}`, {
                            userInput: {
                                type: "number",
                                initialValue: `${spawning67Freq}`,
                                placeholderText: "Default: 100",
                            }
                        });
                    }
                    api.updateShopItemForPlayer(myId, "67mod", `${showKey}`, {
                        hidden: false,
                    });
                } catch { }
            }
        }

        if (itemKey === "getBow") {
            api.giveItem(myId, "Diamond Bow", 1, {
                customAttributes: {
                    enchantmentTier: "Tier 5",
                    enchantments: {
                        "Arrow Speed": 1000,
                        "Quick Charge": 1000
                    },
                    explodingLevel: 1,
                },
                customDisplayName: "Bow of Exploding",
                customDescription: "Fire the bow with any arrow to explode what it hits!"
            });
            api.sendOverShopInfo(myId, "Given bow");
        } else if (itemKey === "getArrows") {
            api.giveItem(myId, "Arrow", 999, {});
            api.sendOverShopInfo(myId, "Given arrows");

        } else if (itemKey === "clearInventory") {
            api.clearInventory(myId);
            api.sendOverShopInfo(myId, "Cleared inventory");
        } else if (itemKey === "getMinigun") {
            /*
            gunType: GunCategory;
        scopeType: "none" | "sniper";
        muzzleFlashOffsetFromGun: Vec3;
        muzzleFlashScale?: number;
        autoFireWithMouse: boolean;
        fireRate: number;
        fireRateWithHeldTouch?: number;
        burstCount?: number;
        burstDelay?: number;
        damage: number;
        shotPelletCount?: number;
        reloadTime?: number;
        clipSize: number;
        reloadBulletsIndividually?: boolean;
        bulletReloadTime?: number;
        cockTime?: number;
        tagSpeedMult: number;
        subsequentTagSpeedReductionScalar: number;
        inaccuracyStanding: number;
        inaccuracyFromShot: number;
        inaccuracyMovement: number;
        yVelocityInaccuracy: number;
        inaccuracyFromJump: number;
        altInaccuracyStanding: number;
        altInaccuracyFromShot: number;
        altInaccuracyMovement: number;
        recoveryRate: number;
        msPerRound?: number;
        msPerRoundTouchScreen?: number;
        altYVelocityInaccuracy?: number;
        altInaccuracyFromJump?: number;
        hasVerticalInaccuracy?: boolean;
        keepScopeOnShot?: boolean;
        aimZoomFactor?: number;
        kickbackDecreaseRate: number;
        minKickback?: number;
        maxKickback?: number;
        kickbackRate?: number;
            */
            api.giveItem(myId, "Minigun", 1, {
                customAttributes: {
                    enchantmentTier: "Tier 5",
                    gunStats: {
                        damage: 10000,
                        clipSize: 67,
                        inaccuracyStanding: 0,
                        inaccuracyFromShot: 0,
                        inaccuracyMovement: 0,
                        yVelocityInaccuracy: 0,
                        inaccuracyFromJump: 0,
                        altInaccuracyStanding: 0,
                        altInaccuracyFromShot: 0,
                        altInaccuracyMovement: 0,
                        altYVelocityInaccuracy: 0,
                        altInaccuracyFromJump: 0,
                        hasVerticalInaccuracy: false,
                        reloadTime: 1,
                    }
                },
                customDisplayName: "67 Killer",
                customDescription: "Buffed Minigun, designed to kill 67's!",
            });

            api.sendOverShopInfo(myId, "Given Minigun");
        } else if (itemKey === "67killfarm") {
            api.giveItem(myId, "Red Seeking Paintball Explosive", 1, {
                customDisplayName: "67 Kill Farm Structure Spawner",
                customDescription: "Place to spawn a 67 kill farm.",
                customAttributes: {
                    enchantmentTier: "Tier 5",
                    canSpawn67KillFarm: true,
                }
            });

            api.sendOverShopInfo(myId, "Given 67 Kill Farm Structure Spawner");
        } else if (itemKey === "67spawnOrb") {
            api.giveItem(myId, "Cyan Paintball", 1, {
                customDisplayName: "67 Spawn Orb",
                customDescription: "Right-click while holding to throw and spawn 5 67s at the landing location.",
                customAttributes: {
                    enchantmentTier: "Tier 5",
                    canSpawn67: true,
                }
            });

            api.sendOverShopInfo(myId, "Given 67 Spawn Orb");
        } else if (itemKey === "despawnMobs") {
            for (let mobId of api.getMobIds()) {
                api.despawnMob(mobId);
            }

            api.sendOverShopInfo(myId, "Despawned mobs");
        } else if (itemKey === "67killfarmfreq") {
            userInput = Number(userInput);
            if (!userInput || userInput <= 0) { userInput = 100; }
            api.setLobbyDbValue("spawn67Freq", `${userInput}`);

            api.sendOverShopInfo(myId, "Changed spawning frequency in the 67 farm");
        } else if (itemKey === "67statue") {
            api.giveItem(myId, "67 Statue", 999, { customDescription: "Perfect for burning." });

            api.sendOverShopInfo(myId, "Got 67 statue");
        } else if (itemKey === "lavaBucket") {
            api.giveItem(myId, "Lava Bucket", 1);

            api.sendOverShopInfo(myId, "Got Lava Bucket");
        } else if (itemKey === "emptyBucket") {
            api.giveItem(myId, "Bucket", 1);

            api.sendOverShopInfo(myId, "Got an empty bucket");
        } else if (itemKey === "despawnItems") {
            api.deleteAllItems();

            api.sendOverShopInfo(myId, "Despawned all items");
        }
    }
}

function onMobDamagingPlayer(mobId, myId, dmg, withItem) {
    let type = api.getEntityType(mobId);
    let mobPos = api.getPosition(mobId);

    let gamemode = api.getPlayerGamemode(myId);

    if (type === "67") {
        api.applyEffect(myId, "Brain Rot", 5000, {});
    }
}

function onPlayerStartChargingItem(myId, itemName) {
    let curSlotNum = api.getSelectedInventorySlotI(myId);
    let item = api.getItemSlot(myId, curSlotNum);

    if (item?.attributes?.customAttributes?.explodingLevel !== undefined) {
        try {
            api.removeFromQueue(currentQueued[myId]);
        } catch { }

        currentQueued[myId] = api.queueCrosshairText(myId, [{ icon: "Fireball" }, { str: "Release your bow to send an explosive arrow!", style: { color: "#f5d142" } }], 3000);
    }
}

function onPlayerFinishChargingItem(myId, used, itemName, duration) {
    let curSlotNum = api.getSelectedInventorySlotI(myId);
    let item = api.getItemSlot(myId, curSlotNum);

    if (item?.attributes?.customAttributes?.explodingLevel !== undefined) {
        try {
            api.removeFromQueue(currentQueued[myId]);
        } catch { }

        currentQueued[myId] = api.queueCrosshairText(myId, [{ icon: "Arrow" }, { str: "Explosive arrow sent.", style: { color: "#f5d142" } }], 1000);

        let [x, y, z] = api.getPosition(myId);
        y += 1;
        let dir = api.getPlayerFacingInfo(myId).dir;
        let [dx, dy, dz] = dir;
        dx *= 5; dy *= 5; dz *= 5;

        playSendParticles(x, y, z, dx, dy, dz);

        fireDir[myId] = api.getPlayerFacingInfo(myId).dir;
        lastBowFired[myId] = item;
    } else { lastBowFired[myId] = null; }
}

function onPlayerSelectInventorySlot(myId, curSlotNum) {
    let item = api.getItemSlot(myId, curSlotNum);

    try {
        api.removeFromQueue(currentQueued[myId]);
    } catch { }

    if (item?.attributes?.customAttributes?.explodingLevel !== undefined) {
        currentQueued[myId] = api.queueCrosshairText(myId, [{ icon: "Diamond Bow" }, { str: "Click and hold to charge your explosive bow!", style: { color: "#f5d142" } }], 3000);
    } else {

    }
}

function onPlayerDamagingMob(myId, mobId, dmg, withItem, damagerDbId) {
    let bowUsed = lastBowFired[myId];
    if (bowUsed && withItem.includes("Arrow")) {

        if (bowUsed?.attributes?.customAttributes?.explodingLevel !== undefined) {
            api.sendFlyingMiddleMessage(myId, [{ icon: "Moonstone Explosive" }, { str: "BANG", style: { color: "#f5d142", fontWeight: "bold" } }], 15);
            let id = api.attemptCreateThrowable(myId, "Super RPG", api.getPosition(mobId), [0, -1, 0], 100);
            api.killLifeform(mobId, { lifeformId: myId, withItem: "Diamond Bow" });
        }
    }
}

function onPlayerThrowableHitTerrain(myId, throwableName, thrownEntityId) {
    let [x, y, z] = pos = api.getPosition(thrownEntityId);

    let actions = throwableActions[thrownEntityId];

    if (actions === "spawn67") {
        delete throwableActions[thrownEntityId];

        let failed = false;
        let spawned = [];
        for (let i = 0; i < 5; i++) {
            let mob = api.attemptSpawnMob("67", ...[x, y, z]);
            if (!mob) { failed = true; break; }

            spawned.push(mob);
        }
        if (failed) {
            for (let mobId of spawned) {
                if (mobId && api.checkValid(mobId)) { api.despawnMob(mobId); }
            }
            api.sendMessage(myId, [{ str: "Cannot spawn 67s. Too many mobs in lobby. If you want, head over to the shop and press Despawn Mobs!", style: { color: "#cef3ff" } }]);
        } else {
            api.playParticleEffect({
                presetId: "mobSpawnOrb",
                pos1: [x, y, z],
                pos2: [x + 1, y + 1, z + 1],
            });
        }
    }


    let bowUsed = lastBowFired[myId];
    if (bowUsed && throwableName.includes("Arrow")) {
        if (bowUsed?.attributes?.customAttributes?.explodingLevel !== undefined) {
            api.sendFlyingMiddleMessage(myId, [{ icon: "Moonstone Explosive" }, { str: "BANG", style: { color: "#f5d142", fontWeight: "bold" } }], 15);
            let id = api.attemptCreateThrowable(myId, "Super RPG", [x, y, z], fireDir[myId], 100);
            api.deleteThrowable(thrownEntityId);
        }
    }
}

function playSendParticles(x, y, z, dx, dy, dz) {
    api.playParticleEffect({
        dir1: [dx - 0.1, dy - 0.1, dz - 0.1],
        dir2: [dx + 0.1, dy + 0.1, dz + 0.1],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "glint",
        minLifeTime: 0.8,
        maxLifeTime: 1,
        minEmitPower: 1.8,
        maxEmitPower: 2,
        minSize: 0.25,
        maxSize: 0.35,
        manualEmitCount: 20,
        gravity: [0, -10, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [255, 0, 0, 1],
                maxColor: [255, 255, 0, 1],
            },
            {
                timeFraction: 1,
                minColor: [200, 0, 0, 0],
                maxColor: [200, 200, 0, 0],
            },
        ],
        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1,
            },
            {
                timeFraction: 1,
                factor: 10,
                factor2: 10,
            },
        ],
        blendMode: 1,
    });
}

api.setDefaultMobSetting("67", "onDeathItemDrops", [
    {
        itemName: "Rotten Flesh",
        probabilityOfDrop: 1,
        dropMinAmount: 1,
        dropMaxAmount: 3,
    },
    {
        itemName: "Rotten Brain",
        probabilityOfDrop: 0.5,
        dropMinAmount: 1,
        dropMaxAmount: 3,
    },
    {
        itemName: "Splash Brain Rot Potion",
        probabilityOfDrop: 0.1,
        dropMinAmount: 1,
        dropMaxAmount: 1,
    },
]);

function play67KillParticles(x, y, z) {
    api.playParticleEffect({
        dir1: [-3, -3, -3],
        dir2: [3, 3, 3],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "soul_0",
        minLifeTime: 0.2,
        maxLifeTime: 0.6,
        minEmitPower: 2,
        maxEmitPower: 2,
        minSize: 0.5,
        maxSize: 0.75,
        manualEmitCount: 50,
        gravity: [0, 0, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [0, 255, 255, 1],
                maxColor: [0, 200, 255, 1],
            },
            {
                timeFraction: 1,
                minColor: [0, 200, 255, 0.1],
                maxColor: [0, 200, 255, 0.1],
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
}

for (let e of api.getEntitiesInRect([-10000, -10000, -10000], [10000, 10000, 10000])) {
    let type = api.getEntityType(e);
    if (type === "Mesh") { api.deleteMeshEntity(e); }
}

function resetSpawnerMesh() {
    if (currentSpawnerMesh && api.checkValid(currentSpawnerMesh)) {
        api.deleteMeshEntity(currentSpawnerMesh);
    }
    currentSpawnerMesh = null;
}