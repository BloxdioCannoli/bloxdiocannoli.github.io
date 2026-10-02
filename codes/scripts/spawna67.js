let [x, y, z] = thisPos
for (let i = 0; i < 5; i++) {
    let mob = api.attemptSpawnMob("67", ...[x, y, z]);
}