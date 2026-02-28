import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    OnDestroy,
    signal,
} from '@angular/core';

interface Point {
    x: number;
    y: number;
}

interface Arrow {
    id: number;
    x: number;  // game-area fraction 0–1
    y: number;
    vx: number; // per-frame velocity in the same 0–1 space
    vy: number;
}

interface Slime {
    id: number;
    x: number;          // current logical centre (0–1)
    y: number;
    color: string;
    shadowColor: string;
    eyeColor: string;
    size: number;       // scale factor (0.7–1.3)
    // hop state
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    jumpPhase: number;  // 0–1 progress of current hop
    jumpDuration: number; // frames for one hop
    restFrames: number;   // frames to wait between hops
    restTimer: number;    // counts down between hops
    // visual (pre-computed each frame)
    visualX: number;
    visualY: number;
    scaleX: number;
    scaleY: number;
}

interface BurstParticle {
    id: number;
    x: number;
    y: number;
    color: string;
    frame: number; // counts up to BURST_DURATION
}

interface Coin {
    id: number;
    x: number;
    y: number;
    frame: number; // counts up to COIN_LIFETIME
}

interface Boss {
    x: number;
    y: number;
    health: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    jumpPhase: number;
    jumpDuration: number;
    restFrames: number;
    restTimer: number;
    visualX: number;
    visualY: number;
    scaleX: number;
    scaleY: number;
    hitFlash: number; // counts down for white-flash feedback
}

interface TreasureBox {
    id: number;
    x: number;
    y: number;
}

type WalkingDirection = 'left' | 'right' | 'up' | 'down' | null;
export type CharacterGender = 'male' | 'female';

const MOVE_STEP = 0.005;
const ANIMATION_SPEED = 10;        // frames per leg-pose
const CHAR_HALF_W = 0.05;
const CHAR_HALF_H = 0.08;
const ARROW_SPEED = 0.013;         // game-area units per frame ≈ full width in ~1.3s
const SWORD_DURATION_FRAMES = 22;  // ≈367ms at 60fps – must match CSS animation duration

// ── Slime constants ────────────────────────────────────────────────────────────
const SLIME_VARIANTS: { color: string; shadowColor: string; eyeColor: string }[] = [
    { color: '#FF6B6B', shadowColor: '#C0392B', eyeColor: '#7B0000' },
    { color: '#51CF66', shadowColor: '#27AE60', eyeColor: '#004D1A' },
    { color: '#FFD43B', shadowColor: '#E8A000', eyeColor: '#5A3E00' },
    { color: '#74C0FC', shadowColor: '#2980B9', eyeColor: '#003366' },
    { color: '#DA77F2', shadowColor: '#8E44AD', eyeColor: '#3A006F' },
    { color: '#FF8CC8', shadowColor: '#CC4499', eyeColor: '#660033' },
    { color: '#FF922B', shadowColor: '#CC5500', eyeColor: '#6B2500' },
    { color: '#66D9E8', shadowColor: '#0096B7', eyeColor: '#003D4D' },
];
const SLIME_SPAWN_INTERVAL = 90;  // frames between spawns (~1.5 s at 60 fps)
const MAX_SLIMES = 10;
const SLIME_JUMP_DISTANCE = 0.065; // how far each hop carries the slime
const SLIME_JUMP_DURATION = 18;    // frames for one hop
const SLIME_REST_MIN = 20;         // min frames between hops
const SLIME_REST_MAX = 50;         // max frames between hops
const SLIME_JUMP_HEIGHT = 0.04;   // peak arc height during a hop (game-area fraction)
const SLIME_HIT_RADIUS = 0.07;    // arrow–slime collision radius
const SWORD_REACH = 0.16;         // how far the sword arc extends
const SWORD_CONE_HALF_ANGLE = 55 * (Math.PI / 180); // half-angle of the swing cone
const BURST_DURATION = 30;        // frames for burst animation
const COIN_LIFETIME = 220;        // frames coin stays visible
const COIN_COLLECT_RADIUS = 0.06; // how close the character must be to pick up a coin

// ── Boss constants ──────────────────────────────────────────────────────────
const BOSS_SPAWN_COINS = 80;
const BOSS_MAX_HEALTH = 20;
const BOSS_JUMP_DISTANCE = 0.12;   // bigger hops than normal slimes
const BOSS_JUMP_DURATION = 32;     // slower hop animation
const BOSS_REST_MIN = 50;          // more rest between hops
const BOSS_REST_MAX = 80;
const BOSS_HIT_RADIUS = 0.18;      // larger collision radius (boss is huge)
const BOSS_SWORD_REACH = SWORD_REACH + 0.08; // extended reach for the big target
const BOSS_HIT_FLASH_DURATION = 8; // frames of white flash on hit
const TREASURE_COLLECT_RADIUS = 0.09;

@Component({
    selector: 'app-kids-game',
    imports: [],
    templateUrl: './kids-game.component.html',
    styleUrl: './kids-game.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:keydown)': 'handleKeydown($event)',
        '(window:keyup)': 'handleKeyup($event)',
    },
})
export class KidsGameComponent implements OnDestroy {
    // ── Movement ──────────────────────────────────────────────────────────────
    readonly characterPosition = signal<Point>({ x: 0.5, y: 0.5 });
    readonly walkingDirection = signal<WalkingDirection>(null);
    readonly walkFrame = signal(0);
    readonly pressedKeys = signal<Set<string>>(new Set());
    /** Visual mirror (left/right only). */
    readonly isFacingLeft = signal(false);
    /** Full 4-direction facing used by weapons. */
    readonly facingDirection = signal<'left' | 'right' | 'up' | 'down'>('right');

    // ── UI state ──────────────────────────────────────────────────────────────
    readonly isMenuOpen = signal(false);
    readonly isCharacterSelectOpen = signal(false);
    readonly characterGender = signal<CharacterGender>('male');

    // ── Weapons ───────────────────────────────────────────────────────────────
    /** Counts down from SWORD_DURATION_FRAMES; while > 0 the swing arc is shown. */
    readonly swordFramesLeft = signal(0);
    readonly swordActive = computed(() => this.swordFramesLeft() > 0);
    readonly arrows = signal<Arrow[]>([]);

    // ── Enemies & effects ─────────────────────────────────────────────────────
    readonly slimes = signal<Slime[]>([]);
    readonly burstParticles = signal<BurstParticle[]>([]);
    readonly coins = signal<Coin[]>([]);
    readonly coinCount = signal(0);

    // ── Boss & world objects ───────────────────────────────────────────────────
    readonly boss = signal<Boss | null>(null);
    readonly treasureBoxes = signal<TreasureBox[]>([]);
    readonly isVictory = signal(false);
    readonly bossHealthPercent = computed(() => {
        const b = this.boss();
        return b ? (b.health / BOSS_MAX_HEALTH) * 100 : 0;
    });

    // ── Derived display ───────────────────────────────────────────────────────
    readonly characterXPercent = computed(() => this.characterPosition().x * 100);
    readonly characterYPercent = computed(() => this.characterPosition().y * 100);

    readonly legSwing = computed(() => {
        if (!this.walkingDirection()) return 0;
        return Math.floor(this.walkFrame() / ANIMATION_SPEED) % 2 === 0 ? 22 : -22;
    });

    private animationFrameId: number | null = null;
    private nextArrowId = 0;
    private nextSlimeId = 0;
    private nextBurstId = 0;
    private nextCoinId = 0;
    private nextTreasureId = 0;
    private spawnTimer = 0;
    private nextBossAt = BOSS_SPAWN_COINS;
    /** Prevents the sword from scoring multiple hits on the same swing. */
    private swordHitChecked = false;

    constructor() {
        afterNextRender(() => this.startGameLoop());
    }

    ngOnDestroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    // ── Game loop ─────────────────────────────────────────────────────────────

    private startGameLoop(): void {
        const tick = () => {
            this.processMovement();
            this.animationFrameId = requestAnimationFrame(tick);
        };
        this.animationFrameId = requestAnimationFrame(tick);
    }

    private processMovement(): void {
        if (this.isMenuOpen() || this.isCharacterSelectOpen() || this.isVictory()) return;

        // Tick sword swing cooldown
        if (this.swordFramesLeft() > 0) {
            this.swordFramesLeft.update(f => f - 1);
            if (this.swordFramesLeft() === 0) {
                this.swordHitChecked = false; // reset for next swing
            }
        }

        // Advance arrows and remove those that have left the game area
        if (this.arrows().length > 0) {
            this.arrows.update(arrows =>
                arrows
                    .map(a => ({ ...a, x: a.x + a.vx, y: a.y + a.vy }))
                    .filter(a => a.x > -0.05 && a.x < 1.05 && a.y > -0.05 && a.y < 1.05),
            );
        }

        const keys = this.pressedKeys();
        const { x, y } = this.characterPosition();
        let newX = x;
        let newY = y;
        let direction: WalkingDirection = null;

        if (keys.has('ArrowUp')) {
            newY = Math.max(CHAR_HALF_H, y - MOVE_STEP);
            direction = 'up';
        } else if (keys.has('ArrowDown')) {
            newY = Math.min(1 - CHAR_HALF_H, y + MOVE_STEP);
            direction = 'down';
        }

        if (keys.has('ArrowLeft')) {
            newX = Math.max(CHAR_HALF_W, x - MOVE_STEP);
            direction ??= 'left';
        } else if (keys.has('ArrowRight')) {
            newX = Math.min(1 - CHAR_HALF_W, x + MOVE_STEP);
            direction ??= 'right';
        }

        const hasMoved = newX !== x || newY !== y;
        if (hasMoved) {
            this.characterPosition.set({ x: newX, y: newY });
            this.walkFrame.update(f => f + 1);
        }

        // Update both facing signals from the resolved direction
        if (direction) {
            this.facingDirection.set(direction);
            if (direction === 'left') this.isFacingLeft.set(true);
            else if (direction === 'right') this.isFacingLeft.set(false);
        }

        this.walkingDirection.set(hasMoved ? direction : null);

        // ── Slime system ──────────────────────────────────────────────────────
        this.tickSpawnTimer();
        this.updateSlimes();
        this.checkArrowSlimeCollisions();
        this.updateBurstParticles();
        this.updateCoins();

        // ── Boss system ───────────────────────────────────────────────────────
        this.checkBossSpawn();
        this.updateBoss();
        this.checkArrowBossCollision();
        this.checkSwordCollisions();
        this.checkTreasureCollection();
    }

    // ── Input handlers ────────────────────────────────────────────────────────

    handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (this.isCharacterSelectOpen()) {
                this.backToMenu();
            } else {
                this.isMenuOpen() ? this.resumeGame() : this.openMenu();
            }
            return;
        }

        if (this.isMenuOpen() || this.isCharacterSelectOpen()) return;

        if (event.key === 'n' || event.key === 'N') {
            this.swingSword();
            return;
        }

        if (event.key === 'm' || event.key === 'M') {
            this.fireArrow();
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
        this.pressedKeys.update(keys => new Set([...keys, event.key]));
    }

    handleKeyup(event: KeyboardEvent): void {
        this.pressedKeys.update(keys => {
            const next = new Set(keys);
            next.delete(event.key);
            return next;
        });
    }

    handleButtonPress(key: string): void {
        this.pressedKeys.update(keys => new Set([...keys, key]));
    }

    handleButtonRelease(key: string): void {
        this.pressedKeys.update(keys => {
            const next = new Set(keys);
            next.delete(key);
            return next;
        });
    }

    // ── Menu ──────────────────────────────────────────────────────────────────

    openMenu(): void {
        this.walkingDirection.set(null);
        this.pressedKeys.set(new Set());
        this.isMenuOpen.set(true);
    }

    resumeGame(): void {
        this.isMenuOpen.set(false);
        this.isCharacterSelectOpen.set(false);
    }

    openCharacterSelect(): void {
        this.isMenuOpen.set(false);
        this.isCharacterSelectOpen.set(true);
    }

    backToMenu(): void {
        this.isCharacterSelectOpen.set(false);
        this.isMenuOpen.set(true);
    }

    selectCharacter(gender: CharacterGender): void {
        this.characterGender.set(gender);
        this.resumeGame();
    }

    playAgain(): void {
        this.characterPosition.set({ x: 0.5, y: 0.5 });
        this.arrows.set([]);
        this.slimes.set([]);
        this.burstParticles.set([]);
        this.coins.set([]);
        this.boss.set(null);
        this.treasureBoxes.set([]);
        this.coinCount.set(0);
        this.spawnTimer = 0;
        this.nextBossAt = BOSS_SPAWN_COINS;
        this.swordHitChecked = false;
        this.swordFramesLeft.set(0);
        this.walkingDirection.set(null);
        this.pressedKeys.set(new Set());
        this.isVictory.set(false);
    }

    // ── Weapons ───────────────────────────────────────────────────────────────

    swingSword(): void {
        if (this.swordFramesLeft() > 0) return; // still swinging
        this.swordFramesLeft.set(SWORD_DURATION_FRAMES);
        this.swordHitChecked = false;
    }

    fireArrow(): void {
        if (this.arrows().length >= 8) return; // prevent flooding the screen
        const dir = this.facingDirection();
        const vx = dir === 'right' ? ARROW_SPEED : dir === 'left' ? -ARROW_SPEED : 0;
        const vy = dir === 'down' ? ARROW_SPEED : dir === 'up' ? -ARROW_SPEED : 0;
        const { x, y } = this.characterPosition();
        this.arrows.update(arrows => [
            ...arrows,
            { id: this.nextArrowId++, x, y, vx, vy },
        ]);
    }

    /** Returns the CSS rotation angle (degrees) matching the arrow's travel direction. */
    getArrowRotationDeg(arrow: Arrow): number {
        return Math.atan2(arrow.vy, arrow.vx) * (180 / Math.PI);
    }

    // ── Slime spawning ────────────────────────────────────────────────────────

    private tickSpawnTimer(): void {
        if (this.slimes().length >= MAX_SLIMES) return;
        this.spawnTimer++;
        if (this.spawnTimer >= SLIME_SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            this.spawnSlime();
        }
    }

    private spawnSlime(): void {
        const variant = SLIME_VARIANTS[Math.floor(Math.random() * SLIME_VARIANTS.length)];
        const size = 0.75 + Math.random() * 0.55; // 0.75–1.3

        // Pick a random side and spawn at the very edge of the game area so
        // slimes are 50 % visible from the moment they appear.
        const side = Math.floor(Math.random() * 4); // 0=top 1=right 2=bottom 3=left
        let x: number, y: number;
        if (side === 0) { x = 0.1 + Math.random() * 0.8; y = 0.01; }
        else if (side === 1) { x = 0.99; y = 0.1 + Math.random() * 0.8; }
        else if (side === 2) { x = 0.1 + Math.random() * 0.8; y = 0.99; }
        else { x = 0.01; y = 0.1 + Math.random() * 0.8; }

        const newSlime: Slime = {
            id: this.nextSlimeId++,
            x, y,
            color: variant.color,
            shadowColor: variant.shadowColor,
            eyeColor: variant.eyeColor,
            size,
            fromX: x, fromY: y,
            toX: x, toY: y,
            jumpPhase: 1, // immediately start next hop
            jumpDuration: SLIME_JUMP_DURATION,
            restFrames: SLIME_REST_MIN + Math.floor(Math.random() * (SLIME_REST_MAX - SLIME_REST_MIN)),
            restTimer: 0,
            visualX: x, visualY: y,
            scaleX: 1, scaleY: 1,
        };
        this.slimes.update(s => [...s, newSlime]);
    }

    // ── Slime movement ────────────────────────────────────────────────────────

    private updateSlimes(): void {
        if (this.slimes().length === 0) return;
        const { x: charX, y: charY } = this.characterPosition();

        this.slimes.update(slimes =>
            slimes.map(s => {
                let { fromX, fromY, toX, toY, jumpPhase, restTimer, x, y } = s;

                if (jumpPhase < 1) {
                    // ── mid-hop ──
                    jumpPhase = Math.min(1, jumpPhase + 1 / s.jumpDuration);
                    // Smooth step easing
                    const t = jumpPhase * jumpPhase * (3 - 2 * jumpPhase);
                    x = fromX + (toX - fromX) * t;
                    y = fromY + (toY - fromY) * t;

                    // Squish & stretch: stretch vertically on ascent, squish on landing
                    const arc = Math.sin(jumpPhase * Math.PI); // 0→1→0
                    const scaleY = 1 + arc * 0.45;
                    const scaleX = 1 - arc * 0.2;

                    const visualY = y - arc * SLIME_JUMP_HEIGHT;
                    return { ...s, jumpPhase, x, y, visualX: x, visualY, scaleX, scaleY };

                } else if (restTimer < s.restFrames) {
                    // ── resting ──
                    restTimer++;
                    // Idle squish: gentle bob
                    const bob = Math.sin(restTimer * 0.22) * 0.04;
                    return { ...s, restTimer, scaleX: 1 + bob * 0.5, scaleY: 1 - bob, visualX: x, visualY: y };

                } else {
                    // ── start next hop toward character ──
                    const dx = charX - x;
                    const dy = charY - y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    // Slight random wobble so they don't pile up perfectly
                    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;
                    const step = Math.min(SLIME_JUMP_DISTANCE, dist);
                    const newToX = Math.max(0.02, Math.min(0.98, x + Math.cos(angle) * step));
                    const newToY = Math.max(0.02, Math.min(0.98, y + Math.sin(angle) * step));
                    return {
                        ...s,
                        fromX: x, fromY: y,
                        toX: newToX, toY: newToY,
                        jumpPhase: 0,
                        restTimer: 0,
                        restFrames: SLIME_REST_MIN + Math.floor(Math.random() * (SLIME_REST_MAX - SLIME_REST_MIN)),
                    };
                }
            }),
        );
    }

    // ── Collision detection ───────────────────────────────────────────────────

    private checkArrowSlimeCollisions(): void {
        const arrows = this.arrows();
        const slimes = this.slimes();
        if (arrows.length === 0 || slimes.length === 0) return;

        const hitSlimeIds = new Set<number>();
        const hitArrowIds = new Set<number>();

        for (const arrow of arrows) {
            for (const slime of slimes) {
                if (hitSlimeIds.has(slime.id)) continue;
                const dx = arrow.x - slime.x;
                const dy = arrow.y - slime.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < SLIME_HIT_RADIUS * slime.size) {
                    hitSlimeIds.add(slime.id);
                    hitArrowIds.add(arrow.id);
                }
            }
        }

        if (hitSlimeIds.size > 0) {
            this.killSlimes(hitSlimeIds);
            this.arrows.update(arr => arr.filter(a => !hitArrowIds.has(a.id)));
        }
    }

    private checkSwordCollisions(): void {
        // Only check once per swing, at the midpoint
        if (!this.swordActive() || this.swordHitChecked) return;
        if (this.swordFramesLeft() > Math.floor(SWORD_DURATION_FRAMES / 2)) return;

        this.swordHitChecked = true;

        const { x: charX, y: charY } = this.characterPosition();
        const dir = this.facingDirection();
        const facingAngle =
            dir === 'right' ? 0 :
            dir === 'down'  ? Math.PI / 2 :
            dir === 'left'  ? Math.PI :
                              -Math.PI / 2;

        // ── Slimes ──
        const hitSlimeIds = new Set<number>();
        for (const slime of this.slimes()) {
            const dx = slime.x - charX;
            const dy = slime.y - charY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > SWORD_REACH) continue;
            const angle = Math.atan2(dy, dx);
            let diff = angle - facingAngle;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            if (Math.abs(diff) <= SWORD_CONE_HALF_ANGLE) hitSlimeIds.add(slime.id);
        }
        if (hitSlimeIds.size > 0) this.killSlimes(hitSlimeIds);

        // ── Boss ──
        const b = this.boss();
        if (b) {
            const dx = b.x - charX;
            const dy = b.y - charY;
            if (Math.sqrt(dx * dx + dy * dy) <= BOSS_SWORD_REACH) {
                const angle = Math.atan2(dy, dx);
                let diff = angle - facingAngle;
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;
                if (Math.abs(diff) <= SWORD_CONE_HALF_ANGLE) this.hitBoss();
            }
        }
    }

    private killSlimes(ids: Set<number>): void {
        const dying = this.slimes().filter(s => ids.has(s.id));

        // Spawn burst + coin at each dead slime's position
        const newBursts: BurstParticle[] = dying.map(s => ({
            id: this.nextBurstId++,
            x: s.x,
            y: s.y,
            color: s.color,
            frame: 0,
        }));
        const newCoins: Coin[] = dying.map(s => ({
            id: this.nextCoinId++,
            x: s.x,
            y: s.y,
            frame: 0,
        }));

        this.slimes.update(sl => sl.filter(s => !ids.has(s.id)));
        this.burstParticles.update(b => [...b, ...newBursts]);
        this.coins.update(c => [...c, ...newCoins]);
    }

    // ── Effects lifecycle ─────────────────────────────────────────────────────

    private updateBurstParticles(): void {
        if (this.burstParticles().length === 0) return;
        this.burstParticles.update(bursts =>
            bursts
                .map(b => ({ ...b, frame: b.frame + 1 }))
                .filter(b => b.frame < BURST_DURATION),
        );
    }

    private updateCoins(): void {
        if (this.coins().length === 0) return;
        const { x: charX, y: charY } = this.characterPosition();
        let collected = 0;

        this.coins.update(coins => {
            const remaining: Coin[] = [];
            for (const c of coins) {
                const aged = { ...c, frame: c.frame + 1 };
                if (aged.frame >= COIN_LIFETIME) continue; // expired — vanishes
                const dx = charX - aged.x;
                const dy = charY - aged.y;
                if (Math.sqrt(dx * dx + dy * dy) < COIN_COLLECT_RADIUS) {
                    collected++; // picked up by the character
                    continue;
                }
                remaining.push(aged);
            }
            return remaining;
        });

        if (collected > 0) {
            this.coinCount.update(n => n + collected);
        }
    }

    // ── Boss system ───────────────────────────────────────────────────────────

    private checkBossSpawn(): void {
        if (this.boss() !== null) return;
        if (this.coinCount() < this.nextBossAt) return;
        this.nextBossAt += BOSS_SPAWN_COINS;
        this.spawnBoss();
    }

    private spawnBoss(): void {
        // Clear all regular slimes when the boss enters
        this.slimes.set([]);

        const side = Math.floor(Math.random() * 4);
        let x: number, y: number;
        if (side === 0)      { x = 0.5;  y = 0.06; }
        else if (side === 1) { x = 0.94; y = 0.5;  }
        else if (side === 2) { x = 0.5;  y = 0.94; }
        else                 { x = 0.06; y = 0.5;  }

        this.boss.set({
            x, y,
            health: BOSS_MAX_HEALTH,
            fromX: x, fromY: y, toX: x, toY: y,
            jumpPhase: 1,
            jumpDuration: BOSS_JUMP_DURATION,
            restFrames: BOSS_REST_MIN,
            restTimer: 0,
            visualX: x, visualY: y,
            scaleX: 1, scaleY: 1,
            hitFlash: 0,
        });
    }

    private updateBoss(): void {
        if (!this.boss()) return;
        const { x: charX, y: charY } = this.characterPosition();

        this.boss.update(boss => {
            if (!boss) return null;
            let { fromX, fromY, toX, toY, jumpPhase, restTimer, x, y, hitFlash } = boss;

            hitFlash = Math.max(0, hitFlash - 1);

            if (jumpPhase < 1) {
                jumpPhase = Math.min(1, jumpPhase + 1 / boss.jumpDuration);
                const t = jumpPhase * jumpPhase * (3 - 2 * jumpPhase);
                x = fromX + (toX - fromX) * t;
                y = fromY + (toY - fromY) * t;
                const arc = Math.sin(jumpPhase * Math.PI);
                const scaleY = 1 + arc * 0.35;
                const scaleX = 1 - arc * 0.15;
                const visualY = y - arc * SLIME_JUMP_HEIGHT * 2.2;
                return { ...boss, jumpPhase, x, y, visualX: x, visualY, scaleX, scaleY, hitFlash };

            } else if (restTimer < boss.restFrames) {
                restTimer++;
                const bob = Math.sin(restTimer * 0.15) * 0.04;
                return { ...boss, restTimer, scaleX: 1 + bob * 0.4, scaleY: 1 - bob, visualX: x, visualY: y, hitFlash };

            } else {
                const dx = charX - x;
                const dy = charY - y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
                const step = Math.min(BOSS_JUMP_DISTANCE, dist);
                const newToX = Math.max(0.05, Math.min(0.95, x + Math.cos(angle) * step));
                const newToY = Math.max(0.05, Math.min(0.95, y + Math.sin(angle) * step));
                return {
                    ...boss,
                    fromX: x, fromY: y, toX: newToX, toY: newToY,
                    jumpPhase: 0, restTimer: 0,
                    restFrames: BOSS_REST_MIN + Math.floor(Math.random() * (BOSS_REST_MAX - BOSS_REST_MIN)),
                    hitFlash,
                };
            }
        });
    }

    private checkArrowBossCollision(): void {
        const b = this.boss();
        const arrows = this.arrows();
        if (!b || arrows.length === 0) return;

        const hitArrowIds = new Set<number>();
        let wasHit = false;
        for (const arrow of arrows) {
            if (wasHit) break;
            const dx = arrow.x - b.x;
            const dy = arrow.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < BOSS_HIT_RADIUS) {
                hitArrowIds.add(arrow.id);
                wasHit = true;
            }
        }
        if (wasHit) {
            this.arrows.update(arr => arr.filter(a => !hitArrowIds.has(a.id)));
            this.hitBoss();
        }
    }

    private hitBoss(): void {
        const b = this.boss();
        if (!b) return;
        const newHealth = b.health - 1;
        if (newHealth <= 0) {
            // Dramatic multi-burst death
            const deathBursts: BurstParticle[] = Array.from({ length: 5 }, (_, i) => ({
                id: this.nextBurstId++,
                x: b.x + (Math.random() - 0.5) * 0.14,
                y: b.y + (Math.random() - 0.5) * 0.14,
                color: '#CC0000',
                frame: i * 3,
            }));
            this.burstParticles.update(bursts => [...bursts, ...deathBursts]);
            // Drop treasure box at boss position
            this.treasureBoxes.update(boxes => [
                ...boxes,
                { id: this.nextTreasureId++, x: b.x, y: b.y },
            ]);
            this.boss.set(null);
            this.isVictory.set(true);
        } else {
            this.boss.update(boss =>
                boss ? { ...boss, health: newHealth, hitFlash: BOSS_HIT_FLASH_DURATION } : null,
            );
        }
    }

    private checkTreasureCollection(): void {
        const boxes = this.treasureBoxes();
        if (boxes.length === 0) return;
        const { x: charX, y: charY } = this.characterPosition();

        const collected: TreasureBox[] = [];
        const remaining: TreasureBox[] = [];
        for (const box of boxes) {
            const dx = charX - box.x;
            const dy = charY - box.y;
            Math.sqrt(dx * dx + dy * dy) < TREASURE_COLLECT_RADIUS
                ? collected.push(box)
                : remaining.push(box);
        }
        if (collected.length > 0) {
            this.treasureBoxes.set(remaining);
            for (const box of collected) this.spawnTreasureCoins(box);
        }
    }

    private spawnTreasureCoins(box: TreasureBox): void {
        const newCoins: Coin[] = Array.from({ length: 20 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 0.04 + Math.random() * 0.17;
            return {
                id: this.nextCoinId++,
                x: Math.max(0.04, Math.min(0.96, box.x + Math.cos(angle) * dist)),
                y: Math.max(0.04, Math.min(0.96, box.y + Math.sin(angle) * dist)),
                frame: 0,
            };
        });
        this.coins.update(c => [...c, ...newCoins]);
    }

    // ── Template helpers ──────────────────────────────────────────────────────

    /** Opacity for a burst effect that expands and fades. */
    getBurstOpacity(burst: BurstParticle): number {
        return Math.max(0, 1 - burst.frame / BURST_DURATION);
    }

    /** Scale for a burst circle (grows as it fades). */
    getBurstScale(burst: BurstParticle): number {
        return 1 + (burst.frame / BURST_DURATION) * 2.5;
    }

    /** Coin opacity: pop in then fade out. */
    getCoinOpacity(coin: Coin): number {
        const fadeInEnd = 15;
        const fadeOutStart = COIN_LIFETIME - 60;
        if (coin.frame < fadeInEnd) return coin.frame / fadeInEnd;
        if (coin.frame > fadeOutStart) return 1 - (coin.frame - fadeOutStart) / 60;
        return 1;
    }

    /** Coin vertical bob offset (percent of game area). */
    getCoinBobY(coin: Coin): number {
        return Math.sin(coin.frame * 0.1) * 0.5;
    }

    /** White-flash opacity for boss hit feedback (0 → 0.65). */
    getBossFlashOpacity(boss: Boss): number {
        return (boss.hitFlash / BOSS_HIT_FLASH_DURATION) * 0.65;
    }
}
