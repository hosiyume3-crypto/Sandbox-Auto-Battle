/* Sandbox Auto-Battler V35 - Data & Libraries */

function initLibraries() {
    // Helper functions to create card objects efficiently
    const A = (id, name, sys, style, tag, range, val, dur, cd, rarity, desc) => {
        let col = SYSTEM_COLORS[sys] || "#999";
        if (sys === "Heal") col = SYSTEM_COLORS["Heal"];
        return {
            id, name, category: "ACTION", type: "ACTION", system: sys, 
            style, tag, range, val, duration: dur, color: col, 
            cooldownMax: cd, currentCooldown: 0, level: 1, rarity, desc
        };
    };
    
    const M = (id, name, desc, col) => ({
        id, name, category: "MOVE", type: "MOVE", system: "Movement", 
        style: "PASSIVE", tag: "BUFF", range: 0, val: 0, duration: 0, 
        color: col, cooldownMax: 0, currentCooldown: 0, rarity: "COMMON", desc
    });
    
    const E = (id, name, stats, col, desc) => ({
        id, name, category: "EQUIP", type: "PASSIVE", system: "Equipment", 
        style: "PASSIVE", stats, color: col, rarity: "COMMON", desc
    });

    // --- ACTION LIBRARY ---
    actionLibrary = [
        // --- 新規追加: 投擲槍 (遠距離) ---
        A("javelin", "Javelin", "Ranged", "RANGE", "PROJECTILE", 500, 35, 40, 150, "COMMON", "Throws a piercing spear."),
        
        // --- 新規追加: カウンター (近接) ---
        // duration 120 = 2秒間の構え
        A("counter", "Counter", "Melee", "SELF", "BUFF", 0, 50, 120, 360, "RARE", "Stance: Negate next hit & ambush attacker."),
        
        // --- 新規追加: 錬金術 (魔法) ---
        A("alchemy", "Alchemy", "Magic", "AOE", "DEBUFF", 200, 15, 40, 480, "RARE", "Toxic mist. Victims drop potions."),

        A("boomerang", "Boomerang", "Ranged", "RANGE", "PROJECTILE", 150, 20, 30, 180, "RARE", "Throws a piercing weapon that returns."),
        A("air_raid", "Air Raid", "Ranged", "AOE", "ATK", 999, 56, 60, 900, "LEGENDARY", "Bombards random enemies from above."), 
        
        A("life_drain", "Life Drain", "Magic", "RANGE", "DEBUFF", 100, 0, 20, 600, "RARE", "Steals 25% of the target's Max HP."),

        A("gatotsu", "Gatotsu", "Melee", "MELEE", "ATK", 150, 14, 20, 300, "RARE", "Dashes forward. Hits all enemies in path."),
        A("shadow_bind", "Bind", "Ranged", "AOE", "DEBUFF", 250, 0, 20, 600, "RARE", "Deals no dmg, but Stuns enemies (2s)."),
        A("slow_sphere", "GiantOrb", "Magic", "RANGE", "PROJECTILE", 999, 28, 60, 180, "RARE", "Fires a giant, slow-moving piercing orb."),
        A("black_hole", "BlackHole", "Magic", "SUMMON", "DEBUFF", 0, 0, 20, 600, "LEGENDARY", "Creates a gravity field on enemy pos."),

        A("fan_laser", "FanLaser", "Magic", "RANGE", "PROJECTILE", 400, 17, 60, 360, "LEGENDARY", "Rapidly fires 8 lasers in a wide fan shape."),
        A("flamethrower", "Flamer", "Magic", "RANGE", "PROJECTILE", 180, 4, 90, 360, "RARE", "Emits a continuous stream of fire."),
        A("backstep", "Backstep", "Ranged", "RANGE", "PROJECTILE", 80, 14, 20, 180, "COMMON", "Shoots and quickly retreats backwards."),

        A("giga_laser", "GigaLaser", "Magic", "RANGE", "PROJECTILE", 400, 40, 60, 500, "RARE", "Fires a massive, piercing wide laser."),
        A("orbit_fire", "Orbiter", "Magic", "SELF", "BUFF", 150, 14, 0, 600, "RARE", "Summons 4 fireballs that circle you for 5s."),
        A("assassin", "Assassin", "Melee", "MELEE", "ATK", 300, 42, 30, 480, "LEGENDARY", "Teleport behind the FARTHEST enemy and strike."), 
        
        {...A("turret", "Turret", "Ranged", "SUMMON", "ALLY", 0, 0, 20, 600, "RARE", "Deploy a temporary turret that shoots enemies."), color: SYSTEM_COLORS["Turret"]},
        A("poison", "Poison", "Magic", "AOE", "DOT", 150, 0, 40, 300, "RARE", "Poisons enemies (3% Max HP/sec)."),
        
        A("repel", "Repel", "Magic", "AOE", "DEBUFF", 160, 10, 20, 420, "COMMON", "Knocks back nearby enemies and Slows them."),

        A("slash", "Slash", "Melee", "MELEE", "ATK", 50, 21, 20, 60, "COMMON", "Basic melee attack (AOE)."), 
        A("hammer", "Hammer", "Melee", "MELEE", "ATK", 60, 35, 50, 300, "RARE", "Heavy shockwave strike (CT5s) with massive knockback."),
        A("dagger", "Dagger", "Melee", "MELEE", "ATK", 30, 7, 8, 20, "COMMON", "Fast consecutive stabs, very low cooldown."),
        A("spear", "Spear", "Melee", "MELEE", "ATK", 90, 24, 30, 80, "COMMON", "Long-reach thrusting attack."),
        
        A("scythe", "Scythe", "Melee", "MELEE", "ATK", 60, 28, 40, 120, "RARE", "Drains a small amount of HP upon hit."),
        
        A("shield_bash", "S.Bash", "Melee", "MELEE", "ATK", 40, 14, 30, 120, "RARE", "Grants a temporary Defense Buff upon hit."),
        A("multicut", "Multicut", "Melee", "MELEE", "ATK", 50, 5, 40, 180, "RARE", "Rapid multi-hit slashes over a short time."),
        A("barrage", "Barrage", "Melee", "MELEE", "ATK", 60, 12, 45, 180, "COMMON", "Rapid 3-strike combo on nearby enemies."),
        
        A("ragnarok", "Ragnarok", "Melee", "MELEE", "ATK", 50, 56, 60, 480, "LEGENDARY", "Target explosion & GLOBAL lightning strike."),

        A("vortex", "Vortex", "Melee", "AOE", "ATK", 100, 17, 40, 420, "COMMON", "Slashes the area, pulling enemies towards the center."), 
        
        A("charge", "Charge", "Melee", "MELEE", "ATK", 70, 45, 30, 420, "COMMON", "Casts for 1s, then dashes with massive knockback."), 
        
        A("stomp", "Stomp", "Melee", "AOE", "ATK", 80, 35, 50, 420, "RARE", "Slams the ground, strongly knocking back enemies in a large area."), 
        A("cleave", "Cleave", "Magic", "AOE", "ATK", 70, 28, 40, 420, "COMMON", "A wide forward sweep attack."), 
        A("stun_gun", "StunGun", "Ranged", "RANGE", "DEBUFF", 100, 7, 20, 420, "RARE", "Low damage shot that Stuns (stops) the enemy."), 
        A("blizzard", "Blizzard", "Magic", "AOE", "DEBUFF", 150, 7, 60, 420, "RARE", "Freezes (Stops) enemies in a large area."), 
        A("gravity", "Gravity", "Magic", "AOE", "DEBUFF", 200, 3, 80, 420, "COMMON", "Pulls enemies to the center of the area and Slows them."), 
        A("dark_orb", "Dark Orb", "Magic", "AOE", "ATK", 250, 35, 60, 420, "RARE", "A dark energy orb that explodes on remote impact."), 
        A("teleport", "Blink", "Magic", "SELF", "BUFF", 0, 0, 1, 180, "RARE", "Instantly move a short distance forward."), 
        A("meteor", "Meteor", "Magic", "AOE", "EXPLOSION", 0, 40, 60, 300, "RARE", "Drops a meteor on a random enemy."),

        A("bow", "Bow", "Ranged", "RANGE", "ATK", 250, 14, 30, 80, "COMMON", "Basic long-range arrow shot."), 
        A("m_gun", "M.Gun", "Ranged", "RANGE", "ATK", 150, 5, 5, 12, "COMMON", "Low power, rapid-fire, low range."),
        
        A("flame", "Flame", "Magic", "RANGE", "PROJECTILE", 120, 5, 10, 5, "COMMON", "Low power, short-range, ultra-fast piercing fire stream."),
        
        A("beam", "Beam", "Magic", "RANGE", "PROJECTILE", 150, 14, 40, 100, "COMMON", "High-piercing beam."),
        
        A("rocket", "Rocket", "Ranged", "RANGE", "EXPLOSION", 350, 56, 60, 200, "LEGENDARY", "Fires an explosive that creates a large AoE blast on impact."),
        
        A("cluster", "Cluster", "Ranged", "RANGE", "PROJECTILE", 250, 15, 40, 240, "RARE", "Fires a bomb that scatters smaller bombs on impact."),
        
        A("shuriken","Shuriken","Ranged","RANGE","ATK", 250, 10, 15, 30, "COMMON", "Fast cooldown mid-range throwing star."),
        A("scatter", "Scatter", "Ranged", "RANGE", "ATK", 150, 8, 10, 50, "COMMON", "Fires 3 spreading pellets."),
        A("shotgun", "Shotgun", "Ranged", "RANGE", "ATK", 100, 10, 40, 120, "RARE", "Fires 5 spreading pellets at short range."),
        
        A("sniper", "Sniper", "Ranged", "RANGE", "ATK", 200, 40, 80, 420, "RARE", "High power, short range single shot."),
        
        A("nova", "Nova", "Magic", "AOE", "ATK", 120, 21, 30, 180, "RARE", "A shockwave that knocks back enemies in all directions."), 
        A("fireball", "Fireball", "Magic", "RANGE", "PROJECTILE", 350, 21, 50, 150, "COMMON", "Hurls a high-power fireball."),
        
        A("thunder", "Thunder", "Magic", "RANGE", "DEBUFF", 400, 28, 20, 420, "RARE", "Strikes 3 random enemies with lightning."),
        
        {...A("shooting_star", "Star", "Magic", "RANGE", "PROJECTILE", 500, 45, 60, 240, "LEGENDARY", "Bounces between enemies up to 6 times."), bounce: 6},

        A("icicle", "Icicle", "Magic", "RANGE", "DEBUFF", 100, 21, 40, 90, "RARE", "Throws 2 ice spears that Slow enemies."),
        A("heal", "Heal", "Heal", "SELF", "HEAL", 0, 28, 40, 600, "LEGENDARY", "Restores HP to the player."),
    ];

    // --- EQUIPMENT LIBRARY ---
    equipLibrary = [
        E("e_swd", "Iron Sword", {melee:0.10}, "#e66", "Melee Damage +10%"),
        E("e_bow", "Long Bow", {range:0.10}, "#6e6", "Ranged Damage +10%"),
        E("e_boot", "Wind Boot", {speed:0.10}, "#0ee", "Movement Speed +10%"),
        E("e_arm", "Plate Mail", {def:0.10}, "#88a", "Damage Taken -10%"),
        E("e_ring", "Ruby Ring", {melee:0.05, range:0.05}, "#d44", "All Damage +5%"),
        E("e_amul", "Time Charm", {cdr:0.05}, "#aa4", "Cooldown Rate +5%"),
        
        E("e_belt", "Potion Belt", {potionStockAdd: 2}, "#852", "Potion Stock Max +2"),
        E("e_wand", "Magic Wand", {magic: 0.10}, "#c6f", "Magic Damage +10%"),
        E("e_scope", "Sniper Scope", {rangeAdd: 0.20}, "#484", "Attack Range +20%"),
        E("e_vamp", "Vampire Tooth", {vampire: 3}, "#a00", "Chance to Heal 3 HP on Kill"),
        E("e_shield", "Heavy Shield", {hpAdd: 25, def:0.05}, "#668", "Max HP +25, Def +5%"),
        
        E("e_lucky", "Lucky Clover", {dropRateAdd: 0.10}, "#0f0", "Item Drop Rate +10%"),
        E("e_barrier", "Barrier Prism", {}, "#0ff", "Gains 30% dmg reduction barrier every 10s (Max 3)."),

        E("e_thorns", "Thorn Vest", {def:0.05}, "#582", "Reflects 10 dmg to attacker."),
        E("e_rage", "Berserk Helm", {}, "#a22", "Damage increases as HP drops."),
        E("e_ghost", "Ghost Cape", {}, "#ddd", "15% chance to dodge attacks."),
        E("e_magnet", "Gold Magnet", {}, "#fd0", "Greatly increases Pickup Range."),
        E("e_battery", "Energy Cell", {cdMult:-0.10}, "#0ff", "Skill Cooldown reduced by 10%."),
        E("e_kevlar", "Kevlar Vest", {}, "#444", "Reduces projectile damage by 30%."),
        E("e_lifering", "Life Ring", {}, "#f88", "Regenerates 1% Max HP per second."),
        E("e_titan", "Titan Glove", {}, "#842", "All Dmg +20%, Cooldown Time +20%.")
    ];

    // --- MOVEMENT CARDS ---
    actionLibrary.push(M("move_strafe", "Strafe", "Orbits enemies, then RUSHES in when close.", "#d0d"));
    actionLibrary.push(M("move_kite", "Kite", "Maintain a safe distance (Kiting) from enemies.", "#0d0"));
    actionLibrary.push(M("move_dash", "Boots", "Movement speed is increased by +40%.", "#0ee"));
    actionLibrary.push(M("move_guard", "Guard", "Reduces damage taken by 50% while moving.", "#88a"));
    actionLibrary.push(M("move_warp", "Warp", "Instantly Teleports near the target if distance is far.", "#a0f"));
    actionLibrary.push(M("move_spike", "Spike", "Deals body-contact damage to enemies while moving.", "#e66"));
    actionLibrary.push(M("move_ghost", "Ghost", "30% chance to Evade (nullify) attacks while moving.", "#fff"));
    actionLibrary.push(M("move_mag", "Magnet", "Item (Potion/Chest) pickup range is tripled.", "#ff0"));
    actionLibrary.push(M("move_reflect", "Deflect", "Nullifies incoming enemy projectiles from the front while moving.", "#0dd"));
    actionLibrary.push(M("move_barrage", "Barrage", "Automatically fires weak shots at nearby enemies while moving.", "#f0f"));
    actionLibrary.push(M("move_phase", "Phase", "Periodically teleports you forward while moving.", "#a0f"));
}

function getCardById(id) {
    let c = actionLibrary.find(x => x.id === id) || equipLibrary.find(x => x.id === id);
    return c ? {...c, currentCooldown: 0} : null;
}
