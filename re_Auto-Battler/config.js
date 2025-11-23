/* Sandbox Auto-Battler V35 - Configuration & Global State */

// --- CONFIGURATION ---
const MAX_DECK_SIZE = 9;
const MAX_EQUIP_SIZE = 4;
const CARD_CHOICES = 4;
const WORLD_W = 3000; 
const WORLD_H = 3000;
const VIEW_W = 800;
const VIEW_H = 600;
const UI_HEIGHT = 220;

// --- CONSTANTS ---
const CLASSES = ["WARRIOR", "RANGER", "MAGE", "FREELANCER"];

const SYSTEM_COLORS = { 
    "Melee": "#ff4444", 
    "Ranged": "#44ff44", 
    "Magic": "#aa44ff", 
    "Heal": "#ff66ff", 
    "Turret": "#ffff66" 
};

const RARITY_COLORS = {
    "COMMON": "#cccccc",
    "RARE": "#4488ff",
    "LEGENDARY": "#ffaa00"
};

// --- GAME STATE VARIABLES ---
let gameState = "TITLE"; 
let playerClass = "FREELANCER";

// Entities
let player;
let enemies = [];
let drops = [];
let particles = [];
let projectiles = [];
let enemyProjectiles = [];
let deployables = [];
let puddles = [];

// Inventory & Library
let deck = [];
let equipment = [];
let actionLibrary = [];
let equipLibrary = [];
let rewardOptions = [];

// Counters & UI State
let discardIndex = 0;
let rewardIndex = 0;
let skillIndex = 0; 
let classIndex = 0;
let pendingCard = null;
let score = 0;
let wave = 1;
let enemiesToNextLevel = 5;
let actionRewardCount = 0;

// Camera & Visual Effects
let camX = 0;
let camY = 0;
let shakePower = 0;
let screenFlash = 0;