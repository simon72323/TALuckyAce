// import { gtCommEvents } from '@gt-npm/gtlibts';
// import { useGlobalEventDispatcher } from '@gt-npm/gtlibts/es/eventDispatcher';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RAGameMain')
export class RAGameMain extends Component {

    protected onLoad(): void {
        
    }

    protected start(): void {
        // 註冊監聽公版事件

        // Spin按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, this.onSpinBtnClick)

        // Turbo按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.TURBO, this.onTurboBtnClick)

        // 
        //useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND, ()=>{})
    }

    protected update(deltaTime: number): void {
        
    }

    protected onDestroy(): void {
        // 移除監聽公版事件
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.SPIN);
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.TURBO);
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND);
    }

    private onSpinBtnClick(): void {

    }

    private onTurboBtnClick(): void {

    }
}

