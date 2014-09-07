YUI.add("moodle-tinymce_mathslate-mathjaxeditor",function(e,t){M.tinymce_mathslate=M.tinymce_mathslate||{},NS=M&&M.tinymce_mathslate||{};var n={SELECTED:"mathslate-selected",WORKSPACE:"mathslate-workspace",PREVIEW:"mathslate-preview",HIGHLIGHT:"mathslate-highlight",DRAGNODE:"mathslate-workspace-drag",DRAGGEDNODE:"mathslate-workspace-dragged",HELPBOX:"mathslate-help-box",PANEL:"mathslate-bottom-panel"},r={SELECTED:"."+n.SELECTED,HIGHLIGHT:"."+n.HIGHLIGHT};NS.MathJaxEditor=function(t){function p(){u.setHTML('<div class="'+n.PREVIEW+'">'+s.preview("tex")+"</div>"),s.getSelected()&&u.one("#"+s.getSelected())&&(a.get("node").one("#"+s.getSelected()).addClass(n.SELECTED),u.one("#"+s.getSelected()).addClass(n.SELECTED)),s.forEach(function(t){var i=a.get("node").one("#"+t[1].id);if(!i)return;i.setAttribute("title",u.one("#"+t[1].id).getHTML().replace(/<div *[^>]*>|<\/div>|<br>/g,"")),i.handleClick=function(e){var t=a.get("node").one(r.SELECTED);if(!t){e.stopPropagation(),s.select(this.getAttribute("id")),d();return}if(t===i){i.removeClass(n.SELECTED),u.one("#"+i.getAttribute("id")).removeClass(n.SELECTED),s.select();return}if(t.one("#"+this.getAttribute("id")))return;e.stopPropagation(),s.insertSnippet(i.getAttribute("id"),s.removeSnippet(t.getAttribute("id"))),s.select(),d()},i.on("click",function(e){this.handleClick(e)}),i.on("dblclick",function(e){e.stopPropagation(),s.removeSnippet(i.getAttribute("id")),d()});var o=a.get("node").one(r.SELECTED);if((!t[1]||!t[1]["class"]||t[1]["class"]!=="blank")&&(!o||!o.one("#"+i.getAttribute("id")))){var f=(new e.DD.Drag({node:i})).plug(e.Plugin.DDProxy,{resizeFrame:!1,moveOnEnd:!1});f.on("drag:start",function(){a.get("node").one(r.SELECTED)&&(s.select(),a.get("node").one(r.SELECTED).removeClass(n.SELECTED)),this.get("node").addClass(n.DRAGGEDNODE);var i=e.guid();this.get("dragNode").set("innerHTML",""),this.get("dragNode").addClass(n.DRAGNODE),MathJax.Hub.Queue(["addElement",MathJax.HTML,this.get("dragNode").getDOMNode(),"span",{id:i},[["math",{display:"block"},[e.JSON.parse(s.getItemByID(t[1].id))]]]]),MathJax.Hub.Queue(["Typeset",MathJax.Hub,i])}),f.on("drag:end",function(){this.get("node").removeClass(n.DRAGGEDNODE)})}var l=new e.DD.Drop({node:i});l.on("drop:hit",function(e){var n=e.drag.get("node").get("id");e.drag.get("data")?s.insertSnippet(t[1].id,s.createItem(e.drag.get("data"))):n!==t[1].id&&s.isItem(n)&&!a.get("node").one("#"+n).one("#"+t[1].id)&&s.insertSnippet(e.drop.get("node").get("id"),s.removeSnippet(n)),d()}),l.on("drop:enter",function(e){e.stopPropagation(),a.get("node").all(r.HIGHLIGHT).each(function(e){e.removeClass(n.HIGHLIGHT)}),this.get("node").addClass(n.HIGHLIGHT)}),l.on("drop:exit",function(e){e.stopPropagation(),this.get("node").removeClass(n.HIGHLIGHT)})})}function d(){s.rekey(),a.get("node").setHTML(""),MathJax.Hub.Queue(["addElement",MathJax.HTML,a.get("node").getDOMNode(),"math",{display:"block"},i]),MathJax.Hub.Queue(["Typeset",MathJax.Hub,"canvas"]),MathJax.Hub.Queue(p)}var i=[],s=new NS.mSlots;s.slots.push(i),this.workspace=e.one(t).append('<div id="canvas2" class="'+n.WORKSPACE+'"/>');var o=e.one(t).appendChild(e.Node.create("<form></form>")),u=e.one(t).appendChild(e.Node.create('<div class="'+n.PANEL+'"/>'));u.delegate("click",function(e){a.get("node").one("#"+this.getAttribute("id")).handleClick(e)},"div");var a=new e.DD.Drop({node:this.workspace.one("#canvas2")});this.canvas=a,this.canvas.get("node").on("click",function(){s.select(),d()});var f=e.Node.create('<button type="button" class="'+n.UNDO+'"'+'" title="'+M.util.get_string("undo","tinymce_mathslate")+'"/>'+"<math><mo>&#x25C1;</mo></math>"+"</button>"),l=e.Node.create('<button type="button" class="'+n.REDO+'"'+'" title="'+M.util.get_string("redo","tinymce_mathslate")+'"/>'+"<math><mo>&#x25B7;</mo></math>"+"</button>"),c=e.Node.create('<button type="button" class="'+n.CLEAR+'"'+'" title="'+M.util.get_string("clear","tinymce_mathslate")+'"/>'+"<math><mi>&#x2718;</mi></math>"+"</button>"),h=e.Node.create('<button type="button" class="'+n.HELP+'" title="'+M.util.get_string("help","tinymce_mathslate")+'">'+"<math><mi>&#xE47C;</mi></math>"+"</button>");o.appendChild(c),o.appendChild(f),o.appendChild(l),o.appendChild(h),l.on("click",function(){s=s.redo(),i=s.slots[0],d()}),f.on("click",function(){s=s.undo(),i=s.slots[0],d()}),c.on("click",function(){e.one(r.SELECTED)?s.removeSnippet(e.one(r.SELECTED).getAttribute("id")):(i=[],s.next=new NS.mSlots,s.next.previous=s,s=s.next,s.slots.push(i)),d()}),h.on("click",function(){u.setHTML('<iframe src="'+NS.help+'" style="width: '+u.getStyle("width")+'" class="'+n.HELPBOX+'"/>')}),this.render=d,this.addMath=function(t){if(!t)return;e.one(r.SELECTED)?s.insertSnippet(e.one(r.SELECTED).getAttribute("id"),s.createItem(t)):s.append(s.createItem(t)),d()},this.clear=function(){e.one(r.SELECTED)?s.removeSnippet(e.one(r.SELECTED).getAttribute("id")):(i=[],s.next=new NS.mSlots,s.next.previous=s,s=s.next,s.slots.push(i)),d()},this.output=function(t){function n(e){if(typeof e!="object")return e;var t=e.slice(0);return t.forEach(function(e,r){if(typeof e!="object")return;if(e[1]&&e[1]["class"]){t[r]="[]";return}e[1]&&e[1].id&&delete e[1].id,e[2]&&(e[2]=n(e[2]))}),t}return t==="MathML"?a.get("node").one("script").getHTML():t==="HTML"?a.get("node").one("span").getHTML():t==="JSON"?e.JSON.stringify(n(e.JSON.parse(e.JSON.stringify(i)))):s.output(t)},this.getHTML=function(){return a.get("node").one("span").getHTML()},this.redo=function(){s=s.redo(),i=s.slots[0],d()},this.undo=function(){s=s.undo(),i=s.slots[0],d()},d()}},"@VERSION@",{requires:["moodle-tinymce_mathslate-snippeteditor","dd-proxy","dd-drop"]});
