YUI.add("moodle-tinymce_mathslate-snippeteditor",function(e,t){M.tinymce_mathslate=M.tinymce_mathslate||{};var n=M&&M.tinymce_mathslate||{};n.mSlots=function(){function s(){n.splice(r);var e=i.slice(0),t=[];e.forEach(function(e){t.push(e.slice(0))}),n[r]=[e,t]}function o(){i.splice(0),i[0]&&i.pop();var e=n[r][0],t=n[r][1];e.forEach(function(e,n){e.splice(0),e[0]&&e.pop(),t[n].forEach(function(t){e.push(t)}),i.push(e)})}var t,n=[],r=0,i=[];this.slots=i,this.redo=function(){return n[r+1]?(r++,o(),this):this.next||this},this.undo=function(){return r===0?this.previous||this:(r--,r===0?(i[0].pop(),this):(o(),this))},this.createItem=function(t){function n(t){Array.isArray(t[2])&&t[2].forEach(function(r){if(Array.isArray(r))n(r);else if(r==="[]"){var s="MJX-"+e.guid();i.push([["mo",{id:s,"class":"blank",tex:[""]},"\u25fb"]]),t[2][t[2].indexOf(r)]=["mrow",{},i[i.length-1]]}})}var r="MJX-"+e.Node.create("<span></span").generateID(),s;return s=e.JSON.parse(t),s[1].id=r,n(s),s},this.getItemByID=function(t){var n;return this.slots.forEach(function(r){r.forEach(function(r){r[1].id===t&&(n=e.JSON.stringify(r))})}),n},this.isItem=function(e){var t=!1;return this.slots.forEach(function(n){if(t)return;n.forEach(function(n){n[1].id===e&&(t=!0)})}),t},this.removeSnippet=function(e){var t=0;return this.slots.forEach(function(n){n.forEach(function(r){r[1].id===e&&(t=r,n.splice(n.indexOf(r),1))})}),t},this.insertSnippet=function(e,t){var n=0;this.slots.forEach(function(r){r.forEach(function(i){if(n!==0)return;i[1].id===e&&(n=i,r.splice(r.indexOf(n),0,t))})}),r++,this.next=null,s();return},this.append=function(e){i[0].push(e),r++,this.next=null,s();return},this.forEach=function(e){this.slots.forEach(function(t){t.forEach(function(n){e(n,t)})})},this.rekey=function(){var t=this;this.slots.forEach(function(n){n.length===0?n.push(["mo",{id:"MJX-"+e.guid(),"class":"blank",tex:[""]},"\u25fb"]):n.forEach(function(r){if(!r[1])return;r[1]["class"]&&r[1]["class"]==="blank"&&n.length>1&&t.removeSnippet(r[1].id),r[1].id&&(r[1].id="MJX-"+e.guid())})})},this.output=function(e){function t(n){var r="";if(typeof n=="string")return n;if(n[1]&&n[1][e]){var i=0;while(n[1][e][i])r+=n[1][e][i++],n[2]&&typeof n[1][e][i]=="number"&&(r+=t(n[2][n[1][e][i]])),i++}else n[2]&&(typeof n[2]=="string"?r+=n[2]:n[2].forEach(function(e){r+=t(e)}));return r}var n="";return i[0].forEach(function(e){n+=t(e)}),n},this.preview=function(e){function t(n){var r="";if(typeof n=="string")return n;n[1]&&n[1].id&&(r=r+'<div id = "'+n[1].id+'">');if(n[1]&&e&&n[1][e]){var i=0;while(n[1][e][i])r+=n[1][e][i++],n[2]&&typeof n[1][e][i]=="number"&&(r+=t(n[2][n[1][e][i]])),i++}else n[2]&&(typeof n[2]=="string"?e&&(r+=n[2]):n[2].forEach(function(e){r+=t(e)}));return n[1]&&n[1]["class"]&&n[1]["class"]==="blank"&&(r+="<br>"),n[1]&&n[1].id&&(r+="</div>"),r}var n="";return i[0].forEach(function(e){n+=t(e)}),n},this.select=function(e){t=null,this.slots.forEach(function(n){n.forEach(function(n){n[1].id===e&&(t=n)})})},this.getSelected=function(){return t&&t[1].id}}},"@VERSION@",{requires:["json"]});
