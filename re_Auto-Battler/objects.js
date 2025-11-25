/* Sandbox Auto-Battler V35 - Game Objects (Projectiles, Drops, Deployables) */

class Deployable {
    constructor(x, y, type) {
        this.pos = createVector(x, y);
        this.type = type;
        
        // --- 各種タレット・設置物のパラメータ設定 ---
        if (type === "BLACK_HOLE") {
            this.life = 300; this.range = 400;
        } else if (type === "TOXIC_MIST") {
            this.life = 300; this.range = 150;
        } else if (type === "SNIPER_TURRET") {
            // 持続7秒(420F), 攻撃間隔を遅く(160F:約2.7秒)
            this.life = 420; this.range = 800; this.maxTimer = 160; 
        } else if (type === "LASER_TURRET") {
            // 持続6秒(360F)
            this.life = 360; this.range = 500; this.maxTimer = 90; 
        } else if (type === "GATLING_TURRET") {
            // 持続5秒(300F)
            this.life = 300; this.range = 350; this.maxTimer = 10; 
        } else if (type === "MISSILE_TURRET") {
            // 持続8秒(480F)
            this.life = 480; this.range = 600; this.maxTimer = 150; 
        } else if (type === "ARC_TURRET") {
            // 持続6秒(360F)
            this.life = 360; this.range = 250; this.maxTimer = 60; 
        } else if (type === "FLAME_TURRET") {
            // 持続7秒(420F)
            this.life = 420; this.range = 200; this.maxTimer = 5; 
        } else {
            // 通常タレット
            this.life = 480; this.range = 300; this.maxTimer = 30;
        }
        
        this.timer = 0;
        this.dead = false;
    }

    update() {
        this.life--;
        if(this.life <= 0) this.dead = true;
        this.timer--;
        
        // --- 攻撃力にプレイヤーのRangeステータスを反映 ---
        let dmgMult = 1.0;
        if (typeof player !== 'undefined' && player) dmgMult = player.getStat("range");
        // --------------------------------------------------

        if (this.type === "BLACK_HOLE") {
            if(frameCount % 2 === 0) {
                particles.push(new Spark(this.pos.x + random(-20,20), this.pos.y + random(-20,20), "#a0f", 0, 0, 10));
            }
            for(let e of enemies) {
                if(dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y) < this.range) {
                    let pull = p5.Vector.sub(this.pos, e.pos).normalize().mult(1.5);
                    e.pos.add(pull);
                }
            }
        } else if (this.type === "TOXIC_MIST") {
            if(frameCount % 10 === 0) {
                particles.push(new Spark(this.pos.x + random(-this.range/2, this.range/2), this.pos.y + random(-this.range/2, this.range/2), "#808", -HALF_PI, random(0.5, 1.5), 20));
            }
            if (frameCount % 60 === 0) {
                let poisonDurMult = 1.0;
                if(typeof equipment !== 'undefined' && equipment.some(e => e.id === "e_plague")) poisonDurMult = 1.5;
                for(let e of enemies) {
                    if(dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y) < this.range) {
                        e.applyDebuff("POISON", 5, 300 * poisonDurMult);
                    }
                }
            }
        } else if (this.type === "ARC_TURRET") {
            // アークタレット: 範囲内の敵に即着弾攻撃
            if (this.timer <= 0) {
                let target = this.getClosestEnemy();
                if (target) {
                    let dmg = Math.floor(12 * dmgMult);
                    target.takeDamage(dmg, {id:"arc_turret"});
                    
                    // 電撃エフェクト (線分をパーティクルで表現)
                    let segments = 5;
                    let curX = this.pos.x, curY = this.pos.y - 10;
                    for(let i=0; i<segments; i++) {
                        let nextX = lerp(curX, target.pos.x, (i+1)/segments) + random(-10,10);
                        let nextY = lerp(curY, target.pos.y, (i+1)/segments) + random(-10,10);
                        particles.push(new Spark((curX+nextX)/2, (curY+nextY)/2, "#0ff", random(TWO_PI), 0, 5));
                        curX = nextX; curY = nextY;
                    }
                    particles.push(new Shockwave(target.pos.x, target.pos.y, 30, "#0ff"));
                    this.timer = this.maxTimer;
                }
            }
        } else {
            // 射撃系タレット共通処理
            if(this.timer <= 0) {
                let target = this.getClosestEnemy();
                if(target) {
                    let dir = p5.Vector.sub(target.pos, this.pos).normalize();
                    let pSpeed = 10;
                    let pLife = 60;
                    let card = { id:"turret_shot", tag:"PROJECTILE", style:"RANGE", range:this.range, color:"#aa0" };
                    let dmg = 0;

                    if (this.type === "TURRET") {
                        card.color = "#aa0"; dmg = 15; pSpeed = 10;
                    } else if (this.type === "SNIPER_TURRET") {
                        // 攻撃力35
                        card.color = "#f00"; card.id = "sniper_shot"; dmg = 35; pSpeed = 30; pLife = 40;
                        card.piercing = true; 
                    } else if (this.type === "LASER_TURRET") {
                        card.color = "#0ff"; card.id = "beam"; dmg = 15; pSpeed = 25; pLife = 30;
                        card.piercing = true; 
                    } else if (this.type === "GATLING_TURRET") {
                        card.color = "#fa0"; dmg = 4; pSpeed = 15; pLife = 40;
                        dir.rotate(random(-0.1, 0.1));
                    } else if (this.type === "MISSILE_TURRET") {
                        card.color = "#f80"; card.id = "homing_missile"; dmg = 25; pSpeed = 8; pLife = 100;
                    } else if (this.type === "FLAME_TURRET") {
                        card.color = "#f40"; card.id = "flame"; dmg = 6; pSpeed = 7; pLife = 25;
                        card.piercing = true;
                        dir.rotate(random(-0.3, 0.3));
                    }

                    let finalDmg = Math.floor(dmg * dmgMult);
                    
                    let p = new Projectile(this.pos.x, this.pos.y - 10, dir, card, finalDmg, pSpeed);
                    p.life = pLife;
                    
                    if (this.type === "MISSILE_TURRET") {
                        p.homing = true; p.target = target;
                    }

                    projectiles.push(p);
                    this.timer = this.maxTimer;
                }
            }
        }
    }

    getClosestEnemy() {
        let closest = null; let minDist = 9999;
        for (let e of enemies) {
            let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
            if (d < minDist && d < this.range) { minDist = d; closest = e; }
        }
        return closest;
    }

    draw() {
        push(); translate(this.pos.x, this.pos.y);
        drawingContext.shadowBlur = 10;
        
        if(this.type === "TURRET") {
            drawingContext.shadowColor = "#ff0";
            noStroke(); fill(150, 150, 0); rect(-10, -10, 20, 20);
            fill(255, 255, 0); circle(0, -5, 10);
        } else if (this.type === "SNIPER_TURRET") {
            drawingContext.shadowColor = "#f00";
            fill(50); rect(-12, -12, 24, 24);
            fill(100); rect(-4, -20, 8, 20); // 長い砲身
            fill(255, 0, 0); circle(0, -5, 6);
        } else if (this.type === "LASER_TURRET") {
            drawingContext.shadowColor = "#0ff";
            fill(0, 100, 150); ellipse(0, 0, 24, 16);
            fill(0, 255, 255); rect(-2, -15, 4, 15);
            circle(0, -15, 8);
        } else if (this.type === "GATLING_TURRET") {
            drawingContext.shadowColor = "#fa0";
            fill(100, 80, 0); rect(-10, -10, 20, 20);
            fill(255, 150, 0); 
            rect(-8, -15, 4, 10); rect(4, -15, 4, 10); rect(-2, -18, 4, 12);
        } else if (this.type === "MISSILE_TURRET") {
            drawingContext.shadowColor = "#f80";
            fill(80); rect(-12, -8, 24, 16);
            fill(255, 100, 0); rect(-10, -15, 6, 10); rect(4, -15, 6, 10);
        } else if (this.type === "ARC_TURRET") {
            drawingContext.shadowColor = "#0ff";
            fill(50, 50, 100); circle(0, 0, 24);
            noFill(); stroke(0, 255, 255); strokeWeight(2);
            let r = 12 + sin(frameCount * 0.5) * 4;
            circle(0, -10, r);
        } else if (this.type === "FLAME_TURRET") {
            drawingContext.shadowColor = "#f40";
            fill(100, 50, 0); rect(-10, -10, 20, 20, 5);
            fill(255, 50, 0); triangle(-5, -5, 5, -5, 0, -20);
        } else if (this.type === "BLACK_HOLE") {
            drawingContext.shadowBlur = 20; drawingContext.shadowColor = "#a0f";
            noStroke(); fill(0); circle(0,0,60);
            noFill(); stroke(100,0,255); strokeWeight(2); circle(0,0,70 + sin(frameCount*0.2)*10);
        } else if (this.type === "TOXIC_MIST") {
            noStroke();
            fill(128, 0, 128, 50 + sin(frameCount * 0.1) * 20);
            circle(0, 0, this.range * 2);
            fill(0, 255, 0, 100);
            for(let i=0; i<3; i++) {
                let r = this.range * random(0.2, 0.8);
                let a = frameCount * 0.05 + i * (TWO_PI/3);
                circle(cos(a)*r, sin(a)*r, 10 + sin(frameCount*0.2+i)*5);
            }
        }
        
        // 範囲表示 (薄く)
        if (this.type.includes("TURRET")) {
             noFill(); stroke(255, 255, 255, 30); strokeWeight(1);
             circle(0, 0, this.range * 2);
        }

        pop();
    }
}

class Drop {
    constructor(x, y, type) { 
        this.pos = createVector(x, y); 
        this.type = type; 
        this.size = 15; 
        this.floatOffset = random(TWO_PI); 
        this.age = 0; 
    }
    update() { 
        this.floatOffset += 0.1; 
        this.age++;
    }
    draw() {
        let yOff = sin(this.floatOffset)*3;
        push(); translate(this.pos.x, this.pos.y + yOff);
        drawingContext.shadowBlur = 15;
        if (this.type === "POTION") { 
            drawingContext.shadowColor = "#f88"; 
            fill(255,100,100); noStroke(); 
            beginShape(); vertex(-5,5); vertex(5,5); vertex(5,-5); vertex(3,-8); vertex(-3,-8); vertex(-5,-5); endShape(CLOSE); 
            fill(255); circle(2,-2,3); 
        } else if (this.type === "HEART") {
            drawingContext.shadowColor = "#f00"; 
            fill(255, 0, 0); noStroke();
            beginShape();
            vertex(0, 5);
            bezierVertex(-5, 0, -10, -5, 0, -10);
            bezierVertex(10, -5, 5, 0, 0, 5);
            endShape(CLOSE);
        }
        else { 
            drawingContext.shadowColor = "#fb0"; 
            fill(200, 150, 0); stroke(255,200,50); strokeWeight(2); 
            rect(-8, -6, 16, 12); line(-8, -2, 8, -2); 
        }
        pop();
    }
}

class Projectile {
    constructor(x, y, dirVec, card, val, speed) {
        this.pos = createVector(x, y); this.vel = dirVec.copy().setMag(speed);
        this.card = card; this.val = val; this.color = card.color || "#fff";
        this.dead = false; this.life = (card.id === "flame" || card.id === "flamethrower") ? 20 : 60; 
        this.piercing = (card.style === "AOE" || card.id === "flame" || card.id === "flamethrower" || card.id === "beam" || card.id === "sniper" || card.id === "giga_laser" || card.id === "boomerang" || card.id === "fan_laser" || card.id === "slow_sphere" || card.id === "railgun" || card.id === "icicle" || card.id === "javelin" || card.id === "gear" || card.id === "super_ball" || card.piercing);
        this.isOrbiter = false; this.orbitAngle = 0; this.orbitRadius = 0;
        
        this.bounceCount = card.bounce || 0;
        if (card.id === "gear") this.bounceCount = 5; 
        if (card.id === "super_ball") this.bounceCount = 20; 

        if(card.id === "slow_sphere") this.life = 180; 
        if(card.id === "railgun") this.life = 10; 
        if(card.id === "gear") this.life = 180;
        if(card.id === "super_ball") this.life = 300; 
        if(card.id === "homing_missile") { this.life = 120; this.homing = true; this.target = null; }

        this.isBoomerang = (card.id === "boomerang");
        this.returnTimer = 0; 
        if(this.isBoomerang) this.life = 180; 
        
        this.drag = 1.0; 
    }
    update() { 
        if(this.isOrbiter) {
            this.orbitAngle += 0.1;
            this.pos.x = player.pos.x + cos(this.orbitAngle) * this.orbitRadius;
            this.pos.y = player.pos.y + sin(this.orbitAngle) * this.orbitRadius;
            this.life--; if(this.life<=0) this.dead=true;
        } else if(this.isBoomerang) {
            this.pos.add(this.vel);
            this.returnTimer++;
            if(this.returnTimer > 30) { 
                let toPlayer = p5.Vector.sub(player.pos, this.pos);
                toPlayer.setMag(1.5); 
                this.vel.add(toPlayer);
                this.vel.limit(25); 
                if(dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 30 && this.returnTimer > 45) {
                    this.dead = true; 
                }
            }
            this.life--; if(this.life<=0) this.dead=true;
        } else {
            this.pos.add(this.vel); 
            this.vel.mult(this.drag); 
            
            if (this.homing && this.target && !this.target.dead) {
                let desired = p5.Vector.sub(this.target.pos, this.pos).setMag(this.vel.mag());
                this.vel.lerp(desired, 0.1);
            }

            if (this.card.id === "gear" || this.card.id === "super_ball") {
                let left = camX;
                let right = camX + width;
                let top = camY;
                let bottom = camY + height; 

                let bounced = false;
                if (this.pos.x < left) { this.pos.x = left; this.vel.x *= -1; bounced = true; }
                if (this.pos.x > right) { this.pos.x = right; this.vel.x *= -1; bounced = true; }
                if (this.pos.y < top) { this.pos.y = top; this.vel.y *= -1; bounced = true; }
                if (this.pos.y > bottom) { this.pos.y = bottom; this.vel.y *= -1; bounced = true; }

                if (bounced) {
                    this.bounceCount--;
                    particles.push(new Spark(this.pos.x, this.pos.y, "#aaa", 0, 0, 10));
                    if (this.bounceCount < 0) this.dead = true;
                }
            }

            this.life--; 
            if(this.life<0 || this.pos.x<0 || this.pos.x>WORLD_W || this.pos.y<0 || this.pos.y>WORLD_H) this.dead=true; 
        }
    }
    draw() { 
        push(); 
        drawingContext.shadowBlur = 20; 
        drawingContext.shadowColor = this.color;
        fill(this.color); noStroke(); 
        translate(this.pos.x, this.pos.y);
        
        if(this.card.id === "beam" || this.card.id === "sniper" || this.card.id === "intercept" || this.card.id === "beam") { // Beam is duplicated but harmless
            rotate(this.vel.heading()); 
            rect(-15, -3, 30, 6); 
            fill(255); rect(-10,-1, 20,2); 
        }
        else if(this.card.id === "fan_laser") {
             rotate(this.vel.heading());
             rect(-15,-2, 30, 4);
        }
        else if(this.card.id === "giga_laser") { 
            rotate(this.vel.heading()); 
            fill(this.color); rect(-30, -15, 60, 30); 
            fill(255); rect(-25, -8, 50, 16); 
        }
        else if(this.card.id === "railgun") {
            rotate(this.vel.heading());
            fill(100, 200, 255); rect(-40, -4, 1200, 8); 
            fill(255); rect(-30, -2, 1200, 4);
        }
        else if(this.card.id === "slow_sphere") {
             circle(0,0,30); 
        }
        else if(this.card.id === "icicle") {
             rotate(this.vel.heading());
             fill(200, 255, 255);
             triangle(10, 0, -10, 4, -10, -4);
        }
        else if(this.card.id === "javelin") {
            rotate(this.vel.heading());
            stroke(255, 100); strokeWeight(1); line(-40, 0, 0, 0); noStroke();
            fill(139, 69, 19); rect(-15, -2, 30, 4);
            fill(200, 200, 200); triangle(15, -4, 35, 0, 15, 4);
            fill(255); rect(-10, -1, 20, 2);
        }
        else if (this.card.id === "gear") {
            rotate(frameCount * 0.2);
            fill(150); circle(0, 0, 20);
            fill(200); for(let i=0; i<8; i++) { rotate(PI/4); rect(8, -3, 6, 6); }
            fill(50); circle(0,0,8);
        }
        else if (this.card.id === "super_ball") {
            fill(random(255), random(255), 255); 
            circle(0, 0, 18);
            fill(255, 200); circle(4, -4, 6);
        }
        else if (this.card.id === "homing_missile") {
            rotate(this.vel.heading());
            fill(200, 100, 50); rect(-10, -4, 20, 8);
            fill(255, 0, 0); triangle(10, -4, 15, 0, 10, 4);
            fill(255, 200, 0, 150); triangle(-10, -3, -10, 3, -10 - random(5,10), 0);
        }
        else if (this.card.id === "poison_flask") {
            rotate(this.vel.heading());
            fill(0, 255, 0); rect(-6, -4, 12, 8, 2);
            fill(200); rect(4, -2, 4, 4); // 蓋
        }
        else if (this.card.id === "toxic_mist") {
            fill(150, 0, 150); circle(0,0,12);
            noFill(); stroke(200, 0, 200); circle(0,0,16);
        }
        else if(this.isBoomerang) { 
            rotate(frameCount * 0.5); 
            noFill(); stroke(this.color); strokeWeight(4); arc(0,0,24,24, 0, PI/1.5); 
        }
        else if(this.card.id === "flame" || this.card.id === "flamethrower") {
            fill(255,100,0); circle(0,0,random(8,14));
        }
        else if(this.card.id === "bow" || this.card.id === "backstep") {
            rotate(this.vel.heading());
            fill(255); triangle(5,0, -5,-4, -5,4);
        }
        else if(this.card.id === "shooting_star") {
            rotate(this.vel.heading());
            fill(255, 255, 100);
            beginShape(); vertex(10,0); vertex(-5,5); vertex(-5,-5); endShape(CLOSE);
        }
        else if(this.card.tag === "EXPLOSION") circle(0, 0, 14);
        else circle(0, 0, 10); 
        
        pop(); 
    }
}
