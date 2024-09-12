import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/* Demo腳本資料內容 */
//牌型獎項
export class typeAward {
    public name: string;//連線獎項名稱
    public symID: number[];//牌種編號[ID]
    public symPos: number[][];//中獎的位置[順序及ID]
    constructor(name: string, symID: number[], winPos: number[][]) {
        this.name = name;
        this.symID = [...symID];
        this.symPos = [...winPos];
    }
    public destroy(): void {
        this.name = '';
        this.symID = [];
        this.symPos = [];
    }
}

//線的獎項
export class lineAward {
    public typeAward: typeAward[] = [];//牌型資料
    constructor(typeAward: typeAward[]) {
        this.typeAward = typeAward;
    }
    public destroy(): void {
        this.typeAward = [];
    }
}

//胡牌獎項
export class huAward {
    public setSym: number[][];//胡牌sym編號[牌][編號]
    public flower: number[];//中獎花色[編號]
    public huType: number[][];//中獎的牌型[牌型編號][台數]
    public allPoints: number;//總台數
    constructor(setSym: number[][], flower: number[], huType: number[][], allPoints: number) {
        this.setSym = [...setSym];
        this.flower = [...flower];
        this.huType = [...huType];
        this.allPoints = allPoints;
    }
    public destroy(): void {
        this.setSym = [];
        this.flower = [];
        this.huType = [];
        this.allPoints = 0;
    }
}

//一回合slot的資料
export class awardGroup {
    public slotNumber: number[][] = [];//symbol盤面
    public lineAward: lineAward[] = [];//線的獎項
    public huAward: huAward = null;//胡牌獎項
    public bta: number = 100;//押注值
    public ws1: number[] = [];//得分(單一次連線得分)
    public ws: number;//得分(所有線的總和)
    public bala: number;//totalWin(最終分數)
    public freeGameLeft: number = 0;//剩餘免費遊戲次數
    public freeGameMultiples: number = 0;//免費遊戲倍率
    public destroy(): void {
        this.lineAward = [];
    }
}

@ccclass('demoInfo_TA')
export class demoInfo_TA extends Component {
    //***************仿gameInfo的腳本 ****************/
    public antes: number[] = [100, 200, 500, 1000];
    /**押注的antes索引 */
    public nowBetIndex = 0;
    /**每局下注金額 */
    public betScore: number = 50;
    /**遊戲demo幾局 */
    public demoRound: number = 8;
    /**遊戲中獎表演資料*/
    public symData: Array<awardGroup> = [];

    //設置demo表演資料
    setWinData() {
        for (let i = 0; i < this.demoRound; i++) {
            const awardGroupData: awardGroup = new awardGroup();//本局參數(一回合slot的資料)
            // console.log(`加載第${i}Case的盤面內容`);
            switch (i) {
                case 0://從1起始，case0沒讀到
                    //symbol盤面
                    awardGroupData.slotNumber = [  //symbol盤面
                        [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
                        [17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17]
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [  //連線的獎項名稱&牌種&位置
                        new lineAward([new typeAward('normal', [14], [[3], [6], [10], [15]]) ]), 
                    ]
                    awardGroupData.ws1 = [75];//單次連線得分
                    awardGroupData.ws = 75;//該回合總贏分
                    break;
                case 1://第一次Spin，沒中獎
                    //symbol盤面，由空盤面起始落下符號算一次Spin
                    awardGroupData.slotNumber = [
                        [11, 13, 11, 14, 13, 4, 10, 7, 16, 18, 15, 15, 15, 2, 13, 16, 16, 17, 12, 12], //第一次Spin結果
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [  //new typeAward('獎項名稱',中獎符號<上方小牌符號>,中獎符號位置ID<演出中獎動態>)
                    ]
                    break;
                case 2://第2次Spin，Qx4，補空缺掉落
                    //symbol盤面
                    awardGroupData.slotNumber = [
                        [11, 14, 18, 16, 0, 14, 16, 1, 1, 6, 16, 18, 3, 6, 6, 16, 11, 18, 12, 6],  //第二次Spin結果
                        [11, 14, 18, 13, 0, 14, 11, 1, 1, 6, 12, 18, 3, 6, 6, 13, 11, 18, 12, 6]   //連線表演完要切換成新牌面，再落下補滿因連線消失的牌面
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [  //new typeAward('獎項名稱',中獎符號<上方小牌符號>,中獎符號位置ID<演出中獎動態>)
                        new lineAward([new typeAward('normal', [16], [[3], [6], [10], [15]]) ]), 
                    ]
                    awardGroupData.ws1 = [50];//單次連線得分
                    awardGroupData.ws = 50;//該回合總贏分
                    break;
                case 3: //第3次Spin，combo2次，1-紅心x5，2-紅磚x4、梅花x2+wild、Jx2+wild，WILDx1，補空缺掉落
                    //symbol盤面
                    awardGroupData.slotNumber = [
                        [13, 12, 11, 13, 13, 0, 15, 13, 12, 2, 5, 17, 12, 18, 14, 16, 16, 15, 13, 14],  //第三次Spin結果
                        [18, 12, 11, 15, 1, 0, 15, 13, 12, 8, 5, 17, 12, 18, 14, 16, 16, 15, 13, 14],  //連線表演完要切換成新牌面，再落下補滿因連線消失的牌面，同位置重複的號碼代表保持在原位的符號
                        [18, 15, 12, 12, 8, 8, 14, 13, 0, 6, 5, 17, 13, 18, 14, 16, 16, 15, 13, 14],  //連線表演完要切換成新牌面，再落下補滿因連線消失的牌面
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [  //new typeAward('獎項名稱',中獎符號<上方小牌符號>,中獎符號位置ID<演出中獎動態>)
                        new lineAward([new typeAward('greenWild', [13], [[0], [3], [4], [7], [9]]) ]),
                        new lineAward([new typeAward('greenWild', [15], [[1], [2], [3], [4], [5], [6], [8], [9], [12]]) ]),
                    ]
                    awardGroupData.ws1 = [65,95];//單次連線得分
                    awardGroupData.ws = 160;//該回合總贏分
                    break;
                case 4://第4次Spin，出現免費遊戲
                    //symbol盤面
                    awardGroupData.slotNumber = [
                        [11, 10, 18, 12, 15, 11, 13, 10, 14, 12, 13, 18, 16, 12, 5, 16, 14, 17, 11, 10],  //第七次Spin結果(FreeGame)
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [
                        new lineAward([new typeAward('free', [10, 10, 10], [[1], [7], [19]])])
                    ]
                    awardGroupData.freeGameLeft = 3; //回合結束時剩餘免費遊戲次數，下回合開始會以此值-1
                    break;
                case 5://進入免費遊戲中第1次Spin，顯示剩餘免費次數2，普通連線，補空缺掉落
                    //symbol盤面
                    awardGroupData.slotNumber = [
                        [11, 14, 18, 16, 0, 7, 16, 1, 16, 16, 17, 18, 6, 6, 16, 11, 18, 12, 6, 14],  //沒清空盤面沒補牌直接Spin的結果
                        [11, 14, 18, 14, 0, 7, 4, 1, 10, 5, 17, 18, 6, 6, 12, 11, 18, 12, 6, 14]   //連線表演完要切換成新牌面，再落下補滿因連線消失的牌面
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [
                        new lineAward([new typeAward('normal', [16], [[3], [6], [8], [9], [14]]) ])
                    ]
                    awardGroupData.ws1 = [75];//單次連線得分
                    awardGroupData.ws = 75;//該回合總贏分
                    awardGroupData.freeGameLeft = 2; //回合結束時剩餘免費遊戲次數，下回合開始會以此值-1
                    break;
                case 6://免費遊戲中第2次Spin，顯示剩餘免費次數1，紅色WILD，補空缺掉落
                    //symbol盤面
                    awardGroupData.slotNumber = [
                        [14, 11, 11, 14, 18, 7, 11, 13, 15, 14, 11, 11, 12, 15, 11, 12, 16, 17, 4, 14],  //沒清空盤面沒補牌直接Spin的結果
                        [14, 12, 11, 14, 18, 7, 3, 13, 15, 14, 17, 17, 12, 15, 4, 12, 16, 17, 4, 14],  //沒清空盤面沒補牌直接Spin的結果
                        [12, 12, 11, 16, 18, 7, 9, 13, 15, 12, 17, 9, 9, 15, 4, 12, 16, 17, 4, 9],   //連線表演完突然切換為新牌面，然後落下補滿缺的牌面
                        [18, 11, 13, 11, 7, 7, 18, 13, 15, 18, 17, 15, 18, 15, 4, 10, 7, 17, 4, 12],  //Scatter聽牌
                        [17, 11, 13, 11, 8, 8, 11, 13, 15, 13, 17, 15, 6, 15, 4, 10, 8, 17, 4, 12], 
                        [14, 11, 14, 11, 14, 0, 11, 18, 15, 10, 6, 15, 8, 15, 4, 10, 7, 17, 4, 12]
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [
                        new lineAward([new typeAward('normal', [11], [[1],[2],[6],[10],[11],[14]])]),
                        new lineAward([new typeAward('redWild', [14], [[0],[3],[6],[9]])]),
                        new lineAward([new typeAward('normal', [9], [[0],[1],[2],[3],[6],[9],[11],[12],[15],[16],[19]])]),
                        new lineAward([new typeAward('greenWild', [7], [[0],[4],[5],[6],[9],[12],[16]])]),
                        new lineAward([new typeAward('normal', [13], [[0],[2],[4],[5],[7],[9],[10],[12],[16]])])
                    ]
                    awardGroupData.ws1 = [60,160,280,660,1320];//單次連線得分
                    awardGroupData.ws = 2480;//該回合總贏分
                    awardGroupData.freeGameLeft = 1; //回合結束時剩餘免費遊戲次數，下回合開始會以此值-1
                    break;
                case 7://免費遊戲中第3次Spin，顯示剩餘免費次數0，沒中獎
                    awardGroupData.slotNumber = [
                        [11, 13, 11, 14, 13, 4, 10, 7, 16, 18, 15, 15, 15, 2, 13, 16, 16, 17, 12, 12],
                    ];
                    //盤面連線獎項
                    awardGroupData.lineAward = [ 
                    ]
                    awardGroupData.bala = 2555;//totalWin(免費遊戲結束，最終分數)
                    break;
                
            }
            this.symData.push(awardGroupData);//設置一般遊戲中獎表演資料
        }
    }

    onLoad() {
        this.setWinData();//設置一般遊戲中獎表演參數(demo)
    }
}