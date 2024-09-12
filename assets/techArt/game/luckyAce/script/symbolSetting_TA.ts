import { _decorator, Component, Sprite, tween, UIOpacity, find, sp, Vec3, Node, Animation } from 'cc';
import { symbolResource_TA } from './symbolResource_TA';
const { ccclass } = _decorator;

/* 掛在symbol預製体上，設置symbol自身的符號圖案 */
@ccclass('symbolSetting_TA')
export class symbolSetting_TA extends Component {
    symID: number = 0;//紀錄本symID
    private symbolHeight: number = 260;//symbol的高度間距

    private symbol: Node;
    private scatter: Node;
    private blurSymbol: Node;
    private blurNode: Node;
    private goldSymbolRay: Node;

    onLoad() { //抓取Slot符號節點
        this.symbol = this.node.getChildByName('main').getChildByName('symbol');
        this.scatter = this.node.getChildByName('main').getChildByName('scatter');
        this.blurSymbol = this.node.getChildByName('blur').getChildByName('symbol');
        this.blurNode = this.node.getChildByName('blur');
        this.goldSymbolRay = this.node.getChildByName('goldSymbolRay');
        this.scatter.active = true; //防呆，預設scatter為開啟狀態，避免讀不到Spine Skeleton資訊產生bug
    }

    //初始化symbol，重新配置圖示與位置(symID)
    resetSymbol(symID: number) {
        this.symbol.active = true;//顯示靜態symbol
        this.scatter.active = false;
        this.node.position = new Vec3(0, 910 - (this.symbolHeight * this.node.getSiblingIndex()), 0);//設置symbol位置，每行第一個symbol位置<原設1170>-(symbol高度X子物件序列ID)
        this.setSymbolData(symID);//更新圖示
    }

    //設置symbol圖示(symID)
    setSymbolData(symID: number) {
        if (!this.node.parent.active)
            return;
        this.symID = symID;//設置本symID
        if (this.symID == 10) {  //如果判斷是符號Scatter
            this.symbol.active = false;
            this.scatter.active = true; //開啟顯示Scatter
        } else {
            this.symbol.active = true;//顯示靜態symbol
            this.scatter.active = false;
        }
        const symbolSFTA = find('Canvas/TADemo/symbolResource_TA').getComponent(symbolResource_TA);//獲取場景內的symbolResource_TA腳本
        this.symbol.getComponent(Sprite).spriteFrame = symbolSFTA.symbolSF[symID]; //正常貼圖，移除原寫法[symID - 1]
        this.blurSymbol.getComponent(Sprite).spriteFrame = symbolSFTA.symbolBlurSF[symID]; //模糊貼圖，移除原寫法[symID - 1]
    }

    //模糊淡入
    blurShow() {
        if (!this.blurNode.active) {
            this.blurNode.active = true;//顯示模糊物件
            tween(this.blurNode.getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();
        }
    }

    //模糊淡出
    blurHide() {
        if (this.blurNode.active) {
            tween(this.blurNode.getComponent(UIOpacity)).to(0.3, { opacity: 0 }).call(() => {
                this.blurNode.active = false;//隱藏模糊物件
                this.blurNode.getComponent(UIOpacity).opacity = 0;
            }).start();//淡出動態
        }
    }

    //切換為scatter出現動態
    scatterShow() {
        // console.warn('執行scatterShow() 切換為scatter出現動態');
        this.symbol.active = false;//隱藏靜態symbol
        this.scatter.active = true;
        this.scatter.getComponent(sp.Skeleton).setAnimation(0, 'show', false);//先播放出現動態
        this.scatter.getComponent(sp.Skeleton).setCompleteListener(()=>{
            this.scatter.getComponent(sp.Skeleton).setAnimation(0, 'idle', true)//再播放停留動態
        });
    }

    //切換為scatter停留動態
    scatterStay() {
        // console.log('執行scatterStay() 切換為scatter停留動態');
        this.symbol.active = false;//隱藏靜態symbol
        this.scatter.active = true;
        this.scatter.getComponent(sp.Skeleton).setAnimation(0, 'idle', true)//播放停留動態
    }

    //播放金卡掃光特效
    showGoldSymbolRay() {
        this.goldSymbolRay.active = true; //開啟掃光特效節點
        this.node.getComponent(Animation)!.play('goldSymbolRay'); //播放掃光特效
    }

    // scatterWin() {
    //     this.symbol.active = false;//隱藏靜態symbol
    //     this.scatter.active = true;
    //     this.scatter.getComponent(sp.Skeleton).setAnimation(0, 'win', true);//播放停留動態
    // }
}