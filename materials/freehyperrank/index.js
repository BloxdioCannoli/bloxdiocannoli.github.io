function onPlayerJoin(myId) {
    api.setTargetedPlayerSettingForEveryone(myId, "lobbyLeaderboardTags", [
        [
            { icon: "bolt", style: { color: "#4f94f1" } },
        ],
    ]);

    api.setTargetedPlayerSettingForEveryone(myId, "nameTagInfo", {
        content: [
            {
                icon: "zap",
                mainRGB: "#4f94f1",
                chatTag: [{
                    str: "HYPER"
                }],
                nameTag: {
                    iconShadowRGB: "#222a9f"
                },
            },
            { str: api.getEntityName(myId) }
        ],
    });
}

function onPlayerChat(myId, txt) {
    return [
        [
            { str: "[", style: { color: "#4f94f1" } },
            { icon: "bolt", style: { color: "#4f94f1" } },
            { str: " HYPER", style: { color: "#4f94f1" } },
            { str: "]", style: { color: "#4f94f1" } },
        ],
    ];
}