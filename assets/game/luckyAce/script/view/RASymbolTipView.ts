import { _decorator, Component, find, Node, Vec3 } from 'cc';
import { RASymbolTip } from './RASymbolTip';
import { RASymbol } from './RASymbol';
import { RASymbolID, TipDirection } from '../enum/RAEnum';
const { ccclass, property } = _decorator;

@ccclass('RASymbolTipView')
export class RASymbolTipView extends Component {

    @property(Node)
    public mask: Node = null!; // 黑色遮照底圖

    @property([RASymbolTip])
    public symbolTip: RASymbolTip[] = []; 

    @property(Node)
    public clickBG: Node = null!;

    private enableTip: boolean = true;

    protected onLoad(): void {
    }

    protected start(): void {

    }

    protected update(deltaTime: number): void {
    }

    /**
     * 顯示 symbol tip
     * @param symbolid 
     * @param grid 
     */
    public showTip(event: Event, customEventData: string): void {

        if(!this.enableTip){
            return;
        }

        const symNode = (event.target as unknown) as Node;
        const symbol = symNode.getComponent(RASymbol);

        this.mask.active = true;
        this.clickBG.active = true;

        let tip: RASymbolTip = null!;
        let pos: Vec3 = symbol.getEndPos();
        
        (symbol.columnID <= 2) ? (tip = this.symbolTip[TipDirection.Left]): (tip = this.symbolTip[TipDirection.Right]);

        tip.node.setPosition(pos);
        tip.setSymbolHint(symbol.getSymbolID(), [0,0,0,0,0]);

        switch(symbol.getSymbolID()){
            case RASymbolID.g9:
            case RASymbolID.g10:
            case RASymbolID.g11:
                tip.setSymbolHint(symbol.getSymbolID());
                break;
            default:
                tip.setSymbolHint(symbol.getSymbolID(), [0,0,0,0,0]);
                break;
        }
        tip.node.active = true;
    }

    /**
     * 隱藏 symbol tip
     */
    public hideTip(): void {
        for(let i = 0; i < this.symbolTip.length; ++i){
            this.symbolTip[i].node.active = false;
        }

        this.mask.active = false;
        this.clickBG.active = false;
    }

    /**
     * 是否允許顯示 symbol tip
     * @param b 
     */
    public enableTipBtn(b:boolean): void {
        this.enableTip = b;
    }
}

