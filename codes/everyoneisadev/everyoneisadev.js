function onPlayerClick(myId, rc) {
    return;
    let [x, y, z] = api.getPosition(myId);
    y -= 0.5;
    x -= 0.5; z -= 0.5;
    api.playParticleEffect({
        dir1: [-0.5, 0, -0.5],
        dir2: [0.5, 0, 0.5],
        pos1: [x, y, z],
        pos2: [x + 1, y + 1, z + 1],
        texture: "glint",
        minLifeTime: 2,
        maxLifeTime: 2.5,
        minEmitPower: 2,
        maxEmitPower: 2.5,
        minSize: 0.2,
        maxSize: 0.25,
        manualEmitCount: 20,
        gravity: [0, 1, 0],
        colorGradients: [
            {
                timeFraction: 0,
                minColor: [0, 255, 0, 1],
                maxColor: [0, 200, 0, 1],
            },
            {
                timeFraction: 0.5,
                minColor: [0, 100, 0, 0.8],
                maxColor: [0, 50, 0, 0.75],
            },
            {
                timeFraction: 1,
                minColor: [0, 50, 0, 0.0],
                maxColor: [0, 10, 0, 0.0],
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


function onPlayerJoin(myId) {
    api.setTargetedPlayerSettingForEveryone(myId, "lobbyLeaderboardTags", [
        [
            { icon: "wrench", style: { color: "#a4a4a4" } },
        ],
        [
            { icon: "bolt", style: { color: "#ffcc00" } },
        ],
    ]);

    api.setTargetedPlayerSettingForEveryone(myId, "nameTagInfo", {
        content: [
            {
                icon: "wrench",
                mainRGB: "#a4a4a4",
                bracketRGB: "#cef3ff",
                chatTag: [{
                    str: "Dev",
                    strRGB: "#cef3ff"
                }],
                nameTag: {
                    iconShadowRGB: "#838383"
                },
            },
            {
                icon: "zap",
                mainRGB: "#ffcc00",
                chatTag: [{
                    str: "Super"
                }],
                nameTag: {
                    iconShadowRGB: "#eea020"
                },
            },
            { str: api.getEntityName(myId) }
        ],
    });

    api.setClientOption(myId, "cantChangeError", []);
}

function onPlayerChat(myId, txt) {
    return [
        [
            { str: "[", style: { color: "#cef3ff" } },
            { icon: "wrench", style: { color: "#a4a4a4" } },
            { str: " Dev", style: { color: "#cef3ff" } },
            { str: "]", style: { color: "#cef3ff" } },
        ],
        [
            { str: "[", style: { color: "#ffcc00" } },
            { icon: "bolt", style: { color: "#ffcc00" } },
            { str: " Super", style: { color: "#ffcc00" } },
            { str: "]", style: { color: "#ffcc00" } },
        ],
    ];
}