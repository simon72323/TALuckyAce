import { _decorator, Component, Node, tween, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/* 掛在跑馬燈上，運行內容跑動 */
@ccclass('marquee_TA')
export class marquee_TA extends Component {

    private marqueeTx: Node[] = []; //跑馬燈內容
    private width: number[] = []; //跑馬燈每個內容長度
    private ID: number = 0; //跑馬燈內容ID

    start() {
        this.scheduleOnce(()=>{
            this.widthRenew();  //等待確認語系完成換圖後，再呼叫更新跑馬燈尺寸
        },0.1)
    }

    /* 更新跑馬燈貼圖長度尺寸 */
    widthRenew(){
        for (let i = 0; i < this.node.children.length; i++) {
            this.marqueeTx[i] = this.node.children[i];   //依序抓取跑馬燈內容子物件
            this.marqueeTx[i].position = new Vec3(540,0,0);  //設置初始起點
            this.width[i] = this.node.children[i].getComponent(UITransform).contentSize.width;   //依序抓取跑馬燈內容的寬度
            console.warn('跑馬燈ID '+ this.marqueeTx[i].name +', 長度 '+ this.width[i] );
        }
        this.marqueeRun(this.ID);  //呼叫運行跑馬燈
    }
    
    /* 運行跑馬燈內容 */
    marqueeRun(marqueeTx: number){
        let pos1 = Math.round(this.width[marqueeTx]+150);  //移動到此座標時啟動下一段內容- 內容節點長度-440(畫面寬度一半540，留100間距)+540(中心點0，往負值移動+540的距離量)
        let pos2 = Math.round(this.width[marqueeTx]+1080-pos1);  //內容移動的終點座標- 內容長度+畫面寬度，再減掉pos1(經過距離)，算出算出剩餘的距離
        let time1 = Math.round(pos1*0.01);  //pos1的運行時間長度，0.01是測出較適宜的距離轉換時間比率
        let time2 = Math.round(pos2*0.01);  //pos2的運行時間長度，0.01是測出較適宜的距離轉換時間比率

        tween(this.marqueeTx[marqueeTx]).by(time1, { position: new Vec3(0-pos1,0,0) })  //移動至下一段內容要啟動的座標(與下段內容拉出間距)
        .call(() => {
            this.ID = this.ID+1;
            if (this.ID >= this.marqueeTx.length) {
                this.ID = 0; //內容ID歸零
            }
            this.marqueeRun(this.ID);//循環呼叫自身，運行下一段內容跑馬燈
        })
        .by(time2, { position: new Vec3(0-pos2,0,0) }) //移動至終點座標
        .call(() => {
            this.marqueeTx[marqueeTx].position = new Vec3(540,0,0);  //將跑馬燈內容歸回起點
        })
        .start(); 
    }
}


