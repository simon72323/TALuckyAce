// import { gtCommEvents } from '@gt-npm/gtlibts';
import { h5GameTools, useGlobalEventDispatcher } from '@gt-npm/gt-lib-ts';
import { _decorator, Component, Node } from 'cc';
import { onOnLoadInfo } from './enum/RAInterface';
const { ccclass, property } = _decorator;

@ccclass('RAGameMain')
export class RAGameMain extends Component {

    protected onLoad(): void {
        // this.linkWs();

        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo)
    }

    protected start(): void {
        // this.linkWs();
        // 註冊監聽公版事件

        // Spin按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, this.onSpinBtnClick)

        // Turbo按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.TURBO, this.onTurboBtnClick)

        // 
        //useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND, ()=>{})

        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo)
    }

    protected update(deltaTime: number): void {
        
    }

    protected onDestroy(): void {
        // 移除監聽公版事件
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.SPIN);
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.TURBO);
        // useGlobalEventDispatcher().removeEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND);

        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO);
    }

    private async linkWs(){
        h5GameTools.UrlHelper.shared.domain = 'https://casino1.bb-in555.com';
        await h5GameTools.boot();
        h5GameTools.slotGameConnector.SlotGameConnector.shared.connect();
    }

    private onLoadInfo(data: onOnLoadInfo): void {
        console.log('onLoadInfo:', JSON.stringify(data));
    }
        

    private onSpinBtnClick(): void {

    }

    private onTurboBtnClick(): void {

    }
}

