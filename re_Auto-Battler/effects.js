/* Sandbox Auto-Battler V35 - Visual Effects */

class Spark {
    constructor(x, y, col, angle, speed, life) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(angle).mult(speed);
        this.col = col;
        this.life = life;
        this.maxLife = life;
        this.drag = 0.9;
        this.dead = false;
    }
    update() {
        this.pos.add(this.vel);
        this.vel.mult(this.drag);
        this.life--;
        if(this.life <= 0) this.dead = true;
    }
    draw() {
        push();
        stroke(this.col); strokeWeight(2);
        line(this.pos.x, this.pos.y, this.pos.x - this.vel.x, this.pos.y - this.vel.y);
        pop();
    }
}

// --- 追加: UI用のテキストパーティクル ---
class UIParticle { 
    constructor(x, y, txt, col, life=40) { 
        this.pos = createVector(x, y); 
        this.vel = createVector(0, -1.5); // UI上なのでゆっくり上昇
        this.txt = txt; 
        this.col = col; 
        this.life = life; 
        this.maxLife = life;
        this.dead = false;
    } 
    update() { 
        this.pos.add(this.vel); 
        this.life--; 
        if(this.life <= 0) this.dead = true; 
    } 
    draw() { 
        push(); 
        // カメラの影響を受けないよう translate しない
        drawingContext.shadowBlur = 5; 
        drawingContext.shadowColor = "#000";
        fill(this.col); 
        textSize(14); // 少し小さめ
        textStyle(BOLD); 
        textAlign(CENTER); 
        let alpha = map(this.life, 0, this.maxLife, 0, 255);
        fill(red(color(this.col)), green(color(this.col)), blue(color(this.col)), alpha);
        text(this.txt, this.pos.x, this.pos.y); 
        pop(); 
    } 
}
// -----------------------------------

class TextParticle { 
    constructor(x, y, txt, col, life=40) { 
        this.pos = createVector(x, y); 
        this.vel = createVector(random(-1.5, 1.5), -3); 
        this.txt = txt; 
        this.col = col; 
        this.life = life; 
        this.maxLife = life;
        this.dead = false;
    } 
    update() { 
        this.pos.add(this.vel); 
        this.vel.y += 0.1; // Gravity
        this.life--; 
        if(this.life <= 0) this.dead = true; 
    } 
    draw() { 
        push(); 
        drawingContext.shadowBlur = 5; 
        drawingContext.shadowColor = "#000";
        fill(this.col); 
        textSize(16 + (this.life/this.maxLife)*5); // Scale down
        textStyle(BOLD); 
        textAlign(CENTER); 
        text(this.txt, this.pos.x, this.pos.y); 
        pop(); 
    } 
}

class Shockwave { 
    constructor(x, y, size, col) { 
        this.x = x; 
        this.y = y; 
        this.max = size; 
        this.s = 1; 
        this.col = col; 
        this.life = 15; 
        this.dead = false;
    } 
    update() { 
        this.s = lerp(this.s, this.max, 0.25); 
        this.life--; 
        if(this.life <= 0) this.dead = true; 
    } 
    draw() { 
        push(); 
        noFill(); 
        stroke(this.col); 
        strokeWeight(4); 
        drawingContext.shadowBlur = 15; 
        drawingContext.shadowColor = this.col; 
        circle(this.x, this.y, this.s); 
        pop(); 
    } 
}

class ExplosionEffect { 
    constructor(x, y, col, count=10) { 
        this.parts = []; 
        for(let i=0; i<count; i++){ 
            this.parts.push({
                pos: createVector(x, y), 
                vel: p5.Vector.random2D().mult(random(2, 8)), 
                size: random(4, 12), 
                life: random(10, 30)
            }); 
        } 
        this.col = col; 
        this.dead = false; 
    } 
    update() { 
        let active = 0; 
        for(let p of this.parts) { 
            p.pos.add(p.vel); 
            p.life--; 
            p.size *= 0.92; 
            if(p.life > 0) active++; 
        } 
        if(active === 0) this.dead = true; 
    } 
    draw() { 
        push(); 
        noStroke(); 
        fill(this.col); 
        drawingContext.shadowBlur = 15; 
        drawingContext.shadowColor = this.col; 
        for(let p of this.parts) { 
            if(p.life > 0) circle(p.pos.x, p.pos.y, p.size); 
        } 
        pop(); 
    } 
}

class AfterImage { 
    constructor(x, y, size, col, life) { 
        this.x = x; 
        this.y = y; 
        this.size = size; 
        this.col = col; 
        this.life = life; 
        this.maxLife = life; 
        this.dead = false;
    } 
    update() { 
        this.life--; 
        if(this.life <= 0) this.dead = true; 
    } 
    draw() { 
        push(); 
        noStroke(); 
        let alpha = map(this.life, 0, this.maxLife, 0, 255); 
        fill(red(color(this.col)), green(color(this.col)), blue(color(this.col)), alpha); 
        circle(this.x, this.y, this.size); 
        pop(); 
    } 
}

class SlashEffect { 
    constructor(x, y, col, size=90, isSpin=false, angle=0) { 
        this.x = x; 
        this.y = y; 
        this.life = 10; 
        this.col = col; 
        this.size = size;
        this.ang = isSpin ? random(TWO_PI) : angle; 
        this.isSpin = isSpin;
        this.dead = false;
    } 
    update() { 
        this.life--; 
        if(this.life <= 0) this.dead = true; 
        if(this.isSpin) this.ang += 0.3; 
    } 
    draw() { 
        push(); 
        translate(this.x, this.y); 
        rotate(this.ang); 
        drawingContext.shadowBlur = 15; 
        drawingContext.shadowColor = this.col;
        stroke(this.col); strokeWeight(2); 
        fill(this.col); 
        beginShape();
        let widthFactor = 0.2; 
        for(let i = -1.0; i <= 1.0; i += 0.1) {
            let r = this.size/2;
            vertex(cos(i)*r, sin(i)*r);
        }
        for(let i = 1.0; i >= -1.0; i -= 0.1) {
            let r = (this.size/2) * (1.0 - widthFactor * (1.0 - abs(i))); 
            vertex(cos(i)*r - 2, sin(i)*r); 
        }
        endShape(CLOSE);
        drawingContext.shadowBlur = 0;
        pop(); 
    } 
}

class StabEffect {
    constructor(x, y, angle, col, length=100) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.col = col;
        this.length = length;
        this.life = 8;
        this.maxLife = 8;
        this.dead = false;
    }
    update() {
        this.life--;
        if(this.life <= 0) this.dead = true;
    }
    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        let progress = 1.0 - (this.life / this.maxLife);
        let currentLen = this.length * (1.0 - pow(progress - 0.2, 2)); 
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = this.col;
        noStroke(); fill(this.col);
        beginShape();
        vertex(0, -3); vertex(currentLen, 0); vertex(0, 3); vertex(-10, 0);
        endShape(CLOSE);
        stroke(this.col); strokeWeight(1);
        line(-20, 0, currentLen * 0.8, 0);
        pop();
    }
}
