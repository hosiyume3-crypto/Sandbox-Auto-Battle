/* Sandbox Auto-Battler V35 - Main Loop & Game Logic */

// --- ASSETS & DATA ---
function setup() {
    createCanvas(VIEW_W, VIEW_H + UI_HEIGHT);
    frameRate(60);
    textFont("Noto Sans JP");
    initLibraries();
    camX = WORLD_W/2 - width/2;
    camY = WORLD_H/2 - height/2;
}

let totalKills = 0;
let spProgress = 0;
let killsForNextSp = 10;

// --- グローバルステート管理 ---
let libraryTab = "ACTION"; 
let libraryActionFilter = "ALL"; 
let isPaused = false;
let uiParticles = []; // 追加: UI用パーティクル配列

// --- MAIN LOOP ---
function draw() {
    background(10);
    updateMouseHover();
    
    if (player && gameState === "PLAY" && !isPaused) {
        let targetX = player.pos.x - width/2;
        let targetY = player.pos.y - (height - UI_HEIGHT)/2;
        camX = lerp(camX, targetX, 0.08);
        camY = lerp(camY, targetY, 0.08);
        
        if(shakePower > 0) {
            camX += random(-shakePower, shakePower);
            camY += random(-shakePower, shakePower);
            shakePower *= 0.9;
            if(shakePower < 0.5) shakePower = 0;
        }
    }

    if (gameState === "LIBRARY" || gameState === "TITLE") {
    } else {
        push();
        translate(-camX, -camY);
        drawGrid();
        if (gameState === "PLAY" || gameState === "PAUSE" || gameState.includes("SELECT") || gameState === "GAME_OVER" || gameState === "SKILL_TREE" || gameState.includes("DISCARD")) {
            if (gameState === "PLAY" && !isPaused) updateGame();
            drawGame();
        }
        pop();
    }

    if(screenFlash > 0) {
        noStroke(); fill(255, screenFlash); rect(0, 0, width, height - UI_HEIGHT);
        screenFlash *= 0.8; if(screenFlash < 5) screenFlash = 0;
    }

    // UI描画
    if (gameState === "TITLE") {
        drawTitle();
    } else if (gameState === "LIBRARY") {
        drawLibrary();
    } else if (gameState === "SELECT_CLASS") {
        drawClassSelect();
    } else {
        fill(20); noStroke(); rect(0, height - UI_HEIGHT, width, UI_HEIGHT);
        stroke(50); line(0, height - UI_HEIGHT, width, height - UI_HEIGHT); noStroke();
        drawUI();
        
        // --- 追加: UIパーティクルの描画 ---
        for(let i = uiParticles.length - 1; i >= 0; i--) {
            uiParticles[i].update();
            uiParticles[i].draw();
            if(uiParticles[i].dead) uiParticles.splice(i, 1);
        }
        // -------------------------------

        if (gameState === "PLAY" && isPaused) {
            drawPauseMenu();
        }
        else if (gameState === "LEVEL_UP") drawSelectionScreen("LEVEL UP!", "報酬を選択してください");
        else if (gameState === "SKILL_TREE") drawSkillTree();
        else if (gameState === "EQUIP_SELECT") drawSelectionScreen("RARE DROP!", "装備を選択してください");
        else if (gameState === "DISCARD_ACTION") drawDiscardScreen("デッキが一杯です", deck, "ACTION");
        else if (gameState === "DISCARD_EQUIP") drawDiscardScreen("装備が一杯です", equipment, "EQUIP");
        else if (gameState === "GAME_OVER") drawGameOver();
    }
}

function addShake(amount) { shakePower = min(shakePower + amount, 25); }
function triggerFlash(amount) { screenFlash = min(screenFlash + amount, 150); }

// --- マウスホバー状態の更新 ---
function updateMouseHover() {
    if (gameState === "LEVEL_UP" || gameState === "EQUIP_SELECT") {
        let startX = 40; let cardW = 120; let gap = 20;
        for(let i=0; i<CARD_CHOICES; i++) {
            let x = startX + i*(cardW+gap); let y = 150;
            if (isMouseOver(x, y, cardW, 200)) {
                rewardIndex = i; 
            }
        }
    } else if (gameState === "SKILL_TREE") {
        let startX = 150; let gapX = 250; 
        let startY = 180; let gapY = 150;
        for(let i=0; i<6; i++) {
            let r = floor(i/3); let c = i%3;
            let x = startX + c*gapX; let y = startY + r*gapY;
            if (isMouseOver(x-80, y-50, 160, 100)) {
                skillIndex = i;
            }
        }
    } else if (gameState.includes("DISCARD")) {
        let list = (gameState === "DISCARD_ACTION") ? deck : equipment;
        let w=50; let gap=10; let totalW = list.length*(w+gap); let sx = (width-totalW)/2;
        for(let i=0; i<list.length; i++) { 
            let x = sx + i*(w+gap); let y=200;
            if (isMouseOver(x, y, w, w*1.8)) {
                discardIndex = i;
            }
        }
    }
}

// --- マウス入力処理 ---
function mousePressed() {
    if (gameState === "TITLE") {
        let btnW = 240, btnH = 50;
        let startX = width/2 - btnW/2;
        let startY = height/2 + 20;
        let libY = height/2 + 90;
        
        if (isMouseOver(startX, startY, btnW, btnH)) {
            gameState = "SELECT_CLASS";
        }
        else if (isMouseOver(startX, libY, btnW, btnH)) {
            gameState = "LIBRARY";
        }
    } 
    else if (gameState === "LIBRARY") {
        let panelY = height - 240;
        let tabW = 120, tabH = 35;
        let tabs = ["ACTION", "MOVE", "EQUIP"];
        let tabSX = 30;
        let tabSY = panelY + 15;
        for(let i=0; i<tabs.length; i++) {
            let x = tabSX + i*(tabW+10);
            if(isMouseOver(x, tabSY, tabW, tabH)) {
                libraryTab = tabs[i];
                return;
            }
        }
        
        if (libraryTab === "ACTION") {
            let filters = ["ALL", "MELEE", "RANGED", "MAGIC"];
            let filterW = 80, filterH = 25;
            let filterSX = width - (filters.length * (filterW + 10)) - 30;
            let filterSY = panelY + 20;
            for(let i=0; i<filters.length; i++) {
                let x = filterSX + i*(filterW+10);
                if (isMouseOver(x, filterSY, filterW, filterH)) {
                    libraryActionFilter = filters[i];
                    return;
                }
            }
        }
        
        let backW = 120, backH = 50;
        let backX = width - backW - 30;
        let backY = height - 70;
        if(isMouseOver(backX, backY, backW, backH)) {
            gameState = "TITLE";
        }
    }
    else if (gameState === "SELECT_CLASS") {
        let w = 140; let gap = 20; let sx = (width - (4*w + 3*gap))/2;
        for(let i=0; i<4; i++) {
            let x = sx + i*(w+gap); let y = 150;
            if (isMouseOver(x, y, w, 200)) {
                classIndex = i;
                playerClass = CLASSES[classIndex];
                startGame();
                return;
            }
        }
        let backW = 120, backH = 40;
        let backX = width/2 - backW/2;
        let backY = 450;
        if(isMouseOver(backX, backY, backW, backH)) {
            gameState = "TITLE";
        }
    }
    else if (gameState === "PLAY") {
        let menuBtnSize = 40;
        let menuBtnX = width - 50;
        let menuBtnY = 70; 
        if (isMouseOver(menuBtnX, menuBtnY, menuBtnSize, menuBtnSize)) {
            isPaused = !isPaused;
        }
        
        if (isPaused) {
            let menuH = 250;
            let menuY = height/2 - menuH/2;
            let btnW = 200, btnH = 50;
            let btnX = width/2 - btnW/2;
            
            if (isMouseOver(btnX, menuY + 90, btnW, btnH)) {
                isPaused = false;
            }
            else if (isMouseOver(btnX, menuY + 160, btnW, btnH)) {
                isPaused = false;
                gameState = "TITLE";
            }
        }
    }
    else if (gameState === "LEVEL_UP" || gameState === "EQUIP_SELECT") {
        let startX = 40; let cardW = 120; let gap = 20;
        for(let i=0; i<CARD_CHOICES; i++) {
            let x = startX + i*(cardW+gap); let y = 150;
            if (isMouseOver(x, y, cardW, 200)) {
                rewardIndex = i;
                confirmSelection();
                return;
            }
        }
        
        // --- 追加: スキップボタン判定 ---
        let skipW = 160, skipH = 40;
        let skipX = width/2 - skipW/2;
        let skipY = 420;
        if (isMouseOver(skipX, skipY, skipW, skipH)) {
            gameState = (player.sp > 0) ? "SKILL_TREE" : "PLAY";
            particles.push(new TextParticle(player.pos.x, player.pos.y - 40, "SKIPPED", "#999"));
        }
        // ------------------------------
    }
    else if (gameState === "SKILL_TREE") {
        let startX = 150; let gapX = 250; 
        let startY = 180; let gapY = 150;
        let r = floor(skillIndex/3); let c = skillIndex%3;
        let x = startX + c*gapX; let y = startY + r*gapY;
        
        if (isMouseOver(x-80, y-50, 160, 100)) {
             if(player.sp > 0) {
                 player.sp--;
                 if(skillIndex === 0) player.upgrades.hp++;
                 if(skillIndex === 1) player.upgrades.atk++;
                 if(skillIndex === 2) player.upgrades.spd++;
                 if(skillIndex === 3) player.upgrades.range++;
                 if(skillIndex === 4) player.upgrades.luck++;
                 if(skillIndex === 5) player.upgrades.def++;

                 player.maxHp = 200 + player.upgrades.hp * 50 + player.getStat("hpAdd");
                 player.hp = min(player.hp + 50, player.maxHp);
                 particles.push(new TextParticle(width/2, height/2, "UPGRADE!", "#ff0"));
                 createImpactSparks(width/2, height/2, -HALF_PI, "#ff0", 20);
             }
             gameState = "PLAY";
        }
    }
    else if (gameState.includes("DISCARD")) {
        let list = (gameState === "DISCARD_ACTION") ? deck : equipment;
        let w=50; let gap=10; let totalW = list.length*(w+gap); let sx = (width-totalW)/2;
        for(let i=0; i<list.length; i++) { 
            let x = sx + i*(w+gap); let y=200;
            if (isMouseOver(x, y, w, w*1.8)) {
                discardIndex = i;
                confirmDiscard();
                return;
            }
        }
    }
}

// ... (updateGame, updateDeployables, updatePuddles, updateEnemies, spawnDrop, updateDrops, checkLevelUp, spawnEnemyGroup, updateProjectiles, distSq, createExplosion, createImpactSparks は変更なし)
// (省略します。元のコードをそのまま使用してください)
function updateGame() {
    const scaleFactor = Math.floor((wave - 1) / 5);
    let baseSpawnRate = 360; 
    let rateDecrease = Math.min(180, wave * 10 + scaleFactor * 30); 
    let spawnRate = baseSpawnRate - rateDecrease; 
    if(spawnRate < 180) spawnRate = 180; 

    if (frameCount % spawnRate === 0) spawnEnemyGroup();

    player.update();
    updateEnemies();
    updateDeployables();
    updateProjectiles(projectiles, enemies, true);
    updateProjectiles(enemyProjectiles, [player, ...deployables.filter(d=>d.type==="TURRET")], false);
    updateDrops();
    updatePuddles();
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].dead) particles.splice(i, 1);
    }
}

function updateDeployables() {
    for (let i = deployables.length - 1; i >= 0; i--) {
        deployables[i].update();
        if (deployables[i].dead) {
             if(deployables[i].type === "TURRET") particles.push(new ExplosionEffect(deployables[i].pos.x, deployables[i].pos.y, "#aa0", 5));
             deployables.splice(i, 1);
        }
    }
}

function updatePuddles() {
    for (let i = puddles.length - 1; i >= 0; i--) {
        puddles[i].life--;
        if (dist(player.pos.x, player.pos.y, puddles[i].x, puddles[i].y) < puddles[i].size/2) {
            if(frameCount % 30 === 0) player.takeDamage(5);
        }
        if (puddles[i].life <= 0) puddles.splice(i, 1);
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.update();
        if (e.dead) {
            totalKills++;
            spProgress++;
            if (spProgress >= killsForNextSp) {
                player.sp++;
                gameState = "SKILL_TREE";
                spProgress = 0;
                killsForNextSp = min(15, killsForNextSp + 1); 
            }

            if (e.type === "MERCHANT") {
                particles.push(new TextParticle(e.pos.x, e.pos.y, "JACKPOT!", "#fb0", 80));
                createExplosion(e.pos.x, e.pos.y, 0, 50, false, "#a0a");
                spawnDrop(e.pos.x, e.pos.y, "CHEST");
                spawnDrop(e.pos.x + 20, e.pos.y, "POTION");
                spawnDrop(e.pos.x - 20, e.pos.y, "POTION");
                score += 500;
            } else {
                let baseDropRate = 0.25; 
                baseDropRate += player.getStat("dropRateAdd");
                
                if(random() < baseDropRate) {
                    let r = random();
                    if (r < 0.10) spawnDrop(e.pos.x, e.pos.y, "CHEST");
                    else if (r < 0.60) spawnDrop(e.pos.x, e.pos.y, "POTION");
                    else spawnDrop(e.pos.x, e.pos.y, "HEART");
                }
                
                let vamp = player.getStat("vampire");
                if(vamp > 0 && random() < 0.2) {
                    player.heal(Math.ceil(vamp));
                    particles.push(new TextParticle(player.pos.x, player.pos.y-20, "HP DRAIN", "#f00"));
                }
                createExplosion(e.pos.x, e.pos.y, 0, 30, false, e.col);
                score += 100;
            }

            enemies.splice(i, 1);
            checkLevelUp();
        }
    }
}

function spawnDrop(x, y, type) { drops.push(new Drop(x, y, type)); }

function updateDrops() {
    let pickupRangeMult = (player.activeMoveCard && player.activeMoveCard.id === "move_mag") ? 3.0 : 1.0;
    for(let e of equipment) if(e.id === "e_magnet") pickupRangeMult += 1.0;

    for (let i = drops.length - 1; i >= 0; i--) {
        let d = drops[i];
        d.update();

        if ((d.type === "POTION" || d.type === "HEART") && d.age > 600) {
            drops.splice(i, 1);
            continue;
        }

        if (d.type === "HEART" && player.hp >= player.maxHp) continue;

        let distToP = dist(player.pos.x, player.pos.y, d.pos.x, d.pos.y);
        if (distToP < (player.size + d.size) * pickupRangeMult) {
            if(distToP > player.size + d.size) {
                 d.pos.add(p5.Vector.sub(player.pos, d.pos).setMag(6));
            } else {
                if (d.type === "POTION") {
                    let maxPots = 3 + player.getStat("potionStockAdd");
                    if(player.potionStock < maxPots) {
                        player.potionStock++;
                        particles.push(new TextParticle(player.pos.x, player.pos.y, "POTION", "#0f0"));
                        drops.splice(i, 1);
                    } else {
                         if(player.hp < player.maxHp) {
                             player.heal(Math.ceil(player.maxHp * 0.03)); 
                             drops.splice(i, 1);
                         }
                    }
                } else if (d.type === "CHEST") {
                    generateRewards("EQUIP");
                    gameState = "EQUIP_SELECT";
                    rewardIndex = 0;
                    triggerFlash(30);
                    addShake(5);
                    drops.splice(i, 1);
                } else if (d.type === "HEART") {
                    player.heal(Math.ceil(player.maxHp * 0.10)); 
                    particles.push(new TextParticle(player.pos.x, player.pos.y, "♥", "#f00"));
                    drops.splice(i, 1);
                }
            }
        }
    }
}

function checkLevelUp() {
    enemiesToNextLevel--;
    if (enemiesToNextLevel <= 0) {
        player.level++;
        generateRewards("ACTION"); 
        gameState = "LEVEL_UP";
        rewardIndex = 0;
        enemiesToNextLevel = 5 + Math.floor(wave * 2.5);
        wave++;
        triggerFlash(50);
        addShake(10);
    }
}

function spawnEnemyGroup() {
    if (random() < 0.02) { 
         let angle = random(TWO_PI);
         let spawnRadius = width/2 + 200; 
         let mx = player.pos.x + cos(angle) * spawnRadius;
         let my = player.pos.y + sin(angle) * spawnRadius;
         enemies.push(new Enemy(mx, my, "MERCHANT"));
         particles.push(new TextParticle(mx, my, "Merchant!", "#a0a", 120));
    }

    let r = random();
    let type = "BASIC"; 
    let groupCount = 1;

    if (wave >= 12 && random() < 0.3) groupCount = 2;

    for(let g=0; g<groupCount; g++) {
        let count = 1;
        if (wave >= 6 && random() < 0.2) { type = "PHALANX_TRIO"; count = 1; }
        else if (wave >= 10 && r > 0.7) {
            let r3 = random();
            if(r3 < 0.25) type = "PLAGUE"; else if (r3 < 0.5) type = "MEDUSA"; else if (r3 < 0.75) type = "CURSER"; else type = "HOOKER";
        } 
        else if (wave >= 8 && r < 0.3) { 
            let r2 = random();
            if (r2 < 0.25) type = "BARRIER"; else if (r2 < 0.5) type = "TWIN"; else if (r2 < 0.75) type = "BERSERKER"; else type = "HEAVY"; 
            count = (type === "TWIN") ? 2 : 1; 
        } else {
            if (wave > 3 && r < 0.15) type = "FLANKER"; else if (wave > 5 && r > 0.85) type = "HEAVY"; else if (wave > 2 && r < 0.3) type = "SHOOTER"; else if (wave > 4 && r < 0.75) type = "TANK"; else if (wave > 1 && r < 0.5) type = "SWARM";
            if (type === "SWARM") count = 3 + floor(wave/3); else if (type === "FLANKER") count = 2; else count = 1;
        }

        let spawnRadius = width/2 + 100; 
        let angleCenter = random(TWO_PI);
        
        if (type === "PHALANX_TRIO") {
            let bx = player.pos.x + cos(angleCenter) * spawnRadius;
            let by = player.pos.y + sin(angleCenter) * spawnRadius;
            let toPlayer = p5.Vector.sub(player.pos, createVector(bx,by)).normalize();
            let perp = createVector(-toPlayer.y, toPlayer.x);
            let e1 = new Enemy(bx, by, "P_TANK"); enemies.push(e1);
            let e2 = new Enemy(bx + perp.x*40 - toPlayer.x*30, by + perp.y*40 - toPlayer.y*30, "P_FIGHTER"); enemies.push(e2);
            let e3 = new Enemy(bx - perp.x*40 - toPlayer.x*60, by - perp.y*40 - toPlayer.y*60, "P_MAGE"); enemies.push(e3);
            particles.push(new Shockwave(bx, by, 50, "#aaa"));
        }
        else {
            for(let i=0; i<count; i++) {
                let angle = angleCenter + random(-0.5, 0.5);
                let sx = constrain(player.pos.x + cos(angle) * spawnRadius, 50, WORLD_W - 50);
                let sy = constrain(player.pos.y + sin(angle) * spawnRadius, 50, WORLD_H - 50);
                enemies.push(new Enemy(sx, sy, type));
                particles.push(new Shockwave(sx, sy, 30, "#fff"));
                if (type === "BARRIER") { enemies.push(new Enemy(sx+30, sy, "GUARD")); enemies.push(new Enemy(sx-30, sy, "GUARD")); }
            }
        }
        r = random();
    }
}

function updateProjectiles(list, targets, isPlayerOwner) {
    for (let i = list.length - 1; i >= 0; i--) {
        let p = list[i];
        p.update();
        
        if(frameCount % 2 === 0) {
             if(p.card.id === "flame" || p.card.id === "flamethrower") particles.push(new AfterImage(p.pos.x + random(-3,3), p.pos.y + random(-3,3), random(5,10), p.color, 10));
             else if(!p.isOrbiter) particles.push(new Spark(p.pos.x, p.pos.y, p.color, p.vel.heading() + PI, random(1,3), 5));
        }

        if(!p.dead) {
            if(!isPlayerOwner && player.state === "MOVING" && player.activeMoveCard && player.activeMoveCard.id === "move_reflect") {
                if(dist(p.pos.x, p.pos.y, player.pos.x, player.pos.y) < 40) {
                    particles.push(new TextParticle(p.pos.x, p.pos.y, "BLOCK", "#aaf"));
                    particles.push(new Shockwave(p.pos.x, p.pos.y, 20, "#aaf"));
                    createImpactSparks(p.pos.x, p.pos.y, p.vel.heading() + PI, "#aaf", 5);
                    p.dead = true;
                    continue;
                }
            }
            
            for (let t of targets) {
                if (t.dead) continue;
                let hitSize = (t instanceof Deployable) ? 20 : t.size/2 + 8;
                if(p.card.id === "giga_laser") hitSize += 25; 
                if(p.card.id === "slow_sphere") hitSize += 30; 

                if (dist(p.pos.x, p.pos.y, t.pos.x, t.pos.y) < hitSize) {
                    if (p.card.tag === "EXPLOSION") {
                        createExplosion(p.pos.x, p.pos.y, p.val, p.card.range, isPlayerOwner);
                        p.dead = true;
                        break;
                    }

                    if (p.card.id === "cluster") {
                         createExplosion(p.pos.x, p.pos.y, p.val, 60, isPlayerOwner, "#fa0"); 
                         for(let m=0; m<3; m++) {
                             let mbDir = p5.Vector.random2D();
                             let mb = new Projectile(p.pos.x, p.pos.y, mbDir, {id:"minibomb", tag:"EXPLOSION", range:60, color:"#fa0"}, p.val * 0.8, random(3,6));
                             mb.drag = 0.85; 
                             mb.life = 40 + random(20);
                             list.push(mb);
                         }
                         p.dead = true;
                         break;
                    }
                    
                    if (isPlayerOwner) {
                         t.takeDamage(p.val, p.card);
                         
                         if (t.type === "GUARD") {
                             p.dead = true;
                             createImpactSparks(p.pos.x, p.pos.y, p.vel.heading() + PI, "#fff", 5);
                             particles.push(new TextParticle(p.pos.x, p.pos.y, "BLOCKED", "#fff"));
                             break;
                         }

                         if (p.card.id === "shooting_star" && p.bounceCount > 0) {
                             p.bounceCount--;
                             let nextTarget = null;
                             let minD = 9999;
                             for(let cand of targets) {
                                 if(cand !== t && !cand.dead) {
                                     let d = dist(p.pos.x, p.pos.y, cand.pos.x, cand.pos.y);
                                     if(d < minD && d < 400) { minD = d; nextTarget = cand; }
                                 }
                             }
                             if(nextTarget) {
                                 let bounceDir = p5.Vector.sub(nextTarget.pos, p.pos).normalize();
                                 let newP = new Projectile(p.pos.x, p.pos.y, bounceDir, p.card, p.val * 0.9, 5); // Keep slow
                                 newP.bounceCount = p.bounceCount;
                                 list.push(newP);
                             }
                             p.dead = true;
                             break;
                         }
                    }
                    else {
                         let dmg = p.val;
                         for(let e of equipment) if(e.id === "e_kevlar") dmg *= 0.7;
                         t.takeDamage(dmg, {pos: p.pos}); 

                         if(p.card.tag === "PETRIFY") t.applyStatus("STUN", 60);
                         if(p.card.tag === "SLOW") t.applyStatus("SLOW", 120);
                         if(p.card.tag === "POISON") t.applyStatus("POISON", 300);
                         if(p.card.tag === "HOOK") {
                             let pullDir = p.vel.copy().normalize().mult(-1);
                             t.pos.add(pullDir.mult(150)); 
                             particles.push(new TextParticle(t.pos.x, t.pos.y, "HOOKED!", "#f00"));
                             addShake(10);
                         }
                    }
                    
                    createImpactSparks(p.pos.x, p.pos.y, p.vel.heading() + PI, p.color, 12); 
                    particles.push(new Shockwave(p.pos.x, p.pos.y, 30, p.color));
                    
                    if(!p.piercing && !p.isOrbiter) p.dead = true;
                    break;
                }
            }
        }
        if (p.dead && p.drag) { 
             if (p.card.id === "minibomb") createExplosion(p.pos.x, p.pos.y, p.val, p.card.range, true, "#fa0");
        }
        if (p.dead) list.splice(i, 1);
    }
}

function distSq(v, w) { return (v.x - w.x)*(v.x - w.x) + (v.y - w.y)*(v.y - w.y); }
function createExplosion(x, y, dmg, range, isPlayerOwner, colOverride) {
    let col = colOverride || "#f50";
    addShake(8);
    if(range > 100) triggerFlash(20);
    particles.push(new Shockwave(x, y, range, col));
    particles.push(new ExplosionEffect(x, y, col, 20));
    particles.push(new AfterImage(x, y, range * 0.8, "#fff", 5)); 

    if(dmg > 0) {
        let targets = isPlayerOwner ? enemies : [player, ...deployables.filter(d=>d.type==="TURRET")];
        for(let t of targets) {
            if(dist(x, y, t.pos.x, t.pos.y) < range) {
                t.takeDamage(dmg, {tag:"EXPLOSION"});
                let push = p5.Vector.sub(t.pos, createVector(x,y)).setMag(20);
                t.pos.add(push);
            }
        }
    }
}
function createImpactSparks(x, y, angle, col, count) {
    for(let i=0; i<count; i++) {
        let spd = random(4, 10);
        let spread = random(-1.0, 1.0);
        particles.push(new Spark(x, y, col, angle + spread, spd, random(15, 25)));
    }
}

function keyPressed() {
    if (gameState === "TITLE") { 
        if (key === 'Enter' || key === 'z' || key === 'Z') gameState = "SELECT_CLASS"; 
    } 
    else if (gameState === "SELECT_CLASS") {
        if (keyCode === LEFT_ARROW) classIndex = (classIndex - 1 + 4) % 4;
        if (keyCode === RIGHT_ARROW) classIndex = (classIndex + 1) % 4;
        if (key === 'Enter' || key === 'z' || key === 'Z') { playerClass = CLASSES[classIndex]; startGame(); }
    }
    else if (gameState === "PLAY") {
        if (key === 'Escape') {
            isPaused = !isPaused;
        }
    }
    else if (gameState === "LEVEL_UP" || gameState === "EQUIP_SELECT") {
        if (keyCode === LEFT_ARROW) rewardIndex = (rewardIndex - 1 + CARD_CHOICES) % CARD_CHOICES;
        if (keyCode === RIGHT_ARROW) rewardIndex = (rewardIndex + 1) % CARD_CHOICES;
        if (key === 'Enter' || key === 'z' || key === 'Z') confirmSelection();
        if (key === 'x' || key === 'X') {
            gameState = (player.sp > 0) ? "SKILL_TREE" : "PLAY";
            particles.push(new TextParticle(player.pos.x, player.pos.y - 40, "SKIPPED", "#999"));
        }
    } 
    else if (gameState === "SKILL_TREE") {
        if (keyCode === LEFT_ARROW) skillIndex = (skillIndex - 1 + 6) % 6;
        if (keyCode === RIGHT_ARROW) skillIndex = (skillIndex + 1) % 6;
        if (keyCode === UP_ARROW) skillIndex = (skillIndex - 3 + 6) % 6;
        if (keyCode === DOWN_ARROW) skillIndex = (skillIndex + 3) % 6;

        if (key === 'z' || key === 'Z') { 
             if(player.sp > 0) {
                 player.sp--;
                 if(skillIndex === 0) player.upgrades.hp++;
                 if(skillIndex === 1) player.upgrades.atk++;
                 if(skillIndex === 2) player.upgrades.spd++;
                 if(skillIndex === 3) player.upgrades.range++;
                 if(skillIndex === 4) player.upgrades.luck++;
                 if(skillIndex === 5) player.upgrades.def++;

                 player.maxHp = 200 + player.upgrades.hp * 50 + player.getStat("hpAdd");
                 player.hp = min(player.hp + 50, player.maxHp);
                 particles.push(new TextParticle(width/2, height/2, "UPGRADE!", "#ff0"));
                 createImpactSparks(width/2, height/2, -HALF_PI, "#ff0", 20);
             }
             gameState = "PLAY";
        }
    }
    else if (gameState.includes("DISCARD")) {
        let targetList = (gameState === "DISCARD_ACTION") ? deck : equipment;
        if (keyCode === LEFT_ARROW) discardIndex = (discardIndex - 1 + targetList.length) % targetList.length;
        if (keyCode === RIGHT_ARROW) discardIndex = (discardIndex + 1) % targetList.length;
        if (key === 'Enter' || key === 'z' || key === 'Z') confirmDiscard();
    }
    else if (gameState === "GAME_OVER") { if (key === 'Enter' || key === 'z' || key === 'Z') gameState = "TITLE"; }
    else if (gameState === "LIBRARY") { if (key === 'x' || key === 'X' || key === 'Escape') gameState = "TITLE"; }
}

function startGame() {
    if(playerClass === "WARRIOR") deck = [getCardById("slash"), getCardById("hammer"), getCardById("charge")];
    else if(playerClass === "RANGER") deck = [getCardById("bow"), getCardById("boomerang"), getCardById("turret")];
    else if(playerClass === "MAGE") deck = [getCardById("flame"), getCardById("cleave"), getCardById("beam")];
    else deck = [getCardById("slash"), getCardById("bow"), getCardById("heal")];

    equipment = []; 
    player = new Player();
    enemies = []; drops = []; projectiles = []; enemyProjectiles = []; particles = []; deployables = []; puddles = [];
    score = 0; wave = 1; enemiesToNextLevel = 5;
    totalKills = 0; 
    spProgress = 0;
    killsForNextSp = 10;
    isPaused = false;
    
    player.pos = createVector(WORLD_W/2, WORLD_H/2);
    camX = WORLD_W/2 - width/2;
    camY = WORLD_H/2 - height/2;
    player.refreshMoveCard();
    gameState = "PLAY";
}

function generateRewards(type) {
    rewardOptions = [];
    let pool;
    if (type === "ACTION") {
        pool = actionLibrary.filter(c => c.type === "ACTION");
    } else {
        pool = [...equipLibrary, ...actionLibrary.filter(c => c.type === "MOVE")];
        pool = pool.filter(c => !equipment.some(e => e.id === c.id));
    }
    
    if(pool.length === 0) pool = (type==="ACTION") ? actionLibrary : equipLibrary;

    let availablePool = pool; 

    for(let i=0; i<CARD_CHOICES; i++) {
        let rarityRoll = random();
        let targetRarity = "COMMON";
        if (rarityRoll < 0.10) targetRarity = "LEGENDARY";
        else if (rarityRoll < 0.40) targetRarity = "RARE";
        
        let rarityPool = availablePool.filter(c => c.rarity === targetRarity);
        if (rarityPool.length === 0) rarityPool = availablePool;

        let weightedPool = [];
        for(let c of rarityPool) {
            let weight = 1;
            if(playerClass === "WARRIOR" && c.system === "Melee") weight = 3;
            if(playerClass === "RANGER" && c.system === "Ranged") weight = 3;
            if(playerClass === "MAGE" && c.system === "Magic") weight = 3;
            if (deck.some(d => d.id === c.id)) weight += 2;
            for(let k=0; k<weight; k++) weightedPool.push(c);
        }
        
        if(weightedPool.length === 0) weightedPool = availablePool;

        let r = floor(random(weightedPool.length));
        let c = {...weightedPool[r]}; 
        if(c.cooldownMax) c.currentCooldown = 0;
        
        if (rewardOptions.some(opt => opt.id === c.id)) {
             if(availablePool.length > CARD_CHOICES) { i--; continue; }
        }
        rewardOptions.push(c);
    }
}

function confirmSelection() {
    let selection = rewardOptions[rewardIndex];
    let nextState = (player.sp > 0) ? "SKILL_TREE" : "PLAY"; 
    
    if (selection.category === "ACTION") {
        let existingCard = deck.find(c => c.id === selection.id);
        if (existingCard) {
            if ((existingCard.level || 1) < 5) {
                existingCard.level = (existingCard.level || 1) + 1;
                particles.push(new TextParticle(player.pos.x, player.pos.y - 40, "LEVEL UP!", "#fff"));
                createImpactSparks(player.pos.x, player.pos.y, -HALF_PI, selection.color, 15);
                gameState = nextState;
                return;
            }
        }
    }

    if (selection.type === "MOVE") {
        let idx = deck.findIndex(c => c.type === "MOVE");
        if (idx !== -1) deck.splice(idx, 1);
        deck.push(selection);
        player.refreshMoveCard();
        gameState = nextState;
        return;
    }
    let targetList = (selection.category === "EQUIP") ? equipment : deck;
    let maxSize = (selection.category === "EQUIP") ? MAX_EQUIP_SIZE : MAX_DECK_SIZE;
    if (targetList.length >= maxSize) {
        pendingCard = selection; discardIndex = 0;
        gameState = (selection.category === "EQUIP") ? "DISCARD_EQUIP" : "DISCARD_ACTION";
    } else { 
        targetList.push(selection); 
        gameState = nextState; 
    }
}

function confirmDiscard() {
    if (gameState === "DISCARD_ACTION") { deck.splice(discardIndex, 1); deck.push(pendingCard); player.refreshMoveCard(); }
    else if (gameState === "DISCARD_EQUIP") { equipment.splice(discardIndex, 1); equipment.push(pendingCard); }
    pendingCard = null; 
    gameState = (player.sp > 0) ? "SKILL_TREE" : "PLAY";
}
