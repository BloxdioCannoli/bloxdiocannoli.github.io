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