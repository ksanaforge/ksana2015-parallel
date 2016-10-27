const model=require("./src/units/model");
const TwoColumnMode=require("./src/modes/twocolumnmode");
const CorpusBindingMode=require("./src/modes/corpusbindingmode");
const CorpusNoteMode=require("./src/modes/corpusnotemode");
const CorpusTabMode=require("./src/modes/corpustabmode");
const localization=require("./src/units/localization");
module.exports={model,localization,
	TwoColumnMode,CorpusBindingMode,CorpusNoteMode,CorpusTabMode};