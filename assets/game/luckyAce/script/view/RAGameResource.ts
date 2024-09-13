import { _decorator, Component, Node, resources, SpriteFrame } from 'cc';
import { RASymbolID } from '../enum/RAEnum';
const { ccclass, property } = _decorator;

@ccclass('RAGameResource')
export class RAGameResource extends Component {
    @property({ type: [SpriteFrame], tooltip: "金色symbol圖" })
    public goldSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "白色symbol圖" })
    public nomarlSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "wild圖" })
    public wildSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "scatter圖" })
    public scatterSymbolSpriteFrame: SpriteFrame[] = [];


    start() {

    }

    update(deltaTime: number) {

    }

    public getSymbolImg(symbolID: RASymbolID): SpriteFrame {
        let symbolImg: SpriteFrame | undefined;
        // if (symbolID < 10) {
        //     symbolImg = this.goldSymbolSpriteFrame[symbolID]
        // } else {
        //     let nomarlID = symbolID - 11
        //     symbolImg = this.nomarlSymbolSpriteFrame[nomarlID]
        // }
        // if (symbolID > RASymbolID.n5) {
        //     symbolImg = this.goldSymbolSpriteFrame[symbolID - 28]

        // } else {
        //     symbolImg = this.nomarlSymbolSpriteFrame[symbolID - 20]
        // }

        if (symbolID >= 28 && symbolID <= 35) {
            // 金色symbol ID = 28 ~ 35 = goldSymbolSpriteFrame 0 ~ 7
            symbolImg = this.goldSymbolSpriteFrame[symbolID - 28]
        } else if (symbolID >= 20 && symbolID <= 27) {
            // 普通symbol ID = 20 ~ 27 = nomarlSymbolSpriteFrame 0 ~ 7
            symbolImg = this.nomarlSymbolSpriteFrame[symbolID - 20]
        } else if (symbolID <= 2) {
            // wild symbol ID = 1 ~ 2 = wildSymbolSpriteFrame 0 ~ 1
            symbolImg = this.wildSymbolSpriteFrame[symbolID - 2]
        } else {
            // scatter symbol ID = 10 = scatterSymbolSpriteFrame 0
            symbolImg = this.scatterSymbolSpriteFrame[symbolID - symbolID]
        }
        return symbolImg;
    }
}
