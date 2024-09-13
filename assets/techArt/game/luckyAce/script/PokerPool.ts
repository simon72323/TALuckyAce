import { _decorator, Component, Node } from 'cc';
import { RAsymbol } from './RASymbol';
const { ccclass, property } = _decorator;

@ccclass('RASymbolPool')
export class RASymbolPool extends Component {

    private static raSymbol: RAsymbol;

    private pokerPool: Array<number>;

    start() {

    }

    update(deltaTime: number) {

    }

    /**
    * 預設牌池
    * @returns 遊戲中所有牌
    */
    private static defaultPokerPool() {
        // 牌面順序由左至右，由上至下20個位置，陣列中第5、10、15、20、25的數值不會被取用到
        const initSymbol = [7, 18, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14];
        let slotRun = 4;
        let defaultPoker: Array<number> = [];

        for (let i = 0; i < initSymbol.length; i++) {
            const symbolType = this.raSymbol.changeSymbolID(i)
            console.log('symbolType', symbolType)
            // defaultPoker.push(symbolType)
        }

        return defaultPoker
    }

    /**
    * 產生牌池
    * @returns 遊戲中所有牌
    */
    private static producePokerPool() {

    }
}

