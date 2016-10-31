const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;
const tabsBarJustifiedClass = 'mui-tabs__bar--justified',
      isActiveClass = 'mui--is-active';

const Tabs=React.createClass({
	getInitialState:function(){
		return {selectedIndex:0}
	}
	,propTypes:{
		panes:PT.array.isRequired,
		tabs:PT.array.isRequired
	}
	,childContextTypes:{
		getActiveTab:PT.func
	}
	,getActiveTab:function(name){
		return this.props.tabs[this.state.selectedIndex][0];
	}
	,getChildContext(){
		return {getActiveTab:this.getActiveTab};
	}
	,onTabClick:function(e){
		const selectedIndex=parseInt(e.target.dataset.i,10);
		this.setState({selectedIndex});
	}
	,render:function(){
		var tabEls = [], paneEls=[], _=this.context._;
		for (var i=0;i<this.props.tabs.length;i++) {
			const name=this.props.tabs[i][1];
			const label=this.props.tabs[i][1];
			const isActive = (i === this.state.selectedIndex) ? true : false;
			tabEls.push(E("li",{key:i,className:(isActive) ? isActiveClass : '',
				},E("a",{onClick:this.onTabClick,"data-i":i},label))
			);

			var className = 'mui-tabs__pane ';
      if (isActive) className += isActiveClass;
			const ref=(isActive?"activePane":"");
			paneEls.push(E("div",{ref,key:i,className},this.props.panes[i]));
		}
		return E("div",{},
				E("ul",{className:'mui-tabs__bar mui-tabs__bar--justified'},tabEls)
			,paneEls);
	}
});
module.exports=Tabs;