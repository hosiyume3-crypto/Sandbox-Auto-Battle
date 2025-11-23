/* Sandbox Auto-Battler V35 - Player Logic */

class Player {
    constructor() {
        this.pos = createVector(WORLD_W/2, WORLD_H/2);
        this.size = 24;
        this.level = 1;
        this.sp = 0;
        this.upgrades = { hp: 0, atk: 0, spd: 0, range: 0, luck: 0, def: 0 }; 
        
        this.hp = 200; this.maxHp = 200;
        this.potionStock = 0;
        this.potionUseTimer = 0;

        this.deckIndex = 0;
        this.timer = 0;
        this.state = "IDLE"; 
        this.target = null;
        this.chaseTimer = 0; 
        
        this.currentCard = null;
        this.activeMoveCard = null;
        this.invincibleTimer = 0;
        this.baseSpeed = 3.5;
        this.warpTimer = 0;
        this.phaseTimer = 0; 
        this.defBuffTimer = 0; 
        this.chargeTimer = 0; 
        
        this.barrierStock = 0;
        this.barrierRefillTimer = 0;
        
        this.lastTargetAcquireTime = 0; 
        
        this.retreatTimer = 0; // For panic retreat

        this.status = { stun:0, slow:0, poison:0, poisonDmg:0 };
    }

    refreshMoveCard() { this.activeMoveCard = deck.find(c => c.type === "MOVE") || null; }
    
    getStat(type) {
        let val = (type.includes("Add") || type === "vampire") ? 0 : 1.0;
        for(let e of equipment) {
            if(e.stats[type]) {
                if (type.includes("Add") || type === "vampire") val += e.stats[type];
                else val *= (1 + e.stats[type]);
            }
        }
        // SKILL TREE UPGRADES
        if(type === "melee" || type === "range" || type === "magic") val *= (1 + this.upgrades.atk * 0.15); 
        // --- 変更: スキルツリー Speed +10% ---
        if(type === "speed") val *= (1 + this.upgrades.spd * 0.10);
        // ------------------------------------
        
        if(type === "rangeAdd") val += this.upgrades.range * 0.10; 
        // --- 変更: スキルツリー Luck +2.5% ---
        if(type === "dropRateAdd") val += this.upgrades.luck * 0.025; 
        // -------------------------------------

        for(let e of equipment) {
            if(e.id === "e_rage") {
                let lostHp = (this.maxHp - this.hp) / this.maxHp; 
                if(type === "melee" || type === "range" || type === "magic") val *= (1 + lostHp);
            }
            if(e.id === "e_battery" && type === "cdMult") val -= 0.10; 
            if(e.id === "e_titan") {
                if(type === "melee" || type === "range" || type === "magic") val *= 1.20;
                if(type === "cdMult") val += 0.20;
            }
        }
        if(type === "cdMult" && this.status.slow > 0) val += 0.10; 
        return val;
    }
    
    applyStatus(type, duration) {
        if(type === "STUN") { this.status.stun = duration; particles.push(new TextParticle(this.pos.x, this.pos.y-20, "STUNNED", "#ff0")); }
        if(type === "SLOW") { this.status.slow = duration; particles.push(new TextParticle(this.pos.x, this.pos.y-20, "SLOW", "#88f")); }
        if(type === "POISON") { this.status.poison = duration; particles.push(new TextParticle(this.pos.x, this.pos.y-20, "POISON", "#0f0")); }
    }

    update() {
        // --- 変更: スキルツリー HP +25 ---
        this.maxHp = 200 + this.upgrades.hp * 25 + this.getStat("hpAdd");
        // ------------------------------
        
        let hasBarrier = equipment.some(e => e.id === "e_barrier");
        if(hasBarrier) {
            if(this.barrierStock < 3) {
                this.barrierRefillTimer--;
                if(this.barrierRefillTimer <= 0) {
                    this.barrierStock++;
                    this.barrierRefillTimer = 600; 
                    particles.push(new TextParticle(this.pos.x, this.pos.y-30, "BARRIER", "#0ff"));
                }
            }
        } else {
            this.barrierStock = 0; 
        }

        for(let e of equipment) {
            if(e.id === "e_lifering" && frameCount % 60 === 0) this.heal(Math.ceil(this.maxHp * 0.01));
        }

        if (this.status.stun > 0) this.status.stun--;
        if (this.status.slow > 0) this.status.slow--;
        
        if (this.status.poison > 0) {
            this.status.poison--;
            if(frameCount % 60 === 0) {
                let poisonDmg = Math.ceil(this.maxHp * 0.03);
                this.takeDamage(poisonDmg); 
            }
        }

        if (this.potionUseTimer > 0) this.potionUseTimer--;
        if (this.retreatTimer > 0) this.retreatTimer--;
        
        if (this.potionStock > 0 && this.potionUseTimer <= 0) {
            if (this.hp <= this.maxHp * 0.5) {
                this.potionStock--;
                let healAmount = Math.floor(this.maxHp * 0.30); 
                this.heal(healAmount);
                this.potionUseTimer = 300; 
                particles.push(new TextParticle(this.pos.x, this.pos.y - 20, "AUTO POTION", "#0f0"));
                particles.push(new Shockwave(this.pos.x, this.pos.y, 40, "#0f0"));
            }
        }

        if (this.hp <= 0) { gameState = "GAME_OVER"; return; }
        for(let c of deck) { if(c.currentCooldown > 0) c.currentCooldown--; }
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.warpTimer > 0) this.warpTimer--;
        if (this.phaseTimer > 0) this.phaseTimer--;
        if (this.defBuffTimer > 0) this.defBuffTimer--;
        if (this.chargeTimer > 0) this.chargeTimer--;
        
        if (this.invincibleTimer <= 0) {
            for (let e of enemies) {
                if (dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y) < (this.size + e.size)/2) {
                    if (this.state === "MOVING" && this.activeMoveCard && this.activeMoveCard.id === "move_spike") {
                         e.takeDamage(10); particles.push(new SlashEffect(e.pos.x, e.pos.y, "#888", 30));
                         addShake(1);
                    }
                    if (this.state === "ACTING" && this.currentCard && this.currentCard.id === "gatotsu") {
                         e.takeDamage(this.currentCard.val * this.getStat("melee")); 
                         particles.push(new SlashEffect(e.pos.x, e.pos.y, "#f00", 50));
                         createImpactSparks(e.pos.x, e.pos.y, p5.Vector.sub(e.pos, this.pos).heading(), "#f00", 10);
                         addShake(2);
                    } else {
                        if (e.type !== "MERCHANT") {
                            let collisionDmg = e.dmg;
                            if(e.eliteTrait === "POWER") collisionDmg *= 1.5;
                            if(e.eliteTrait === "VENOM") { this.applyStatus("POISON", 180); } 
                            this.takeDamage(collisionDmg);
                            
                            if (e.type !== "P_TANK") {
                                this.pos.add(p5.Vector.sub(this.pos, e.pos).setMag(10));
                            }
                            
                            for(let eq of equipment) { if(eq.id === "e_thorns") e.takeDamage(10); }
                        }
                    }
                }
            }
        }
        
        if(this.status.stun > 0) return;

        if (this.state !== "ACTING" && this.state !== "CASTING" && drops.length > 0) {
            let closestDrop = this.getClosestDrop();
            if (closestDrop) { this.state = "LOOTING"; this.target = closestDrop; }
        } else if (this.state === "LOOTING" && (!this.target || drops.indexOf(this.target) === -1)) {
             this.state = "IDLE";
             this.target = null;
        }

        if (this.state === "LOOTING") this.moveToTarget();
        else if (this.state === "IDLE") this.findNextCard();
        else if (this.state === "MOVING") {
            this.chaseTimer++;
            if (this.chaseTimer > 120) {
                this.target = null;
                this.chaseTimer = 0;
                this.state = "IDLE";
                particles.push(new TextParticle(this.pos.x, this.pos.y - 30, "?", "#fff"));
            }
            
            if (this.target && frameCount - this.lastTargetAcquireTime > 180) {
                let newTarget = this.getClosestEnemy();
                if (newTarget && newTarget !== this.target) {
                    this.target = newTarget;
                    this.lastTargetAcquireTime = frameCount;
                    particles.push(new TextParticle(this.pos.x, this.pos.y-30, "RETARGET", "#fff"));
                } else {
                    this.lastTargetAcquireTime = frameCount; 
                }
            }
            
            // --- 変更: 緊急回避 (反対方向へ高速移動) ---
            if ((playerClass === "MAGE" || playerClass === "RANGER") && this.retreatTimer <= 0) {
                let nearEnemy = this.getClosestEnemy();
                if (nearEnemy && dist(this.pos.x, this.pos.y, nearEnemy.pos.x, nearEnemy.pos.y) < 60) {
                    let runDir = p5.Vector.sub(this.pos, nearEnemy.pos).normalize();
                    this.pos.add(runDir.mult(150)); // 高速移動
                    particles.push(new TextParticle(this.pos.x, this.pos.y - 20, "ESCAPE!", "#fff"));
                    particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, "#fff", 10));
                    this.retreatTimer = 300; // CT 5秒
                }
            }
            // ---------------------------------------
            
            if (this.activeMoveCard && this.activeMoveCard.id === "move_barrage" && frameCount % 10 === 0) {
                let target = this.getClosestEnemy();
                if (target && dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 400) {
                    let dir = p5.Vector.sub(target.pos, this.pos).normalize();
                    projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, {id:"move_shot", color:"#f0f", style:"RANGE"}, 8, 15));
                }
            }
            if (drops.length > 0) { 
                let d = this.getClosestDrop();
                if(d) { this.state = "LOOTING"; this.target = d; return; }
            }
            this.moveToTarget();
        } 
        else if (this.state === "CASTING") {
            this.timer--;
            if (frameCount % 5 === 0) {
                let a = random(TWO_PI);
                let r = random(20, 40);
                particles.push(new Spark(this.pos.x + cos(a)*r, this.pos.y + sin(a)*r, "#fff", a + PI, 2, 10));
            }
            if (this.timer <= 0) {
                this.performAction(false, true); 
            }
        }
        else if (this.state === "ACTING") {
            this.chaseTimer = 0;
            this.lastTargetAcquireTime = frameCount; 
            
            this.timer--;
            if(this.currentCard) {
                if ((this.currentCard.id === "multicut" || this.currentCard.id === "m_gun") && this.timer % 5 === 0 && this.timer > 0) this.performAction(true);
                if (this.currentCard.id === "barrage" && this.timer % 15 === 0 && this.timer > 0) this.performAction(true);
                if (this.currentCard.id === "flamethrower" && this.timer % 3 === 0 && this.timer > 0) this.performAction(true);
                if (this.currentCard.id === "fan_laser" && this.timer % 4 === 0 && this.timer > 0) this.performAction(true);
                if (this.currentCard.id === "gatotsu" && this.target) {
                    let dashDir = p5.Vector.sub(this.target.pos, this.pos).normalize();
                    this.pos.add(dashDir.mult(40)); 
                    particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, "#f00", 5));
                }
            }

            if (this.timer <= 0) {
                if(this.currentCard) {
                    let mult = this.getStat("cdMult"); 
                    this.currentCard.currentCooldown = Math.floor(this.currentCard.cooldownMax * mult);
                }
                this.nextCardIndex();
            }
        } else if (this.state === "RELOADING") {
             this.chaseTimer = 0;
             if (drops.length > 0) {
                let d = this.getClosestDrop();
                if(d) { this.state = "LOOTING"; this.target = d; return; }
             }
             if (deck.some(c => c.category === "ACTION" && c.currentCooldown <= 0)) this.state = "IDLE";
        }
        
        let margin = this.size / 2 + 2;
        this.pos.x = constrain(this.pos.x, margin, WORLD_W - margin);
        this.pos.y = constrain(this.pos.y, margin, WORLD_H - margin);
    }

    findNextCard() {
        if (deck.length === 0) return;
        let attempts = 0;
        while(attempts < deck.length) {
            let c = deck[this.deckIndex];
            if (c.category === "ACTION" && c.currentCooldown <= 0) {
                this.currentCard = c;
                this.processCardLogic(c);
                return;
            }
            this.deckIndex = (this.deckIndex + 1) % deck.length;
            attempts++;
        }
        this.state = "RELOADING";
        this.currentCard = null;
    }

    processCardLogic(card) {
        if (card.system === "Heal" || card.id === "teleport" || card.id === "turret" || card.id === "orbit_fire" || card.id === "air_raid" || card.id === "thunder" || card.id === "black_hole" || card.id === "meteor") { this.performAction(); return; }
        
        let targetEnemy;
        if (card.id === "assassin") targetEnemy = this.getFarthestEnemy();
        else targetEnemy = this.getClosestEnemy();

        if (!targetEnemy) { 
            this.state = "IDLE";
            return; 
        }

        this.target = targetEnemy;
        this.lastTargetAcquireTime = frameCount;
        
        if (card.id === "charge") {
            this.state = "CASTING";
            this.timer = 60; 
            particles.push(new TextParticle(this.pos.x, this.pos.y - 40, "CHARGING...", "#fa0"));
            return;
        }

        let effectiveRange = (card.id === "assassin" || card.id === "giga_laser" || card.id === "slow_sphere" || card.id === "life_drain") ? 9999 : card.range;
        if(card.system === "Ranged") effectiveRange *= (1 + this.getStat("rangeAdd"));
        
        if (dist(this.pos.x, this.pos.y, targetEnemy.pos.x, targetEnemy.pos.y) <= effectiveRange) {
             this.performAction();
        } else {
             this.state = "MOVING";
        }
    }

    moveToTarget() {
        if (!this.target) { this.state = "IDLE"; return; }
        if (this.state !== "LOOTING" && this.target.dead) { this.state = "IDLE"; return; }
        
        if (this.state === "MOVING" && this.activeMoveCard && this.activeMoveCard.id === "move_warp" && this.warpTimer <= 0) {
            if (dist(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y) > 100) {
                particles.push(new ExplosionEffect(this.pos.x, this.pos.y, "#a0f", 20)); 
                this.pos = p5.Vector.add(this.target.pos, p5.Vector.random2D().setMag(40));
                particles.push(new Shockwave(this.pos.x, this.pos.y, 50, "#a0f")); 
                this.warpTimer = 90; addShake(3); return;
            }
        }

        let speed = this.baseSpeed * this.getStat("speed");
        if(this.status.slow > 0) speed *= 0.5;

        if(this.activeMoveCard && this.activeMoveCard.id === "move_dash") speed *= 1.4; 

        let dir;
        if (this.state === "LOOTING") {
             dir = p5.Vector.sub(this.target.pos, this.pos).normalize();
        } else {
            let distToTarget = dist(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
            let vecToTarget = p5.Vector.sub(this.target.pos, this.pos);
            
            if (this.activeMoveCard && this.activeMoveCard.id === "move_strafe") {
                if(distToTarget < 150) {
                    dir = vecToTarget.normalize(); speed *= 1.2;
                } else {
                    let tangent = vecToTarget.copy().rotate(HALF_PI).normalize();
                    let approach = vecToTarget.copy().normalize().mult(0.3);
                    dir = tangent.add(approach).normalize();
                }
            } 
            else if (this.activeMoveCard && this.activeMoveCard.id === "move_kite") {
                if (distToTarget < 120) dir = vecToTarget.mult(-1).normalize(); 
                else if (distToTarget > 180) dir = vecToTarget.normalize(); 
                else dir = vecToTarget.rotate(HALF_PI).normalize();
            } 
            else {
                dir = vecToTarget.normalize();
            }
        }
        
        if(this.activeMoveCard && this.activeMoveCard.id === "move_phase") {
            this.pos.add(dir.mult(speed));
            if(this.state === "MOVING") {
                if(this.phaseTimer <= 0) {
                    this.pos.add(dir.copy().setMag(50));
                    particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, "#a0f", 10));
                    this.phaseTimer = 60;
                }
            }
        }
        else {
            this.pos.add(dir.mult(speed));
        }
        
        if (this.state !== "LOOTING" && this.currentCard) {
             let effectiveRange = (this.currentCard.id === "assassin" || this.currentCard.id === "giga_laser" || this.currentCard.id === "slow_sphere" || this.currentCard.id === "life_drain") ? 9999 : this.currentCard.range;
             if(this.currentCard.system === "Ranged") effectiveRange *= (1 + this.getStat("rangeAdd"));
             
             if (dist(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y) <= effectiveRange) {
                this.performAction();
            }
        }
    }

    performAction(isMultiHit = false, fromCast = false) {
        this.state = "ACTING";
        let c = this.currentCard;
        if(!isMultiHit && !fromCast) this.timer = c.duration;
        if (fromCast) this.timer = c.duration;

        let typeMult = 1.0;
        if (c.system === "Melee") typeMult = this.getStat("melee");
        if (c.system === "Ranged") typeMult = this.getStat("range");
        if (c.system === "Magic") typeMult = this.getStat("magic");
        
        let levelMult = 1.0 + ((c.level || 1) - 1) * 0.15; 
        let baseVal = c.val * typeMult * levelMult;
        let variance = random(0, this.level * 1.5); 
        let finalVal = Math.floor(baseVal + variance);
        
        if(!isMultiHit) {
            particles.push(new TextParticle(this.pos.x, this.pos.y - 30, c.name, c.color, 60));
        }

        if (c.id === "backstep") {
            if (this.target) {
                let dir = p5.Vector.sub(this.target.pos, this.pos).normalize();
                projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 15));
                this.pos.add(dir.mult(-60)); 
                particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, "#fff", 10));
            }
            return;
        }

        if (c.id === "teleport") {
            let blinkDir;
            if(this.target) blinkDir = p5.Vector.sub(this.target.pos, this.pos).normalize();
            else blinkDir = p5.Vector.random2D();
            this.pos.add(blinkDir.mult(150));
            particles.push(new AfterImage(this.pos.x, this.pos.y, this.size, "#0ff", 15));
            createImpactSparks(this.pos.x, this.pos.y, blinkDir.heading() + PI, "#0ff", 10);
            return;
        }

        if (c.id === "turret") {
            deployables.push(new Deployable(this.pos.x, this.pos.y, "TURRET"));
            particles.push(new Shockwave(this.pos.x, this.pos.y, 40, "#aa0"));
            return;
        }
        if (c.id === "black_hole") {
            let target = this.getClosestEnemy();
            let spawnX = target ? target.pos.x : this.pos.x + random(-100,100);
            let spawnY = target ? target.pos.y : this.pos.y + random(-100,100);
            deployables.push(new Deployable(spawnX, spawnY, "BLACK_HOLE"));
            return;
        }

        if (c.id === "thunder") {
            let targets = [...enemies].sort(() => 0.5 - random()).slice(0, 3);
            if(targets.length === 0) targets = [null]; 
            for(let t of targets) {
                let tx = t ? t.pos.x : this.pos.x + random(-200,200);
                let ty = t ? t.pos.y : this.pos.y + random(-200,200);
                createExplosion(tx, ty, finalVal, 60, true, "#ff0");
                particles.push(new Spark(tx, ty - 200, "#ff0", PI/2, 20, 10)); 
                line(tx, ty-300, tx, ty); 
            }
            addShake(5);
            return;
        }

        if (c.id === "meteor") {
            let target = enemies.length > 0 ? random(enemies) : null;
            let tx, ty;
            if(target) { tx = target.pos.x; ty = target.pos.y; }
            else { tx = this.pos.x + random(-200,200); ty = this.pos.y + random(-200,200); }
            
            particles.push(new TextParticle(tx, ty - 150, "??", "#f50", 60));
            setTimeout(() => { 
                createExplosion(tx, ty, finalVal, 120, true, "#f50"); 
                addShake(10);
            }, 500);
            return;
        }

        if (c.id === "orbit_fire") {
            for(let i=0; i<4; i++) {
                let p = new Projectile(this.pos.x, this.pos.y, createVector(0,0), c, finalVal, 0);
                p.isOrbiter = true; p.orbitAngle = i * (TWO_PI/4); p.orbitRadius = 60; p.life = 300; 
                projectiles.push(p);
            }
            return;
        }
        if (c.id === "air_raid") {
            addShake(5);
            for(let i=0; i<5; i++) {
                let target = enemies.length > 0 ? random(enemies) : null;
                let tx, ty;
                if(target) { tx = target.pos.x + random(-20,20); ty = target.pos.y + random(-20,20); }
                else { tx = this.pos.x + random(-200,200); ty = this.pos.y + random(-200,200); }
                setTimeout(() => { createExplosion(tx, ty, finalVal, 80, true); }, i * 100);
            }
            return;
        }

        if (c.system === "Heal") {
            if(c.tag === "HEAL") { this.heal(finalVal); particles.push(new Shockwave(this.pos.x, this.pos.y, 30, "#0f0")); }
        } 
        else if (c.style === "AOE") {
            particles.push(new Shockwave(this.pos.x, this.pos.y, c.range, c.color));
            if(c.id === "cleave" || c.id === "vortex" || c.id === "repel" || c.id === "shadow_bind") particles.push(new SlashEffect(this.pos.x, this.pos.y, c.color, c.range, true));
            addShake(4);
            
            for(let e of enemies) {
                if(dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y) < c.range) {
                    if(c.id === "poison") {
                        e.applyDebuff("POISON", finalVal, 240);
                        particles.push(new TextParticle(e.pos.x, e.pos.y, "POISON", c.color));
                    } else if (c.id === "repel") {
                        e.takeDamage(finalVal, c);
                        e.applyDebuff("SLOW", 0, 240);
                        let push = p5.Vector.sub(e.pos, this.pos).setMag(100);
                        e.pos.add(push);
                    } else if (c.id === "shadow_bind") {
                        e.applyDebuff("STUN", 0, 120); 
                        particles.push(new TextParticle(e.pos.x, e.pos.y, "BIND", "#50a"));
                    } else {
                        e.takeDamage(finalVal, c);
                        createImpactSparks(e.pos.x, e.pos.y, p5.Vector.sub(e.pos, this.pos).heading(), c.color, 5);
                        let pushForce = 25; 
                        if(c.id === "cleave") pushForce = 40;
                        if(c.id === "gravity" || c.id === "vortex") pushForce = -30; 
                        if(c.id === "stomp") pushForce = 70;
                        if(c.id === "hammer") pushForce = 120; 
                        
                        let push = p5.Vector.sub(e.pos, this.pos).setMag(pushForce);
                        if(c.id === "gravity" || c.id === "vortex") push = p5.Vector.sub(this.pos, e.pos).setMag(pushForce * -1);
                        e.pos.add(push);
                    }
                }
            }
        } 
        else if (this.target) {
            if (c.system === "Melee") {
                if (c.id === "assassin" && !isMultiHit) {
                    let offset = p5.Vector.sub(this.pos, this.target.pos).normalize().mult(30); 
                    this.pos = p5.Vector.add(this.target.pos, offset);
                    particles.push(new AfterImage(this.pos.x, this.pos.y, 30, "#505", 15));
                    addShake(5);
                }
                if (c.id === "gatotsu") return; 

                if (c.id === "ragnarok") {
                     createExplosion(this.target.pos.x, this.target.pos.y, finalVal, 250, true, "#ff0");
                     addShake(15);
                     for(let e of enemies) {
                         if (!e.dead) {
                             particles.push(new Spark(e.pos.x, e.pos.y-100, "#ff0", PI/2, 15, 10));
                             line(e.pos.x, e.pos.y-200, e.pos.x, e.pos.y);
                             createExplosion(e.pos.x, e.pos.y, finalVal * 0.5, 40, true, "#ff0");
                         }
                     }
                     return;
                }

                let angle = p5.Vector.sub(this.target.pos, this.pos).heading();
                
                if (c.id === "hammer") {
                    particles.push(new Shockwave(this.target.pos.x, this.target.pos.y, 100, c.color));
                } else {
                    particles.push(new SlashEffect(this.target.pos.x, this.target.pos.y, c.color, 70, false, angle));
                }
                
                createImpactSparks(this.target.pos.x, this.target.pos.y, angle, c.color, 10);
                addShake(3);
                
                let splashRange = 80; 
                
                for(let e of enemies) {
                    if(dist(this.target.pos.x, this.target.pos.y, e.pos.x, e.pos.y) < splashRange) {
                         e.takeDamage(finalVal, c);
                         if(c.id === "scythe" && e === this.target) { this.heal(5); particles.push(new TextParticle(this.pos.x, this.pos.y-10, "DRAIN", "#f00")); }
                         if(c.id === "shield_bash" && e === this.target) { this.defBuffTimer = 120; particles.push(new TextParticle(this.pos.x, this.pos.y-10, "DEF UP", "#00f")); }
                         let kb = 30; 
                         if (c.id === "hammer") { kb = 150; triggerFlash(10); }
                         if (c.id === "shield_bash") kb = 60;
                         if (c.id === "dagger") kb = 15; 
                         if (c.id === "charge") kb = 80;
                         if (c.id === "multicut") kb = 25; // Increased to Medium
                         if (c.id === "barrage") kb = 10;
                         
                         let push = p5.Vector.sub(e.pos, this.pos).setMag(kb);
                         e.pos.add(push);
                    }
                }
                if(c.id === "charge" && !isMultiHit) {
                    this.chargeTimer = 10; 
                    this.pos.add(p5.Vector.sub(this.target.pos, this.pos).setMag(30));
                }

            } else if (c.system === "Ranged" || (c.system === "Magic" && c.tag === "PROJECTILE")) {
                let dir = p5.Vector.sub(this.target.pos, this.pos).normalize();
                
                if (c.id === "life_drain") {
                    let drainAmt = Math.floor(this.target.maxHp * 0.25);
                    this.target.takeDamage(drainAmt, c);
                    this.heal(drainAmt);
                    particles.push(new TextParticle(this.target.pos.x, this.target.pos.y, "DRAIN", "#a0f"));
                    particles.push(new Shockwave(this.target.pos.x, this.target.pos.y, 40, "#a0f"));
                    for(let i=0; i<5; i++) {
                        let p = new Spark(this.target.pos.x, this.target.pos.y, "#f0a", 0, 0, 30);
                        p.vel = p5.Vector.sub(this.pos, this.target.pos).normalize().mult(random(5,8));
                        p.drag = 1.0;
                        particles.push(p);
                    }
                    return; 
                }
                
                if (c.id === "m_gun") dir.rotate(random(-0.1, 0.1));
                if (c.id === "flamethrower") dir.rotate(random(-0.2, 0.2));

                if (c.id === "fan_laser") {
                     let angleOffset = map(this.timer, c.duration, 0, -0.5, 0.5);
                     let fanDir = dir.copy().rotate(angleOffset);
                     projectiles.push(new Projectile(this.pos.x, this.pos.y, fanDir, c, finalVal, 25));
                } 
                else if (c.id === "flamethrower") {
                     projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 10));
                }
                else if (c.id === "scatter" || c.id === "shotgun") {
                    let numPellets = (c.id === "scatter") ? 3 : 5;
                    for(let i=0; i<numPellets; i++) {
                        projectiles.push(new Projectile(this.pos.x, this.pos.y, dir.copy().rotate(random(-0.25, 0.25)), c, finalVal, 15));
                    }
                } else if (c.id === "sniper" || c.id === "beam" || c.id === "giga_laser") {
                     let speed = (c.id === "giga_laser") ? 40 : 30;
                     projectiles.push(new Projectile(this.pos.x, this.pos.y, dir.rotate(random(-0.01, 0.01)), c, finalVal, speed));
                     if(c.id === "giga_laser") { addShake(8); triggerFlash(10); }
                     else addShake(2);
                } else if (c.id === "slow_sphere") {
                     projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 2.5));
                } else if (c.id === "cluster") {
                     let p = new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 15);
                     p.drag = 0.95; 
                     projectiles.push(p);
                } else if (c.id === "railgun") {
                     let p = new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 0); // Speed 0 for stationary beam
                     p.life = 120; // Lasts 2s
                     projectiles.push(p);
                     addShake(5);
                } else if (c.id === "icicle") {
                     let p1 = new Projectile(this.pos.x, this.pos.y, dir.copy().rotate(-0.1), c, finalVal, 15);
                     let p2 = new Projectile(this.pos.x, this.pos.y, dir.copy().rotate(0.1), c, finalVal, 15);
                     projectiles.push(p1); projectiles.push(p2);
                } else if (c.id === "shooting_star") {
                     // --- 変更: スターはゆっくり ---
                     let p = new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, 5); 
                     projectiles.push(p);
                     // ---------------------------
                } else {
                    let pSpeed = (c.id === "flame") ? 8 : 15;
                    let p = new Projectile(this.pos.x, this.pos.y, dir, c, finalVal, pSpeed);
                    if(c.id === "boomerang") { p.isBoomerang = true; p.piercing = true; }
                    projectiles.push(p);
                }
            }
        }
    }

    nextCardIndex() { this.deckIndex = (this.deckIndex + 1) % deck.length; this.state = "IDLE"; }

    takeDamage(amt) {
        // --- 変更: アイテム収集中に被弾したら戦闘モードへ ---
        if (this.state === "LOOTING") {
            this.state = "IDLE";
            this.target = null;
        }
        // ----------------------------------------------

        if(this.invincibleTimer > 0) return;
        if(this.activeMoveCard && this.activeMoveCard.id === "move_ghost" && this.state === "MOVING" && random() < 0.3) {
            particles.push(new TextParticle(this.pos.x, this.pos.y-10, "DODGE", "#fff")); return;
        }
        for(let e of equipment) if(e.id === "e_ghost" && random() < 0.15) {
             particles.push(new TextParticle(this.pos.x, this.pos.y-10, "MISS", "#ccc")); return;
        }

        if(this.barrierStock > 0) {
             amt = Math.floor(amt * 0.7); 
             this.barrierStock--;
             particles.push(new TextParticle(this.pos.x, this.pos.y - 25, "BARRIER", "#0ff"));
        }

        let reduction = 0;
        for(let e of equipment) if(e.stats.def) reduction += e.stats.def;
        if(this.activeMoveCard && this.activeMoveCard.id === "move_guard" && this.state === "MOVING") reduction += 0.5; 
        if(this.defBuffTimer > 0) reduction += 0.5;
        
        reduction += this.upgrades.def * 0.05; // Skill Tree DEF +5%

        let finalDmg = Math.max(1, Math.floor(amt * (1.0 - Math.min(0.9, reduction))));
        this.hp -= finalDmg;
        this.invincibleTimer = 60;
        particles.push(new TextParticle(this.pos.x, this.pos.y, "-" + finalDmg, "#f00"));
        createImpactSparks(this.pos.x, this.pos.y, random(TWO_PI), "#f00", 10);
        addShake(5);
        triggerFlash(50);
    }

    heal(amt) { this.hp = min(this.hp + amt, this.maxHp); particles.push(new TextParticle(this.pos.x, this.pos.y, "+" + amt, "#0f0")); }

    getClosestEnemy() {
        let closest = null; let minDist = 9999;
        for (let e of enemies) {
            let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
            if (d < minDist) { minDist = d; closest = e; }
        }
        return closest;
    }

    getFarthestEnemy() {
        let farthest = null; let maxDist = -1;
        for (let e of enemies) {
            let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
            if (d > maxDist && d < 1000) { 
                maxDist = d; farthest = e; 
            }
        }
        return farthest || enemies[0]; 
    }

    getClosestDrop() {
        let closest = null; let minDist = 9999;
        let maxPots = 3 + this.getStat("potionStockAdd");

        for (let d of drops) {
            if (d.type === "POTION") {
                // HP満タンかつストック満タンなら無視
                if (this.potionStock >= maxPots && this.hp >= this.maxHp) continue; 
            }
            // ハートはHP満タンなら無視
            if (d.type === "HEART" && this.hp >= this.maxHp) continue;
            
            let distToDrop = dist(this.pos.x, this.pos.y, d.pos.x, d.pos.y);
            if (distToDrop < minDist) { minDist = distToDrop; closest = d; }
        }
        return closest;
    }

    draw() {
        push(); translate(this.pos.x, this.pos.y);
        drawingContext.shadowBlur = 15; drawingContext.shadowColor = "rgba(255,255,255,0.8)";
        if(this.state==="LOOTING") { noFill(); stroke(255,215,0); circle(0,0,30); }
        else if(this.activeMoveCard && this.state==="MOVING") { 
            noFill(); stroke(this.activeMoveCard.color); 
            if(this.activeMoveCard.id === "move_reflect") { strokeWeight(3); arc(0,0,50,50, -PI/3, PI/3); } 
            else if (this.activeMoveCard.id === "move_warp") { drawingContext.setLineDash([5, 5]); circle(0,0, 30 + sin(frameCount*0.2)*5); drawingContext.setLineDash([]); }
            else if (this.activeMoveCard.id === "move_spike") { drawingContext.setLineDash([10, 5]); circle(0,0, 30); drawingContext.setLineDash([]); }
            else if (this.activeMoveCard.id === "move_strafe") { arc(0,0,40,40, frameCount*0.1, frameCount*0.1 + PI); }
            else if (this.activeMoveCard.id === "move_kite") { circle(0,0,30); line(0,0,0,-25); }
            else if (this.activeMoveCard.id === "move_barrage") { drawingContext.setLineDash([2, 2]); circle(0,0,35); drawingContext.setLineDash([]); }
            else if (this.activeMoveCard.id === "move_phase") { 
                drawingContext.setLineDash([15, 5]); circle(0,0, 35); drawingContext.setLineDash([]);
                if(this.phaseTimer > 0) { noStroke(); fill(160,0,255,100); circle(0,0,35 * (this.phaseTimer/60)); }
            }
            else { circle(0,0,35); }
        }
        if(this.defBuffTimer > 0) { noFill(); stroke(0,0,255); circle(0,0,28); }
        if(this.barrierStock > 0) { noFill(); stroke(0,255,255); strokeWeight(2); circle(0,0,38); for(let i=0; i<this.barrierStock; i++) circle(20*cos(i*2), 20*sin(i*2), 6); }
        if(this.status.stun > 0) { noFill(); stroke(255,255,0); circle(0,0,30); } 
        if(this.status.slow > 0) { noFill(); stroke(100,100,255); circle(0,0,32); }
        if(this.status.poison > 0) { noFill(); stroke(0,255,0); circle(0,0,34); }

        if (this.state === "CASTING") {
            noFill(); stroke(255, 150, 0); strokeWeight(2);
            let progress = map(this.timer, 60, 0, 0, TWO_PI);
            arc(0, 0, 40, 40, -HALF_PI, -HALF_PI + progress);
        }

        stroke(255); strokeWeight(2); fill(this.invincibleTimer>0 && frameCount%4<2 ? 255 : 20);
        if (this.state === "ACTING") fill(255, 200, 50);
        circle(0, 0, this.size);
        drawingContext.shadowBlur = 0;
        noStroke(); fill(50,0,0); rect(-15,-25,30,4);
        fill(0,255,100); rect(-15,-25,30*(this.hp/this.maxHp),4);
        if(this.state === "LOOTING") { fill(255,215,0); textSize(10); textAlign(CENTER); text("!", 0, -30); }
        
        if(this.potionStock > 0) {
            for(let i=0; i<this.potionStock; i++) {
                fill(100,255,100); noStroke(); circle(-10 + i*8, -32, 6);
            }
        }

        pop();
    }
}
