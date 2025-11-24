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
        this.life = 12; 
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
        noFill(); 
        drawingContext.shadowBlur = 25; 
        drawingContext.shadowColor = this.col;
        
        // --- 変更: 斬撃をより鋭く ---
        stroke(this.col); strokeWeight(3); 
        fill(this.col); // 少し中身も塗る
        
        beginShape();
        // 三日月型の描画ロジックを鋭角化
        for(let i = -1.2; i <= 1.2; i += 0.1) {
            let r = this.size/2;
            vertex(cos(i)*r, sin(i)*r);
        }
        for(let i = 1.2; i >= -1.2; i -= 0.1) {
            let r = this.size/2 * 0.6; // 内径を小さくして鋭くする
            vertex(cos(i)*r - 5, sin(i)*r); // 少し中心をずらす
        }
        endShape(CLOSE);
        // -------------------------
        
        drawingContext.shadowBlur = 0;
        pop(); 
    } 
}
