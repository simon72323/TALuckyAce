import { _decorator, Component, Node } from 'cc';
import { GreenWild, Lines, onBeginGame, RedWild, Scatter } from '../enum/RAInterface';
const { ccclass, property } = _decorator;

@ccclass('RAGameModel')
export class RAGameModel extends Component {

    private beginGameData: onBeginGame = null!;
    private bonusQueue: string[] = [];



    protected onLoad(): void {
        
    }
    
    protected start(): void {

    }

    protected update(deltaTime: number): void {
        
    }

    /**
     * 儲存 begin game 資料
     * @param msg 
     */
    public setBeginGameData(msg: onBeginGame): void {
        console.log('set beginGameData: ', msg);
        this.beginGameData = msg;
    }

    /**
     * 取得 begin game 資料
     * @returns 回傳 begin game 資料
     */
    public getBeginGameData(): onBeginGame {
        console.log('get beginGameData: ', this.beginGameData);
        return this.beginGameData;
    }

    /**
     * 此筆 onBeginGame 資料是否還有中線
     * @returns 是否還有中線
     */
    public isLineHit(): boolean {
        return (this.beginGameData['data'].Lines.length > 1) ?  true : false;
    }

    /**
     * 此筆 onBeginGame 資料是否還有中Scatter
     * @returns 是否還有中Scatter
     */
    public isScatterHit(): boolean {
        if(this.beginGameData['data'].FreeGame.HitFree){
            this.beginGameData['data'].FreeGame.HitFree = false;
            return true;
        }else{
            return false;
        }
    }

    /**
     * shift 出一筆中線資料
     * @returns 
     */
    public shiftLinesData(): Lines[] {
        return this.beginGameData['data']['Lines'].shift(); // 中線資料
    }

    /**
     * shift 出一筆盤面卡牌資料
     * @returns 
     */
    public shiftCardsData(): number[][]{
        return this.beginGameData['data']['Cards'].shift(); // 掉落完畢，盤面上卡牌資料
    }

    /**
     * shift 出一筆綠色Wild資料
     * @returns 
     */
    public shiftGreenWildData(): GreenWild[] {
        return this.beginGameData['data']['GreenWild'].shift();
    }

    /**
     * shift 出一筆紅色Wild資料
     * @returns 
     */
    public shiftRedWildData(): RedWild[] {
        return this.beginGameData['data']['RedWild'].shift();
    }

    /**
     * 回傳 Scatter 資料
     * @returns 
     */
    public getScatterData(): Scatter {
        return this.beginGameData['data']['Scatter'];
    }
}

