import { _decorator, Component, Node, Animation, Label } from 'cc';
import { FreeGameSpin, FreeGame, Lines } from '../enum/RAInterface';
import { RAMarquee } from './RAMarquee';
const { ccclass, property } = _decorator;

@ccclass('RAComboView')
export class RAComboView extends Component {

    @property({ type: Node, tooltip: "倍率文字" })
    private multipleNode: Node = null;
    @property({ type: Node, tooltip: "combo文字" })
    private comboNode: Node = null;

    // Free Game
    @property({ type: Node, tooltip: "free game文字背景" })
    private freeTopBg: Node = null;

    // 跑馬燈 marquee_winScore
    @property({ type: Node, tooltip: "跑馬燈" })
    private marquee: RAMarquee = null;
    // 遊戲贏得分數 winScoreInfo
    @property({ type: Node, tooltip: "遊戲贏得分數資訊" })
    private winScoreInfo: Node = null;
    // 跑馬燈分數資訊
    @property({ type: Node, tooltip: "跑馬燈分數資訊" })
    private winTotalScoreInfo: Node = null;


    private multipleNormal = [1, 2, 3, 5]; // 一般遊戲時的倍率
    private multipleFree = [2, 4, 6, 10]; // 免費遊戲時的倍率
    private comboTimes: number = 0; // combo連跳次數


    protected onLoad(): void {
        this.freeTopBg.active = false;
        this.setMultipleNormal();
    }


    start() {
    }

    update(deltaTime: number) {

    }


    /**
     * 中線演出
     * @param lineData Lines內所有Data
     * @param payData 此局可獲得金額
     * @param freeGameSpinData 是否為Free Game
     */

    public async setLineWinInfo(lineData: Lines[], payData: number, freeGameSpinData?: FreeGameSpin): Promise<void> {
        const lines = lineData[0].DoubleTime;
        const isFreeGame = freeGameSpinData.FreeGameTime > 0;
        let doubleTimeData: number = 0;
        doubleTimeData = lines;
        this.comboTimes++

        await this.waitMilliSeconds(1500);

        // 中線顯示倍率文字 & Combo & 更換跑馬燈
        this.showMultipleLabel(doubleTimeData, isFreeGame);
        this.showComboLabel(this.comboTimes);
    }

    /**
     * 設置 Normal Game 倍率文字
     */
    private setMultipleNormal(): void {
        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;

        for (let child = 0; child < multipleNode.length; child++) {
            // 更換底圖的字
            let topLabel = multipleNode[child].getComponent(Label);
            topLabel.string = `x${this.multipleNormal[child]}`

            // 更換亮燈的字
            let botLabel = multipleNode[child].getChildByName('label').getComponent(Label);
            botLabel.string = `x${this.multipleNormal[child]}`
        }
    }

    /**
     * Free game 模式演出
     * 更換 Free Game 背景 & 倍率文字
     * @param lineNum combo次數
     */

    public async setScatterWinInfo(lineData: Lines[], payData: number, freeGameData?: FreeGame, FreeGameSpin?: FreeGameSpin): Promise<void> {
        await this.waitMilliSeconds(4000);
        this.freeTopBg.active = true;

        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;

        for (let child = 0; child < multipleNode.length; child++) {
            // 更換底圖的字
            let topLabel = multipleNode[child].getComponent(Label);
            topLabel.string = `x${this.multipleFree[child]}`

            // 更換亮燈的字
            let botLabel = multipleNode[child].getChildByName('label').getComponent(Label);
            botLabel.string = `x${this.multipleFree[child]}`
        }

        // 重置狀態
        this.resetComboInfo();
    }

    /**
     *
     * 重置所有狀態
     */
    public resetComboInfo(): void {
        console.log('RESET')
        let doubleTime: number = 0;
        this.showMultipleLabel(doubleTime);
        this.comboNode.active = false;
        this.comboTimes = 0;
    }

    /**
     * 顯示倍率文字
     * @param lineNum 中線資料
     */
    public showMultipleLabel(lineNum: number, isFreeGame?: boolean) {
        let currentLineNum = -1;

        if (isFreeGame) {
            currentLineNum = this.multipleFree.indexOf(lineNum);
        } else {
            currentLineNum = this.multipleNormal.indexOf(lineNum);
        }

        if (currentLineNum === -1) {
            currentLineNum = 0;
        }

        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;
        const nodeAnimation = multipleNode[currentLineNum].getComponent(Animation);

        multipleNode.forEach(node => {
            node.getChildByName('label').active = false;
            node.getChildByName('fx').active = false;
        });

        // 亮燈得地方
        multipleNode[currentLineNum].getChildByName('label').active = true;
        multipleNode[currentLineNum].getChildByName('fx').active = true;


        if (lineNum === 0) {
            nodeAnimation.play('multipleStay');
        } else {
            // 播放震動
            this.node.getComponent(Animation).play('shark')
            nodeAnimation.play('multipleChange');
            nodeAnimation.on(Animation.EventType.FINISHED, () => {
                nodeAnimation.play('multipleStay');
            }, this);
        }

    }

    /**
     * 顯示Combo文字
     * @param comboNum combo次數
     */
    private showComboLabel(comboNum: number) {
        this.comboNode.active = true;

        const comboAni = this.comboNode.getComponent(Animation);
        let comboStr = this.comboNode.getChildByName('label').getComponent(Label);

        setTimeout(() => {
            comboStr.string = comboNum.toString();
        }, 0.5);

        if (comboNum === 1) {
            comboAni.play('combo_show');
            comboAni.on(Animation.EventType.FINISHED, (state) => {
                comboAni.play('combo_loop')
            }, this)
        } else {
            comboAni.play('combo_change');
            comboAni.on(Animation.EventType.FINISHED, (state) => {
                comboAni.play('combo_loop')
            }, this)
        }
    }

    /**
     * 等待多少毫秒
     * @param ms
     * @returns
     */
    private waitMilliSeconds(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }
}

