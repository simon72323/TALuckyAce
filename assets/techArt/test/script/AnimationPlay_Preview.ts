import { _decorator, Component, Node, Animation, SkeletalAnimation, input, Input, EventKeyboard, KeyCode, Prefab, CCBoolean, CCString } from 'cc';
const { ccclass, property, type } = _decorator;

/*||功能：掛載在動態物件上，以熱鍵控制動作的播放測試||*/
@ccclass('AnimationPlay_Preview')
export class AnimationPlay_Preview extends Component {

    @property({ type: CCBoolean, displayName:'是否接續播放待機動作'})
    public playIdle = false;

    @property({ type: CCString, displayName:'待機動作名稱', visible() { return (this.playIdle === true); }})  //playIdle勾選true，此欄位才會顯示
    public idleClipName = '';

    AnimName: string[] = [];
    skeAnimationNode: SkeletalAnimation = null;
    AnimationNode: Animation = null;
    
    onLoad () {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    start() {
        this.skeAnimationNode = this.node.getComponent(SkeletalAnimation);
        this.AnimationNode = this.node.getComponent(Animation);
        if (this.skeAnimationNode != null) {
            console.log('可使用動作數量：'+ this.skeAnimationNode.clips.length);
            for (let i = 0; i < this.skeAnimationNode.clips.length; i++) {
                let clipName = this.skeAnimationNode.clips[i].name; //依序取得動作名稱
                this.AnimName.push(clipName);  //填入動作名稱陣列
                console.log('動作'+ i +'：'+ this.AnimName[i]);
            }    
        }else{
            console.log('可使用動作數量：'+ this.AnimationNode.clips.length);
            for (let i = 0; i < this.AnimationNode.clips.length; i++) {
                let clipName = this.AnimationNode.clips[i].name;
                this.AnimName.push(clipName);
                console.log('動作'+ i +'：'+ this.AnimName[i]);
            }
        }
    }

    onKeyDown (event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.NUM_1:
                console.log('Press 1 key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.play(this.AnimName[0]);  //播放動作
                    if (this.playIdle == true) {
                        this.skeAnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this); //探測動作是否播放完畢，若完成執行指定涵式
                    }
                }else{this.AnimationNode.play(this.AnimName[0])};
                if (this.playIdle == true) {
                    this.AnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
                }
                console.log('播放動作：'+ this.AnimName[0]);
                break;
            case KeyCode.NUM_2:
                console.log('Press 2 key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.play(this.AnimName[1]);  //播放動作
                    if (this.playIdle == true) {
                        this.skeAnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this); //探測動作是否播放完畢，若完成執行指定涵式
                    }
                }else{this.AnimationNode.play(this.AnimName[1])};
                if (this.playIdle == true) {
                    this.AnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
                }
                console.log('播放動作：'+ this.AnimName[1]);
                break;
            case KeyCode.NUM_3:
                console.log('Press 3 key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.play(this.AnimName[2]);  //播放動作
                    if (this.playIdle == true) {
                        this.skeAnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this); //探測動作是否播放完畢，若完成執行指定涵式
                    }
                }else{this.AnimationNode.play(this.AnimName[2])};
                if (this.playIdle == true) {
                    this.AnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
                }
                console.log('播放動作：'+ this.AnimName[2]);
            break;
            case KeyCode.NUM_4:
                console.log('Press 4 key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.play(this.AnimName[3]);  //播放動作
                    if (this.playIdle == true) {
                        this.skeAnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this); //探測動作是否播放完畢，若完成執行指定涵式
                    }
                }else{this.AnimationNode.play(this.AnimName[3])};
                if (this.playIdle == true) {
                    this.AnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
                }
                console.log('播放動作：'+ this.AnimName[3]);
                break;
            case KeyCode.NUM_5:
                console.log('Press 5 key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.play(this.AnimName[4]);  //播放動作
                    if (this.playIdle == true) {
                        this.skeAnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this); //探測動作是否播放完畢，若完成執行指定涵式
                    }
                }else{this.AnimationNode.play(this.AnimName[4])};
                if (this.playIdle == true) {
                    this.AnimationNode?.on(Animation.EventType.FINISHED, this.onAnimationFinished, this);
                }
                console.log('播放動作：'+ this.AnimName[4]);
                break;
            case KeyCode.KEY_P:
                console.log('Press P key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.pause();  //暫停播放動作
                }else{this.AnimationNode.pause()};
                console.log("暫停播放");
                break;
            case KeyCode.KEY_R:
                console.log('Press R key');
                if (this.skeAnimationNode != null) {
                    this.skeAnimationNode.resume();  //恢復播放動作 
                }else{this.AnimationNode.resume()};
                console.log("恢復播放");
                break;
        }
    }

    onAnimationFinished(){
        if (this.skeAnimationNode != null) {
            this.skeAnimationNode.play('idle');
        }else{
            this.AnimationNode.play('idle');
        }
    }
}


