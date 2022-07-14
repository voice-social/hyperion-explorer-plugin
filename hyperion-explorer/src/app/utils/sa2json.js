class SA2JSON {
    
    constructor() {
    }


    buildJSON (obj) {
		let res = {};		
		for (var ro in obj) {	
			let key = this.processSAtypes(obj[ro].key, true);
			let val = this.processSAtypes(obj[ro].value, false);
			res[key] = val;		
		}	
		return res;
    }
//--------------------------------------------------
    
    jsonSA_TYPE_PAIR ( obj, isKey ) {
		let res = {}
		let key = this.processSAtypes(obj.first, true)
		let val = this.processSAtypes(obj.second, isKey)
		
		if (isKey) {
			return key+"-"+val
		} else {
			res[key] = val;	
		}
		return res;	
    }

    jsonSA_TYPE_MAP_VEC ( obj, isKey ) {
		let res = {}
		for (var mv in obj) {
			let key = this.processSAtypes(obj[mv].key, true);		
			let val = [];
			for (var ve in obj) {
			val.push( this.processSAtypes(obj[mv].value[ve], false) );
			}
			
			res[key] = val;
		}
		return res;	
    }

    jsonSA_TYPE_VEC  ( obj )  {
		let res = []
		for (var ve in obj) {
			if (obj[ve])
			res.push( this.processSAtypes(obj[ve], false ) );
		}		
		return res;	
    }

    processSAtypes(obj, isKey) {
		let otype = obj[0];	
		let o = obj[1];
		if ( otype == "TYPE_PAIR" ) {
			o = this.jsonSA_TYPE_PAIR (o, isKey);
		} else if ( otype == "TYPE_MAP_VEC" ) {
			o = this.jsonSA_TYPE_MAP_VEC (o, isKey);
		} else if ( otype == "TYPE_VEC" ) {
			o = this.jsonSA_TYPE_VEC (o);
		} else if ( otype == "TYPE_MAP" ) {
			// todo !!!!!
		} else if ( otype == "TYPE_SET" ) {
			// todo !!!!!
		} else if ( otype == "asset" ) {
			if (isKey) o = this.makeKey(o);
		} else if ( otype == "symbol" ) {
			// noting to do
		} else if ( otype == "extended_asset" ) {
			if (isKey) 	o = this.makeKey(o.contract) + "-" + this.makeKey(o.quantity)			
		} else if ( otype == "extended_symbol" ) {
			if (isKey) 	o = this.makeKey(o.contract) + "-" + this.makeKey(o.sym)
		} else {
			if (isKey) o = this.makeKey(o);
		}
		return o;
    }

    makeKey(s)  {
		let res = s.toString().replace(/ /g, '_');
		res = res.replace(/\./g, '_');
		return res;
    }
    
	arr_val2Str( o ) {
		let r = [];
		for ( var k in o) {
			if (typeof o[k] === 'object') {
				if (Array.isArray(o[k])) {
					r.push (this.arr_val2Str(o[k]));
				} else {
					r.push(this.obj_val2Str(o[k]));
				}
			} else {
				r.push('' + o[k]);
			}
		};
		return r;
			
	}
	
	obj_val2Str( o ) {
		let r = {};
		Object.keys(o).forEach( k => {
			//console.log(typeof o[k]);
			if (typeof o[k] === 'object') {
				if (Array.isArray(o[k])) {
					//console.log(typeof o[k]);
					//console.log(o[k]);
					r[k] = this.arr_val2Str(o[k]);
				} else {
					r[k] = this.obj_val2Str(o[k]);
				}
			} else {
				r[k] = '' + o[k];
			}
		});
		return r;
    }
}

module.exports = {SA2JSON};
