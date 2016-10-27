const React=require("react");
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
	,renderTab:function(tab,idx){
		return E("div",{},tab);
	}
	,onTabClick:function(e){
		const selectedIndex=parseInt(e.target.dataset.i,10);
		this.setState({selectedIndex});
	}
	,render:function(){
		var tabEls = [], paneEls=[];
		for (var i=0;i<this.props.tabs.length;i++) {
			const label=this.props.tabs[i];
			const isActive = (i === this.state.selectedIndex) ? true : false;
			tabEls.push(E("li",{key:i,className:(isActive) ? isActiveClass : '',
				},E("a",{onClick:this.onTabClick,"data-i":i},label))
			);

			var className = 'mui-tabs__pane';
      if (isActive) className += isActiveClass;

			paneEls.push(E("div",{key:i,className},this.props.panes[i]));
		}

		return E("div",{},
				E("ul",{className:'mui-tabs__bar'},tabEls)
			,paneEls);
	}
});
module.exports=Tabs;