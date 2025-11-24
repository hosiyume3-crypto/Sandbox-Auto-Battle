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
        // --- 新規追加: 投擲槍 (遠距離) ---
        A("javelin", "ジャベリン", "Ranged", "RANGE", "PROJECTILE", 500, 35, 40, 150, "COMMON", "敵を貫通する槍を投げる。"),
        
        // --- 新規追加: カウンター (近接) ---
        A("counter", "カウンター", "Melee", "SELF", "BUFF", 0, 50, 120, 360, "RARE", "構えをとる。次の被弾を無効化し、攻撃者の背後に奇襲する。"),
        
        // --- 新規追加: 錬金術 (魔法) ---
        A("alchemy", "錬金術", "Magic", "AOE", "DEBUFF", 200, 15, 40, 480, "RARE", "毒の霧をまく。これで倒した敵はポーションを落とす。"),

        A("boomerang", "ブーメラン", "Ranged", "RANGE", "PROJECTILE", 250, 20, 30, 180, "RARE", "戻ってくる貫通武器を投げる。"),
        A("air_raid", "空爆支援", "Ranged", "AOE", "ATK", 999, 56, 60, 900, "LEGENDARY", "ランダムな敵の頭上から爆撃を行う。"), 
        
        A("life_drain", "ライフドレイン", "Magic", "RANGE", "DEBUFF", 100, 0, 20, 600, "RARE", "対象の最大HPの25%を吸収する。"),

        A("gatotsu", "牙突", "Melee", "MELEE", "ATK", 150, 14, 20, 300, "RARE", "高速で突き進み、経路上の敵を攻撃する。"),
        A("shadow_bind", "影縛り", "Ranged", "AOE", "DEBUFF", 250, 0, 20, 600, "RARE", "ダメージはないが、敵を2秒間スタンさせる。"),
        A("slow_sphere", "重力球", "Magic", "RANGE", "PROJECTILE", 999, 28, 60, 180, "RARE", "ゆっくり進む巨大な貫通弾を放つ。"),
        A("black_hole", "ブラックホール", "Magic", "SUMMON", "DEBUFF", 0, 0, 20, 600, "LEGENDARY", "敵の位置に強力な重力場を生成する。"),

        A("fan_laser", "拡散レーザー", "Magic", "RANGE", "PROJECTILE", 400, 17, 60, 360, "LEGENDARY", "扇状に8本のレーザーを連射する。"),
        A("flamethrower", "火炎放射", "Magic", "RANGE", "PROJECTILE", 180, 4, 90, 360, "RARE", "前方に炎を放射し続ける。"),
        A("backstep", "バックステップ", "Ranged", "RANGE", "PROJECTILE", 200, 14, 20, 180, "COMMON", "射撃と同時に後方へ素早く下がる。"),

        A("giga_laser", "ギガレーザー", "Magic", "RANGE", "PROJECTILE", 400, 40, 60, 500, "RARE", "極太の貫通レーザーを放つ。"),
        A("orbit_fire", "オービット", "Magic", "SELF", "BUFF", 150, 14, 0, 600, "RARE", "周囲を回転する火の玉を4つ召喚する。"),
        A("assassin", "暗殺", "Melee", "MELEE", "ATK", 300, 42, 30, 480, "LEGENDARY", "最も遠い敵の背後から奇襲。"), 
        
        {...A("turret", "タレット", "Ranged", "SUMMON", "ALLY", 0, 0, 20, 600, "RARE", "自動で射撃を行う砲台を設置する。"), color: SYSTEM_COLORS["Turret"]},
        A("poison", "ポイズン", "Magic", "AOE", "DOT", 150, 0, 40, 300, "RARE", "広範囲の敵を毒状態にする(毎秒最大HPの3%ダメ)。"),
        
        A("repel", "拒絶", "Magic", "AOE", "DEBUFF", 160, 10, 20, 420, "COMMON", "周囲の敵を大きく弾き飛ばし、スロウを与える。"),

        A("slash", "斬撃", "Melee", "MELEE", "ATK", 50, 21, 20, 60, "COMMON", "前方を薙ぎ払う基本的な近接攻撃。"), 
        A("hammer", "ハンマー", "Melee", "MELEE", "ATK", 60, 35, 50, 300, "RARE", "強力なノックバックを伴う叩きつけ攻撃。"),
        A("dagger", "ダガー", "Melee", "MELEE", "ATK", 30, 7, 8, 20, "COMMON", "威力は低いが、隙の少ない連続突き。"),
        A("spear", "スピア", "Melee", "MELEE", "ATK", 90, 24, 30, 80, "COMMON", "射程の長い突き攻撃。"),
        
        A("scythe", "大鎌", "Melee", "MELEE", "ATK", 60, 28, 40, 120, "RARE", "攻撃命中時に少量のHPを吸収する。"),
        
        A("shield_bash", "シールドバッシュ", "Melee", "MELEE", "ATK", 40, 14, 30, 120, "RARE", "攻撃命中時、一時的に防御力が上昇する。"),
        A("multicut", "乱れ斬り", "Melee", "MELEE", "ATK", 50, 5, 40, 180, "RARE", "前方を無数に切り刻む連撃。"),
        A("barrage", "連撃", "Melee", "MELEE", "ATK", 60, 12, 45, 180, "COMMON", "素早い3連撃を繰り出す。"),
        
        A("ragnarok", "ラグナロク", "Melee", "MELEE", "ATK", 50, 56, 60, 480, "LEGENDARY", "衝撃波を起こし画面全体に落雷を招く。"),

        A("vortex", "ヴォルテックス", "Melee", "AOE", "ATK", 100, 17, 40, 420, "COMMON", "回転斬りで敵を攻撃し、中心に引き寄せる。"), 
        
        A("charge", "チャージ", "Melee", "MELEE", "ATK", 70, 45, 30, 420, "COMMON", "溜め動作の後、強い一撃。"), 
        
        A("stomp", "スタンプ", "Melee", "AOE", "ATK", 80, 35, 50, 420, "RARE", "地面を叩きつけ、周囲の敵を吹き飛ばす。"), 
        A("cleave", "衝撃波", "Magic", "AOE", "ATK", 70, 28, 40, 420, "COMMON", "前方に扇状の衝撃波を放つ。"), 
        A("stun_gun", "スタンガン", "Ranged", "RANGE", "DEBUFF", 100, 7, 20, 420, "RARE", "威力は低いが、敵をスタンさせる弾を撃つ。"), 
        A("blizzard", "ブリザード", "Magic", "AOE", "DEBUFF", 150, 7, 60, 420, "RARE", "周囲の敵を凍結させ、動きを止める。"), 
        A("gravity", "グラビティ", "Magic", "AOE", "DEBUFF", 200, 3, 80, 420, "COMMON", "広範囲の敵を中心へ引き寄せ、スロウを与える。"), 
        A("dark_orb", "ダークオーブ", "Magic", "AOE", "ATK", 250, 35, 60, 420, "RARE", "着弾地点で爆発する闇の球を発射する。"), 
        A("teleport", "テレポート", "Magic", "SELF", "BUFF", 0, 0, 1, 180, "RARE", "向いている方向へ瞬時にワープする。"), 
        A("meteor", "メテオ", "Magic", "AOE", "EXPLOSION", 0, 40, 60, 300, "RARE", "ランダムな敵の頭上に隕石を落とす。"),

        A("bow", "弓矢", "Ranged", "RANGE", "ATK", 300, 14, 30, 80, "COMMON", "標準的な遠距離攻撃。"), 
        A("m_gun", "マシンガン", "Ranged", "RANGE", "ATK", 150, 5, 5, 12, "COMMON", "威力は低いが連射性能に優れる銃。"),
        
        A("flame", "ファイア", "Magic", "RANGE", "PROJECTILE", 120, 5, 10, 5, "COMMON", "射程は短いが連射の効く炎。"),
        
        A("beam", "ビーム", "Magic", "RANGE", "PROJECTILE", 150, 14, 40, 100, "COMMON", "敵を貫通するエネルギー波。"),
        
        A("rocket", "ロケット弾", "Ranged", "RANGE", "EXPLOSION", 350, 56, 60, 200, "LEGENDARY", "着弾すると広範囲に爆発を起こす。"),
        
        A("cluster", "クラスター弾", "Ranged", "RANGE", "PROJECTILE", 250, 15, 40, 240, "RARE", "着弾時に分裂する爆弾を発射する。"),
        
        A("shuriken","手裏剣","Ranged","RANGE","ATK", 250, 10, 15, 30, "COMMON", "クールダウンの短い投擲武器。"),
        A("scatter", "散弾", "Ranged", "RANGE", "ATK", 150, 8, 10, 50, "COMMON", "3方向に弾をばら撒く。"),
        A("shotgun", "ショットガン", "Ranged", "RANGE", "ATK", 100, 10, 40, 120, "RARE", "近距離で5発の散弾を放つ。"),
        
        A("sniper", "スナイパー", "Ranged", "RANGE", "ATK", 200, 40, 80, 420, "RARE", "射程と単発威力に優れる狙撃銃。"),
        
        A("nova", "ノヴァ", "Magic", "AOE", "ATK", 120, 21, 30, 180, "RARE", "衝撃波を放ち敵を弾き飛ばす。"), 
        A("fireball", "ファイアボール", "Magic", "RANGE", "PROJECTILE", 350, 21, 50, 150, "COMMON", "高威力の火球を放つ。"),
        
        A("thunder", "サンダー", "Magic", "RANGE", "DEBUFF", 400, 28, 20, 420, "RARE", "ランダムな敵3体に雷を落とす。"),
        
        {...A("shooting_star", "シューティングスター", "Magic", "RANGE", "PROJECTILE", 500, 45, 60, 240, "LEGENDARY", "敵の間を跳ね回る星を放つ。"), bounce: 6},

        A("icicle", "アイシクル", "Magic", "RANGE", "DEBUFF", 100, 21, 40, 90, "RARE", "スロウ効果のある氷柱を2発放つ。"),
        A("heal", "ヒール", "Heal", "SELF", "HEAL", 0, 28, 40, 600, "LEGENDARY", "自身のHPを回復する。"),
    ];

    // --- EQUIPMENT LIBRARY (日本語) ---
    equipLibrary = [
        E("e_swd", "鉄の剣", {melee:0.10}, "#e66", "近接ダメージ +10%"),
        E("e_bow", "ロングボウ", {range:0.10}, "#6e6", "遠距離ダメージ +10%"),
        E("e_boot", "疾風の靴", {speed:0.10}, "#0ee", "移動速度 +10%"),
        E("e_arm", "プレートメイル", {def:0.10}, "#88a", "被ダメージ -10%"),
        E("e_ring", "ルビーの指輪", {melee:0.05, range:0.05}, "#d44", "全ダメージ +5%"),
        E("e_amul", "時のアミュレット", {cdr:0.05}, "#aa4", "クールダウン短縮 +5%"),
        
        E("e_belt", "ポーションベルト", {potionStockAdd: 2}, "#852", "ポーション所持上限 +2"),
        E("e_wand", "魔法の杖", {magic: 0.10}, "#c6f", "魔法ダメージ +10%"),
        E("e_scope", "スナイパースコープ", {rangeAdd: 0.20}, "#484", "攻撃射程 +20%"),
        E("e_vamp", "吸血鬼の牙", {vampire: 3}, "#a00", "敵撃破時、低確率でHP3回復"),
        E("e_shield", "タワーシールド", {hpAdd: 25, def:0.05}, "#668", "最大HP+25, 防御+5%"),
        
        E("e_lucky", "四つ葉のクローバー", {dropRateAdd: 0.10}, "#0f0", "アイテムドロップ率 +10%"),
        E("e_barrier", "バリアプリズム", {}, "#0ff", "10秒ごとにバリア(30%軽減)を張る(最大3)。"),

        E("e_thorns", "茨の鎧", {def:0.05}, "#582", "被弾時、攻撃者に10ダメージ反射。"),
        E("e_rage", "バーサーカーヘルム", {}, "#a22", "HPが減るほど攻撃力が上昇する。"),
        E("e_ghost", "ゴーストマント", {}, "#ddd", "15%の確率で攻撃を回避する。"),
        E("e_magnet", "ゴールドマグネット", {}, "#fd0", "アイテムの回収範囲が大幅に広がる。"),
        E("e_battery", "エナジーセル", {cdMult:-0.10}, "#0ff", "スキルクールダウン -10%"),
        E("e_kevlar", "ケブラーベスト", {}, "#444", "射撃ダメージを30%軽減する。"),
        E("e_lifering", "再生の指輪", {}, "#f88", "毎秒最大HPの1%を自然回復する。"),
        E("e_titan", "タイタングローブ", {}, "#842", "全ダメージ+20%, クールダウン+20%(遅くなる)")
    ];

    // --- MOVEMENT CARDS (日本語) ---
    actionLibrary.push(M("move_strafe", "ストレイフ", "敵の周囲を回り、隙を見て接近する。", "#d0d"));
    actionLibrary.push(M("move_kite", "カイト", "敵と一定距離を保ちながら移動する。", "#0d0"));
    actionLibrary.push(M("move_dash", "ダッシュ", "移動速度が40%上昇する。", "#0ee"));
    actionLibrary.push(M("move_guard", "ガード", "移動中、被ダメージを50%軽減する。", "#88a"));
    actionLibrary.push(M("move_warp", "ワープ", "敵が遠い場合、瞬時にテレポートして近づく。", "#a0f"));
    actionLibrary.push(M("move_spike", "スパイク", "移動中、接触した敵にダメージを与える。", "#e66"));
    actionLibrary.push(M("move_ghost", "ゴースト", "移動中、30%の確率で攻撃を完全回避する。", "#fff"));
    actionLibrary.push(M("move_mag", "マグネット", "アイテムの回収範囲が3倍になる。", "#ff0"));
    actionLibrary.push(M("move_reflect", "リフレクト", "移動中、正面からの射撃を打ち消す。", "#0dd"));
    actionLibrary.push(M("move_barrage", "バラージ", "移動中、近くの敵に自動で弱射撃を行う。", "#f0f"));
    actionLibrary.push(M("move_phase", "フェイズ", "移動中、定期的に前方へ小ワープする。", "#a0f"));
}

function getCardById(id) {
    let c = actionLibrary.find(x => x.id === id) || equipLibrary.find(x => x.id === id);
    return c ? {...c, currentCooldown: 0} : null;
}
