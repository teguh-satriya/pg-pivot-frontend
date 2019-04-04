export const FlattenObject = (obj:Object, name?:string, stem?:string) => {
    let out:any = {};
    let newName = (typeof name !== 'undefined')? name:'';
    let newStem = (typeof stem !== 'undefined' && stem !== '') ? stem + '_' + newName : newName;

    if (typeof obj !== 'object') {
        out[newStem] = obj;
        return out;
    }

    for (let [p,o] of Object.entries(obj)) {
        let prop = FlattenObject(o, p, newStem);
        out = MergeObject([out, prop]);
    }

    return out;
} 

export const MergeObject = (objects:Object) => {
    let out:any = {};

    for (let [i,obj] of Object.entries(objects)) {
        if(typeof obj === "object"){
            for (let [p,o] of Object.entries(obj)) {
                out[p] = o;
            }
        }
    }

    return out;
}

