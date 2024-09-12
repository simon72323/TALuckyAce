import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/* 掛在特效上，時間到刪除自身 */
@ccclass('destroySelf_TA')
export class destroySelf_TA extends Component {
    start() {
        this.scheduleOnce(() => {
            this.node.destroy();//刪除自身
        }, 1) 
    }

}


