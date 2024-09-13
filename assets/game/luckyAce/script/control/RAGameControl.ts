import { _decorator, Component, Node } from 'cc';
import { RABaseGameView } from '../view/RAGameView';
import { onBeginGame } from '../enum/RAInterface';
import { RAGameModel } from '../model/RAGameModel';
import { beginGameData } from '../enum/mockData';
import { RAComboView } from '../view/RAComboView';
import { RAMarquee } from '../view/RAMarquee';
import { RASymbolTipView } from '../view/RASymbolTipView';
const { ccclass, property } = _decorator;

@ccclass('RAGameControl')
export class RAGameControl extends Component {

    @property(RABaseGameView)
    public gameView: RABaseGameView = null!; // game view

    @property(RAGameModel)
    public model: RAGameModel = null!; // game view

    @property(RAComboView)
    public comboView: RAComboView = null; // game combo

    @property(RASymbolTipView)
    public tipView: RASymbolTipView = null; // symbol tip

    private hasGameStarted: boolean = false;

    protected onLoad(): void {
    }

    protected start(): void  {
        this.gameView.playOpenFx();
        this.tipView.enableTipBtn(true);
    }

    public onSpin(): void {
    }

    public onBeginGame(msg: object): void {
        // msg = structuredClone(onBeginGameData);
        msg = structuredClone(beginGameData.Instance.getData());

        this.model.setBeginGameData(msg as onBeginGame);
        if (!this.hasGameStarted) {
            this.playFirstMultiple();
            this.hasGameStarted = true;
        }
        this.updateSymbols();
        this.tipView.enableTipBtn(false);

        // 監聽公版事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, ()=>{
        //})
    }

    protected update(deltaTime: number): void {
    }

    /**
     * symbol掉落演出，盤面symbol顯示為server給的資料
     */
    private updateSymbols(): void {
        const cards = this.model.shiftCardsData(); // 盤面更新卡牌資料

        console.log('cards:', JSON.stringify(cards));

        this.gameView.updateSymbols(cards, () => {
            this.handleBeginGame();
        });
    }

    /**
     * 處理 onBeginGame
     */
    private handleBeginGame(): void {
        console.log('handleBeginGame...');
        // 更新落下的 symbol
        if (this.model.isLineHit()) {
            this.playLineWin();
        } else if (this.model.isScatterHit()) {
            console.log('演出中scatter');
            this.playScatterWin();
        } else {
            // 都沒中的情況
            this.comboView.resetComboInfo();
            this.hasGameStarted = false;
            console.log('所有獎項演出完畢!');
            this.tipView.enableTipBtn(true);
        }
    }

    // 第一次亮燈
    private playFirstMultiple(): void {
        const deafultLine: number = 0;
        const isFreeGame: boolean = false;
        this.comboView.showMultipleLabel(deafultLine, isFreeGame);
    }

    /**
     * 處理中線演出
     */
    private playLineWin(): void {
        const payTotalData = this.model.getBeginGameData()['data']['PayTotal'];
        const freeGameSpinData = this.model.getBeginGameData()['data']['FreeGameSpin'];
        let linedata = this.model.shiftLinesData(); // 中線資料
        let draw = this.model.shiftCardsData(); // 補牌資料
        let gwdata = this.model.shiftGreenWildData();
        let rwdata = this.model.shiftRedWildData();

        this.comboView.setLineWinInfo(linedata, payTotalData, freeGameSpinData);
        this.gameView.playLinesWin(linedata, draw, gwdata, rwdata,() => { this.handleBeginGame(); });
    }

    /**
     * 處理中Scatter演出
     */
    private playScatterWin(): void {
        let linedata = this.model.shiftLinesData(); // 中線資料
        const payTotalData = this.model.getBeginGameData()['data']['PayTotal'];
        const freeGameData = this.model.getBeginGameData()['data']['FreeGame'];
        const freeGameSpinData = this.model.getBeginGameData()['data']['FreeGameSpin'];

        this.gameView.playScatterWin(this.model.getScatterData(), () => { this.handleBeginGame(); });
        this.comboView.setScatterWinInfo(linedata, payTotalData, freeGameData, freeGameSpinData);
    }
}

