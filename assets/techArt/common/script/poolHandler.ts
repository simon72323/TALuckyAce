import { NodePool,instantiate,Node,Prefab } from 'cc';
/**
 * @api {class} poolHandler prefab節點創建回收
 * @apiName poolHandler
 * @apiGroup data
 * @apiDescription prefab節點創建回收
 */

/* 生成symbolNode物件池內容 */
export default class poolHandler {
    private poolTable:Map<string,NodePool>=null; //建立一個在緩存區的數據庫
    /**取得 */
    public get(pre:Prefab):Node{
        if( this.poolTable === null){
            this.poolTable = new Map([[pre.name,new NodePool()]]);
        }
        let pool = this.poolTable.get(pre.name);
        if( pool === undefined ){
            this.poolTable.set(pre.name,new NodePool());
            pool = this.poolTable.get(pre.name);
        }
        if( pool.size() > 0){
            return pool.get();
        }else{
            pool.put(instantiate(pre));
        }
        return pool.get();
    }
    /**退還 */
    public put(node:Node):void{
        if( this.poolTable === null){
            return;
        }
        let pool = this.poolTable.get(node.name);
        if( pool === null ){
            return;
        }
        pool.put(node);
    }
    public destroy():void{
        for( let tab in this.poolTable){
            let pool = this.poolTable.get(tab);
            pool.clear();
        }
        this.poolTable.clear();
        this.poolTable = null;
    }
}