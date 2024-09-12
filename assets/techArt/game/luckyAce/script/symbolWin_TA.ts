import { _decorator, Component, Sprite, find, sp, Animation, Node, Vec3, UIOpacity, Color, tween } from 'cc';
import { symbolResource_TA } from './symbolResource_TA';
const { ccclass } = _decorator;

/* 掛在symbolWin預製体上，中獎符號表演相關功能*/
@ccclass('symbolWin_TA')
export class symbolWin_TA extends Component {

    private wild: Node;
    private symbol: Node;
    private scatter: Node;
    private stayFx: Node;
    private winFx: Node;
    private redWildFx: Node;
    private flopFx: Node;

    private targetSymbol: Node = null;

    onLoad() { //抓取Slot符號節點
        this.wild = this.node.getChildByName('wild');
        this.symbol = this.node.getChildByName('symbol');
        this.scatter = this.node.getChildByName('scatter');
        this.stayFx = this.node.getChildByName('stayFx');    
        this.winFx = this.node.getChildByName('winFx');
        this.redWildFx = this.node.getChildByName('redWildFx');
        this.flopFx = this.node.getChildByName('flopFx');         
    }

    //設置要執行的symbolWin表演(symID，聽牌狀態，輪軸的symbol節點)
    setSymbolWinData(symID: number, scatterReady: boolean, symbolNode: Node) {
        this.targetSymbol = symbolNode;
        this.getComponent(UIOpacity).opacity = 255;
        this.node.scale = new Vec3(1, 1, 1);//尺寸初始化
        this.wild.active = false;
        this.symbol.active = false;
        this.scatter.active = false;
        this.stayFx.active = false;
        this.winFx.active = false;
        this.redWildFx.active = false;
        this.flopFx.active = false;
        const symbolSFTA = find('Canvas/TADemo/symbolResource_TA').getComponent(symbolResource_TA);//獲取場景內的symbolResource_TA腳本
        this.node.position = symbolNode.getPosition().add(symbolNode.parent.parent.getPosition());//中獎顯示的世界座標位置
        symbolNode.active = false;//隱藏輪軸的symbol
        if (symID === 10) { //scatter中獎表演
            this.scatter.getChildByName('scatterSpine').setScale(new Vec3(1, 1, 1,));
            this.scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).color = new Color(255, 255, 255, 255);
            this.scatter.getChildByName('scatterHideFx').getComponent(UIOpacity).opacity = 0;
            this.scatter.active = true;
            if (scatterReady) {              
                this.stayFx.active = true;  //啟動scatter聽牌狀態特效
                this.scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).setAnimation(0, 'listen', true);//播放scatter聽牌動態
            }
            else
            this.scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).setAnimation(0, 'win', true);//播放scatter贏牌動態
        }else if(symID === 8) {  //綠Wild中獎表演
            this.wild.active = true;
            this.winFx.active = true;
            this.node.getComponent(Animation).play('symbolWildWin');//播放動態
            this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'win_green', false);//播放Wild贏牌動態

        }else if(symID === 9) {  //紅Wild中獎表演
            this.wild.active = true;
            this.winFx.active = true;
            this.node.getComponent(Animation).play('symbolWildWin');//播放動態
            this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'win_red', false);//播放Wild贏牌動態
            
        }else {
            this.symbol.active = true;
            this.winFx.active = true;
            this.node.getComponent(Animation).play('symbolWin');//播放動態
            this.symbol.getComponent(Sprite).spriteFrame = symbolSFTA.symbolSF[symID];//設置貼圖，移除[symID - 1]
        }
    }

    update() {
        if (this.targetSymbol) {
            const targetPos = this.targetSymbol.getPosition().add(this.targetSymbol.parent.parent.getPosition());
            if (this.node.position.y != targetPos.y)
                this.node.position = targetPos;//中獎顯示的世界座標位置
        }
    }
    //scatter牌消除
    scatterRemove() {
        this.node.getChildByName('scatter').getComponent(Animation).play();//播放消除動態
    }

//Wild掀牌表演
runWild(wildType: string){
    console.log('執行runWild() Wild表演');
    this.scatter.active = false;
    this.stayFx.active = false;
    this.symbol.active = true; //開啟symbol節點，漸淡消失表演
    this.winFx.active = false;
    this.redWildFx.active = false;
    this.flopFx.active =true;
    this.wild.active =true; //開啟wild節點
    this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'back', true); //播放掀牌動態
    let _goldSymOpacity = this.symbol.getComponent(UIOpacity); //抓取中獎symbol的UIOpacity組件
    _goldSymOpacity.opacity = 255;
    tween(_goldSymOpacity).to(0.3, { opacity: 0 }).start();  //讓金卡Symbol漸淡消失
    this.node.getComponent(Animation).play('symbolFlopFx');//播放金卡轉換牌背特效
    this.scheduleOnce(() => {
        if (wildType=='green') {  //Skin切換成綠牌
            this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'flip_green', false); //播放掀牌動態
        }else if(wildType=='red'){   //Skin切換成紅牌
            this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'flip_red', false); //播放掀牌動態
            this.scheduleOnce(() => {
                this.wild.getChildByName('wildSpine').getComponent(sp.Skeleton).setAnimation(0, 'replicate_red', false); //播放複製動態
            }, 0.7)  
        }
    }, 0.5)  //等待金卡Symbol漸淡消失後再開啟Wild物件(牌背狀態)
}
//|→→→一般牌消失特效0.3→→→|→→→金卡漸淡0.3→→→|→→→牌背翻成Wild0.3→→→|→→→刪除SymbolGoldwinLayer節點下的Wild，由軸面上的Wild取代


    resetTarget() {
        this.targetSymbol = null;
    }

    onDisable() {
        this.resetTarget();
    }
}