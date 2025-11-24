/* Sandbox Auto-Battler V35 - Game Objects (Projectiles, Drops, Deployables) */

class Deployable {
    constructor(x, y, type) {
        this.pos = createVector(x, y);
        this.type = type;
        this.life = type === "BLACK_HOLE" ? 300 : 480;
        this.timer = 0;
        this.range = type === "BLACK_HOLE" ? 400 : 300;
        this.dead = false;
    }
    update() {
        this.life--;
        if(this.life <= 0) this.dead = true;
        this.timer--;
        
        if(this.type === "TURRET") {
            if(this.timer <= 0) {
                let target = this.getClosestEnemy();
                if(target) {
                    let dir = p5.Vector.sub(target.pos, this.pos).normalize();
                    let card = { id:"turret_shot", tag:"PROJECTILE", style:"RANGE", range:400, color:"#aa0" };
                    projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, card, 15, 10));
                    this.timer = 30; 
                }
            }
        } else if (this.type === "BLACK_HOLE") {
            if(frameCount % 2 === 0) {
                particles.push(new Spark(this.pos.x + random(-20,20), this.pos.y + random(-20,20), "#a0f", 0, 0, 10));
            }
            for(let e of enemies) {
                let d = dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
                if(d < this.range) {
                    let pull = p5.Vector.sub(this.pos, e.pos).normalize().mult(1.5);
                    e.pos.add(pull);
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
        if(this.type === "TURRET") {
            drawingContext.shadowBlur = 10; drawingContext.shadowColor = "#ff0";
            noStroke(); fill(150, 150, 0);
            rect(-10, -10, 20, 20);
            fill(255, 255, 0); circle(0, -5, 10);
            noFill(); stroke(255,255,0, 100); circle(0,0, this.range * 0.2); 
        } else if (this.type === "BLACK_HOLE") {
            drawingContext.shadowBlur = 20; drawingContext.shadowColor = "#a0f";
            noStroke(); fill(0); circle(0,0,60);
            noFill(); stroke(100,0,255); strokeWeight(2); circle(0,0,70 + sin(frameCount*0.2)*10);
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
        this.piercing = (card.style === "AOE" || card.id === "flame" || card.id === "flamethrower" || card.id === "beam" || card.id === "sniper" || card.id === "giga_laser" || card.id === "boomerang" || card.id === "fan_laser" || card.id === "slow_sphere" || card.id === "railgun" || card.id === "icicle" || card.id === "javelin" || card.id === "gear" || card.id === "super_ball");
        this.isOrbiter = false; this.orbitAngle = 0; this.orbitRadius = 0;
        
        this.bounceCount = card.bounce || 0;
        if (card.id === "gear") this.bounceCount = 5; 
        // --- 追加: スーパーボールの跳弾回数 ---
        if (card.id === "super_ball") this.bounceCount = 20; 
        // -----------------------------------

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

            // --- 変更: ギアとスーパーボールの画面反射 ---
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
            // ---------------------------------------

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
        
        if(this.card.id === "beam" || this.card.id === "sniper" || this.card.id === "intercept") { 
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
        // --- 追加: スーパーボールの描画 ---
        else if (this.card.id === "super_ball") {
            fill(random(255), random(255), 255); 
            circle(0, 0, 18);
            fill(255, 200); circle(4, -4, 6);
        }
        // ------------------------------
        else if (this.card.id === "homing_missile") {
            rotate(this.vel.heading());
            fill(200, 100, 50); rect(-10, -4, 20, 8);
            fill(255, 0, 0); triangle(10, -4, 15, 0, 10, 4);
            fill(255, 200, 0, 150); triangle(-10, -3, -10, 3, -10 - random(5,10), 0);
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
