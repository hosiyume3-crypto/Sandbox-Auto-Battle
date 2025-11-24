/* Sandbox Auto-Battler V35 - UI & Rendering */

// --- UI Helper Functions ---
function isMouseOver(x, y, w, h) {
    return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function drawButton(x, y, w, h, label, isHover, colOverride) {
    push();
    let baseColor = colOverride || "#0ff";
    
    if (isHover) {
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = baseColor;
        fill(red(baseColor), green(baseColor), blue(baseColor), 50);
        stroke(baseColor);
        strokeWeight(2);
    } else {
        drawingContext.shadowBlur = 0;
        fill(20, 20, 25, 230);
        stroke(100);
        strokeWeight(1);
    }
    
    rect(x, y, w, h, 8);
    
    noStroke();
    fill(isHover ? 255 : 220);
    textSize(16);
    textStyle(BOLD); 
    textAlign(CENTER, CENTER);
    text(label, x + w/2, y + h/2);
    pop();
}

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
    textAlign(CENTER); fill(255); textSize(40); textStyle(BOLD);
    drawingContext.shadowBlur = 30; drawingContext.shadowColor = "#fff";
    text("SANDBOX AUTO-BATTLER V35", width/2, height/2 - 100); 
    drawingContext.shadowBlur = 0;
    textSize(20); fill(255,255,0); text("Merchant & Skills Update", width/2, height/2 - 50);
    
    let btnW = 240, btnH = 50;
    let startX = width/2 - btnW/2;
    let startY = height/2 + 20;
    let libY = height/2 + 90;

    let hoverStart = isMouseOver(startX, startY, btnW, btnH);
    drawButton(startX, startY, btnW, btnH, "ゲームスタート", hoverStart, "#0f0");

    let hoverLib = isMouseOver(startX, libY, btnW, btnH);
    drawButton(startX, libY, btnW, btnH, "カード図鑑", hoverLib, "#08f");
}

function drawLibrary() {
    background(15);
    
    let bottomPanelH = 240;
    let panelY = height - bottomPanelH;
    
    textAlign(LEFT, TOP); fill(255); textSize(24); textStyle(BOLD);
    text("カード図鑑", 30, 20);
    
    fill(25); noStroke();
    rect(0, height - bottomPanelH, width, bottomPanelH);
    stroke(50); line(0, height - bottomPanelH, width, height - bottomPanelH);
    
    let tabW = 120, tabH = 35;
    let tabs = ["ACTION", "MOVE", "EQUIP"];
    let tabSX = 30;
    let tabSY = panelY + 15;
    
    for(let i=0; i<tabs.length; i++) {
        let t = tabs[i];
        let x = tabSX + i*(tabW+10);
        let isActive = (libraryTab === t);
        let isHover = isMouseOver(x, tabSY, tabW, tabH);
        
        drawButton(x, tabSY, tabW, tabH, t, isHover || isActive, isActive ? "#ff0" : "#888");
    }

    if (libraryTab === "ACTION") {
        let filters = ["ALL", "MELEE", "RANGED", "MAGIC"];
        let filterW = 80, filterH = 25;
        let filterSX = width - (filters.length * (filterW + 10)) - 30;
        let filterSY = panelY + 20;
        
        for(let i=0; i<filters.length; i++) {
            let f = filters[i];
            let x = filterSX + i*(filterW+10);
            let isActive = (libraryActionFilter === f);
            let isHover = isMouseOver(x, filterSY, filterW, filterH);
            
            drawButton(x, filterSY, filterW, filterH, f, isHover || isActive, isActive ? "#0f0" : "#555");
        }
    }
    
    let list = [];
    if(libraryTab === "ACTION") {
        list = actionLibrary.filter(c => c.category === "ACTION");
        if (libraryActionFilter !== "ALL") {
            let targetSys = libraryActionFilter.charAt(0).toUpperCase() + libraryActionFilter.slice(1).toLowerCase();
            list = list.filter(c => c.system === targetSys);
        }
    }
    else if(libraryTab === "MOVE") list = actionLibrary.filter(c => c.category === "MOVE");
    else list = equipLibrary;
    
    let gridSX = 50, gridSY = 60;
    let cardW = 60, gap = 15;
    let cols = floor((width - 100) / (cardW + gap));
    
    let activeName = "";
    let activeDesc = "カードにカーソルを合わせると詳細が表示されます。";
    let activeColor = "#fff";

    for(let i=0; i<list.length; i++) {
        let c = list[i];
        let col = i % cols;
        let row = floor(i / cols);
        let x = gridSX + col*(cardW+gap);
        let y = gridSY + row*(cardW*1.5 + gap);
        
        if (y + cardW*1.5 > panelY) continue;

        let isHover = isMouseOver(x, y, cardW, cardW*1.5);
        if (isHover) {
            activeName = c.name;
            activeDesc = c.desc;
            activeColor = c.color;
        }

        if(c.category === "EQUIP") {
             drawCardSimple(x, y, cardW, c, isHover, false);
        } else {
             drawCardSimple(x, y, cardW, c, isHover, true);
        }
    }
    
    let descBoxX = 30;
    let descBoxY = panelY + 65;
    let descBoxW = width - 200;
    let descBoxH = 150;
    
    fill(10); stroke(60); strokeWeight(1);
    rect(descBoxX, descBoxY, descBoxW, descBoxH, 5);
    
    if (activeName !== "") {
        noStroke(); fill(activeColor); textSize(20); textAlign(LEFT, TOP); textStyle(BOLD);
        text(activeName, descBoxX + 15, descBoxY + 10);
        fill(200); textSize(14); textStyle(NORMAL);
        text(activeDesc, descBoxX + 15, descBoxY + 45, descBoxW - 30, descBoxH - 50);
    } else {
        fill(100); textSize(16); textAlign(CENTER, CENTER);
        text(activeDesc, descBoxX + descBoxW/2, descBoxY + descBoxH/2);
    }
    
    let backW = 120, backH = 50;
    let backX = width - backW - 30;
    let backY = height - 70;
    let hoverBack = isMouseOver(backX, backY, backW, backH);
    drawButton(backX, backY, backW, backH, "戻る", hoverBack, "#f55");
}

function drawPauseMenu() {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    let menuW = 300, menuH = 250;
    let menuX = width/2 - menuW/2;
    let menuY = height/2 - menuH/2;
    
    fill(20); stroke(100); strokeWeight(2);
    drawingContext.shadowBlur = 20; drawingContext.shadowColor = "#000";
    rect(menuX, menuY, menuW, menuH, 10);
    drawingContext.shadowBlur = 0;
    
    noStroke(); fill(255); textSize(24); textAlign(CENTER, TOP); textStyle(BOLD);
    text("PAUSED", width/2, menuY + 30);
    
    let btnW = 200, btnH = 50;
    let btnX = width/2 - btnW/2;
    
    let resumeY = menuY + 90;
    let hoverResume = isMouseOver(btnX, resumeY, btnW, btnH);
    drawButton(btnX, resumeY, btnW, btnH, "再開", hoverResume, "#282");
    
    let titleY = menuY + 160;
    let hoverTitle = isMouseOver(btnX, titleY, btnW, btnH);
    drawButton(btnX, titleY, btnW, btnH, "タイトルへ戻る", hoverTitle, "#822");
}

function drawClassSelect() {
    textAlign(CENTER); fill(255); textSize(24); textStyle(BOLD); text("スタイル選択", width/2, 80);
    let w = 140; let gap = 20; let sx = (width - (4*w + 3*gap))/2;
    let classesJP = ["ウォーリアー", "レンジャー", "メイジ", "フリーランサー"];
    
    for(let i=0; i<4; i++) {
        let x = sx + i*(w+gap); let y = 150;
        let isHover = isMouseOver(x, y, w, 200);
        
        stroke(i===classIndex || isHover ? color(255,255,0) : 60); 
        strokeWeight(i===classIndex || isHover ? 3 : 1);
        
        if(i===classIndex || isHover) { drawingContext.shadowBlur = 20; drawingContext.shadowColor = "#ff0"; }
        
        fill(20); rect(x,y,w,200,5); drawingContext.shadowBlur = 0;
        noStroke(); fill(255); textSize(16); text(classesJP[i], x+w/2, y+30);
        fill(150); textSize(10); textAlign(CENTER, TOP);
        let desc = "";
        if(i===0) desc = "近接特化。\n初期: 斬撃, ハンマー, チャージタックル";
        if(i===1) desc = "遠距離特化。\n初期: 弓矢, ブーメラン, タレット";
        if(i===2) desc = "魔法特化。\n初期: ファイア, 衝撃波, ビーム";
        if(i===3) desc = "バランス型。";
        text(desc, x+10, y+60, w-20, 100); textAlign(CENTER);
    }
    
    let backW = 120, backH = 40;
    let backX = width/2 - backW/2;
    let backY = 450;
    let hoverBack = isMouseOver(backX, backY, backW, backH);
    drawButton(backX, backY, backW, backH, "戻る", hoverBack, "#555");
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
    fill(255); textSize(12); textAlign(LEFT, TOP); textStyle(BOLD);
    let classJP = "フリーランサー";
    if(playerClass === "WARRIOR") classJP = "ウォーリアー";
    if(playerClass === "RANGER") classJP = "レンジャー";
    if(playerClass === "MAGE") classJP = "メイジ";
    
    text(`WAVE: ${wave} | LV: ${player.level} | CLASS: ${classJP}`, 15, 15); 
    text(`SCORE: ${score}`, 15, 30);
    
    fill(150); text(`HP: ${player.hp}/${player.maxHp}`, 15, 50);
    fill(100,255,100); text(`POTIONS: ${player.potionStock}/${3 + player.getStat("potionStockAdd")}`, 15, 65);

    if (player.state === "RELOADING") { fill(255,50,50); text("リロード中...", 15, 85); }
    else if (player.state === "LOOTING") { fill(255,215,0); text("アイテム収集中", 15, 85); }
    else if (player.state === "CASTING") { fill(255,150,0); text("詠唱中...", 15, 85); }
    
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
    
    let menuBtnSize = 40;
    let menuBtnX = width - 50;
    let menuBtnY = 70; 
    let hoverMenu = isMouseOver(menuBtnX, menuBtnY, menuBtnSize, menuBtnSize);
    drawButton(menuBtnX, menuBtnY, menuBtnSize, menuBtnSize, "||", hoverMenu, "#aaa");
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
    if (c.category === "EQUIP") rarityColor = "#fff"; 

    if (selected) { stroke(255, 255, 0); strokeWeight(2); drawingContext.shadowBlur = 10; drawingContext.shadowColor = "#ff0"; } 
    else stroke(rarityColor);
    
    if (c.category === "EQUIP") fill(30, 25, 10); else fill(20);
    if (c.type === "MOVE") rect(x, y, w, h, 10); else rect(x, y, w, h, 3);
    drawingContext.shadowBlur = 0;

    if(c.category !== "EQUIP" && c.type !== "MOVE") { noStroke(); let sysColor = SYSTEM_COLORS[c.system] || "#999"; fill(sysColor); rect(x+1, y+1, w-2, 10); } 
    else if (c.category === "EQUIP") { noFill(); stroke(c.color); rect(x+3, y+3, w-6, h-6); }
    
    if (showStats && c.category === "ACTION" && c.level > 1) {
         fill(255, 200, 50);
         textSize(8); textAlign(RIGHT, TOP);
         text(`Lv.${c.level}`, x+w-2, y+12);
    }

    // --- 変更: 中央揃えを適用 ---
    textAlign(CENTER, CENTER);
    // -------------------------
    
    stroke(0); strokeWeight(2); fill(rarityColor); 
    textSize(9); text(c.name.substring(0,6), x+w/2, y+18);
    noStroke();
    
    if (showStats && c.category === "ACTION") {
        fill(255,255,0); textSize(8); 
        text(c.system.toUpperCase(), x+w/2, y+h/2 + 5);

        let typeMult = 1.0;
        if(player && c.system === "Melee") typeMult = player.getStat("melee");
        if(player && c.system === "Ranged") typeMult = player.getStat("range");
        if(player && c.system === "Magic") typeMult = player.getStat("magic");
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

function drawSelectionScreen(title, subtitle) {
    fill(0,0,0,220); rect(0,0,width,height); textAlign(CENTER); fill(255); textSize(24); textStyle(BOLD); text(title, width/2, 80); textSize(16); fill(200); text(subtitle, width/2, 110);
    
    let cardW = 120; 
    let gap = 40; 
    let totalW = CARD_CHOICES * cardW + (CARD_CHOICES - 1) * gap;
    let startX = (width - totalW) / 2;

    for(let i=0; i<CARD_CHOICES; i++) {
        let c = rewardOptions[i]; let x = startX + i*(cardW+gap); let y = 150;
        let isHover = isMouseOver(x, y, cardW, 200);
        
        stroke((i===rewardIndex || isHover) ? color(255,255,0) : 60); 
        strokeWeight((i===rewardIndex || isHover) ? 3:1); 
        
        fill(c.category==="EQUIP"? color(30,25,15) : 20); rect(x,y,cardW,200,6); noStroke(); 
        
        let rarityCol = RARITY_COLORS[c.rarity] || "#fff";
        if(c.category === "EQUIP") rarityCol = "#fff";
        
        fill(c.color); textSize(16); text(c.name, x+cardW/2, y+25); 
        fill(rarityCol); textSize(10); text(c.rarity || c.category, x+cardW/2, y+45);

        if(c.category === "ACTION") { let sysColor = SYSTEM_COLORS[c.system] || "#999"; fill(sysColor); text(`[${c.system.toUpperCase()}]`, x+cardW/2, y+60); }
        if(c.category === "ACTION") {
            fill(200,200,255); textSize(11); text(`Range: ${c.id==="assassin"||c.id==="giga_laser"||c.id==="railgun"?"INF":c.range}`, x+cardW/2, y+85); text(`CD: ${(c.cooldownMax/60).toFixed(1)}s`, x+cardW/2, y+100); 
            
            let typeMult = 1.0;
            if(player) {
                if(c.system === "Melee") typeMult = player.getStat("melee");
                if(c.system === "Ranged") typeMult = player.getStat("range");
                if(c.system === "Magic") typeMult = player.getStat("magic");
            }
            let pwr = Math.floor(c.val * typeMult);
            text(`Power: ${pwr}`, x+cardW/2, y+115);

            fill(255); textAlign(CENTER, TOP); textSize(10); textLeading(14);
            text(c.desc, x+5, y+135, cardW-10, 80);
        } else { 
            fill(255); textAlign(CENTER, TOP); textSize(10); textLeading(14);
            text(c.desc, x+5, y+80, cardW-10, 120); 
        } 
        textAlign(CENTER);
    }
    
    let skipW = 160, skipH = 40;
    let skipX = width/2 - skipW/2;
    let skipY = 420;
    let hoverSkip = isMouseOver(skipX, skipY, skipW, skipH);
    drawButton(skipX, skipY, skipW, skipH, "選択をスキップ", hoverSkip, "#999");
}

function drawSkillTree() {
    fill(0,0,0,230); rect(0,0,width,height);
    textAlign(CENTER); fill(255); textSize(30); textStyle(BOLD); text("SKILL TREE", width/2, 60);
    textSize(16); fill(255,255,100); text(`SKILL POINTS: ${player.sp}`, width/2, 90);
    
    let skills = [
        { name: "VITALITY", val: player.upgrades.hp, desc: "最大HP +25" },
        { name: "STRENGTH", val: player.upgrades.atk, desc: "全ダメージ +15%" },
        { name: "AGILITY", val: player.upgrades.spd, desc: "移動速度 +10%" },
        { name: "RANGE", val: player.upgrades.range, desc: "攻撃範囲 +10%" },
        { name: "LUCK", val: player.upgrades.luck, desc: "ドロップ率 +2.5%" },
        { name: "DEFENSE", val: player.upgrades.def, desc: "被ダメージ軽減 +5%" }
    ];
    
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
    
    fill(200); textSize(14); text("[Z] またはクリックで強化して次へ", width/2, 550);
}

function drawDiscardScreen(title, list, type) {
    fill(0,0,0,220); rect(0,0,width,height); textAlign(CENTER); fill(255,50,50); textSize(24); textStyle(BOLD); text(title, width/2, 80);
    let w=50; let gap=10; let totalW = list.length*(w+gap); let sx = (width-totalW)/2;
    for(let i=0; i<list.length; i++) { 
        let c = list[i]; let x = sx + i*(w+gap); let y=200; 
        let isSelected = (i === discardIndex); 
        drawCardSimple(x, y, w, c, isSelected, false); 
        if(isSelected) { fill(255); textSize(12); text(c.name + ": " + c.desc, width/2, 320); } 
    }
    fill(100,255,100); text("NEW ITEM:", width/2, 360); if(pendingCard) drawCardSimple(width/2 - 25, 380, 50, pendingCard, false, false);
}

function drawGameOver() {
    fill(0,0,0,200); rect(0,0,width,height); textAlign(CENTER); fill(255,0,0); textSize(40); textStyle(BOLD); text("GAME OVER", width/2, height/2);
    fill(255); textSize(20); text(`Score: ${score}`, width/2, height/2+40); 
    
    let btnW = 240, btnH = 50;
    let btnX = width/2 - btnW/2;
    let btnY = height/2 + 80;
    let hoverBtn = isMouseOver(btnX, btnY, btnW, btnH);
    drawButton(btnX, btnY, btnW, btnH, "タイトルへ戻る", hoverBtn, "#88f");
}
