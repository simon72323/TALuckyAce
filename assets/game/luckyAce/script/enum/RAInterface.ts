export interface onBeginGame {
    event: boolean,
    data:{
      PayTotal: number; // 此局玩家贏了多少 credit
      Lines: Lines[][]; // 中線相關資料
      Cards: number[][][]; // 此次中線前所有 symbol 資料，中線後 symbol 消失，再次補牌後 symbol 資料
      Scatter: Scatter; // 此次中 scatter 資料
      FreeGame: FreeGame; // 當下中 freegame 資料
      FreeGameSpin: FreeGameSpin; // freegame 中，每一次 freegame 資料
      RollerNumber: number; // 輪帶代號
      BBJackpot: any; // Jackpot 資料
      WagersID: number; // 局號
      Credit: number; // 此次特殊遊戲前，玩家 credit
      Credit_End: number; // 此次特殊遊戲到目前此次slot，玩家 credit
      AxisLocation: string; // 每一條 slot 輪帶代號
      Status: number;
      HitWagersID: number; // 中 freegame 當下局號
    }
  }

  export interface onOnLoadInfo {
    action: string,
    result: {
      event: boolean,
      data: {
        event: boolean,
        Balance: number,
        Base: string,
        DefaultBase: string,
        BetCreditList: number[],
        DefaultBetCredit: number,
        Rates:{[key: string]: number[]},
        UserAutoExchange: UserAutoExchange,
        Currency: string, // 幣別
        BuyFree: boolean, // 是否允許購買免費遊戲
        LoginName: "Player",
        AutoExchange: boolean,
        Credit: number,
        BetBase: string,
        isCash: boolean, // 未知欄位
        userSetting: userSetting,
        SingleBet: 100,
      },
      tokenId: '/3',
    }
  }

  export interface Lines {
    DoubleTime: number; // 倍數 X1, X2, X3, X5
    Element: number[]; // 此次中線，每一個 slot 中線的 symbol 是什麼
    ElementID: number; //  此次中線，每一個 slot 中線的 symbol 是哪一個
    GridNum: number; // 此次中線是中了幾個格子
    Grids: number[]; // 中線是中哪個格子的 symbol
    Payoff: number; // 此次中線玩家得到多少 credit
  }

  export interface Scatter {
    GridNum: number; // 此次 scatter，總共中幾格
    Grids: number[]; // 此次 scatter，是哪幾格中
    ID: number; // scatter symbol 代號
  }

  export interface FreeGame {
    FreeGamePayoffTotal: number; // 中 free game 當下，總共贏得多少 credit
    FreeGameTime: number; // 中 freegame 當下，此次 freegame 給多少次免費 spin
    HitFree: boolean;  // 當下此次 slot 是否中 free game
    ID: number; // free game symbol 代號
  }

  export interface RedWild {
    ID: number, // 紅色WILD ID
    GridsNum: number, // 總共有幾個紅色WILD
    Grids: number[], // 紅色WILD要吃掉的位置
    MainGrid: number, // 紅色WILD 初始位置
  }

  export interface GreenWild {
    ID: number, // 綠色WILD ID
    GridsNum: number, // 總共有幾個綠色WILD
    Grids: number[], // 綠色WILD位置
  }

  export interface FreeGameSpin {
    FreeGamePayoffTotal: number; // 此次 freegame 拉到目前此數總共贏得多少 credit(累積)
    FreeGameTime: number; // 此局還剩下 freespin 次數
    WagersID: number; // freegame 局號
  }

  interface UserAutoExchange {
    'IsAuto': boolean,
    'Credit': number,
    'BetBase': string,
    'Record': [] // 功能未知
  }

  interface userSetting {
    autoCredit: number,
    auto: boolean,
    info: {},
    rate: "1:1"
  }