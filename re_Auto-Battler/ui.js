/* Sandbox Auto-Battler V35 - UI & Rendering */

function drawGrid() {
    stroke(25); strokeWeight(1);
    let startX = floor(camX / 50) * 50;
    let startY = floor(camY / 50) * 50;
    let endX = startX + width + 50;
    let endY = startY + height + 50;
    for(let i=startX; i<endX; i+=50) if(i>=0 && i<=WORLD_W) line(i, max(0, camY), i, min(WORLD_H, camY + height - UI_HEIGHT));
    for(let i=startY; i<endY; i+=50) if(i>=0 && i<=WORLD_H) line(max(0, camX), i, min(WORLD_W, camX + width), i);
    noStroke();
}

function drawTitle() {
    textAlign(CENTER); fill(255); textSize(40); 
    drawingContext.shadowBlur = 30; drawingContext.shadowColor = "#fff";
    text("SANDBOX AUTO-BATTLER V35", width/2, height/2 - 50); 
    drawingContext.shadowBlur = 0;
    textSize(20); fill(255,255,0); text("Merchant & Skills Update", width/2, height/2);
    textSize(14); fill(150); text("[Z] Class Selection", width/2, height/2 + 50);
}

function drawClassSelect() {
    textAlign(CENTER); fill(255); textSize(24); text("SELECT YOUR STYLE", width/2, 80);
    let w = 140; let gap = 20; let sx = (width - (4*w + 3*gap))/2;
    for(let i=0; i<4; i++) {
        let x = sx + i*(w+gap); let y = 150;
        stroke(i===classIndex ? color(255,255,0) : 60); strokeWeight(i===classIndex?3:1);
        if(i===classIndex) { drawingContext.shadowBlur = 20; drawingContext.shadowColor = "#ff0"; }
        fill(20); rect(x,y,w,200,5); drawingContext.shadowBlur = 0;
        noStroke(); fill(255); textSize(16); text(CLASSES[i], x+w/2, y+30);
        fill(150); textSize(10); textAlign(CENTER, TOP);
        let desc = "";
        if(i===0) desc = "Melee focus.\nStart with: Slash, Hammer, Charge.";
        if(i===1) desc = "Ranged focus.\nStart with: Bow, Boomerang, Turret.";
        if(i===2) desc = "Magic focus.\nStart with: Flame, Cleave, Beam.";
        if(i===3) desc = "Random balanced start.";
        text(desc, x+10, y+60, w-20, 100); textAlign(CENTER);
    }
}

function drawGame() {
    for(let d of drops) d.draw();
    for(let t of deployables) t.draw();
    for(let e of enemies) e.draw();
    if(player) player.draw();
    for(let p of projectiles) p.draw();
    for(let p of enemyProjectiles) p.draw();
    for(let p of particles) p.draw();
}

function drawUI() {
    push(); translate(0, height - UI_HEIGHT);
    fill(255); textSize(12); textAlign(LEFT, TOP);
    text(`WAVE: ${wave} | LV: ${player.level} | CLASS: ${playerClass}`, 15, 15); 
    text(`SCORE: ${score}`, 15, 30);
    
    fill(150); text(`HP: ${player.hp}/${player.maxHp}`, 15, 50);
    fill(100,255,100); text(`POTIONS: ${player.potionStock}/${3 + player.getStat("potionStockAdd")}`, 15, 65);

    if (player.state === "RELOADING") { fill(255,50,50); text("RELOADING...", 15, 85); }
    else if (player.state === "LOOTING") { fill(255,215,0); text("SEEKING LOOT", 15, 85); }
    else if (player.state === "CASTING") { fill(255,150,0); text("CASTING...", 15, 85); }
    
    drawEquipmentUI(width - 220, 10);
    
    fill(200); text("MOVEMENT:", 130, 15);
    stroke(40); noFill(); rect(130, 35, 50, 90, 5);
    let moveCard = deck.find(c => c.type === "MOVE");
    if(moveCard) {
        drawCardSimple(130, 35, 50, moveCard, false, true);
    }

    let startX = 210; 
    fill(200); text("ACTION DECK:", startX, 15);
    
    let actionDeck = deck.filter(c => c.category === "ACTION");
    let cardW = 50; let gap = 10; 
    for(let i=0; i<actionDeck.length; i++) { 
        let c = actionDeck[i]; let x = startX + i * (cardW + gap); let y = 35; 
        let isSelected = (c === player.currentCard) || (deck.indexOf(c) === player.deckIndex); 
        drawCardSimple(x, y, cardW, c, isSelected, true); 
    }
    pop();
}

function drawEquipmentUI(x, y) {
    fill(200); textSize(12); text("EQUIPMENT:", x, y+5);
    let eqSize = 40; let gap = 10;
    for(let i=0; i<MAX_EQUIP_SIZE; i++) { 
        let ex = x + i*(eqSize+gap); let ey = y + 25; 
        stroke(40); fill(15); rect(ex, ey, eqSize, eqSize, 2); 
        if(i < equipment.length) drawCardSimple(ex, ey, eqSize, equipment[i], false, false); 
    }
}

function drawCardSimple(x, y, w, c, selected, showStats) {
    let h = (c.category === "EQUIP") ? w : w * 1.8; 
    strokeWeight(1);
    
    let rarityColor = RARITY_COLORS[c.rarity] || "#888";
    if (c.type === "MOVE") rarityColor = "#0ff";
    if (c.category === "EQUIP") rarityColor = "#ed0";

    if (selected) { stroke(255, 255, 0); strokeWeight(2); drawingContext.shadowBlur = 10; drawingContext.shadowColor = "#ff0"; } 
    else stroke(rarityColor);
    
    if (c.category === "EQUIP") fill(30, 25, 10); else fill(20);
    if (c.type === "MOVE") rect(x, y, w, h, 10); else rect(x, y, w, h, 3);
    drawingContext.shadowBlur = 0;

    if(c.category !== "EQUIP" && c.type !== "MOVE") { noStroke(); let sysColor = SYSTEM_COLORS[c.system] || "#999"; fill(sysColor); rect(x+1, y+1, w-2, 10); } 
    else if (c.category === "EQUIP") { noFill(); stroke(c.color); rect(x+3, y+3, w-6, h-6); }
    
    // --- 変更: レベルを上部に表示 ---
    if (showStats && c.category === "ACTION" && c.level > 1) {
         fill(255, 200, 50);
         textSize(8); textAlign(RIGHT, TOP);
         text(`Lv.${c.level}`, x+w-2, y+12);
         textAlign(CENTER, CENTER);
    }
    // -----------------------------

    noStroke(); fill(c.color); textSize(16); textAlign(CENTER, CENTER); 
    text(getIcon(c), x+w/2, y+h/2 - (showStats ? 15 : 0));
    
    stroke(0); strokeWeight(2); fill(rarityColor); 
    textSize(9); text(c.name.substring(0,6), x+w/2, y+18);
    noStroke();
    
    if (showStats && c.category === "ACTION") {
        fill(255,255,0); textSize(8); 
        text(c.system.toUpperCase(), x+w/2, y+h/2 + 5);

        let typeMult = 1.0;
        if(c.system === "Melee") typeMult = player.getStat("melee");
        if(c.system === "Ranged") typeMult = player.getStat("range");
        if(c.system === "Magic") typeMult = player.getStat("magic");
        let lvlMult = 1.0 + ((c.level || 1) - 1) * 0.15;
        let displayPower = Math.floor(c.val * typeMult * lvlMult);

        fill(200,200,255); textSize(8); text(c.id==="assassin"||c.id==="giga_laser"||c.id==="railgun"?"INF":`R:${c.range}`, x+w/2, y+h-32);
        fill(100,255,255); text(`${(c.cooldownMax/60).toFixed(1)}s`, x+w/2, y+h-22);
        fill(255,100,100); let pwrTxt = c.tag==="HEAL" ? `+${displayPower}` : `P:${displayPower}`; text(pwrTxt, x+w/2, y+h-12);
    } else if (c.type === "MOVE" && showStats) {
        fill(0,255,255); textSize(9); text("PASSIVE", x+w/2, y+h-15);
    }
    
    if(showStats && c.currentCooldown > 0) { fill(0,0,0,150); noStroke(); let ch = h * (c.currentCooldown / c.cooldownMax); rect(x, y+h-ch, w, ch); }
}

function getIcon(c) {
    if(c.category === "EQUIP") return "🛡️";
    if(c.type === "MOVE") return "👟";
    if(c.id==="assassin" || c.id==="gatotsu") return "🗡️";
    if(c.id==="boomerang") return "🪃";
    if(c.id==="turret") return "🤖";
    if(c.id==="orbit_fire") return "🔥";
    if(c.id==="air_raid") return "✈️";
    if(c.id==="life_drain") return "🩸";
    if(c.tag==="HEAL") return "❤️";
    if(c.id==="poison") return "☠️";
    if(c.id==="blizzard" || c.id==="shadow_bind") return "❄️";
    if(c.id==="fireball" || c.id==="slow_sphere") return "☄️";
    if(c.id==="giga_laser") return "🌠";
    if(c.id==="thunder" || c.id==="stun_gun") return "⚡";
    if(c.id==="vortex" || c.id==="gravity" || c.id==="black_hole") return "🌀";
    if(c.id==="nova" || c.id==="cleave" || c.id==="repel") return "🌊";
    if(c.id === "sniper") return "🎯";
    if(c.id === "shotgun") return "🔫";
    if(c.id === "m_gun") return "🔫";
    if(c.id === "beam") return "🔦";
    if(c.id === "fan_laser") return "📶";
    if(c.id === "flamethrower") return "🔥";
    if(c.id === "backstep" || c.id === "teleport") return "💨";
    if(c.id === "ragnarok") return "🌋";
    if(c.id === "barrage") return "🥊";
    if(c.id === "cluster" || c.id === "cluster_bomb") return "💣";
    if(c.id === "meteor") return "☄️";
    if(c.id === "shooting_star") return "🌟";
    if(c.id === "railgun") return "🚄";
    if(c.id === "icicle") return "🧊";

    if(c.system==="Magic") return "✨";
    return "⚔️";
}

function drawSelectionScreen(title, subtitle) {
    fill(0,0,0,220); rect(0,0,width,height); textAlign(CENTER); fill(255); textSize(24); text(title, width/2, 80); textSize(16); fill(200); text(subtitle, width/2, 110);
    let startX = 40; let cardW = 120; let gap = 20;
    for(let i=0; i<CARD_CHOICES; i++) {
        let c = rewardOptions[i]; let x = startX + i*(cardW+gap); let y = 150;
        stroke(i===rewardIndex ? color(255,255,0) : 60); strokeWeight(i===rewardIndex?3:1); fill(c.category==="EQUIP"? color(30,25,15) : 20); rect(x,y,cardW,200,6); noStroke(); 
        
        let rarityCol = RARITY_COLORS[c.rarity] || "#fff";
        fill(c.color); textSize(16); text(c.name, x+cardW/2, y+25); 
        fill(rarityCol); textSize(10); text(c.rarity || c.category, x+cardW/2, y+45);

        if(c.category === "ACTION") { let sysColor = SYSTEM_COLORS[c.system] || "#999"; fill(sysColor); text(`[${c.system.toUpperCase()}]`, x+cardW/2, y+60); }
        if(c.category === "ACTION") {
            fill(200,200,255); textSize(11); text(`Range: ${c.id==="assassin"||c.id==="giga_laser"||c.id==="railgun"?"INF":c.range}`, x+cardW/2, y+85); text(`Cooldown: ${(c.cooldownMax/60).toFixed(1)}s`, x+cardW/2, y+100); 
            
            let typeMult = 1.0;
            if(c.system === "Melee") typeMult = player.getStat("melee");
            if(c.system === "Ranged") typeMult = player.getStat("range");
            if(c.system === "Magic") typeMult = player.getStat("magic");
            let pwr = Math.floor(c.val * typeMult);
            text(`Power: ${pwr}`, x+cardW/2, y+115);

            if(deck.some(d => d.id === c.id)) {
                fill(255, 200, 50); text("LEVEL UP!", x+cardW/2, y+130);
                fill(255); textAlign(CENTER, TOP); text(c.desc, x+10, y+150, cardW-20, 80);
            } else {
                fill(255); textAlign(CENTER, TOP); text(c.desc, x+10, y+135, cardW-20, 80);
            }
        } else { fill(255); textAlign(CENTER, TOP); text(c.desc, x+10, y+80, cardW-20, 120); } textAlign(CENTER);
    }
    fill(200); textSize(14); text("[X] SKIP SELECTION", width/2, 420);
}

function drawSkillTree() {
    fill(0,0,0,230); rect(0,0,width,height);
    textAlign(CENTER); fill(255); textSize(30); text("SKILL TREE", width/2, 60);
    textSize(16); fill(255,255,100); text(`SKILL POINTS: ${player.sp}`, width/2, 90);
    
    // --- 変更: スキルツリー数値 ---
    let skills = [
        { name: "VITALITY", val: player.upgrades.hp, desc: "Max HP +25" },
        { name: "STRENGTH", val: player.upgrades.atk, desc: "Damage +15%" },
        { name: "AGILITY", val: player.upgrades.spd, desc: "Speed +10%" },
        { name: "RANGE", val: player.upgrades.range, desc: "Attack Range +10%" },
        { name: "LUCK", val: player.upgrades.luck, desc: "Drop Rate +2.5%" },
        { name: "DEFENSE", val: player.upgrades.def, desc: "Dmg Cut +5%" }
    ];
    // --------------------------
    
    let startX = 150; let gapX = 250; 
    let startY = 180; let gapY = 150;
    
    for(let i=0; i<6; i++) {
        let r = floor(i/3);
        let c = i%3;
        let x = startX + c*gapX; 
        let y = startY + r*gapY;
        
        stroke(i===skillIndex ? color(255,255,0) : 80); strokeWeight(i===skillIndex?3:1);
        fill(30); rect(x-80, y-50, 160, 100, 10);
        noStroke(); fill(255); textSize(16); text(skills[i].name, x, y-20);
        textSize(24); fill(100,255,100); text(`+${skills[i].val}`, x, y+10);
        textSize(10); fill(180); text(skills[i].desc, x, y+35);
    }
    
    fill(200); textSize(14); text("[Z] Upgrade & Continue", width/2, 550);
}

function drawDiscardScreen(title, list, type) {
    fill(0,0,0,220); rect(0,0,width,height); textAlign(CENTER); fill(255,50,50); textSize(24); text(title, width/2, 80);
    let w=50; let gap=10; let totalW = list.length*(w+gap); let sx = (width-totalW)/2;
    for(let i=0; i<list.length; i++) { let c = list[i]; let x = sx + i*(w+gap); let y=200; let isSelected = (i === discardIndex); drawCardSimple(x, y, w, c, isSelected, false); if(isSelected) { fill(255); textSize(12); text(c.name + ": " + c.desc, width/2, 320); } }
    fill(100,255,100); text("NEW ITEM:", width/2, 360); if(pendingCard) drawCardSimple(width/2 - 25, 380, 50, pendingCard, false, false);
}

function drawGameOver() {
    fill(0,0,0,200); rect(0,0,width,height); textAlign(CENTER); fill(255,0,0); textSize(40); text("GAME OVER", width/2, height/2);
    fill(255); textSize(20); text(`Score: ${score}`, width/2, height/2+40); text("[Z] Return to Title", width/2, height/2+80);
}
