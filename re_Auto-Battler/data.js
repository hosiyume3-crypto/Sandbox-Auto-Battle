/* Sandbox Auto-Battler V35 - Data & Libraries */

function initLibraries() {
    // Helper functions to create card objects efficiently
    const A = (id, name, sys, style, tag, range, val, dur, cd, rarity, desc) => {
        let col = SYSTEM_COLORS[sys] || "#999";
        if (sys === "Heal") col = SYSTEM_COLORS["Heal"];
        return {
            id, name, category: "ACTION", type: "ACTION", system: sys, 
            style, tag, range, val, duration: dur, color: col, 
            cooldownMax: cd, currentCooldown: 0, level: 1, rarity, desc
        };
    };
    
    const M = (id, name, desc, col) => ({
        id, name, category: "MOVE", type: "MOVE", system: "Movement", 
        style: "PASSIVE", tag: "BUFF", range: 0, val: 0, duration: 0, 
        color: col, cooldownMax: 0, currentCooldown: 0, rarity: "COMMON", desc
    });
    
    const E = (id, name, stats, col, desc) => ({
        id, name, category: "EQUIP", type: "PASSIVE", system: "Equipment", 
        style: "PASSIVE", stats, color: col, rarity: "COMMON", desc
    });

    // --- ACTION LIBRARY (日本語) ---
    actionLibrary = [
        // --- 毒ビルド用カード (調整済み) ---
        A("poison_flask", "毒フラスコ", "Magic", "RANGE", "PROJECTILE", 300, 10, 40, 60, "COMMON", "着弾地点に毒をばら撒く。毒の敵には威力増。"),
        A("bane_bolt", "ベインボルト", "Magic", "MELEE", "ATK", 90, 10, 10, 60, "RARE", "高速の魔法斬撃。毒の敵を切り刻む。"),
        A("toxic_mist", "トキシックミスト", "Magic", "RANGE", "PROJECTILE", 400, 10, 60, 600, "COMMON", "着弾点に毒の霧を発生させる弾を放つ。"),
        A("venom_whip", "ベノムウィップ", "Magic", "AOE", "ATK", 150, 20, 20, 120, "RARE", "前方を一掃。毒の敵に威力3倍。"),
        A("pandemic", "パンデミック", "Magic", "AOE", "ATK", 300, 50, 60, 480, "LEGENDARY", "広範囲攻撃。毒の敵には2倍ダメージ。"),

        // --- 遠距離設置物シナジーカード (6種) ---
        {...A("sniper_turret", "スナイパータレット", "Ranged", "SUMMON", "ALLY", 0, 40, 20, 720, "RARE", "超長射程・高威力の狙撃タレットを設置。"), color: SYSTEM_COLORS["Turret"]},
        {...A("laser_turret", "レーザータレット", "Ranged", "SUMMON", "ALLY", 0, 15, 20, 720, "RARE", "貫通するレーザーを放つタレットを設置。"), color: SYSTEM_COLORS["Turret"]},
        {...A("gatling_turret", "ガトリングタレット", "Ranged", "SUMMON", "ALLY", 0, 4, 20, 600, "COMMON", "高速連射を行うタレットを設置。"), color: SYSTEM_COLORS["Turret"]},
        {...A("missile_turret", "ミサイルタレット", "Ranged", "SUMMON", "ALLY", 0, 25, 20, 800, "LEGENDARY", "追尾ミサイルを発射するタレットを設置。"), color: SYSTEM_COLORS["Turret"]},
        {...A("arc_turret", "アークタレット", "Ranged", "SUMMON", "ALLY", 0, 12, 20, 600, "RARE", "範囲内の敵に電撃を放つタレットを設置。"), color: SYSTEM_COLORS["Turret"]},
        {...A("flame_turret", "フレイムタレット", "Ranged", "SUMMON", "ALLY", 0, 6, 20, 600, "COMMON", "周囲に炎を撒き散らすタレットを設置。"), color: SYSTEM_COLORS["Turret"]},

        // --- 既存カード ---
        A("super_ball", "スーパーボール", "Ranged", "RANGE", "PROJECTILE", 300, 25, 300, 480, "LEGENDARY", "6方向に発射。壁と敵で跳ね返る。"),
        A("gear", "ギア", "Ranged", "RANGE", "PROJECTILE", 999, 25, 120, 240, "RARE", "画面端で5回跳ねる貫通弾。"),
        A("homing_missile", "ミサイル", "Ranged", "RANGE", "PROJECTILE", 600, 18, 60, 300, "RARE", "敵を追尾する弾を複数発射。"),
        A("intercept", "迎撃", "Ranged", "RANGE", "ATK", 50, 80, 10, 480, "COMMON", "至近距離への超高威力射撃。"),
        A("spear_flurry", "槍撃乱舞", "Melee", "MELEE", "ATK", 150, 25, 60, 300, "LEGENDARY", "前方に高速の連続突きを繰り出す。"),
        A("martial_arts", "格闘術", "Melee", "MELEE", "ATK", 60, 15, 10, 30, "COMMON", "隙の少ない超高速連打。"),
        A("roar", "咆哮", "Melee", "AOE", "ATK", 200, 5, 40, 300, "RARE", "周囲の敵を大きく吹き飛ばす。"),
        A("pile_bunker", "パイルバンカー", "Melee", "MELEE", "ATK", 50, 40, 40, 360, "RARE", "至近単体に威力40＆強撃退。"),
        A("javelin", "ジャベリン", "Ranged", "RANGE", "PROJECTILE", 500, 35, 40, 150, "COMMON", "敵を貫通する槍を投擲。"),
        A("counter", "カウンター", "Melee", "SELF", "BUFF", 0, 50, 120, 360, "RARE", "構え中被弾無効＆背後反撃。"),
        A("boomerang", "ブーメラン", "Ranged", "RANGE", "PROJECTILE", 250, 20, 30, 180, "RARE", "手元に戻ってくる貫通武器。"),
        A("air_raid", "空爆支援", "Ranged", "AOE", "ATK", 999, 56, 60, 900, "LEGENDARY", "ランダムな敵の頭上を爆撃。"), 
        A("life_drain", "ドレイン", "Magic", "RANGE", "DEBUFF", 100, 0, 20, 600, "RARE", "対象の体力を吸収する。"),
        A("gatotsu", "牙突", "Melee", "MELEE", "ATK", 150, 14, 20, 300, "RARE", "最も遠い敵へ高速突進。"),
        A("shadow_bind", "影縛り", "Ranged", "AOE", "DEBUFF", 250, 0, 20, 600, "RARE", "範囲内の敵をスタンさせる。"),
        A("slow_sphere", "重力球", "Magic", "RANGE", "PROJECTILE", 999, 28, 60, 180, "RARE", "ゆっくり進む巨大な貫通弾。"),
        A("black_hole", "ブラックホール", "Magic", "SUMMON", "DEBUFF", 0, 0, 20, 600, "LEGENDARY", "敵を引き寄せる重力場を生成。"),
        A("fan_laser", "拡散レーザー", "Magic", "RANGE", "PROJECTILE", 400, 17, 60, 360, "LEGENDARY", "扇状にレーザーを連射。"),
        A("flamethrower", "火炎放射", "Magic", "RANGE", "PROJECTILE", 180, 4, 90, 360, "RARE", "前方に炎を放射し続ける。"),
        A("backstep", "バックステップ", "Ranged", "RANGE", "PROJECTILE", 200, 14, 20, 180, "COMMON", "射撃と同時に後退する。"),
        A("giga_laser", "ギガレーザー", "Magic", "RANGE", "PROJECTILE", 400, 40, 60, 500, "RARE", "極太の貫通レーザーを放つ。"),
        A("orbit_fire", "オービット", "Magic", "SELF", "BUFF", 150, 14, 0, 600, "RARE", "周囲を回る火の玉を展開。"),
        A("assassin", "暗殺", "Melee", "MELEE", "ATK", 300, 42, 30, 480, "LEGENDARY", "最遠敵の背後へワープ攻撃。"), 
        {...A("turret", "タレット", "Ranged", "SUMMON", "ALLY", 0, 0, 20, 600, "RARE", "自動射撃を行う砲台を設置。"), color: SYSTEM_COLORS["Turret"]},
        A("poison", "ポイズン", "Magic", "AOE", "DOT", 150, 0, 40, 300, "RARE", "広範囲を毒状態にする。"),
        A("repel", "拒絶", "Magic", "AOE", "DEBUFF", 160, 10, 20, 420, "COMMON", "弾き飛ばし＆スロウ付与。"),
        A("slash", "斬撃", "Melee", "MELEE", "ATK", 50, 21, 20, 60, "COMMON", "前方を薙ぎ払う基本攻撃。"), 
        A("hammer", "ハンマー", "Melee", "MELEE", "ATK", 60, 35, 50, 300, "RARE", "強力なノックバック攻撃。"),
        A("dagger", "ダガー", "Melee", "MELEE", "ATK", 30, 7, 8, 20, "COMMON", "隙の少ない連続突き。"),
        A("spear", "スピア", "Melee", "MELEE", "ATK", 90, 24, 30, 80, "COMMON", "射程の長い突き攻撃。"),
        A("scythe", "大鎌", "Melee", "MELEE", "ATK", 60, 28, 40, 120, "RARE", "攻撃命中時に体力を微回復。"),
        A("shield_bash", "シールドバッシュ", "Melee", "MELEE", "ATK", 40, 14, 30, 120, "RARE", "攻撃時、防御力が上昇。"),
        A("multicut", "乱れ斬り", "Melee", "MELEE", "ATK", 50, 5, 40, 180, "RARE", "前方を無数に切り刻む。"),
        A("barrage", "連撃", "Melee", "MELEE", "ATK", 60, 12, 45, 180, "COMMON", "素早い3連撃を繰り出す。"),
        A("ragnarok", "ラグナロク", "Melee", "MELEE", "ATK", 50, 56, 60, 900, "LEGENDARY", "対象を爆破し、全画面落雷。"),
        A("vortex", "ヴォルテックス", "Melee", "AOE", "ATK", 100, 17, 40, 420, "COMMON", "回転斬りで敵を引き寄せる。"), 
        A("charge", "チャージタックル", "Melee", "MELEE", "ATK", 70, 45, 30, 420, "COMMON", "溜め動作の後、高速突進。"), 
        A("stomp", "ストンプ", "Melee", "AOE", "ATK", 80, 35, 50, 420, "RARE", "衝撃波で周囲を吹き飛ばす。"), 
        A("cleave", "衝撃波", "Magic", "AOE", "ATK", 70, 28, 40, 420, "COMMON", "前方に扇状の衝撃波。"), 
        A("stun_gun", "スタンガン", "Ranged", "RANGE", "DEBUFF", 100, 7, 20, 420, "RARE", "敵を1秒スタンさせる弾。"), 
        A("blizzard", "ブリザード", "Magic", "AOE", "DEBUFF", 150, 7, 60, 420, "RARE", "広範囲を1秒凍結。"), 
        A("gravity", "グラビティ", "Magic", "AOE", "DEBUFF", 200, 3, 80, 420, "COMMON", "引き寄せ＆スロウ(1.5秒)。"), 
        A("dark_orb", "ダークオーブ", "Magic", "AOE", "ATK", 250, 35, 60, 420, "RARE", "着弾地点で爆発する闇の球。"), 
        A("teleport", "テレポート", "Magic", "SELF", "BUFF", 0, 0, 1, 180, "RARE", "前方へ瞬時にワープする。"), 
        A("meteor", "メテオ", "Magic", "AOE", "EXPLOSION", 0, 40, 60, 300, "RARE", "ランダムな敵に隕石を落とす。"),
        A("bow", "弓矢", "Ranged", "RANGE", "ATK", 300, 14, 30, 80, "COMMON", "標準的な遠距離攻撃。"), 
        A("m_gun", "マシンガン", "Ranged", "RANGE", "ATK", 150, 5, 5, 12, "COMMON", "低威力だが連射が効く銃。"),
        A("flame", "ファイア", "Magic", "RANGE", "PROJECTILE", 120, 10, 10, 5, "COMMON", "射程の短い連射炎。"),
        A("beam", "ビーム", "Magic", "RANGE", "PROJECTILE", 150, 20, 40, 60, "COMMON", "敵を貫通するエネルギー波。"),
        A("rocket", "ロケット弾", "Ranged", "RANGE", "EXPLOSION", 350, 56, 60, 200, "LEGENDARY", "着弾で広範囲爆発。"),
        A("cluster", "クラスター弾", "Ranged", "RANGE", "PROJECTILE", 250, 15, 40, 240, "RARE", "分裂する爆弾を発射する。"),
        A("shuriken","手裏剣","Ranged","RANGE","ATK", 250, 10, 15, 30, "COMMON", "高回転の投擲武器。"),
        A("scatter", "散弾", "Ranged", "RANGE", "ATK", 150, 8, 10, 50, "COMMON", "3方向に弾をばら撒く。"),
        A("shotgun", "ショットガン", "Ranged", "RANGE", "ATK", 100, 10, 40, 120, "RARE", "近距離で多数の弾を放つ。"),
        A("sniper", "スナイパー", "Ranged", "RANGE", "ATK", 200, 40, 80, 420, "RARE", "高威力・長射程の狙撃。"),
        A("nova", "ノヴァ", "Magic", "AOE", "ATK", 120, 21, 30, 180, "RARE", "全方位に弾き飛ばす衝撃波。"), 
        A("fireball", "ファイアボール", "Magic", "RANGE", "PROJECTILE", 350, 21, 50, 150, "COMMON", "高威力の火球を放つ。"),
        A("thunder", "サンダー", "Magic", "RANGE", "DEBUFF", 400, 28, 20, 420, "RARE", "ランダムな敵に落雷。"),
        {...A("shooting_star", "シューティングスター", "Magic", "RANGE", "PROJECTILE", 500, 45, 60, 240, "LEGENDARY", "敵の間を跳ね回る星。"), bounce: 6},
        A("icicle", "アイシクル", "Magic", "RANGE", "DEBUFF", 100, 21, 40, 90, "RARE", "氷柱2発。スロウ付与。"),
        A("heal", "ヒール", "Heal", "SELF", "HEAL", 0, 28, 40, 600, "LEGENDARY", "自身のHPを回復する。"),
    ];

    // --- EQUIPMENT LIBRARY ---
    equipLibrary = [
        E("e_swd", "鉄の剣", {melee:0.20}, "#e66", "近接ダメージ+20%"),
        E("e_bow", "ロングボウ", {range:0.20}, "#6e6", "遠距離ダメージ+20%"),
        E("e_boot", "疾風の靴", {speed:0.10}, "#0ee", "移動速度+10%"),
        E("e_arm", "プレートメイル", {def:0.10}, "#88a", "被ダメージ-10%"),
        E("e_ring", "ルビーの指輪", {melee:0.15, range:0.15, magic:0.15}, "#d44", "全ダメージ+15%"),
        E("e_amul", "時のアミュレット", {cdr:0.05}, "#aa4", "クールダウン短縮-5%"),
        
        E("e_belt", "ポーションベルト", {potionStockAdd: 2}, "#852", "ポーション所持数+2"),
        E("e_wand", "魔法の杖", {magic: 0.20}, "#c6f", "魔法ダメージ+20%"),
        E("e_scope", "スナイパースコープ", {rangeAdd: 0.20}, "#484", "攻撃射程+20%"),
        
        // --- タレット強化装備 (3種) ---
        E("e_wrench", "整備士のレンチ", {turretDuration: 0.5}, "#fa0", "タレット持続時間+50%"),
        E("e_lens", "増幅レンズ", {turretRange: 0.3}, "#0ff", "タレット射程+30%"),
        E("e_overclock", "オーバークロックギア", {turretSpeed: 0.2}, "#f44", "タレット攻撃頻度+20%"),
        // ---------------------------

        E("e_plague", "疫病の仮面", {poisonDuration: 0.5}, "#0a0", "毒の効果時間+50%"),
        E("e_injector", "毒の刃", {poisonChance: 0.2}, "#808", "攻撃時20%で毒を付与"),
        E("e_absorb", "ポイズンイーター", {}, "#80a", "敵が毒ダメージを受ける度HP3回復"),
        E("e_poison_charm", "毒の香炉", {}, "#909", "毒属性カードの出現率が大幅上昇"),
        
        E("e_vamp", "吸血鬼の牙", {vampire: 10}, "#a00", "撃破時HP10回復"),
        E("e_shield", "タワーシールド", {hpAdd: 25, def:0.05}, "#668", "最大HP+25, 防御+5%"),
        
        E("e_lucky", "四つ葉のクローバー", {dropRateAdd: 0.10}, "#0f0", "アイテムドロップ率+10%"),
        E("e_barrier", "バリアプリズム", {}, "#0ff", "10秒毎にバリア(30%軽減)"),
        E("e_thorns", "茨の鎧", {def:0.05}, "#582", "被弾時10ダメージ反射"),
        E("e_rage", "バーサーカーヘルム", {}, "#a22", "HP減少率に応じて攻撃増"),
        E("e_ghost", "ゴーストマント", {}, "#ddd", "15%で攻撃を回避"),
        E("e_magnet", "ゴールドマグネット", {}, "#fd0", "アイテム回収範囲が無限"),
        E("e_battery", "エナジーセル", {cdMult:-0.10}, "#0ff", "クールダウン短縮-10%"),
        E("e_kevlar", "ケブラーベスト", {}, "#444", "射撃ダメージ-30%"),
        E("e_lifering", "再生の指輪", {}, "#f88", "毎秒最大HPの1%回復"),
        E("e_titan", "タイタングローブ", {}, "#842", "全ダメ+50%, CD+30%")
    ];

    // --- MOVEMENT CARDS (日本語) ---
    actionLibrary.push(M("move_strafe", "ストレイフ", "敵へ回り込むように動く。", "#d0d"));
    actionLibrary.push(M("move_dash", "ダッシュ", "移動速度が大幅に上昇。", "#0ee"));
    actionLibrary.push(M("move_guard", "ガード", "移動中、被ダメージ半減。", "#88a"));
    actionLibrary.push(M("move_warp", "ワープ", "敵が遠いと瞬時に接近。", "#a0f"));
    actionLibrary.push(M("move_ghost", "ゴースト", "確率で攻撃を完全回避。", "#fff"));
    actionLibrary.push(M("move_sonic", "ソニック", "移動速度が飛躍的に上昇。", "#2f8"));
    actionLibrary.push(M("move_reflect", "リフレクト", "射撃ダメージを半減する。", "#0dd"));
    actionLibrary.push(M("move_barrage", "バラージ", "移動中、自動射撃。", "#f0f"));
    actionLibrary.push(M("move_phase", "フェイズ", "被弾時、後方へ短距離ワープ(CT5秒)。", "#a0f"));
}

function getCardById(id) {
    let c = actionLibrary.find(x => x.id === id) || equipLibrary.find(x => x.id === id);
    return c ? {...c, currentCooldown: 0} : null;
}
