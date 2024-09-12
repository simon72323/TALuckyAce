import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, resources, Sprite, SpriteFrame, find } from 'cc';
import {luckyAce_TA} from '../../game/luckyAce/script/luckyAce_TA';
const { ccclass, property } = _decorator;
/* 自動切換語系功能，掛在每個需要切換語系的Sprite節點 */

enum LocalizedMode {  //語系選擇
    CN,  //簡中
    EN,  //英文
    TW,  //繁中
}

@ccclass('LocalizedUI_TA')
export class LocalizedUI_TA extends Component {
    @property({ type: SpriteFrame})
    public CN: SpriteFrame = null;
    @property({ type: SpriteFrame})
    public EN: SpriteFrame = null;
    @property({ type: SpriteFrame})
    public TW: SpriteFrame = null;

    private Sprite: Sprite = null; //抓取自身Sprite用

    onLoad () {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.Sprite = this.node.getComponent(Sprite);  //抓取自身Sprite
    }

    /* 鍵盤熱鍵切換語系 */
    onKeyDown (event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_C:
                console.log('Press c key');
                    this.Sprite.spriteFrame = this.CN;
                break;

            case KeyCode.KEY_E:
                console.log('Press e key');
                    this.Sprite.spriteFrame = this.EN;               
                break;
            
            case KeyCode.KEY_T:
                console.log('Press t key');
                    this.Sprite.spriteFrame = this.TW;
                break;
        }
    }
    
    /* 根據主流程設置，自動切換語系 */
    start(){
        const _TADemo = find('Canvas/TADemo')!;  //找尋Canvas之下的TADemo節點(掛有luckyAce_TA腳本的節點)
        const _luckyAce = _TADemo.getComponent(luckyAce_TA);

        if (_luckyAce.language === LocalizedMode.CN) {
            this.Sprite.spriteFrame = this.CN;
            console.log('語言設置CN');
        }
        else if (_luckyAce.language  === LocalizedMode.EN){
            this.Sprite.spriteFrame = this.EN;
            console.log('語言設置EN');
        }
        else if (_luckyAce.language === LocalizedMode.TW){
            this.Sprite.spriteFrame = this.TW;
            console.log('語言設置TW');
        }else{
            console.error('更換語系錯誤');
        }
    } 

    onDestroy () {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

}


