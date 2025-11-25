/* Sandbox Auto-Battler V35 - Enemy Logic */

class Enemy {
    constructor(x, y, type) {
        this.pos = createVector(x, y); 
        this.type = type; 
        this.dead = false;
        
        this.frozenTimer = 0; 
        this.slowTimer = 0; 
        this.stunTimer = 0; 
        this.shootTimer = 100 + random(60);
        this.poisonTimer = 0; 
        this.poisonDmg = 0;
        this.drainTimer = 0; 
        this.drainDmg = 0;
        
        this.dashState = 0; 
        this.dashTimer = 0; 
        this.dashDir = createVector(0,0);
        this.orbitSum = 0; 
        this.orbitState = 0; 
        
        // 司令官用パラメータ
        this.minionCount = 0; 
        this.summonTimer = 60; 
        
        this.noiseOffset = random(1000);
        this.eliteTrait = null;

        const scaleFactor = Math.floor((wave - 1) / 5);
        let hpBonus = scaleFactor * 20; 
        let dmgBonus = scaleFactor * 5; 

        if (wave >= 15) {
            let extraScale = wave - 14;
            hpBonus += extraScale * 25; 
            dmgBonus += extraScale * 4; 
        }

        let baseHp = 0, baseDmg = 0, speed = 0, size = 0, col = 0;
        
        // --- 既存の敵 ---
        if(type === "BASIC") { baseHp = 40; baseDmg = 12; speed = 1.8; size = 20; col = color(150,150,150); } 
        else if (type === "SWARM") { baseHp = 15; baseDmg = 8; speed = 3.5; size = 12; col = color(150,150,50); } 
        else if (type === "TANK") { baseHp = 150; baseDmg = 25; speed = 0.8; size = 35; col = color(80,80,150); } 
        else if (type === "SHOOTER") { baseHp = 50; baseDmg = 12; speed = 1.5; size = 20; col = color(50,150,50); }
        else if (type === "BARRIER") { baseHp = 200; baseDmg = 18; speed = 1.0; size = 30; col = color(50,100,200); } 
        else if (type === "TWIN") { baseHp = 80; baseDmg = 15; speed = 3.0; size = 18; col = color(200,150,0); } 
        else if (type === "BERSERKER") { baseHp = 180; baseDmg = 30; speed = 1.2; size = 28; col = color(200,0,0); } 
        else if (type === "FLANKER") { baseHp = 60; baseDmg = 15; speed = 2.2; size = 18; col = color(0,200,200); }
        else if (type === "HEAVY") { baseHp = 250; baseDmg = 15; speed = 0.5; size = 40; col = color(100,100,0); } 
        else if (type === "GUARD") { baseHp = 100; baseDmg = 10; speed = 1.2; size = 25; col = color(200,200,200); }
        else if (type === "PLAGUE") { baseHp = 250; baseDmg = 5; speed = 1.5; size = 30; col = color(0,200,0); }
        else if (type === "CURSER") { baseHp = 100; baseDmg = 10; speed = 1.5; size = 20; col = color(100,0,100); }
        else if (type === "HOOKER") { baseHp = 180; baseDmg = 10; speed = 1.3; size = 25; col = color(150,100,50); }
        else if (type === "WIZARD") { baseHp = 120; baseDmg = 20; speed = 1.2; size = 24; col = color(100, 50, 200); }
        else if (type === "GOLEM") { baseHp = 400; baseDmg = 40; speed = 0.4; size = 45; col = color(100, 80, 60); }
        else if (type === "BAT") { baseHp = 30; baseDmg = 10; speed = 2.5; size = 16; col = color(80, 50, 100); }
        else if (type === "P_TANK") { baseHp = 300; baseDmg = 15; speed = 0.8; size = 35; col = color(80,80,100); }
        else if (type === "P_FIGHTER") { baseHp = 150; baseDmg = 25; speed = 1.3; size = 25; col = color(150,50,50); }
        else if (type === "P_MAGE") { baseHp = 100; baseDmg = 15; speed = 1.0; size = 20; col = color(100,50,150); }
        else if (type === "MERCHANT") { baseHp = 100; baseDmg = 0; speed = 3.0; size = 25; col = color(150,0,180); }
        
        // --- 新規追加の敵 ---
        else if (type === "SNIPER") { baseHp = 80; baseDmg = 50; speed = 0; size = 22; col = color(200, 50, 50); }
        else if (type === "COMMANDER") { baseHp = 500; baseDmg = 10; speed = 1.2; size = 40; col = color(255, 215, 0); }
        // 司令官の部下たち
        else if (type === "C_INFANTRY") { baseHp = 120; baseDmg = 15; speed = 1.0; size = 25; col = color(100, 100, 100); }
        else if (type === "C_SCOUT") { baseHp = 60; baseDmg = 12; speed = 2.5; size = 18; col = color(150, 150, 100); }
        else if (type === "C_GUNNER") { baseHp = 60; baseDmg = 15; speed = 1.2; size = 20; col = color(100, 150, 100); }

        this.hp = baseHp + wave * 5 + hpBonus; 
        this.dmg = baseDmg + dmgBonus;
        this.speed = speed;
        this.size = size;
        this.col = col;
        
        // エリート特性の抽選（SNIPER, COMMANDER, MERCHANT以外）
        let eliteChance = 0.10 + (wave * 0.005);
        if(type === "SNIPER") eliteChance = 0; // スナイパーは特性なし（あるいは固定）

        if(random() < eliteChance && type !== "MERCHANT" && type !== "COMMANDER") {
            // 新特性 IRON（ノックバック無効）、VOID（弾消滅）を追加
            let traits = ["POWER", "SPEED", "GIANT", "ARMOR", "REGEN", "IRON", "VOID"];
            this.eliteTrait = random(traits);
            
            if(this.eliteTrait === "SPEED") { this.speed *= 1.5; }
            if(this.eliteTrait === "GIANT") { this.size *= 1.5; this.hp *= 2; }
            // IRON, VOID はダメージ処理や弾処理で参照
        }

        this.maxHp = this.hp;
    }
    
    getClosestAlly() {
        let closest = null; let minDist = 9999;
        for (let e of enemies) {
            if (e !== this && !e.dead) {
                let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
                if (d < minDist) { minDist = d; closest = e; }
            }
        }
        return minDist < 200 ? closest : null;
    }

    update() {
        if(this.stunTimer > 0) { this.stunTimer--; return; } 
        
        if(this.poisonTimer > 0) {
            if(frameCount % 60 === 0) { 
                let poisonDmg = Math.ceil(this.maxHp * 0.03);
                this.takeDamage(poisonDmg); 
                
                if(player && equipment.some(e => e.id === "e_absorb")) {
                    player.heal(3);
                }

                particles.push(new TextParticle(this.pos.x, this.pos.y-5, floor(poisonDmg), "#0f0")); 
            }
            this.poisonTimer--;
        }

        if(this.drainTimer > 0) {
            if(frameCount % 30 === 0) { 
                this.takeDamage(this.drainDmg); 
                if(player) player.heal(this.drainDmg);
                particles.push(new TextParticle(this.pos.x, this.pos.y-5, floor(this.drainDmg), "#a0f")); 
            }
            this.drainTimer--;
        }
        
        if(this.eliteTrait === "REGEN" && frameCount % 60 === 0 && this.hp < this.maxHp) {
            this.hp = min(this.hp + Math.ceil(this.maxHp*0.05), this.maxHp);
            particles.push(new TextParticle(this.pos.x, this.pos.y-10, "+", "#0f0"));
        }
        
        if(this.type === "BARRIER") {
            let spd = this.speed + (wave * 0.05);
            if(this.frozenTimer > 0) spd = 0;
            else if(this.slowTimer > 0) spd *= 0.5;
            
            let dir;
            let playerVector = p5.Vector.sub(player.pos, this.pos);
            let closestAlly = this.getClosestAlly(); 
            if (closestAlly) {
                 let allyVector = p5.Vector.sub(closestAlly.pos, this.pos);
                 dir = playerVector.copy().mult(0.7).add(allyVector.mult(0.3)).normalize();
            } else { dir = playerVector.normalize(); }
            
            let d = playerVector.mag();
            if (d < 50) dir = playerVector.mult(-1).normalize(); 
            
            dir.setMag(spd);
            this.pos.add(dir);
            if(frameCount % 60 === 0) particles.push(new Shockwave(this.pos.x, this.pos.y, 100, "#00f"));
        } else if (this.type === "BERSERKER") {
            if(this.dashState === 0) { 
                this.moveNormal();
                if(dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 200 && random() < 0.02) {
                    this.dashState = 1; this.dashTimer = 40; 
                    particles.push(new TextParticle(this.pos.x, this.pos.y-20, "!", "#f00"));
                }
            } else if (this.dashState === 1) { 
                this.dashTimer--;
                if(this.dashTimer <= 0) {
                    this.dashState = 2; this.dashTimer = 20; 
                    this.dashDir = p5.Vector.sub(player.pos, this.pos).normalize().mult(12);
                }
            } else if (this.dashState === 2) { 
                this.pos.add(this.dashDir);
                this.dashTimer--;
                particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, this.col, 5));
                if(this.dashTimer <= 0) this.dashState = 0;
            }
        } else if (this.type === "HOOKER") {
            this.moveNormal();
            if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 60 && this.shootTimer > 60) {
                if (frameCount % 60 === 0) {
                    particles.push(new Shockwave(this.pos.x, this.pos.y, 80, "#f00"));
                    player.takeDamage(30, this);
                    addShake(10);
                }
            }
        } else if (this.type === "SNIPER") {
            // スナイパーは移動しない。射撃のみ行う。
            this.shootTimer--;
            if(this.shootTimer <= 0 && this.frozenTimer <= 0) {
                this.shoot();
                this.shootTimer = 240; // 4秒間隔
            }
        } else if (this.type === "COMMANDER") {
            // 司令官の挙動
            // 1. 移動: プレイヤーと一定距離(500)を保つ
            let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
            let desiredDist = 500;
            let moveDir = p5.Vector.sub(player.pos, this.pos);
            
            let spd = this.speed + (wave * 0.05);
            if(this.frozenTimer > 0) spd = 0;
            else if(this.slowTimer > 0) spd *= 0.5;

            if (d < desiredDist - 50) {
                // 近すぎるので逃げる
                moveDir.mult(-1).normalize().setMag(spd);
                this.pos.add(moveDir);
            } else if (d > desiredDist + 50) {
                // 遠すぎるので近づく
                moveDir.normalize().setMag(spd);
                this.pos.add(moveDir);
            }
            
            // 2. 召喚ロジック
            this.summonTimer--;
            if (this.summonTimer <= 0) {
                // 自分の部下（C_から始まるタイプ）の数をカウント
                let minions = enemies.filter(e => e.type.startsWith("C_") && !e.dead);
                if (minions.length < 5) {
                    this.summonMinion();
                    this.summonTimer = 180; // 3秒クールダウン
                } else {
                    this.summonTimer = 60; // 満員なら1秒後に再チェック
                }
            }

        } else {
            this.moveNormal();
        }
        
        // 座標のNaNチェック
        if (isNaN(this.pos.x) || isNaN(this.pos.y) || !isFinite(this.pos.x) || !isFinite(this.pos.y)) {
            this.dead = true;
            return;
        }
        
        let margin = this.size / 2;
        this.pos.x = constrain(this.pos.x, margin, WORLD_W - margin);
        this.pos.y = constrain(this.pos.y, margin, WORLD_H - margin);
    }
    
    summonMinion() {
        // 自分とプレイヤーの間に召喚
        let spawnDir = p5.Vector.sub(player.pos, this.pos).normalize();
        let spawnPos = p5.Vector.add(this.pos, spawnDir.mult(60));
        
        // ランダムな部下を選択
        let types = ["C_INFANTRY", "C_SCOUT", "C_GUNNER"];
        let type = random(types);
        
        let minion = new Enemy(spawnPos.x, spawnPos.y, type);
        enemies.push(minion);
        
        // エフェクト
        particles.push(new Shockwave(spawnPos.x, spawnPos.y, 50, "#ff0"));
        particles.push(new TextParticle(spawnPos.x, spawnPos.y - 20, "SUMMON", "#fff"));
    }

    moveNormal() {
        let spd = this.speed + (wave * 0.05);
        if(this.frozenTimer > 0) { spd = 0; this.frozenTimer--; }
        if(this.slowTimer > 0) { spd *= 0.5; this.slowTimer--; }
        
        let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
        let dir = p5.Vector.sub(player.pos, this.pos);
        
        if(this.type === "MERCHANT") {
            if(d < 200) { dir = p5.Vector.sub(player.pos, this.pos); } 
            else if(d < 600) { dir.mult(-1); } 
            else { dir = p5.Vector.random2D(); }
        }

        if(this.type.startsWith("P_") || this.type.startsWith("C_")) {
             // C_ は司令官の部下。P_ と同様に群れる挙動を入れる
             let nearestP = null; let minD = 9999;
             let prefix = this.type.substring(0, 2); // "P_" or "C_"
             for(let e of enemies) {
                 if(e !== this && e.type.startsWith(prefix) && !e.dead) {
                     let pd = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
                     if(pd < minD) { minD = pd; nearestP = e; }
                 }
             }
             if(nearestP && minD > 80) {
                 let cohesion = p5.Vector.sub(nearestP.pos, this.pos).setMag(spd * 0.8);
                 dir.add(cohesion.mult(2)); 
             }
        }
        
        if (this.type === "SHOOTER" || this.type === "WIZARD" || this.type === "CURSER" || this.type === "HOOKER" || this.type === "P_MAGE" || this.type === "C_GUNNER") {
            let keepDist = 250;
            if(this.type === "WIZARD") keepDist = 300;
            
            if (d > keepDist) dir.setMag(spd); else if (d < keepDist - 100) dir.setMag(-spd * 0.5); else dir.mult(0);
            this.pos.add(dir); this.shootTimer--;
            if(this.shootTimer <= 0 && this.frozenTimer <= 0) { this.shoot(); this.shootTimer = 120; }
        } 
        else if (this.type === "HEAVY") { 
             dir.setMag(spd); this.pos.add(dir);
             if (d < 200) { 
                 this.shootTimer--;
                 if(this.shootTimer <= 0 && this.frozenTimer <= 0) { this.shoot(); this.shootTimer = 150; }
             }
        }
        else if (this.type === "PLAGUE") { 
             dir.setMag(spd); this.pos.add(dir);
             if (d < 100) { 
                 this.shootTimer--;
                 if(this.shootTimer <= 0 && this.frozenTimer <= 0) { this.shoot(); this.shootTimer = 60; }
             }
        }
        else if (this.type === "FLANKER") {
             if (this.orbitState === 0) {
                 let toPlayer = p5.Vector.sub(player.pos, this.pos);
                 if(d > 160) {
                     let perp = createVector(-toPlayer.y, toPlayer.x).normalize();
                     dir = toPlayer.copy().normalize().add(perp).normalize().setMag(spd);
                 } else {
                     let perp = createVector(-toPlayer.y, toPlayer.x).normalize();
                     dir = perp.setMag(spd);
                     let validD = max(d, 1); 
                     let angSpeed = spd / validD; 
                     this.orbitSum += angSpeed;
                 }
                 this.pos.add(dir);
                 if (this.orbitSum > TWO_PI) {
                     this.orbitState = 1;
                     particles.push(new TextParticle(this.pos.x, this.pos.y-20, "!", "#0ff"));
                 }
             } else {
                 dir = p5.Vector.sub(player.pos, this.pos).normalize().setMag(spd * 1.5);
                 this.pos.add(dir);
             }
        }
        else if (this.type === "BAT") {
            dir.setMag(spd);
            let perp = createVector(-dir.y, dir.x).normalize();
            let sway = perp.mult(sin(frameCount * 0.1 + this.noiseOffset) * spd * 0.8);
            dir.add(sway);
            this.pos.add(dir);
        }
        else { 
            dir.setMag(spd); 
            this.pos.add(dir); 
        }

        let distAfterMove = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
        let minDist = (this.size + player.size) / 2;
        if (distAfterMove < minDist - 2 && this.type !== "MERCHANT" && this.type !== "COMMANDER") {
            this.pos.add(p5.Vector.sub(this.pos, player.pos).normalize().mult((minDist-2)-distAfterMove));
            if(frameCount%10===0) player.takeDamage(this.dmg / 6, this); 
            else if (distAfterMove < minDist - 10) {
                 if(frameCount%30===0) player.takeDamage(this.dmg, this);
            }
        }
        
        if ((this.type === "GUARD" || this.type === "P_TANK" || this.type === "C_INFANTRY") && distAfterMove < 35) {
             let push = p5.Vector.sub(player.pos, this.pos).setMag(20);
             player.pos.add(push);
        }
    }

    shoot() { 
        if (this.type === "HEAVY") {
            for(let i=0; i<5; i++) {
                let spread = p5.Vector.sub(player.pos, this.pos).normalize().rotate(map(i,0,4, -0.3, 0.3));
                enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, spread, {val:this.dmg}, this.dmg, 5)); 
            }
            particles.push(new Shockwave(this.pos.x, this.pos.y, 40, "#ff0"));
        } else if (this.type === "PLAGUE") {
            for(let i=0; i<3; i++) {
                let spread = p5.Vector.sub(player.pos, this.pos).normalize().rotate(random(-0.3, 0.3));
                enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, spread, {val:this.dmg, tag:"POISON", color:"#0f0"}, this.dmg, 5)); 
            }
        } else if (this.type === "WIZARD") {
            let p = new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg, color:"#a0f"}, this.dmg, 4);
            p.homing = true; p.target = player;
            enemyProjectiles.push(p);
        } else if (this.type === "CURSER") {
            enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg, tag:"SLOW", color:"#50a"}, this.dmg, 6)); 
        } else if (this.type === "HOOKER") {
            enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg, tag:"HOOK", color:"#963"}, this.dmg, 12)); 
        } else if (this.type === "SNIPER") {
            // スナイパーの弾：超高速・高火力
            enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg, color:"#f00"}, this.dmg, 25)); 
            particles.push(new Shockwave(this.pos.x, this.pos.y, 30, "#f00"));
        } else if (this.type === "C_GUNNER") {
             enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg, color:"#afa"}, this.dmg, 8)); 
        } else {
            enemyProjectiles.push(new Projectile(this.pos.x, this.pos.y, p5.Vector.sub(player.pos, this.pos).normalize(), {val:this.dmg}, this.dmg, 4)); 
        }
    }
    
    applyDebuff(type, dmg, duration) { 
        if(type === "POISON") { this.poisonDmg = dmg; this.poisonTimer = duration; } 
        if(type === "DRAIN") { this.drainDmg = dmg; this.drainTimer = duration; }
        if(type === "SLOW") { this.slowTimer = duration; }
        if(type === "STUN") { this.stunTimer = duration; }
    }
    
    takeDamage(amt, cardEffect) {
        let reduction = 1.0;
        if (this.eliteTrait === "ARMOR") reduction *= 0.5;
        if (this.type === "GOLEM") reduction *= 0.8; 

        for(let e of enemies) {
            if(e.type === "BARRIER" && e !== this && !e.dead && dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y) < 150) {
                reduction *= 0.5; 
                break;
            }
        }
        let finalDmg = Math.floor(amt * reduction);
        this.hp -= finalDmg;
        let col = reduction < 1.0 ? "#88f" : "#fff";
        particles.push(new TextParticle(this.pos.x, this.pos.y, finalDmg, col));
        
        if(cardEffect) {
             if(cardEffect.tag === "DEBUFF") {
                if(cardEffect.id === "blizzard") this.frozenTimer = 60;
                if(cardEffect.id === "stun_gun" || cardEffect.id === "thunder") { this.stunTimer = 60; particles.push(new TextParticle(this.pos.x, this.pos.y-10, "STUN", "#ff0")); }
                if(cardEffect.id === "icicle") this.slowTimer = 60;
                if(cardEffect.id === "shadow_bind") { this.stunTimer = 120; particles.push(new TextParticle(this.pos.x, this.pos.y-10, "BIND", "#a0f")); }
            } else if (cardEffect.id === "gravity" || cardEffect.id === "vortex") this.slowTimer = 90;
        }
        if (this.hp <= 0) this.dead = true;
    }
    
    draw() {
        push(); translate(this.pos.x, this.pos.y); 
        
        if(this.eliteTrait) {
            noFill(); strokeWeight(3);
            if(this.eliteTrait === "POWER") {
                stroke(255, 50, 50, 180); strokeWeight(2);
                beginShape();
                for(let a=0; a<TWO_PI; a+=0.4) {
                    let r = this.size/2 + 10 + (a%(0.8)===0 ? 5 : 0) + sin(frameCount*0.2)*2;
                    vertex(cos(a+frameCount*0.1)*r, sin(a+frameCount*0.1)*r);
                }
                endShape(CLOSE);
            }
            else if(this.eliteTrait === "SPEED") {
                rotate(this.pos.heading()); 
                stroke(100, 255, 255, 150); strokeWeight(2);
                line(-this.size, 0, -this.size-10, -5);
                line(-this.size, 0, -this.size-10, 5);
                rotate(-this.pos.heading());
            }
            else if(this.eliteTrait === "GIANT") {
                stroke(255, 200, 50, 100); strokeWeight(4);
                circle(0, 0, this.size + 10 + sin(frameCount*0.05)*4);
            }
            else if(this.eliteTrait === "ARMOR") {
                stroke(100, 100, 255, 150); strokeWeight(2);
                rotate(frameCount * 0.05);
                beginShape();
                for(let i=0; i<6; i++) {
                    let ang = TWO_PI/6 * i;
                    vertex(cos(ang)*(this.size/2 + 12), sin(ang)*(this.size/2 + 12));
                }
                endShape(CLOSE);
                rotate(-frameCount * 0.05);
            }
            else if(this.eliteTrait === "REGEN") {
                stroke(50, 255, 50, 180); strokeWeight(3);
                let ry = -this.size/2 - 10 - (frameCount%30)/2;
                line(-4, ry, 4, ry); line(0, ry-4, 0, ry+4);
            }
            else if(this.eliteTrait === "IRON") {
                stroke(150, 150, 150, 200); strokeWeight(3);
                rect(-this.size/2-5, -this.size/2-5, this.size+10, this.size+10, 5);
            }
            else if(this.eliteTrait === "VOID") {
                stroke(200, 0, 200, 200); strokeWeight(2);
                noFill();
                circle(0, 0, this.size + 15 + sin(frameCount*0.1)*5);
            }
        }

        drawingContext.shadowBlur = 15; drawingContext.shadowColor = this.col;
        
        let mainFill = this.col;
        let outline = color(200, 200, 200); 
        if(this.frozenTimer > 0) { mainFill = color(100,100,255); outline = color(0, 0, 255); }
        if(this.stunTimer > 0) { mainFill = color(255, 255, 0); outline = color(255,150,0); }
        if(this.poisonTimer > 0) { noStroke(); fill(0,255,0, 100); circle(0,0,this.size+5); }
        if(this.drainTimer > 0) { noFill(); stroke(150,0,255); circle(0,0,this.size+5); noStroke(); }
        
        fill(mainFill); stroke(outline); strokeWeight(2); 

        if (this.type === "BASIC") { 
            rect(-this.size/2, -this.size/2, this.size, this.size, 3);
            fill(255); circle(0,0,4);
        }
        else if (this.type === "GUARD" || this.type === "P_TANK" || this.type === "C_INFANTRY") {
            rect(-15,-15,30,30, 2);
            line(-15,-15,15,15); line(15,-15,-15,15);
        }
        else if (this.type === "P_FIGHTER") {
            triangle(0,-15, -10,10, 10,10);
            fill(255,0,0); rect(-2,-10,4,20); 
        }
        else if (this.type === "P_MAGE") {
            ellipse(0,0,25,25);
            fill(200,0,255); circle(0,-15,8); 
        }
        else if (this.type === "PLAGUE") {
             circle(0,0,this.size);
             fill(0,100,0); rect(-5,-5,10,10);
        }
        else if (this.type === "WIZARD") {
             triangle(0, -this.size, -this.size/2, 0, this.size/2, 0);
             rect(-this.size/2, 0, this.size, this.size/2);
        }
        else if (this.type === "GOLEM") {
             rect(-this.size/2, -this.size/2, this.size, this.size, 8);
             fill(50); rect(-10, -5, 20, 10);
        }
        else if (this.type === "BAT") {
             fill(this.col);
             triangle(0, 0, -this.size, -10, -this.size, 10);
             triangle(0, 0, this.size, -10, this.size, 10);
             fill(255); circle(0, 0, 8);
        }
        else if (this.type === "CURSER") {
             rect(-10,-15,20,30);
             fill(50,0,50); circle(0,-10,10);
        }
        else if (this.type === "HOOKER") {
             triangle(0,-15, -10,10, 10,10);
             fill(200); ellipse(0,0,10,15);
        }
        else if (this.type === "SNIPER") {
             ellipse(0, 0, this.size, this.size);
             fill(0); circle(0,0,10);
             stroke(0); line(0,0, 20,0);
        }
        else if (this.type === "COMMANDER") {
             // 司令官の見た目
             rect(-20, -20, 40, 40, 5);
             fill(255); rect(-10, -25, 20, 10); // 帽子
             fill(200, 0, 0); rect(-5, -5, 10, 20); // マント
        }
        else if (this.type === "SWARM") { 
            rect(-this.size/2, -this.size/2, this.size, this.size);
            fill(this.col); 
        }
        else if (this.type === "TANK") { 
            rect(-15,-15,30,30, 5);
            fill(50,50,150); rect(-10,-10,20,20, 3);
        }
        else if (this.type === "SHOOTER" || this.type === "C_GUNNER") { 
            push();
            rect(-10,-10,20,20);
            rotate(p5.Vector.sub(player.pos, this.pos).heading() + HALF_PI);
            fill(50,255,50); rect(-2,-15,4,5);
            pop();
        }
        else if (this.type === "C_SCOUT") {
            triangle(0, -10, -8, 8, 8, 8);
            fill(255,255,0); circle(0,0,5);
        }
        else if (this.type === "BARRIER") { 
            rect(-15,-15,30,30,5);
            fill(50,100,255); ellipse(0,0,25,25);
            noFill(); stroke(0,100,255, 150); circle(0,0,300 * (0.8 + sin(frameCount*0.05)*0.1));
        }
        else if (this.type === "TWIN") { 
            beginShape(); vertex(0,-12); vertex(10,8); vertex(-10,8); endShape(CLOSE);
            fill(255,150,0); rect(-5,0,10,10);
        }
        else if (this.type === "BERSERKER") { 
            if(this.dashState === 1) fill(255,100,100);
            beginShape(); vertex(0,-15); vertex(10,5); vertex(0,15); vertex(-10,5); endShape(CLOSE);
            fill(255); rect(-4,-4,8,8);
        }
        else if (this.type === "FLANKER") {
            push();
            rotate(p5.Vector.sub(player.pos, this.pos).heading() + HALF_PI);
            triangle(0, -12, -8, 8, 8, 8);
            pop();
        }
        else if (this.type === "HEAVY") {
            rect(-18,-18,36,36, 4);
            push();
            rotate(p5.Vector.sub(player.pos, this.pos).heading() + HALF_PI);
            fill(50); rect(-6, -20, 12, 10); 
            pop();
        }
        else if (this.type === "MERCHANT") {
            fill(this.col);
            arc(0, 0, 30, 40, PI, TWO_PI); 
            rect(-15, 0, 30, 20); 
            fill(180, 100, 50); ellipse(10, 5, 12, 16); 
            fill(0); ellipse(0, -5, 10, 10); 
            fill(255, 255, 0); circle(-2, -5, 2); circle(2, -5, 2); 
        }
        
        drawingContext.shadowBlur = 0;
        noStroke(); fill(50,0,0); rect(-10,-20,20,4);
        fill(0,255,100); rect(-10,-20,20*(this.hp/this.maxHp),4);
        pop();
    }
}
