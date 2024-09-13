import { _decorator, Component, Node, Animation, EventHandler, Button, tween, Vec3, math, Toggle, sp, Label, Tween, UIOpacity, Prefab, UITransform, Sprite, LightingStage, animation, AnimationState, instantiate, UIOpacityComponent, CCFloat, find } from 'cc';
import { particle3DAutoSwitch } from '../../../../game/luckyAce/script/anim/particle3DAutoSwitch';
import poolHandler from '../../../common/script/poolHandler';
import { demoInfo_TA } from './demoInfo_TA';
import { symbolResource_TA } from './symbolResource_TA';
import { symbolSetting_TA } from './symbolSetting_TA';
import { symbolWin_TA } from './symbolWin_TA';

const { ccclass, property } = _decorator;

/* royalAce動態表演主流程 */
@ccclass('royalAce_TA')
export class royalAce_TA extends Component {
    /* 按鈕相關 */
    @property({ type: Node, tooltip: "spin按鈕" })
    private btnSpin: Node = null;
    @property({ type: Node, tooltip: "stop按鈕" })
    private btnStop: Node = null
    @property({ type: Node, tooltip: "自動按鈕停止" })
    private btnAutoStop: Node = null;
    @property({ type: Node, tooltip: "閃電按鈕(關閉狀態)" })
    private btnFastOff: Node = null;
    @property({ type: Node, tooltip: "閃電按鈕(開啟狀態)" })
    private btnFastOn: Node = null;
    @property({ type: Button, tooltip: "自動按鈕" })
    private btnAuto: Button = null;
    @property({ type: Button, tooltip: "下注加分按鈕" })
    private betAdd: Button = null;
    @property({ type: Button, tooltip: "下注減分按鈕" })
    private betLess: Button = null;
    @property({ type: Button, tooltip: "設置選單按鈕" })
    private btnSetting: Button = null;

    /* 主要介面 */
    @property({ type: Node, tooltip: "slot主界面" })
    private slotGameUI: Node = null;
    @property({ type: Node, tooltip: "symbol勝利動畫層" })
    private symbolWinLayer: Node = null;
    @property({ type: Node, tooltip: "金卡symbol勝利動畫層" })
    private symbolGwinLayer: Node = null;
    @property({ type: Node, tooltip: "symbol特效層" })
    private symbolFxLayer: Node = null;
    @property({ type: [Node], tooltip: "slot轉動層" })  //slotRun0~4節點
    private slotRun: Node[] = [];
    @property({ type: Node, tooltip: "slot遮黑層" })
    private slotBlack: Node = null;
    @property({ type: Node, tooltip: "slot聽牌層" })
    private slotListen: Node = null;
    @property({ type: Node, tooltip: "大獎跑分層" })
    private bigWin: Node = null;
    /* stateName對應typeState位置(表演資料對應用) */
    private stateNameID = {
        'free': 0,
        'normal': 1,  //原'flower'
        'greenWild': 2, //原'kong'
        'redWild': 3,  //原'pong'
    }
    @property({ type: Node, tooltip: "Slot上方牌靴" })
    private PokerShoe: Node = null;
    @property({ type: Prefab, tooltip: "中獎符號消失特效" })
    private symDestroyFx: Prefab = null;
    @property({ type: Node, tooltip: "開局特效" })
    private openingFx: Node = null;


    /* 免費遊戲相關介面 */
    @property({ type: Node, tooltip: "免費遊戲獲得" })
    private freeGameGet: Node = null;
    @property({ type: Node, tooltip: "免費遊戲結算" })
    private totalWin: Node = null;
    @property({ type: Node, tooltip: "免費遊戲上方背景圖" })
    private freeTopBg: Node = null;
    @property({ type: Node, tooltip: "免費遊戲剩餘次數介面" })
    private freeGameTimes: Node = null;
    @property({ type: Node, tooltip: "免費遊戲加局訊息" })
    private freeGameAddition: Node = null;
    @property({ type: Node, tooltip: "免費遊戲隱藏按鈕操作區" })
    private controlBtns: Node = null;

    private scatterSym: Node[] = []; //儲存每局的scatter符號，開始新局時清空

    /* 分數相關 */
    @property({ type: Label, tooltip: "玩家分數" })
    private userCashLabel: Label = null;
    @property({ type: Node, tooltip: "目前倍率" })
    private multiple: Node = null;
    @property({ type: Node, tooltip: "贏得分數資訊" })
    public winScoreInfo: Node = null;
    @property({ type: Node, tooltip: "共贏得分數資訊" })
    private winTotalScoreInfo: Node = null;
    @property({ type: Node, tooltip: "跑馬燈" })
    private marquee: Node = null;
    @property({ type: Node, tooltip: "COMBO連贏次數" })
    private combo: Node = null;
    @property({ type: Node, tooltip: "贏得分數欄位底框" })
    private winScoreBg: Node = null;
    @property({ type: Node, tooltip: "贏得分數噴金幣特效" })
    private spawnCoin: Node = null;

    /* 時間參數 */
    private slotRunSpeed: number = 0.4;//slot轉動速度時間
    private scheduleStartTime: number = 0.1;//slot依序表演的間隔時間
    private scheduleStopTime: number = 0.2;//依序停止的間隔時間
    private fastStopTime: number = 0.6;//閃電模式，開始轉動後等待停止的時間
    private stopTime: number = 1;//開始轉動後等待停止的時間
    private listenTime: number = 2.5;//轉動聽牌時間
    private dropListenTime: number = 1.5;//掉落聽牌時間
    private runScoreTime: number = 6;//跑分時間(最多)


    /* 遊戲模式設置 */
    private freeGameMode: boolean = false;//免費遊戲:一般模式
    private freeGameReady: boolean = false;//預備進入免費遊戲
    private autoGameMode: boolean = false;//自動遊戲模式狀態
    private fastMode: boolean = false;//閃電模式狀態
    private bigWinState: boolean = false;//BigWin執行狀態

    /* 其他 */
    private userCash: number = 0;//玩家分數
    private autoGameRound: number = 0;//自動遊戲回合
    private bigWinMultiple = [20, 40, 70, 100];//切換bigWin的分數倍率
    private bigWinSpineAnimName = ['bigwin', 'mega', 'super']; //bigWinSpine動態名稱
    private myPool = new poolHandler();//創建物件池
    private symbolHeight = 260;//此款遊戲的symbol欄位高度
    private stopSlot: boolean[] = [false, false, false, false, false];//每段slot停止狀態
    private gameRound: number = 0;//紀錄遊戲目前demo回合(第0局開始)
    private hideSlot: number[] = [0, 0, 0, 0, 0];//掉落前的各symbol隱藏數量(用來判斷該行是否判斷掉落跟聽牌)
    private multipleNormal = ['x1', 'x2', 'x3', 'x5'];//一般遊戲時的倍率
    private multipleFree = ['x2', 'x4', 'x6', 'x10'];//免費遊戲時的倍率
    private winTotalScore: number = 0; //累加當局目前贏得分數
    private comboNum: number = 0; //記錄遊戲目前COMBO連贏數
    private goldSym: Node[] = []; //記錄目前連線的金卡牌
    private slotSymbolPos: Vec3[] = [new Vec3(-430,910,0),new Vec3(-430,650,0),new Vec3(-430,390,0),new Vec3(-430,130,0),  //盤面上20個Symbol座標，作為紅Wild移動目標
                                     new Vec3(-215,910,0),new Vec3(-215,650,0),new Vec3(-215,390,0),new Vec3(-215,130,0),
                                     new Vec3(0,910,0),new Vec3(0,650,0),new Vec3(0,390,0),new Vec3(0,130,0),
                                     new Vec3(215,910,0),new Vec3(215,650,0),new Vec3(215,390,0),new Vec3(215,130,0),
                                     new Vec3(430,910,0),new Vec3(430,650,0),new Vec3(430,390,0),new Vec3(430,130,0)];

    //腳本連結
    @property({ type: demoInfo_TA, tooltip: "demo內容腳本" })
    private demoInfoTA: demoInfo_TA = null;
    @property({ type: symbolResource_TA, tooltip: "symbol資源" })
    private symbolResourceTA: symbolResource_TA = null;

    onLoad() {
        //按鈕觸發設置
        const thisScriptName = this.name.split('<')[1].split('>')[0];  //取得自身腳本的名稱，從'<'分割，保留第2部分，再從'>'分割，保留第1部分
        //spin按鈕，設置呼叫的涵式
        const spinBtnEventHandler = new EventHandler();  //新增一個按鈕ClickEvents
        spinBtnEventHandler.target = this.node;          //指定要執行的節點
        spinBtnEventHandler.component = thisScriptName;  //執行的腳本名稱
        spinBtnEventHandler.handler = 'clickSpin';       //執行的Funtion名稱
        this.btnSpin.getComponent(Button).clickEvents.push(spinBtnEventHandler);  //指定按鈕節點，push()內填入前面宣告的名稱

        //stop按鈕
        const stopBtnEventHandler = new EventHandler();
        stopBtnEventHandler.target = this.node;
        stopBtnEventHandler.component = thisScriptName;
        stopBtnEventHandler.handler = 'stopGameSlotRunNow';
        this.btnStop.getComponent(Button).clickEvents.push(stopBtnEventHandler);

        //fast按鈕(關閉)
        const fastBtnOffEventHandler = new EventHandler();
        fastBtnOffEventHandler.target = this.node;
        fastBtnOffEventHandler.component = thisScriptName;
        fastBtnOffEventHandler.handler = 'fastSlotOn';
        this.btnFastOff.getComponent(Button).clickEvents.push(fastBtnOffEventHandler);

        //fast按鈕(開啟)
        const fastBtnOnEventHandler = new EventHandler();
        fastBtnOnEventHandler.target = this.node;
        fastBtnOnEventHandler.component = thisScriptName;
        fastBtnOnEventHandler.handler = 'fastSlotOff';
        this.btnFastOn.getComponent(Button).clickEvents.push(fastBtnOnEventHandler);

        //停止自動遊戲按鈕
        const stopAutoBtnEventHandler = new EventHandler();
        stopAutoBtnEventHandler.target = this.node;
        stopAutoBtnEventHandler.component = thisScriptName;
        stopAutoBtnEventHandler.handler = 'stopAutoGame';
        this.btnAutoStop.getComponent(Button).clickEvents.push(stopAutoBtnEventHandler);

        //配置初始牌面
        const initSymbol = [7, 18, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14];  //牌面順序由左至右，由上至下20個位置，陣列中第5、10、15、20、25的數值不會被取用到
        const slotLength = this.slotRun.length;  //slot行數
        for (let i = 0; i < slotLength; i++) {
            for (let j = 0; j < 3; j++) { //每行執行3次(tempUp,mainSymbol,tempDown)
                for (let k = 0; k < 4; k++) { //每行執行4次<生成4個>
                    const instsymbol = this.myPool.get(this.symbolResourceTA.symbolNode);//生成symbolNode物件池內容(載入symbol預製体)
                    instsymbol.parent = this.slotRun[i].children[j]; //將生成symbol設置到為5軸滾輪子物件
                    const symID = initSymbol[i * slotLength + k]; //依序設置symbol的ID，initSymbol陣列中第5、10、15、20、25的數值不會被取用到
                    // console.log(`i:${i}，slotLength:${slotLength}，k${k}，使用陣列中第 ${i * slotLength + k} 個數值，`);
                    // console.log(`初始牌面${this.slotRun[i].name} / ${this.slotRun[i].children[j].name} / 牌種ID為${symID}`);
                    instsymbol.getComponent(symbolSetting_TA).resetSymbol(symID);//設置symbol的貼圖，抓取symbol上的腳本，執行更換Sprite的涵式
                    if (instsymbol.parent.name == 'mainSymbol') { //判斷是否在主軸面上
                        instsymbol.active = false; //先關閉待開場表演時再開啟
                    }
                }
            }
            this.slotRun[i].children[2].active = false;//隱藏下層
        }

        //配置初始UI狀態
        this.winTotalScoreInfo.active = false;//隱藏共贏得資訊
        this.freeTopBg.active = false; //隱藏免費遊戲的倍數加乘框
    }

    //-------------------按鈕事件觸發函式-------------------/
    //閃電加速開啟
    fastSlotOn() {
        this.fastMode = true;
        this.listenTime = 1.5;//聽牌時間2秒
        this.dropListenTime = 1;//下落聽牌時間
        this.btnFastOn.active = true;
        this.btnFastOff.active = false;
    }
    //閃電加速關閉
    fastSlotOff() {
        this.fastMode = false;
        this.listenTime = 2.5;//聽牌時間3秒
        this.dropListenTime = 1.5;//下落聽牌時間
        this.btnFastOn.active = false;
        this.btnFastOff.active = true;
    }
    //開始自動遊戲
    startAutoGame() {
        this.autoGameMode = true;//啟用自動模式
        this.btnAutoStop.active = true;//顯示自動停止按鈕
        this.btnSpin.active = false;//隱藏spin按鈕
        this.startGameSlotRun();//開始spin轉動
        console.log('呼叫 startGameSlotRun() 開始下局轉動，於startAutoGame()自動遊戲狀態');
        this.autoGameRound--;
        this.btnAutoStop.children[0].getChildByName('label').getComponent(Label).string = this.autoGameRound.toString();
    }
    //停止自動遊戲
    stopAutoGame() {
        this.autoGameMode = false;//關閉自動模式
        this.btnAutoStop.active = false;//隱藏自動停止按鈕
        this.btnSpin.active = true;//顯示spin按鈕
        //如果自動按鈕是啟用狀態，且spin按鈕未啟用狀態，才啟用spin按鈕
        if (this.btnAuto.interactable && !this.btnSpin.getComponent(Button).interactable){
            this.btnSpin.getComponent(Button).interactable = true;//啟用spin按鈕
        }
    }

    /* 開場表演 */
    start(){
        this.scheduleOnce(()=>{
            this.openingFx.active = true;  //顯示開場特效
            this.openingFx.getComponent(Animation).play('openingFx'); //播放開場特效
            let wiatTime = 0; //每個Symbol表演的延遲時間
            this.scheduleOnce(()=>{
                for (let i = 0; i < this.slotRun.length; i++) {
                    for (let s = 0; s < this.slotRun[i].children[1].children.length; s++) { //依序抓取主軸面上的20個symbol
                        wiatTime = wiatTime + 0.05; //每個symbol表演間隔0.05秒時間差，依序累加得出每個symbol各自要等待的時間
                        this.scheduleOnce(()=>{
                        this.slotRun[i].children[1].children[s].active = true; //開啟symbol顯示
                        this.slotRun[i].children[1].children[s].getComponent(Animation).play('symbolOpening');  //播放symbol開場動態
                        },wiatTime); //每個symbol各自要等待的時間
                    }
                }
                this.scheduleOnce(()=>{
                    this.openingFx.active = false;
                },1.5); //等待特效播完後(0.8+1.5秒)關閉特效節點
            },0.8) //等待特效播放0.8秒後啟動Symbol開場動態表演
        },0.8); //進入遊戲後等待0.8秒再啟動開局特效
    }

    /* 開始spin轉動 */
    clickSpin() {
        this.startGameSlotRun();
        console.log('呼叫 startGameSlotRun() 開始下局轉動，於clickSpin()按下Spin鍵');
    }

    /* 遊戲立即停止(按鍵觸發) */
    stopGameSlotRunNow() {
        this.btnStop.active = false;
        //隱藏聽牌物件
        for (let i = 0; i < this.slotListen.children.length; i++) {
            this.listenHide(i);//聽牌特效淡出(slotLine)
        }
        this.unscheduleAllCallbacks();//停止所有計時器
        for (let i = 0; i < this.stopSlot.length; i++) {
            //如果有未執行停止轉動的才執行停止slot
            if (!this.stopSlot[i])
                this.stopSlotRun(i);//停止slot轉動(排除已停止的slot)
        }
    }
    //-------------------按鈕事件觸發-------------------/

    //-------------------主要slot流程-----------------------/
    /* 開始遊戲slot轉動 */
    startGameSlotRun() {
        this.clearSlot(); //呼叫清空盤面
        this.scheduleOnce(() => { //等待清空盤面結束，測試中功能
            this.gameRound++;//表演回合+1
            console.warn(`執行startGameSlotRun() 第 ${this.gameRound} 回合表演開始`);
            this.scatterSym = []; //scatter記錄數量歸零，原無此行，自行添加
            console.log('現有scatter數量歸零 '+ this.scatterSym.length);
            this.resetWinTotalScore();  //總贏分歸零
            if (this.gameRound > this.demoInfoTA.demoRound - 1)  //demoRound->要Demo的總局數
                this.gameRound = 0;//演示回合0
            for (let i = 0; i < this.stopSlot.length; i++) {
                this.stopSlot[i] = false; //stopSlot陣列的5個布林值都改為false
            }
            this.btnStop.active = true;//顯示停止按鈕
            this.btnSetting.interactable = false;//禁用設置按鈕
            this.btnAuto.interactable = false;//禁用自動按鈕
            this.betAdd.interactable = false;//禁用下注加分按鈕
            this.betLess.interactable = false;//禁用下注減分按鈕
            this.winTotalScoreInfo.active = false;//隱藏共贏得資訊
            this.winScoreInfo.active = false;//隱藏贏得資訊
            this.btnSpin.getComponent(Animation).getState('btnSpinRotate').speed = 4;//加速旋轉
            this.btnSpin.getChildByName('loopFx').active = true;//顯示旋轉狀態
            this.resetMultiple();  //重置連贏倍率

            //執行slot轉動
            if (this.fastMode) {
                //起始同時轉動
                for (let i = 0; i < this.slotRun.length; i++) {
                    this.startSlotRun(i);
                }
                //等待轉動時間結束
                this.scheduleOnce(() => {
                    this.waitGameStopSlot(0, 0.01);//等待遊戲依序停止(哪行slot,等待停止時間)
                }, this.fastStopTime)
            } else {
                //起始依序轉動
                let i = 0;
                this.schedule(() => {
                    this.startSlotRun(i);  //測試中功能，原為this.startSlotRun(i)
                    i++;
                }, this.scheduleStartTime, this.slotRun.length - 1, 0.01)
                //等待轉動時間結束
                this.scheduleOnce(() => {
                    this.waitGameStopSlot(0, this.scheduleStopTime);//等待遊戲依序停止(哪行slot,等待停止時間)
                }, this.stopTime) //試試測試秒數2
            }

        },0.5) //等待清空盤面結束
    }

    /* 清空盤面 */
    clearSlot(){
        console.warn('執行clearSlot() 清空盤面');
        for (let i = 0; i < this.slotRun.length; i++) {
            const slotRunLine = this.slotRun[i].children[1];
            const slotRunLineHeight = slotRunLine.getComponent(UITransform).height; //行高
            const downPos = new Vec3(slotRunLine.position.x, -slotRunLineHeight, 0); //移到下方位置
                tween(slotRunLine).to(0.3, { position: downPos }, { easing: "circIn" })
                .call(() => {
                    slotRunLine.active = false; //關閉主盤面(mainSymbol)
                    slotRunLine.position = new Vec3(slotRunLine.position.x, 0, 0); //主盤面回到清空前位置
                })
                .start();
        }
    }


    /* 等待遊戲依序停止(哪行slot,等待停止時間) */
    waitGameStopSlot(slotLine: number, time: number) {
        //如果此行聽牌狀態未顯示，正常停止此行slot
        if (!this.slotListen.children[slotLine].active)
            this.stopSlotRun(slotLine);
        if (slotLine === this.slotRun.length - 1)
            return;//最後一行不執行聽牌判斷
        this.scatterSave(slotLine);//紀錄中獎scatter
        let readyTime = 0;//等待聽牌時間
        /* scatter數量>=2時啟動聽牌 */
        if (this.scatterSym.length >= 2) {
            readyTime = this.listenTime;
            this.scheduleOnce(() => {
                this.creatScatter();//生成scatter聽牌物件
                this.listenLoopSlot(slotLine + 1);//執行減速聽牌(哪行slot)
            }, this.slotRunSpeed)
        }
        this.scheduleOnce(() => {
            slotLine++;//執行下一行slot
            this.waitGameStopSlot(slotLine, time);//再次執行遊戲依序停止(下行slot)
        }, time + readyTime)
    }

    /* 開始轉動slot(哪行slot) */
    startSlotRun(slotLine: number) {
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        slotRunLine.children[2].active = true;//顯示下層
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height; //行高
        const downPos = new Vec3(slotRunLine.position.x, -slotRunLineHeight, 0); //移到下方位置
        this.scheduleOnce(()=>{
            this.PokerShoe.children[slotLine].getComponent(sp.Skeleton).setAnimation(0, 'deal4', false); //播放牌靴發牌動態(4張)
        },0.1) //等待清空盤面時隱藏的主軸面(mainSymbol)落完，上方軸面(tempUp)開始落下再啟動發牌動態
        tween(slotRunLine).to(this.slotRunSpeed, { position: downPos }, { easing: "cubicIn" })
            .call(() => {
                slotRunLine.children[1].active = true; //顯示清空軸面時隱藏的主軸面
                this.loopSlotRun(slotLine);//執行循環轉動
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < slotRunLine.children[i].children.length; j++) {
                        slotRunLine.children[i].children[j].getComponent(symbolSetting_TA).blurShow();//顯示模糊漸變
                    }
                }
            })
            .tag(slotLine).start();
    }

    //循環轉動slot(哪行slot)
    loopSlotRun(slotLine: number) {
        //設置隨機上中下的數值(先預設固定值)
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(slotRunLine.position.x, slotRunLineHeight, 0);//移到上方位置
        const downPos = new Vec3(slotRunLine.position.x, -slotRunLineHeight, 0);//移到下方位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        //檢查如果symbol節點有隱藏的，需重新顯示(因為此遊戲會有空牌狀態)
        for (let i = 0; i < symbolAmount; i++) {
            if (!slotRunLine.children[1].children[i].active)
                slotRunLine.children[1].children[i].active = true;
        }
        this.setSymbolImage(slotRunLine.children[1], this.randomSymbolNum(symbolAmount));//設置正symbol圖案(隨機)
        slotRunLine.position = upPos;//每次循環時會回到上面
        let changeSymbol = true;//等待上下換圖
        tween(slotRunLine).to(this.slotRunSpeed, { position: downPos }, {
            onUpdate: () => {
                //轉到一半時，設置上下symbol圖案一致(隨機)
                if (slotRunLine.position.y < 0 && changeSymbol) {
                    changeSymbol = false;
                    const randomData = this.randomSymbolNum(symbolAmount);
                    this.setSymbolImage(slotRunLine.children[0], randomData);//設置上symbol圖案(隨機一致)
                    this.setSymbolImage(slotRunLine.children[2], randomData);//設置下symbol圖案(隨機一致)
                }
            }
        }).call(() => {
            this.loopSlotRun(slotLine);//持續轉動
        }).tag(slotLine).start();
    }

    //* 停止轉動slot(哪行slot)，設置牌面結果 *//
    stopSlotRun(slotLine: number) {
        Tween.stopAllByTag(slotLine);//停止一般loop輪盤轉動
        this.stopSlot[slotLine] = true;//設定該行已執行停止轉動
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const xPos = slotRunLine.position.x;
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(xPos, slotRunLineHeight, 0);//移到上方位置
        const endingPos = new Vec3(xPos, -30, 0); //移到停止超出位置
        const endPos = new Vec3(xPos, 0, 0); //移到停止位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0]; //設置本回合各slot的symbol停止編號
        // console.log(`停止轉動slot，設置第${this.gameRound}回合，第0個個盤面結果${slotSymbolNumber}`);
        const symbolNumber = slotSymbolNumber.slice(symbolAmount * slotLine, symbolAmount * (slotLine + 1)); //該行的symbol停止編號
        // console.log('停止編號：開始索引 '+symbolAmount * slotLine+'，結束索引 '+symbolAmount * (slotLine + 1));
        this.setSymbolImage(slotRunLine.children[1], symbolNumber); //設置Spin中的symbol盤面圖案(結果)
        // console.log(`第${slotLine}行Slot，原本位置${this.slotRun[slotLine].position}`);
        slotRunLine.position = upPos; //slot回歸到上方<tempUp滾輪>位置
        // console.log(`第${slotLine}行Slot，回歸到上方位置${this.slotRun[slotLine].position}`);
        this.blurSFReset(slotRunLine);//將模糊貼圖更換為正常貼圖
        tween(slotRunLine).to(this.slotRunSpeed - 0.1, { position: endPos }, { easing: 'elasticOut' })  //原設定 { position: endingPos }, { easing: 'cubicOut' }
            // .call(() => {  //播放回彈音效   })
            // .then(tween(slotRunLine).to(0.1, { position: endPos }))    //原程式碼為二段緩動作出回彈動態，改為一段使用回彈線型
            .call(() => {
                //此處播放回彈音效
                this.endSlot(slotLine); //結束slot轉動時執行(哪行slot)
        }).start();
    }

    //scatter節點紀錄(哪行slot)
    scatterSave(slotLine: number) {
        const mainSlotRun = this.slotRun[slotLine].children[1];  //抓取slotRun下的mainSymbol節點
        //每行第一個資料不判斷
        for (let i = 1; i < mainSlotRun.children.length; i++) {
            if (mainSlotRun.children[i].getComponent(symbolSetting_TA).symID === 10){  //依序判斷該行哪個symbol為scatter
                this.scatterSym.push(mainSlotRun.children[i]);//儲存scatter節點至scatterSym陣列
                // console.warn('scatter數量+1，記錄scatter數：'+ this.scatterSym.length);
            }
        }
    }

    //生成scatter聽牌物件
    creatScatter() {
        for (let i = 0; i < this.scatterSym.length; i++) {
            //生成過的話就不生成(子物件數量跟生成數量相比)
            if (this.symbolWinLayer.children.length < i + 1) {
                const instScatter = this.myPool.get(this.symbolResourceTA.symbolWin);//生成中獎symbol物件池內容
                instScatter.parent = this.symbolWinLayer;//設置父節點
                instScatter.getComponent(symbolWin_TA).setSymbolWinData(10, true, this.scatterSym[i]);//設置symbolWin編號(symID，聽牌狀態，輪軸的symbol節點)
                console.log('生成scatter聽牌物件'+ this.symbolWinLayer.children.length +'應生成scatter數：'+ this.scatterSym.length);
            }
        }
    }

    //聽牌特效淡入顯示(哪行slot)
    listenShow(slotLine: number, hideTime: number) {
        const slotListen = this.slotListen.children[slotLine];
        slotListen.getComponent(UIOpacity).opacity = 0;
        slotListen.active = true;//顯示第N行聽牌特效
        tween(slotListen.getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();//淡入
        this.scheduleOnce(() => {
            this.listenHide(slotLine);//隱藏聽牌
        }, hideTime)
    }

    //聽牌特效淡出(哪行slot)
    listenHide(slotLine: number) {
        const slotListen = this.slotListen.children[slotLine];
        tween(slotListen.getComponent(UIOpacity)).to(0.2, { opacity: 0 }).call(() => {
            slotListen.active = false;//隱藏聽牌特效
        }).start();//淡出
    }

    //執行聽牌loop依序減速並停止轉動(哪行slot)
    listenLoopSlot(slotLine: number) {
        Tween.stopAllByTag(slotLine);//停止一般loop輪盤轉動
        this.listenShow(slotLine, this.listenTime);//聽牌特效淡入顯示(slotLine)
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const time = [0.1, 0.13, 0.16, 0.19];//loop依序減速的時間百分比(2段時間一組)
        let timeStep = 0;//陣列時間段
        const xPos = slotRunLine.position.x;
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(xPos, slotRunLineHeight, 0);//移到上方位置
        const downPos = new Vec3(xPos, -slotRunLineHeight, 0);//移到下方位置
        const endingPos = new Vec3(xPos, -30, 0);//移到停止超出位置
        const endPos = new Vec3(xPos, 0, 0);//移到停止位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        const slowSlot = () => {
            this.setSymbolImage(slotRunLine.children[1], this.randomSymbolNum(symbolAmount));//設置正symbol圖案(隨機)
            slotRunLine.position = upPos;//每次循環時會回到上面
            tween(slotRunLine).to(this.listenTime * time[timeStep], { position: endPos })
                .call(() => {
                    timeStep++;//表演時間段+1
                    const randomData = this.randomSymbolNum(symbolAmount);
                    this.setSymbolImage(slotRunLine.children[0], randomData);//設置上symbol圖案(隨機一致)
                    this.setSymbolImage(slotRunLine.children[2], randomData);//設置下symbol圖案(隨機一致)
                    tween(slotRunLine).to(this.listenTime * time[timeStep], { position: downPos })
                        .call(() => {
                            timeStep++;//表演時間段+1
                            if (timeStep < time.length)
                                slowSlot.bind(this)();//再次轉動
                            else {
                                //執行減速停止轉動
                                const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0];//設置本回合各slot的symbol停止編號
                                const symbolNumber = slotSymbolNumber.slice(symbolAmount * slotLine, symbolAmount * (slotLine + 1));//該行的symbol停止編號
                                this.setSymbolImage(slotRunLine.children[1], symbolNumber);//設置正symbol圖案(結果)
                                slotRunLine.position = upPos;//slot回歸到上面
                                this.blurSFReset(slotRunLine);//轉換為正常貼圖
                                tween(slotRunLine).to(this.listenTime * 0.36, { position: endingPos }, { easing: 'sineOut' }).then
                                    (tween(slotRunLine).to(this.listenTime * 0.06, { position: endPos }))
                                    .call(() => {
                                        this.stopSlot[slotLine] = true;//設定該行已執行停止轉動
                                        this.endSlot(slotLine);//結束slot轉動時執行(哪行slot)
                                    }).tag(slotLine).start();
                            }
                        }).tag(slotLine).start();
                }).tag(slotLine).start();
        }
        slowSlot.bind(this)();
    }

    //結束slot(指定哪行slot)
    endSlot(slotLine: number) {
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        slotRunLine.children[2].active = false;//隱藏下層
        this.listenHide(slotLine);//聽牌特效淡出(slotLine)
        const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0];//設置本回合symbol停止編號  //E獲取本回合的第一個牌面結果
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量(4個)
        //判斷此行的symbol是否有需要提前出現的動態
        for (let i = 0; i < symbolAmount; i++) {
            if (slotSymbolNumber[symbolAmount * slotLine + i] === 10) { //依序判斷20個牌面ID哪個是scatter
                slotRunLine.children[1].children[i].getComponent(symbolSetting_TA).scatterStay();//如果是scatter編號，播放停留<show>動畫
                // console.warn(`第${slotLine}行滾輪，第${i}個符號，`+'呼叫scatterStay() 播放<Stay>動畫，於endSlot()執行中');
            }else if(slotSymbolNumber[symbolAmount * slotLine + i] <= 7){
                slotRunLine.children[1].children[i].getComponent(symbolSetting_TA).showGoldSymbolRay();//判斷是0~7金卡編號，播放掃光動畫
                // console.warn(`第${slotLine}行滾輪，第${i}個符號，`+'呼叫showGoldSymbolRay() 播放掃光動畫');
            }
        }
        //如果是最後一段停止，執行結果判斷
        if (slotLine === this.slotRun.length - 1){
            this.resultGameSpin();//遊戲spin結果判斷
        }
    }

    //遊戲spin結果判斷
    resultGameSpin() {
        this.btnSpin.getComponent(Animation).getState('btnSpinRotate').speed = 1;//旋轉速度回歸
        this.btnSpin.getComponent(Button).interactable = false;//禁用spin按鈕
        this.unscheduleAllCallbacks();//停止所有計時器
        this.btnStop.active = false;//隱藏停止按鈕
        //如果最後一行聽牌結束沒有蒐集到3個free，要清除表演動態，並回歸靜態節點顯示
        this.putSymbolWinLayer();//退還所有勝利表演pool物件
        console.log('呼叫putSymbolWinLayer() 中獎牌返還物件池，當前resultGameSpin()');
        // for (const data of this.scatterSym) {
        //     data.active = true;
        //     data.getComponent(symbolSetting_TA).scatterShow();//播放出現動態
        //     console.warn('呼叫scatterShow() 切換為scatter出現動態，於resultGameSpin()執行中');
        // }
        if (this.autoGameRound === 0 && this.autoGameMode)
            this.stopAutoGame();//停止自動遊戲
        const symData = this.demoInfoTA.symData[this.gameRound];//該回合sym資料
        const lineAward = symData.lineAward;//中獎連線資料
        //判斷有沒有中獎
        if (lineAward.length > 0) {  //如果demoInfo_TA腳本中對應的中獎牌組不是空
            let step = 0;//紀錄要表演的中獎次數
            //中獎牌組表演
            const lineAwardShow = () => {
                this.hideSlot = [0, 0, 0, 0, 0];//清空空缺處數量紀錄
                const slotNumber = symData.slotNumber[step];//本回合slot編號
                console.log(`spin結果判斷，穫取第${step}個盤面結果 ${slotNumber}`);
                //檢查本回合牌型是否有Scatter，若無將Scatter記數歸零，Evan加入
                for (let i = 0; i < slotNumber.length; i++) {
                    const _symID = slotNumber[i];
                    if (_symID==10) {
                        break;
                    }else{
                        this.scatterSym = []; //scatter記錄數量歸零
                        console.log('現有scatter數量歸零 '+ this.scatterSym.length);
                    }
                }
                const typeAward = lineAward[step].typeAward;//中獎線牌型表演資料
                for (let i = 0; i < typeAward.length; i++) {
                    console.log(`獲取第${step}組中獎牌組lineAward，的中獎牌型資料 `+typeAward[i]);
                }

                let typeRound = 0;//該次中獎的牌型表演回合，每次連線可能包含1種以上的獎項(free、花牌、槓、碰、眼睛等等)，需依序表演
                let updataAll = false; //補牌時判斷下回是否要全刷掉再補牌
                //中獎牌組的牌型表演(一中獎牌組可能有多個中獎牌型，如槓、碰)
                const typeAwardShow = () => {
                    this.slotBlackShow();//顯示遮黑層
                    console.log('呼叫slotBlackShow() Slot壓黑');
                    this.putSymbolWinLayer();//退還所有勝利表演pool物件
                    console.log('呼叫putSymbolWinLayer() 中獎牌返還物件池544');
                    //生成並表演symbol中獎
                    for (let i = 0; i < typeAward[typeRound].symPos.length; i++) {  //從有幾組位置ID判斷此獎有幾個牌組，typeAward：連線的獎項名稱&牌種&位置
                        for (let j = 0; j < typeAward[typeRound].symPos[i].length; j++) { //從有幾個位置ID判斷中獎牌組張數，"碰"可能同時有多組，會有多組位置ID
                            const pos = typeAward[typeRound].symPos[i][j];//獲取第i組位置的第j個位置ID，中獎符號位置ID(0~19)
                            const instSymbolAnim = this.myPool.get(this.symbolResourceTA.symbolWin);//生成中獎symbol物件池內容
                            instSymbolAnim.parent = this.symbolWinLayer;//設置父節點
                            const winSymbol = this.slotRun[Math.floor(pos / 4)].children[1].children[pos % 4];//抓取中獎的symbol節點，由位置ID算出行數及子物件排序[位置ID/4向下取整數得出Slot行數]
                            // console.warn('scatter數量+1，現有scatter數：'+ this.scatterSym.length);
                            instSymbolAnim.getComponent(symbolWin_TA).setSymbolWinData(slotNumber[pos], false, winSymbol);//執行表演(symID，聽牌狀態，在滾輪上滾動的symbol預製物節點)
                            // console.log('中獎symbolID：'+ slotNumber[pos]+ '，位置ID：' + pos );
                            if (slotNumber[pos] == 10) {
                                instSymbolAnim.parent = this.symbolFxLayer;//判斷是Scatter符號，改設定父節點
                            }
                            if (slotNumber[pos]<=7) { //判斷是否為金卡
                                instSymbolAnim.parent = this.symbolGwinLayer;//symbolID 7之前為金卡，父物件改為symbolGWinLayer
                                this.goldSym.push(winSymbol); //儲存滾輪上的金卡symbol節點至goldSym陣列
                                console.warn('已儲存的金卡symbol節點數量：'+ this.goldSym.length);
                            }
                        }
                    }
                    const typeName = typeAward[typeRound].name;//贏得的牌型名稱
                    const typeSymID = typeAward[typeRound].symID;//贏得的牌型symbol編號資料
                    const typeSymPos = typeAward[typeRound].symPos;//贏得的牌型symbol位置資料
                    const ws1 = this.demoInfoTA.symData[this.gameRound].ws1;//共贏分
                    const ws1Length = this.demoInfoTA.symData[this.gameRound].ws1.length; //共有幾筆得分資訊
                    if (typeName != 'free') {  //判斷不是獲得免費遊戲才顯示分數及累加連贏次數
                        console.log('輸入得分 '+ ws1[step]+'，回合數 '+ this.gameRound+'，第幾盤面 '+step);
                        let _scoreBg = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 2,}  //贏得分數次數對應得分框ID，((因不知得分倍數因此作假表演))
                        let _showFx = false; //是否開啟噴金幣特效
                        if (step > 2 && step == ws1Length-1) {
                            _showFx = true; //如果不是第1~3回合，並且是得分回合的最後一筆，開啟噴金幣特效，((因不知得分倍數因此作假表演))
                        }
                        this.showWinScore(ws1[step],_scoreBg[step],_showFx); //顯示贏得分數
                        let _comboNum =  this.comboNum;
                        if (typeName !== 'free') {
                            _comboNum =  ++this.comboNum; //不是免費遊戲就累加COMBO數值
                        }
                        this.showCombo(_comboNum); //顯示連贏次數
                        console.log('呼叫showCombo()顯示連贏次數 '+_comboNum);
                        this.ChangeMultiple(_comboNum); //切換連贏倍率
                        console.log('呼叫ChangeMultiple()切換連贏倍率 '+_comboNum);
                    }
                    //顯示牌型動態(眼睛牌型除外)
                    let waitMoveTime = 0.5;    //中獎牌連線表演結束，等待開始表演勝利牌移到置牌區的時間，原數值1
                    if (typeName !== 'eye'){
                        if (typeName === 'free') {  //獲得免費遊戲表演
                            waitMoveTime = 3;//免費遊戲獲得表演等待秒數
                            //等待一秒(free牌表演)
                            this.scheduleOnce(() => {
                                this.scheduleOnce(() => {
                                    this.freeGameReady = true; //準備進入免費遊戲(已符合進入免費遊戲條件)
                                }, 2.2) //等加局畫面撥放到適當時間點嗎？
                                this.scatterSym = [];//清空scatter節點紀錄資料(全刷掉才要清空)
                                for (let data of this.symbolWinLayer.children) {
                                    data.getComponent(symbolWin_TA).scatterRemove();//表演scatter牌消除
                                }
                                this.freeGameAddition.active = true;//顯示免費遊戲加局訊息
                                console.warn('顯示獲得免費遊戲次數');
                                if (this.freeGameMode) {  //判斷是否正在免費遊戲模式中
                                    console.log('freeGameAddition 顯示再次獲得免費遊戲+次數');
                                    //顯示再次獲得
                                    this.scheduleOnce(() => {
                                        //等待指向線特效出現，表演加局
                                        const timesLabel = this.freeGameTimes.getChildByName('tx_times').getChildByName('label');
                                        timesLabel.getComponent(Animation).play();//播放縮放動態
                                        timesLabel.getComponent(Label).string = (Number(timesLabel.getComponent(Label).string) + 3).toString();//剩餘次數+3局
                                    }, 2.2) //等加局畫面撥放到適當時間點嗎？
                                }
                            }, 1)
                        }
                        else {
                            if (typeName != 'free')
                                this.slotGameUI.getComponent(Animation).play('shark');//播放震動
                        }
                        //等待牌型表演結束後，勝利牌移到置牌區
                        this.scheduleOnce(() => {
                            console.log('勝利牌移到置牌區');
                            this.scheduleOnce(() => {
                                this.slotBlackHide();//隱藏遮黑層
                            }, 1.5) //等待0.8秒再隱藏遮黑層，讓遮黑層顯示久一點
                            typeRound++;//牌型表演+1
                            //1秒後，判斷牌型表演結束
                            this.scheduleOnce(() => {
                                //如果牌型表演結束
                                if (typeRound === typeAward.length) {
                                    this.putSymbolWinLayer();//退還所有勝利表演pool物件
                                    console.log('呼叫putSymbolWinLayer() 中獎牌返還物件池，當前為牌型表演結束');
                                    step++;//連線表演次數+1
                                    const nextSlotNumber = symData.slotNumber[step]; //取得下回合盤面結果
                                    let waitWildTime = 0;  //設定等待Wild表演結束的時間，預設0不等待
                                    /* 判斷中獎牌組中是否有金卡 */
                                    if (this.symbolGwinLayer.children.length>0) {
                                        let redWildPosID = [];
                                        let wildType = '';
                                        for (let i = 0; i < nextSlotNumber.length; i++) {
                                            if (nextSlotNumber[i]== 8) {
                                                waitWildTime = 0.5;  //設定等待綠Wild表演結束的時間
                                                wildType = 'green';
                                                break; //抓到一個符號ID8即跳出
                                            }else if(nextSlotNumber[i]== 9){ //目前只能有一張金卡變成紅Wild，否則會出現bug
                                                redWildPosID.push(i); //從下回合盤面結果找出紅Wild位置ID
                                                waitWildTime = 3;  //設定等待紅Wild表演結束的時間
                                                wildType = 'red';
                                            }
                                        }
                                        this.showWild(wildType,redWildPosID);  //呼叫Wild表演(Wild類型,輸入位置ID對應的座標值)
                                        console.log(`呼叫showWild() 執行${wildType}Wild表演`+`記錄紅Wild座標ID ${redWildPosID.length}個 `+ redWildPosID);
                                    }
                                    this.scheduleOnce(() => {
                                        // console.warn('nextSlotNumber數組長度 '+nextSlotNumber.length+'，第1筆資料 '+nextSlotNumber[0]+'，最後筆資料 '+ nextSlotNumber[nextSlotNumber.length-1]);
                                        /* 無symbol表演資料，直接結算 */
                                        if (!nextSlotNumber) {
                                            this.resultGame(); //呼叫回合結算
                                            console.log('呼叫resultGame() Spin結果表演結束，呼叫回合結算');
                                            return;
                                        }
                                        let waitReadyTime = 0.5; //移除中獎牌組，等待補牌掉落的時間，原數值0
                                        this.scheduleOnce(() => {
                                            this.updataSlot(nextSlotNumber, updataAll, () => {
                                                console.log('呼叫updataSlot() 更新盤面，是否全更新 '+ updataAll+ '，step '+step);
                                                //執行symbol掉落補牌(是否全刷掉)
                                                this.dropSymbol(() => {
                                                    console.log('呼叫dropSymbol() 掉落補牌');
                                                    //掉落完畢後判斷，無中獎資料，直接結算
                                                    if (!lineAward[step]) { //檢查-如果中獎牌組陣列ID是空資料，代表中獎牌組已表演完
                                                        this.resultGame();//執行結算
                                                        console.log('呼叫resultGame() 執行結算');
                                                        return;
                                                    }
                                                    else{ //判斷中獎牌組陣列ID不是空資料，再次判斷中獎表演
                                                        lineAwardShow.bind(this)();//迴圈，再次執行中獎牌組表演
                                                    }
                                                });
                                            })
                                        }, waitReadyTime)  //waitReadyTime 移除中獎牌組，等待補牌掉落的時間
                                    }, waitWildTime)  //等待Wild表演結束的時間，如果沒有Wild表演，就會讀取預設值0

                                } else{
                                    typeAwardShow.bind(this)();//迴圈，再次執行中獎牌型表演(free,wild)
                                }
                            }, 1)  //原等待秒數數值1
                        }, waitMoveTime)  //waitMoveTime 等待開始表演勝利牌移到置牌區的時間
                    }
                }
                typeAwardShow.bind(this)();//迴圈，再次執行中獎牌型表演(free,wild)
            }
            lineAwardShow.bind(this)();//迴圈，再次執行中獎牌組表演
        } else
            this.scheduleOnce(() => {
                console.log('呼叫scatterWinTest() spin結果運行結束，判斷是否進入免費模式');
                this.scatterWinTest();//判斷是否進入免費模式
            }, 0) //原0.3
    }

    /* 更新下一個盤面配置 (下一個slot盤面編號, 是否全刷掉, 完成時執行功能) */
    updataSlot(slotNumber: number[], updataAll: boolean, callback: any) {
        if (updataAll) {
            console.log('執行updataSlot() 更新"全"盤面');
            //更新下一個盤面配置_全刷掉(下一個slot盤面編號)
            this.hideSlot = [4, 4, 4, 4, 4];//全空
            const slotLength = this.slotRun.length;//slot行數
            let i = 0;
            this.schedule(() => {
                const mainSlotLine = this.slotRun[i].children[1];
                const symbolAmount = mainSlotLine.children.length;//該行symbol數量
                for (let j = 0; j < symbolAmount; j++) {
                    const moveSymbol = mainSlotLine.children[j];
                    const movePos = moveSymbol.position.y - 1590;
                    const pos = i * symbolAmount + j; //獲得取用(25)盤面符號的陣列索引
                    tween(moveSymbol).to(0.3, { position: new Vec3(0, movePos, 0) }, { easing: 'cubicIn' }).call(() => {
                        moveSymbol.position = new Vec3(0, 2470 - moveSymbol.getSiblingIndex() * this.symbolHeight, 0);
                        moveSymbol.active = true;//顯示symbol
                        moveSymbol.getComponent(symbolSetting_TA).setSymbolData(slotNumber[pos]);//設置下局的symbol(不更新位置)
                    }).start();
                }
                i++;
                if (i === slotLength) {
                    this.scheduleOnce(() => {
                        callback();
                    }, 0.3)
                }
            }, 0.05, slotLength - 1, 0.01)
        } else {
            console.log('執行updataSlot() 更新"局部"盤面');
            //更新下一個盤面配置_紀錄缺口(下一個slot盤面編號)
            for (let i = 0; i < this.slotRun.length; i++) {
                const slotSymbol = this.slotRun[i].children[1];  //獲取每一軸的mainSymbol節點
                let moveNum = 0;//消除移動的數量
                let saveSymbol = [];//先紀錄symbol排序，因為設置siblingIndex後排序可能會抓錯
                for (const data of slotSymbol.children) { //slotSymbol.children：將mainSymbol之下的每個symbol加到saveSymbol陣列中
                    saveSymbol.push(data);
                }

                /* 再執行symbol圖案設置 */
                const symbolAmount = slotSymbol.children.length;//該行滾輪symbol數量
                for (let j = 0; j < symbolAmount; j++) {
                    const symID = slotNumber[symbolAmount * i + j]
                    slotSymbol.children[j].getComponent(symbolSetting_TA).setSymbolData(symID);//設置下局的symbol(不更新位置)
                    // console.log(`設置下局的symbol圖案，第${i}行/第${j}個symbol貼圖 `+slotSymbol.children[j].getChildByName('main').getChildByName('symbol').getComponent(Sprite).spriteFrame.name);
                }

                //從下方開始判斷(最後一個子物件)
                for (let j = saveSymbol.length - 1; j >= 0; j--) {
                    const symNode = saveSymbol[j];
                    const symNodeTexture = symNode.getChildByName('main').getChildByName('symbol').getComponent(Sprite).spriteFrame.name; //抓取symbol的貼圖名稱

                    if (!symNode.active ) { //判斷mainSymbol之下的symbol，如果是隱藏狀態才執行
                        this.hideSlot[i]++;//該行空缺數+1
                        moveNum++;//需上移位置，預備落下補牌的數量+1
                        // symNode.setSiblingIndex(0);   //如果該節點隱藏，排序就要移到最上層→→→→→因過後面濾掉Wild，這行code會造成Symbol掉落排序錯誤
                        //→→→→→註解掉還產生一個想要的結果，非補牌Symbol保持在原位置，只有補牌掉落。判斷是因為排序不正確會造成dropSymbol()推斷該Symbol應到達的定位不正確
                        if (symNodeTexture != 'sym_g9'&& symNodeTexture != 'sym_g10') {  //如果不是Wild才執行，原無，自行添加
                            symNode.position.add(new Vec3(0, this.symbolHeight * (moveNum + j), 0));//設置上移後Y參數
                            symNode.active = true;
                            // console.log('執行上移symbol貼圖名稱 '+ symNodeTexture +'，座標 '+ symNode.position );
                        }
                        else if(symNodeTexture == 'sym_g9'){
                            symNode.active = false;  //如果是綠Wild先關閉，dropSymbol()執行落下表演涵式時再開啟
                        }
                        else if(symNodeTexture == 'sym_g10'){
                            symNode.active = true;   //如果是紅Wild就跟其他符號一樣直接開啟
                        }

                    }
                }

            }
            callback();
        }
    }

    /* 執行補牌下落表演(是否是全掉落，callback) */
    dropSymbol(callback: any) {
        console.log('執行dropSymbol() 掉落補牌');
        const slotLength = this.slotRun.length;//slot行數
        const drop = (slotLine: number) => {
            if (slotLine === slotLength) {
                //等待掉落完啟動Scatter動態
                this.scheduleOnce(() => {
                    if (this.scatterSym.length < 3) {
                        console.log('現有scatter符號數 '+this.scatterSym.length);
                        this.putSymbolWinLayer(); //退還所有勝利表演pool物件
                        console.log('呼叫putSymbolWinLayer() 中獎牌返還物件池，於dropSymbol()中執行');
                        for (const data of this.scatterSym) {
                            data.active = true;
                            console.warn('呼叫scatterStay() 切換為scatter停留動態，於dropSymbol()中執行');
                            data.getComponent(symbolSetting_TA).scatterStay();//播放停留動態
                        }
                    }
                    callback();//回傳掉落完畢
                }, 0.9);
            }
            else {
                //執行補牌掉落表演
                const slotSymbol = this.slotRun[slotLine].children[1].children;  //獲取每一軸mainSymbol之下的Symbol節點
                for (const moveSymbol of slotSymbol) {
                    const setPos = new Vec3(0, 910 - (this.symbolHeight * moveSymbol.getSiblingIndex()), 0); //設置symbol要到達的定位，每行由上算起的第一個symbol座標<Y原設1170>-(symbol高度X子物件排序ID)
                    const yPos = moveSymbol.position.y;
                    //判斷是否執行掉落
                    if (yPos > setPos.y) {
                        this.PokerShoe.children[slotLine].getComponent(sp.Skeleton).setAnimation(0, 'deal1', false); //播放牌靴發牌動態(1張)
                        const time = 0.45 + 0.05 * (yPos - setPos.y) / this.symbolHeight;//基礎下落時間0.35+0.05*相差高度/基本高度
                        const delayTime = 0.05 * (slotSymbol.length - moveSymbol.getSiblingIndex() - 1);//根據排序來決定延遲執行掉落時間
                        tween(moveSymbol).delay(delayTime).to(time - 0.2, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' })
                            .then(tween(moveSymbol).to(0.065, { position: new Vec3(0, setPos.y + 30, 0) }, { easing: 'cubicOut' }))
                            .then(tween(moveSymbol).to(0.065, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' }))
                            .then(tween(moveSymbol).to(0.035, { position: new Vec3(0, setPos.y + 10, 0) }, { easing: 'cubicOut' }))
                            .then(tween(moveSymbol).to(0.035, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' }))
                            .start();
                    } else
                        moveSymbol.position = setPos;//設置位置

                }

                // for (const moveSymbol of slotSymbol) {  //在原位的Scatter會播放'show'動作，掉落的反而沒播放
                //     const symNodeTexture = moveSymbol.getChildByName('main').getChildByName('symbol').getComponent(Sprite).spriteFrame.name; //抓取symbol的貼圖名稱
                //     if (symNodeTexture == 'sym_g11') {
                //         moveSymbol.getComponent(symbolSetting_TA).scatterShow(); //如果掉落的是Scatter，播放'show'動作
                //         console.warn('呼叫scatterShow() 切換為scatter出現動態，於dropSymbol()掉落後');
                //     }
                // }

                /* 待翻牌表演完開啟顯示綠Wild(之前updataSlot()盤面配置時關閉的綠Wild)  */
                this.scheduleOnce(()=>{
                    for (const moveSymbol of slotSymbol) {
                        const symNodeTexture = moveSymbol.getChildByName('main').getChildByName('symbol').getComponent(Sprite).spriteFrame.name; //抓取symbol的貼圖名稱
                        if (symNodeTexture == 'sym_g9') {
                            moveSymbol.active = true;
                        }
                    }
                },0.3)

                this.scatterSave(slotLine);//紀錄中獎scatter
                slotLine++;
                if ((this.scatterSym.length >= 2) && slotLine < slotLength && this.hideSlot[slotLine] > 0) { //判斷scatter數量大於2.....
                    this.scheduleOnce(() => {
                        this.listenShow(slotLine, this.dropListenTime);//顯示第n行聽牌
                        if (this.scatterSym.length >= 2)
                            this.creatScatter();//生成scatter聽牌物件
                    }, 0.7)

                    /* 等待掉落聽牌時間 */
                    this.scheduleOnce(() => {
                        drop.bind(this)(slotLine);//判斷下一行
                    }, this.dropListenTime)
                } else {
                    this.scheduleOnce(() => {
                        drop.bind(this)(slotLine);//判斷下一行
                    }, this.scheduleStartTime)
                }
            }
        }
        //判斷聽牌以及該行是否有空缺
        if ((this.scatterSym.length >= 2) && this.hideSlot[0] > 0) {
            console.log('if-判斷聽牌以及該行是否有空缺');
            // this.scheduleOnce(() => {
            this.listenShow(0, this.dropListenTime);//顯示第一行聽牌
            if (this.scatterSym.length >= 2) {
                this.creatScatter();//生成scatter聽牌物件
            }
            // }, 0.7)
            this.scheduleOnce(() => {
                drop.bind(this)(0);//第一行開始執行掉落
            }, this.dropListenTime - 0.7)
        } else
            drop.bind(this)(0);//第一行開始執行掉落
    }

    //結算此回合
    resultGame() {
            console.log('執行resultGame() 結算此回合');
            this.putSymbolWinLayer();//退還所有勝利表演pool物件
            console.log('呼叫putSymbolWinLayer() 結算此回合，中獎牌返還物件池');
            for (const data of this.scatterSym) {
                console.log('現有scatter符號數 '+this.scatterSym.length);
                data.active = true;
                console.warn('呼叫scatterStay() 切換為scatter停留動態，於resultGame()執行中');
                data.getComponent(symbolSetting_TA).scatterStay();//播放停留動態
            }
            this.scatterSym = [];
            const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
            this.showWinTotalScore(ws); //顯示總得分
            this.scatterWinTest();//判斷是否進入免費模式
            console.log('呼叫scatterWinTest() 結算此回合，判斷是否進入免費模式');
            this.hideCombo();  //隱藏COMBO連贏次數
            console.log('呼叫hideCombo() 結算此回合，隱藏COMBO連贏次數');
            //判斷是否bigWin跑分或進入免費模式
            if (ws > 0) {
                // this.scheduleOnce(()=>{
                    if (ws > this.demoInfoTA.betScore * this.bigWinMultiple[0]){  //判斷是否執行bigWin跑分
                        this.bigWinState = true; //bigWin執行狀態標示為啟動中
                        this.scheduleOnce(()=>{
                            this.bigWinRunning(ws);
                            console.warn(`呼叫bigWinRunning() 抓取第${this.gameRound}回合分數值：`+ ws);
                        },1)
                    }
                    else {
                        this.scheduleOnce(() => {
                            this.scatterWinTest(); //判斷是否進入免費模式
                        }, 1.3)
                    }
                // },1)
            } else {
                this.scatterWinTest(); //判斷是否進入免費模式
            }
    }

    //顯示COMBO連贏次數
    showCombo(comboNum: number){
        console.log('showCombo() 執行顯示COMBO連贏次數 '+ comboNum);
        this.combo.active = true;
        this.scheduleOnce(()=>{
            this.combo.getChildByName('label').getComponent(Label).string = comboNum.toString();
        },0.5); //延遲0.5秒換數字，配合動畫表演的縮放時機點
        if (comboNum==1) { //1倍時播放combo_show動作，1倍以上時，因COMBO顯示已存在，播放combo_change動作
            this.combo.getComponent(Animation)!.play('combo_show');
            this.combo.getComponent(Animation).on(Animation.EventType.FINISHED, (state) =>
            {this.combo.getComponent(Animation).play('combo_loop')}, this)  //動畫播完時呼叫要執行的事件(涵式)，直接把下一段動畫於()中指定
        }else{
            this.combo.getComponent(Animation)!.play('combo_change');
            this.combo.getComponent(Animation).on(Animation.EventType.FINISHED, (state) =>
            {this.combo.getComponent(Animation).play('combo_loop')}, this)  //動畫播完時呼叫要執行的事件(涵式)，直接把下一段動畫於()中指定
        }

    }

    //隱藏COMBO連贏次數
    hideCombo(){
        console.log('執行hideCombo() 隱藏COMBO連贏次數');
        this.combo.active = false;
        this.comboNum = 0;
    }

    /* 切換Multiple連贏加乘倍數 */
    ChangeMultiple(multipleNum: number){
        console.log('執行ChangeMultiple() 切換Multiple連贏加乘倍數 '+ multipleNum);
        let _multipleNum = multipleNum -1;  //輸入的是連線次數，-1才會剛好對應子物件序列   let _multipleNum = multipleNum -1;
        for (let child of this.multiple.getChildByName('multipleLayout').children) {  //對子物件依序執行
            child.getChildByName('label').active = false;  //關閉所有亮起的倍率
            child.getChildByName('fx').active = false;  //關閉所有亮起的特效
        }
        let _multipleNode = this.multiple.getChildByName('multipleLayout').children[math.clamp(_multipleNum,0,3)]; //抓取連贏加乘倍數的labelx?節點，限制數值範圍，因為只有4個子物件
        _multipleNode.getChildByName('label').active = true; //將正確倍率亮起
        _multipleNode.getChildByName('fx').active = true;
        _multipleNode.getComponent(Animation).play('multipleChange');//播放倍率切換動態
        _multipleNode.getComponent(Animation).on(Animation.EventType.FINISHED, (state) =>{_multipleNode.getComponent(Animation).play('multipleStay')}, this)  //動畫播完時呼叫要執行的事件(涵式)
    }
    /* 重置Multiple連贏加乘倍數 */
    resetMultiple(){
        console.log('執行resetMultiple() 重置Multiple連贏加乘倍數');
        for (let child of this.multiple.getChildByName('multipleLayout').children) {  //對子物件依序執行
            child.getChildByName('label').active = false;  //關閉所有亮起的倍率
            child.getChildByName('fx').active = false;  //關閉所有亮起的特效
        }
        let _multipleNode = this.multiple.getChildByName('multipleLayout').children[0]; //抓取連贏加乘倍數的labelx1節點
        _multipleNode.getChildByName('label').active = true; //將1倍率亮起
        _multipleNode.getChildByName('fx').active = true; //將1倍特效節點開啟
        _multipleNode.getComponent(Animation).play('multipleStay');//播放倍率切換動態
    }

    /* 重啟spin按鈕(同一回合中) */
    resetGameSpin() {
        console.log('執行 resetGameSpin()');
        //先判斷是否為免費模式
        if (this.freeGameMode) {
            const symData = this.demoInfoTA.symData[this.gameRound];
            if (symData.freeGameLeft <= 0 && !this.bigWinState) {
                //免費遊戲結束
                if (!this.totalWin.active) { //如果totalWin非啟動中才執行，避免重複啟動
                    this.scheduleOnce(() => {
                        console.log('開啟TotalWin結算，於resetGameSpin()中');
                        this.totalWin.active = true;//顯示免費遊戲結算
                        this.totalWin.getComponent(Animation).play("totalWinShow");//播放得分畫面
                        this.totalWin.getChildByName('label').getComponent(Label).string = this.numberSpecification(symData.bala);//設置免費遊戲總得分
                        //3.3秒後自動執行(根據動畫資訊出現開始算)
                        tween(this).delay(3.3).call(() => { //等待3.3秒離開totalWin
                            this.freeGameExit(symData.bala);//自動執行免費遊戲結算
                            console.log('呼叫freeGameExit() 免費遊戲結算退出，於resetGameSpin()中');
                        }).tag(88).start();
                    }, 0.5) //等待讓最後一個Spin的結果稍微停留一下再啟動totalWin
                }
            } else {
                //等待0.4秒下局轉動
                this.scheduleOnce(() => {
                    if (!this.bigWinState) {
                        console.log('bigWingState是否執行中 '+ this.bigWinState);
                        console.log('呼叫startGameSlotRun() 開始下局轉動，於resetGameSpin()啟spin按鈕中');
                        this.startGameSlotRun(); //開始下局轉動
                        this.freeGameTimes.getChildByName('tx_times').getChildByName('label').getComponent(Label).string = (symData.freeGameLeft - 1).toString();//免費次數更新
                        console.log('freeGameLeft 剩餘免費遊戲次數 '+symData.freeGameLeft);
                        if (symData.freeGameLeft==1) {
                            this.freeGameTimes.getChildByName('tx_times').active = false; //關閉免費次數訊息
                            this.freeGameTimes.getChildByName('tx_last').active = true; //開啟最後免費旋轉訊息
                        }
                    }
                    return;
                }, 0.4)
            }
            return;
        }
        //如果是自動遊戲狀態，等待0.4秒下局轉動
        else if (this.autoGameMode) {
            this.scheduleOnce(() => {
                this.startGameSlotRun();//開始下局轉動
                console.error('呼叫 startGameSlotRun() 開始下局轉動，於自動遊戲狀態');
                this.autoGameRound--;
                this.btnAutoStop.children[0].getChildByName('label').getComponent(Label).string = this.autoGameRound.toString();
            }, 0.4)
            return;
        }
        this.btnSpin.getComponent(Button).interactable = true;//啟用spin
        this.btnAuto.interactable = true;//啟用自動按鈕
        this.btnSetting.interactable = true;//啟用設置按鈕
        this.betAdd.interactable = true;//啟用下注加分按鈕
        this.betLess.interactable = true;//啟用下注減分按鈕
    }
    //-------------------主要slot流程-------------------/

    //-------------------功能類-------------------/

    /* 設置symbol圖案(哪行slotSymbol,該行顯示的symbol編號) */
    setSymbolImage(slotSymbol: Node, symbolNumber: number[]) {
        for (let i = 0; i < slotSymbol.children.length; i++) {
            slotSymbol.children[i].getComponent(symbolSetting_TA).setSymbolData(symbolNumber[i]);//設置顯示的symbol
        }
    }

    /* 回傳該行隨機symbol圖案編號(要隨機產生的編號數量) */
    randomSymbolNum(amount: number) {
        let result: number[] = [];//要回傳的隨機編號陣列
        for (let i = 0; i < amount; i++) {
            result.push(Math.floor(Math.random() * 19)); //向下取整數，得出隨機0~18的值
        }
        return result;//回傳該行隨機symbol圖案編號
    }

    /* 模糊貼圖回歸正常(哪行slot) */
    blurSFReset(slotRunLine: Node) {
        //設置上下用模糊貼圖
        for (const data of slotRunLine.children) {
            for (const data2 of data.children) {
                data2.getComponent(symbolSetting_TA).blurHide();//顯示模糊漸變
            }
        }
    }

    /* 遮黑淡入 */
    slotBlackShow() {
        console.log('執行slotBlackShow() Slot壓黑');
        this.slotBlack.getComponent(UIOpacity).opacity = 0;
        this.slotBlack.active = true;//顯示遮黑
        tween(this.slotBlack.getComponent(UIOpacity)).to(0.15, { opacity: 255 }).start();//淡入
    }

    /* 遮黑淡出 */
    slotBlackHide() {
        console.log('執行slotBlackHide() Slot解除壓黑');
        tween(this.slotBlack.getComponent(UIOpacity)).to(0.15, { opacity: 0 }).call(() => {
            this.slotBlack.active = false;//隱藏遮黑
        }).start();//淡出
    }
    //顯示共贏得分數(小字)
    showWinTotalScore(score: number) {
        if (score != null) {
            this.winTotalScoreInfo.getChildByName('score').getChildByName('label').getComponent(Label).string = this.numberSpecification(score);//共贏分設置
            this.marquee.getComponent(UIOpacity).opacity = 0; //隱藏跑馬燈
            this.winTotalScoreInfo.active = true;//顯示共贏得
            this.winTotalScoreInfo.getComponent(Animation).play('totalscoreShow');
            this.scheduleOnce(()=>{
                this.winTotalScoreInfo.active = false;//關閉共贏得分數
                let _marqueeUIOpacity = this.marquee.getComponent(UIOpacity); //抓取跑馬燈的UIOpacity組件
                _marqueeUIOpacity.opacity = 0
                tween(_marqueeUIOpacity).to(0.3, { opacity: 255 }).start();  //顯示跑馬燈
            },2)
        }
    }

    //共贏得分數歸零(小字)&得分框回歸基本款
    resetWinTotalScore() {
        this.winTotalScoreInfo.getChildByName('score').getChildByName('label').getComponent(Label).string = this.numberSpecification(0.00); //共贏分設置
        this.winTotalScore = 0; //累加分數歸零
        this.winScoreBg.children[0].active = true; //開啟基本款得分框
        this.winScoreBg.children[1].active = false;
        this.winScoreBg.children[2].active = false;
        // this.spawnCoin.getComponent(particle3DAutoSwitch).stopParticle(); //停止粒子噴發
        this.scheduleOnce(()=>{
            this.spawnCoin.active = false; //關閉噴金幣特效
        },1);
    }

    //顯示贏得分數(大字)&累加分數(小字)
    showWinScore(score: number, scoreBg: number ,showFx: boolean) {
        console.log('執行 showWinScore()顯示贏得分數 '+score+'，得分框ID '+ scoreBg+'，是否噴金幣 '+ showFx);
        this.winScoreInfo.getChildByName('score').getChildByName('label').getComponent(Label).string = this.numberSpecification(score);//贏分設置
        this.winScoreInfo.active = true; //顯示贏得分數

        this.marquee.getComponent(UIOpacity).opacity = 0; //隱藏跑馬燈
        this.winTotalScoreInfo.active = true;//顯示共贏得
        let _winTotalScore = this.winTotalScore + score;  //累計得分+此次得分=此局目前共得分
        this.winTotalScoreInfo.getChildByName('score').getChildByName('label').getComponent(Label).string = this.numberSpecification(_winTotalScore);//顯示共贏得分數
        this.winTotalScore = _winTotalScore; //將累加結果存回
        if (showFx) {
            this.spawnCoin.active = true; //開啟噴金幣特效
        }
        if (scoreBg > 0) {
            if (!this.winScoreBg.children[scoreBg].active) {  //如果要開啟的得分框現在非啟動中才執行，為了作到有變換得分框材播動畫
                for (let child of this.winScoreBg.children) {  //先關閉所有得分框
                    child.active = false;
                }
                this.winScoreBg.children[scoreBg].active = true; //開啟升級版得分框
                this.winScoreBg.children[scoreBg].getComponent(Animation).play('winScoreBg'); //播放換得分框動畫
            }
        }

        this.scheduleOnce(()=>{
            this.winScoreInfo.active = false; //隱藏贏得分數
        },1.5)
    }
    //錢包歸分(得分)
    walletScore(score: number) {
        this.userCash = Number(this.userCash) + (score * 10000);//玩家得分增加
        const cashStr = this.numberSpecification((this.userCash / 10000));
        this.runScore(Number(this.userCashLabel.string.replace(/,/gi, '')), Number(cashStr.replace(/,/gi, '')), this.userCashLabel);//執行小跑分
    }
    /* 規格化數值(取小數點後2位)*/
    private numberSpecification(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }

    /* 中獎牌啟動消失特效 */
    destroySymFx(){
        for (let i = 0; i < this.symbolWinLayer.children.length; i++) {
            console.error('destroySymFx() 中獎牌消失特效，牌名 '+this.symbolWinLayer.children[i].name);
            this.symbolWinLayer.children[i].getComponent(Animation)!.play('symbolWin_destroyFx');  //啟動中獎牌消失的特效
        }
    };

    /* 退還symbolWinLayer節點下的中獎牌至物件池，並釋放消失特效 */
    putSymbolWinLayer(){
        while (this.symbolWinLayer.children.length > 0) {
            if (!this.symbolWinLayer.children[0].getChildByName('scatter').active) {  //不是Scatter才釋放消失特效
                let _symDestroyFx = instantiate(this.symDestroyFx);  //生成中獎牌消失特效
                _symDestroyFx.setParent(this.symbolFxLayer); //設置特效父物件
                _symDestroyFx.setPosition(this.symbolWinLayer.children[0].position);  //將特效至中獎牌座標
                // console.log('已生成中獎牌消失特效'+_symDestroyFx.name+'座標'+_symDestroyFx.position);
            }
            this.myPool.put(this.symbolWinLayer.children[0]);//退還symbolWinLayer節點下的pool
        }
    }

    /* 移除scatter中獎符號，退還symbolFxLayer節點下的中獎牌至物件池 */
    putSymbolFxLayer(){
        for (let child of this.symbolFxLayer.children) {  //對子物件依序執行
            child.getComponent(symbolWin_TA).scatterRemove(); //播放消除動態
        }

        this.scheduleOnce(()=>{
            while (this.symbolFxLayer.children.length > 0) {
                this.myPool.put(this.symbolFxLayer.children[0]);//退還symbolFxLayer節點下的pool
            }
        },0.7)

    }

    /* 退還symbolGoldWinLayer節點下的中獎牌至物件池，並釋放消失特效 */
    putSymbolGwinLayer(){
        console.log('執行putSymbolGwinLayer 退還Wild符號至物件池');
        while (this.symbolGwinLayer.children.length > 0) {
            this.myPool.put(this.symbolGwinLayer.children[0]);//退還symbolGoldWinLayer節點下的pool
        }
    }

    /* Wild表演 */
    showWild(wildType: string, redWindPos: number[]){
        console.log('執行showWild Wild表演');
        let waitSlotWildShow = 1.4; //等待mainSymbol上Wild出現的時間
        this.scheduleOnce(() => {
            for (let i = 0; i < this.symbolGwinLayer.children.length; i++) {
                if (wildType=='green') {
                    this.symbolGwinLayer.children[i].getComponent(symbolWin_TA).runWild(wildType); //呼叫中獎符號掛載的Wild翻牌表演
                    console.log('呼叫runWild() 中獎符號上的綠Wild表演功能');
                    waitSlotWildShow = 1.4;  //回收綠wild的延遲時間
                }else if(wildType=='red'){
                    this.symbolGwinLayer.children[i].getComponent(symbolWin_TA).runWild(wildType); //呼叫中獎符號掛載的Wild翻牌表演
                    console.log('呼叫runWild() 中獎符號上的紅Wild表演功能');

                    this.scheduleOnce(() => {
                        let spawnWild = [];
                        let delayTime = [0.3,0.2,0]; //依序移動複製版紅Wild的延遲時間，配合反向For循環，延遲時間也改由大至小

                        /* 複製出符合座標ID數量的紅Wild進行移動表演，過濾掉ID0(上局中獎Wild的本尊)  */
                        // for (let w = 1; w < redWindPos.length; w++) {
                        for (let w = redWindPos.length-1; w > 0; w--) {  //為了美感，讓遠的位置先移動，使用反向For循環，由大至小
                            spawnWild[w] = this.myPool.get(this.symbolResourceTA.symbolWin);//取用中獎symbol物件池生成紅Wild
                            spawnWild[w].parent = this.symbolWinLayer;//設置父節點
                            spawnWild[w].position = this.symbolGwinLayer.children[i].position; //新紅Wild初始位置同原紅Wild座標
                            let _scatter = spawnWild[w].getChildByName('scatter');
                            let _stayFx = spawnWild[w].getChildByName('stayFx');
                            let _symbol = spawnWild[w].getChildByName('symbol');
                            let _winFx = spawnWild[w].getChildByName('winFx');
                            let _wild = spawnWild[w].getChildByName('wild');
                            let _redWildFx = spawnWild[w].getChildByName('redWildFx');
                            let _flopFx = spawnWild[w].getChildByName('flopFx');
                            _symbol.getComponent(Sprite).spriteFrame = this.symbolResourceTA.symbolSF[9]; //設置符號貼圖為紅Wild
                            _scatter.active = false;
                            _stayFx.active = false;
                            _symbol.active = true;
                            _winFx.active = false;
                            _redWildFx.active = true;
                            _flopFx.active = false;
                            _wild.active = false;

                                spawnWild[w].getComponent(Animation).play('symbolRedWiid'); //播放特效(翻牌特效兼用)
                                //→→→→→this.slotSymbolPos:盤面20個Symbol座標位置，redWindPos:要生成紅Wild的位置ID陣列
                                tween(spawnWild[w]).delay(delayTime[w]).to(0.3, { position: new Vec3(this.slotSymbolPos[redWindPos[w]]) }, { easing: 'circOut' }).start();
                                console.log('移動複製的紅Wild座標至 '+this.slotSymbolPos[redWindPos[w]]);

                            this.scheduleOnce(() => {
                                this.myPool.put(spawnWild[w]); //退還複製版Wild給pool
                            }, 1.3) //回收複製版Wild的延遲時間
                        }

                    }, 1.9)  //等待金卡消失+掀牌表演結束
                    waitSlotWildShow = 3.2;  //回收原版wild的延遲時間
                }
            }
            this.scheduleOnce(() => {
                this.putSymbolGwinLayer();
            }, waitSlotWildShow)  //等待軸面上的Wild出現後，再移除SymbolGoldwinLayer節點下的Wild

        }, 0.3)  //等待一般牌消失表演結束再啟動Wild表演
    }

    /* 跑分 */
    runScore(stratScore: number, endScore: number, label: Label) {
        const runScore = { score: stratScore };//設置起始分
        tween(runScore).to(0.5, { score: endScore }, {
            onUpdate: () => {
                label.string = this.numberSpecification(runScore.score);//更新分數
            }
        }).call(() => {
            label.string = this.numberSpecification(endScore);//更新分數
        }).start();
    }
    //-------------------功能類-------------------/

    //-------------------大獎跑分相關-------------------/
    /* 執行大獎跑跑分(滑鼠點擊後直接跳結果) */
    bigWinRunning(_ws: number) {
        console.warn('執行bigWinRunning() 輸入分數值：'+_ws);
        // const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        // console.warn(`執行bigWinRunning() 抓取第${this.gameRound}回合分數值：`+ ws);
        const runningScoreLabel = this.bigWin.getChildByName("label").getComponent(Label);
        runningScoreLabel.string = "0";//清空跑分
        this.bigWin.active = true;//顯示跑分物件
        this.bigWin.getComponent(Button).interactable = true;//啟用按鈕
        this.bigWin.getComponent(Animation).play("bigWinReset");
        let arrayId = 0;  //作為bigWin的動畫名稱ID
        const bigWinSpine = this.bigWin.getChildByName("spine").getComponent(sp.Skeleton);
        bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_in', false);//進場
        bigWinSpine.setCompleteListener(() => {
            bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_loop', true);//循環播放
            bigWinSpine.setCompleteListener(null);//結束監聽
        })
        //等待跑分結束(回傳)
        const runBigWinScore = { score: 0 };//設置起始分
        tween(runBigWinScore).to(this.runScoreTime, { score: _ws }, {
            onUpdate: () => {
                runningScoreLabel.string = this.numberSpecification(runBigWinScore.score);//更新分數
                if (arrayId < 3 && runBigWinScore.score > this.demoInfoTA.betScore * this.bigWinMultiple[arrayId]) {
                    arrayId++;//判斷下個階段
                    console.warn('BigWin階段ID：'+ arrayId);
                    this.bigWin.getComponent(Animation).play("bigWinNum"); //切換階段時播放數字動態
                    bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_in', false);//進場
                    bigWinSpine.setCompleteListener(() => {
                        bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_loop', true);//循環播放
                        bigWinSpine.setCompleteListener(null);//結束監聽
                    })
                }
            }
        }).call(() => {
            runningScoreLabel.string = this.numberSpecification(_ws);//更新分數
            this.bigWinOver(_ws);
        }).start();
    }

    //執行bigWin跑分結束
    bigWinOver(_ws: number) {
        console.log('執行bigWinOver() 跑分結束，輸入分數值：'+_ws);
        // console.warn(`執行bigWinRunning() 抓取第${this.gameRound}回合分數值：`+ ws);
        this.bigWin.getComponent(Button).interactable = false; //禁用bigWin按鈕反應
        const runningScoreLabel = this.bigWin.getChildByName("label").getComponent(Label);
        runningScoreLabel.string = this.numberSpecification(_ws);  //設置最終獲得分數
        this.bigWin.getComponent(Animation).play("bigWinOver");
        this.scheduleOnce(() => {
            this.bigWinState = false; //標示bigWin執行結束
            this.bigWin.active = false;//隱藏跑分物件
            if (!this.freeGameMode){
                this.showWinTotalScore(_ws);//顯示共贏得
                console.log('呼叫showWinTotalScore() bigWin結束，顯示共贏得分數(小字)');
            }else{
                this.scheduleOnce(() => {
                    this.scatterWinTest();//判斷是否進入免費模式
                    console.log('呼叫scatterWinTest() bigWin結束，判斷是否進入免費模式');
                }, 0.3)
            }
        }, 2) //等待"bigWinOver"動畫播完
    }

    //大獎跑分畫面按下觸發
    endBigWinRun() {
        const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        Tween.stopAllByTag(88);
        this.unscheduleAllCallbacks();
        const bigWinSpine = this.bigWin.getChildByName("spine").getComponent(sp.Skeleton);
        bigWinSpine.setCompleteListener(null);//結束監聽
        for (let i = 0; i < this.bigWinMultiple.length; i++) {
            if (ws < this.demoInfoTA.betScore * this.bigWinMultiple[i]) {
                bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[i - 1] + '_loop', true)
                break;
            }
            if (i === this.bigWinMultiple.length - 1)
                bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[i] + '_loop', true)
        }
        this.bigWinOver(ws);
    }
    //-------------------大獎跑分相關-------------------/

    //-------------------免費遊戲表演相關-------------------/
    //判斷是否進入免費模式,判斷盤面的symbol
    scatterWinTest() {
        console.log('執行scatterWinTest() 判斷是否進入免費模式');
        this.btnSpin.getChildByName('loopFx').active = false;//隱藏Spin鍵旋轉狀態
        //判斷是否有獲得免費圖示
        if (this.freeGameReady) { //判斷"免費遊戲+次數"是否為顯示狀態
            this.scheduleOnce(() => {
                this.startFreeGame();//表演時間結束後【執行freeGame表演流程】
                console.log('呼叫 startFreeGame() 啟動freeGame流程');
            }, 0) //原0.3，改0，不知為何直接移除scheduleOnce()會造成流程及Slot壞掉
        }
        else {
            this.resetGameSpin(); //重啟spin
            console.log('呼叫resetGameSpin() 重啟(同回合)spin，於scatterWinTest()中');
        }
    }

    /* 執行freeGame流程 */
    startFreeGame() {
        console.log('執行 startFreeGame() 運行freeGame流程');
        this.freeGameReady = false; //因已進入免費遊戲，關閉符合進入免費遊戲狀態
        this.comboNum = -1; //連贏次數重置, FreeGame時Combo數總會直接從2開始跳，因找不到原因，所以不重置0，改設為-1解決
        console.log('COMBO次數歸零');
        this.slotBlackHide();//隱藏遮黑層
        //如果是第一次進入免費遊戲，會先出現介面
        if (!this.freeGameMode) {
            const freeGameTimesUIOpacity = this.freeGameTimes.getComponent(UIOpacity);
            freeGameTimesUIOpacity.opacity = 0;  //設置下方剩餘免費遊戲次數訊息透明度由0起始
            this.freeGameTimes.active = true;
            this.controlBtns.active = false;//隱藏操作按鈕區
            tween(freeGameTimesUIOpacity).to(0.3, { opacity: 255 }).start();  //下方剩餘免費遊戲次數訊息淡入顯示

            const freeTopBgUIOpacity = this.freeTopBg.getComponent(UIOpacity);
            freeTopBgUIOpacity.opacity = 0;  //設置上方倍率加乘介面透明度由0起始
            /* 設定免費遊戲的倍數加乘數值 */
            let _multipleLayout = this.multiple.getChildByName('multipleLayout');
            for (let i = 0; i < _multipleLayout.children.length; i++) {
                _multipleLayout.children[i].getComponent(Label).string = this.multipleFree[i];
                _multipleLayout.children[i].getChildByName('label').getComponent(Label).string = this.multipleFree[i];
            }
            this.freeTopBg.active = true; //開啟免費遊戲的倍數加乘的背景框
            tween(freeTopBgUIOpacity).to(0.3, { opacity: 255 }).start();  //上方倍率加乘介面淡入顯示

            this.freeGameGet.active = true;//獲得免費遊戲
            this.scheduleOnce(() => {
                this.freeGameStart(); //自動執行免費遊戲開始
            }, 4.1)
        } else {
            this.freeGameStart(); //自動執行免費遊戲開始
        }
    }

    /* 免費遊戲開始 */
    freeGameStart() {
        this.putSymbolFxLayer(); //移除中獎表演Scatter符號
        Tween.stopAllByTag(88);//停止免費遊戲自動關閉視窗倒數
        if (!this.freeGameMode) {
            this.freeGameSet(true);//免費遊戲進退場設置(如果是第一次進入免費模式，需設置參數)
            this.freeGameGet.active = false;
        }
        if(!this.bigWinState){
            console.log('bigWinState狀態： '+this.bigWinState);
            this.scheduleOnce(() => {
                console.log('呼叫resetGameSpin() 重啟(同回合)spin，於免費遊戲開始後');
                this.resetGameSpin()//重啟遊戲spin轉動
            }, 0.3)
        }
    }

    /* 免費遊戲進退場設置(免費遊戲狀態) */
    freeGameSet(bool: boolean) {
        console.log('執行 freeGameSet() 免費遊戲進退場設置');
        this.freeGameMode = bool;//免費模式開關
        //freeGame介面淡出
        if (!bool) {
            tween(this.freeTopBg.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                .call(() => {
                    //回復一般遊戲的倍數加乘數值
                    let _multipleLayout = this.multiple.getChildByName('multipleLayout');
                    for (let i = 0; i < _multipleLayout.children.length; i++) {
                        _multipleLayout.children[i].getComponent(Label).string = this.multipleNormal[i];
                        _multipleLayout.children[i].getChildByName('label').getComponent(Label).string = this.multipleNormal[i];
                    }
                    this.freeTopBg.active = false;  //關閉免費遊戲的倍數加乘的背景框
                }).start();
            tween(this.freeGameTimes.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                .call(() => {
                    this.freeGameTimes.active = false;  //關閉免費遊戲剩餘次數訊息
                    this.freeGameTimes.getChildByName('tx_times').active = true;  //重置-開啟免費遊戲剩餘次數數字
                    this.freeGameTimes.getChildByName('tx_last').active = false;  //重置-關閉最後免費旋轉訊息
                    this.controlBtns.active = true; //顯示操作按鈕區
                }).start();
        }
        if (!bool && this.autoGameMode) {
            this.btnAutoStop.active = true;//顯示自動停止按鈕
            this.btnSpin.active = false;//隱藏spin按鈕
        }
    }

    //免費遊戲結算退出(按鈕觸發或5秒自動觸發)
    freeGameExit(score: number) {
        console.log('執行 freeGameExit() 免費遊戲結算退出');
        Tween.stopAllByTag(88);//停止免費遊戲自動關閉視窗倒數
        this.freeGameSet(false);//免費遊戲進退場設置
        this.totalWin.getComponent(Animation).play("totalWinExit");
        this.scheduleOnce(() => {
            this.totalWin.active = false;//隱藏免費遊戲結算畫面
            this.showWinTotalScore(score);//顯示共贏得
            if(!this.bigWinState){
                console.log('bigWinState狀態： '+this.bigWinState);
                this.scheduleOnce(() => {
                    console.log('呼叫resetGameSpin() 重啟(同回合)spin，於freeGameExit()中');
                    this.resetGameSpin();//重啟spin
                }, 0.3)
            }
        }, 0.2)
    }
    //-------------------免費遊戲表演相關-------------------/
}