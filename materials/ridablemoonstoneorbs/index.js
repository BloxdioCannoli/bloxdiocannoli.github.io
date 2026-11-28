function mountOrb(myId, orbId) {
    moonstoneOrbs[myId] = orbId;

    api.setPlayerPose(myId, "sitting", [0, -0, 0]);
    api.setOtherEntitySetting(myId, myId, "nameTagInfo", { content: [] });

    api.setClientOptions(myId, {
        gravityMultiplier: 0,
        speedMultiplier: 0,
        gameCamera: {
            mode: "follow",
            hideHud: true,
            offset: [3, 3, 3],
            offsetSpace: "target",
            avoidTerrain: true,
        }
    });
}

function dismountOrb(myId) {
    delete moonstoneOrbs[myId];

    api.setPlayerPose(myId, "standing");
    api.setOtherEntitySettingToDefault(myId, myId, "nameTagInfo");

    api.setClientOptions(myId, {
        gravityMultiplier: 1,
        speedMultiplier: 1,
        gameCamera: {
            mode: "default"
        }
    });
}

onPlayerAttemptAltAction = (myId, x, y, z, block, targetEId) => {
    let held = api.getHeldItem(myId);
    if (held?.name === "Moonstone Orb" && moonstoneOrbs[myId]) {
        return "preventAction";
    }
};

onPlayerUsedThrowable = (myId, throwableName, throwableId) => {
    if (throwableName === "Moonstone Orb") {
        mountOrb(myId, throwableId);
    }
};
onPlayerThrowableHitTerrain = (myId, throwableName, throwableId) => {
    if (throwableId === moonstoneOrbs[myId]) {
        dismountOrb(myId);
    }
};

globalThis.moonstoneOrbs = {};
onPlayerJoin = (myId) => {
    api.sendMessage(myId, [{ str: `Welcome! Throw a moonstone orb to ride it while it's in the air.`, style: { color: "#cef3ff" } }]);
};
onPlayerLeave = (myId) => {
    delete moonstoneOrbs[myId];
};

tick = (ms) => {
    for (let myId of api.getPlayerIds()) {
        let myOrb = moonstoneOrbs[myId];

        if (myOrb && api.checkValid(myOrb)) {
            api.setPosition(myId, api.getPosition(myOrb));
        }
    }
};