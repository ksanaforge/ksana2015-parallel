var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var TocResult=React.createClass({
	getInitialState:function(){
		return {res:[]};
	},
	componentDidMount:function(){
		this.setState({res:this.search()})
	}
	,sortByDepth:function(res){
		var T=this.props.toc;
		return res.sort(function(a,b){
			return T[a].d-T[b].d;
		});
	}
	,sortByLength:function(res){
		var T=this.props.toc;
		return res.sort(function(a,b){
			return T[a].t.length-T[b].t.length;
		});
	}
	,search:function(tofind,order,toc){
		var res=[];
		tofind=tofind||this.props.tofind,
		order=order||this.props.order,
		toc=toc||this.props.toc;
		var pat=new RegExp(tofind);
		for (var i=0;i<toc.length;i++) {
			var m=toc[i].t.match(pat);
			if (m) {
				res.push(i);
			}
		}
		if (order===2) this.sortByDepth(res);
		else if (order===3) this.sortByLength(res);
		return res;
	}
	,componentWillReceiveProps:function(nextProps){
		if (nextProps.tofind!==this.props.tofind ||nextProps.order!==this.props.order) {
	    this.setState({res:this.search(nextProps.tofind,nextProps.order)});
		}
	}
	,highlightText:function(text) {
		var pat=new RegExp(this.props.tofind);
		var out=[],lastidx=0;
		text.replace(pat,function(t,key){
			out.push(text.substring(lastidx,key));
			out.push(E("span",{className:"found",key},t));
			lastidx=key+t.length;
		});
		out.push(text.substr(lastidx));
		return out;
	}
	,onSelect:function(e){
		var n=parseInt(e.target.dataset.n);
		if (isNaN(n)) {
			n=parseInt(e.target.parentElement.dataset.n);
			console.log(n)
		}
		this.props.onSelect(this,this.props.toc[n]);
	}
	,renderNode:function(n,key){
		var item=this.props.toc[n];
		var hl=this.highlightText(item.t);
		return E("div",{className:"foundline",key,onClick:this.onSelect,"data-n":n},
			E("div",{style:{fontFamily:item.f}},hl)
		);
	}
	,render:function(){
		return E("div",{},
			this.state.res.map(this.renderNode)
		);
	}
});
module.exports=TocResult;