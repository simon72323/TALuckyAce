import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/* 掛在symbolResource_TA節點上，建立Symbol圖素資源庫 */
@ccclass('symbolResource_TA')
export class symbolResource_TA extends Component {
    @property({ type: [SpriteFrame], tooltip: "symbol圖" })
    public symbolSF: SpriteFrame[] = []!;
    @property({ type: [SpriteFrame], tooltip: "symbol模糊圖" })
    public symbolBlurSF: SpriteFrame[] = []!;
    // @property({ type: [SpriteFrame], tooltip: "胡牌牌型語系貼圖" })
    // public huTypeSF: SpriteFrame[] = []!;
    // @property({ type: [SpriteFrame], tooltip: "胡牌牌型標題語系貼圖" })
    // public huTypeTitleSF: SpriteFrame[] = []!;

    @property({ type: Prefab, tooltip: "symbol靜態節點" })
    public symbolNode: Prefab = null!;
    @property({ type: Prefab, tooltip: "符號中獎" })
    public symbolWin: Prefab = null!;

    //金卡調換普卡的對應ID
    public goldChangeID = {
        0: 11,
        1: 12,
        2: 13,
        3: 14,
        4: 15,
        5: 16,
        6: 17,
        7: 18,
        8: 11,
        9: 12,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
    }

    //金卡調換普卡的對應ID
    public wildChangeID = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 0,
        9: 11,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
    }
}


