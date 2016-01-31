YUI.add("moodle-tinymce_mathslate-editor",function(e,t){M&&(M.tinymce_mathslate=M.tinymce_mathslate||{});var n=M&&M.tinymce_mathslate||{},r=window.MathJax,i={TOOLBOX:"mathslate-toolbox",DRAGNODE:"mathslate-toolbox-drag",UNDO:"mathslate-undo-button",REDO:"mathslate-redo-button",CLEAR:"mathslate-clear-button",HELP:"mathslate-help-button"};n.Editor=function(t,s,o){o=o||{texInput:!0};var u=this;this.node=e.one(t),this.node.setHTML(M.util.get_string("nomathjax","tinymce_mathslate"));if(typeof r=="undefined")return;r.Hub.processSectionDelay=0;var a=e.guid(),f=e.guid(),l=e.guid();this.node.addClass(i.EDITOR),this.node.setHTML('<div id="'+a+'" class="'+i.TOOLBOX+'" style="positon: relative">'+'<div style="background-color: white; color: green; height: 300px; line-height: 75px; '+'font-size: 18px; text-align:center"><br />Mathslate Mathematics Editor<br />'+'Version 1.2 Alpha</div><script type="math/tex">\\quad</script><math> <mo> </mo></math></div>'+'<div id="'+l+'" ></div>');var c=new n.MathJaxEditor("#"+l),h={tools:[],Tool:function(t){function n(e){Array.isArray(e[2])&&e[2].forEach(function(t){Array.isArray(t)?n(t):t==="[]"&&(e[2][e[2].indexOf(t)]=["mn",{},"[]"])})}function r(e){if(typeof e=="string")return e;if(typeof e[1]=="undefined")return"";var t="";return typeof e[1].tex!="undefined"?(e[1].tex.forEach(function(n){typeof n=="string"?t+=n:t+=r(e[2][n])}),t):typeof e[2]=="string"?e[2]:typeof e[2]=="undefined"?"":(e[2].forEach(function(e){t+=r(e)}),t)}this.id=e.guid(),this.json=JSON.stringify(t),this.HTMLsnippet=[["span",{id:this.id,title:r(t)},[["math",{},[t]]]]],n(t),h.tools.push(this)},fillToolBox:function(t,n){var i={children:[]},s;return r.Hub.Register.StartupHook("TeX Jax Config",[this,function(){if(!o.texInput)return;r.Ajax.Require("[MathJax]/extensions/toMathML.js"),i.children.push({label:'<span title="TeX"><math><mi>T</mi><mspace width="-.14em"/><mpadded height="-.5ex" depth="+.5ex" voffset="-.5ex"><mrow class="MJX-TeXAtom-ORD"><mi>E</mi></mrow></mpadded><mspace width="-.115em" /> <mi>X</mi> </math></span>',content:'<span id="'+f+'"></input></span>'}),c.toolbar.append('<input id="tex-input" type="text" />'),c.toolbar.on("submit",function(e){e.preventDefault()})}]),r.Hub.Register.StartupHook("End",function(){t.forEach(function(t){var n=e.Node.create("<p></p>");t.tools.forEach(function(e){if(e[0]&&e[0]==="br"){n.append("<br />");return}var t=new h.Tool(e);n.append("<span> "+c.toMathML(t.HTMLsnippet)+" </span>")}),i.children.push({label:t.label,content:n.getHTML()})}),s=new e.TabView(i),u.output=function(e){return c.output(e)},e.one("#"+n)&&(e.one("#"+n).setHTML(""),s.render("#"+n),e.one("#"+f)&&(r.Ajax.Require("[Mathslate]/textool.js"),r.Hub.Register.StartupHook("TeX Input Tool Ready",function(){var t=new e.DD.Drag({node:e.one("#"+f)});new r.Mathslate.TeXTool("#"+f,function(e){c.addMath(e),t.set("data",e)}),t.on("drag:end",function(){this.get("node").setStyle("top","0"),this.get("node").setStyle("left","0")})}))),r.Hub.Queue(["Typeset",r.Hub,n]),r.Hub.Queue(function(){h.tools.forEach(function(t){e.one("#"+n)&&e.one("#"+n).one("#"+t.id)&&h.registerTool(t)})})}),this.tabview=s,s},getToolByID:function(e){var t;return this.tools.forEach(function(n){n.id&&n.id===e&&(t=n)}),t},registerTool:function(t){if(!e.one("#"+t.id))return;var n=new e.DD.Drag({node:"#"+t.id});n.set("data",t.json),n.on("drag:start",function(){this.get("dragNode").addClass(i.DRAGNODE)}),n.on("drag:end",function(){this.get("node").setStyle("top","0"),this.get("node").setStyle("left","0"),this.get("node").removeClass(i.DRAGNODE)})}};r.Hub.Queue(["Typeset",r.Hub,a]);var p;e.on("io:success",function(t,n){p.id===t&&r.Hub.Queue(["fillToolBox",h,e.JSON.parse(n.response),a])}),s===undefined?p=e.io(n.config):p=e.io(s),this.tbox=h,this.mje=c,c.canvas.on("drop:hit",function(e){e.drag.get("data")&&c.addMath(e.drag.get("data"))}),e.one("#"+a).delegate("click",function(){var e=h.getToolByID(this.getAttribute("id"));e&&c.addMath(e.json)},"span .yui3-dd-draggable"),this.focusTeXInput=function(e){var t=this.mje.toolbar.one("#tex-input");if(!t)return;e.type==="key"&&this.tbox.tabview.selectChild(0),t.focus()},e.one(t+", #"+a).on("click",this.focusTeXInput,this),this.node.on("key",this.focusTeXInput,"down:",this)}},"@VERSION@",{requires:["dd-drag","dd-proxy","dd-drop","event","tabview","io-base","json","moodle-tinymce_mathslate-textool","moodle-tinymce_mathslate-mathjaxeditor"]});
