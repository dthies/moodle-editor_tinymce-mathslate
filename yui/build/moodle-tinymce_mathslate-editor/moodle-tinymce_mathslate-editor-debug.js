YUI.add('moodle-tinymce_mathslate-editor', function (Y, NAME) {

//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Text editor mathslate plugin.
 *
 * @package    tinymce_mathslate
 * @copyright  2013 Daniel Thies  <dthies@ccal.edu>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

M.tinymce_mathslate = M.tinymce_mathslate|| {};
var CSS = {
   EDITOR: 'mathslate-tinymce',
   TOOLBOX: 'mathslate-toolbox',
   DRAGNODE: 'mathslate-toolbox-drag',
   UNDO: 'mathslate-undo-button',
   REDO: 'mathslate-redo-button',
   CLEAR: 'mathslate-clear-button',
   HELP: 'mathslate-help-button'
};
/* Constructor function for an editor of a page.
 * @method Editor
 * @param string editorID
 * @param string config
 */
M.tinymce_mathslate.Editor=function(editorID,config){
    this.node=Y.one(editorID);
    this.node.setHTML(M.util.get_string('nomathjax','tinymce_mathslate'));
    if(!MathJax){
        return;
    }
    this.node.setHTML('');
    //Set MathJax to us HTML-CSS rendering on all browsers
    MathJax.Hub.setRenderer('HTML-CSS');
    var toolboxID=Y.guid();
    var workID=Y.guid();
    this.node.addClass(CSS.EDITOR);
    //Place math editor on page
    this.node.appendChild(Y.Node.create('<div id="' +toolboxID +'" class="'+CSS.TOOLBOX+'">'));
    this.node.appendChild(Y.Node.create('<div id="' +workID +'" >'));

    var mje=new M.tinymce_mathslate.MathJaxEditor('#'+workID);
 
    var me=this;
    me.output = function(f){return mje.output(f);};

    var tbox={tools: [],
        fillToolBox: function(tools){
        function Tool(snippet) {
            function findBlank(snippet) {
                if (Array.isArray(snippet[2])) {
                    snippet[2].forEach(function(a){
                    if (Array.isArray(a)) {
                            findBlank(a);
                        }
                        else if(a==='[]') {
                        newID=Y.guid();
                        snippet[2][snippet[2].indexOf(a)]=['mn',{},'[]'];
                        }
                    });
                }
            }
            this.id=Y.guid();
            
            this.json=JSON.stringify(snippet);
            this.HTMLsnippet=[['span', {id: this.id}, [['math', {}, [snippet]]]]];
            
            findBlank(snippet);
            tbox.tools.push(this);
        }
        var tabs={children: [{label: "<math><mi>T</mi><mspace width=\"-.14em\" />"
             +"<mpadded height=\"-.5ex\" depth=\"+.5ex\" voffset=\"-.5ex\">"
             +"<mrow class=\"MJX-TeXAtom-ORD\"><mi>E</mi></mrow></mpadded>"
             +"<mspace width=\"-.115em\" /> <mi>X</mi> </math>",
        content: "<span id='latex-input'></span>"}]};
        tools.forEach(function(tab){
            var q=Y.Node.create('<p></p>');
            tab.tools.forEach(function(snippet){
                var t = new Tool(snippet);
                MathJax.HTML.addElement(q.getDOMNode(),'span',{},t.HTMLsnippet);
                if(snippet[0]&&snippet[0]!=='br'){q.append('&thinsp; &thinsp;');}
                });
            tabs.children.push({label: tab.label, content: q.getHTML()});
        });
        var tabview = new Y.TabView(
            tabs
            );
        if(Y.one('#'+toolboxID)){
            tabview.render('#'+toolboxID);
            new M.tinymce_mathslate.TeXTool('#latex-input',function(json){mje.addMath(json);});
        }
    
    },
        getToolByID: function(id){
        var t;
        this.tools.forEach(function(tool){
            if(tool.id){ if(tool.id===id) {t=tool;}}
        });
        return t;
    }
    };


    mje.canvas.on('drop:hit',function(e){
        if(e.drag.get('data')) {
            mje.addMath(e.drag.get('data'));
        }
    });
 /* function passed to MathJax to initiate dragging after math is formated
  * @function makeToolsDraggable
  */
    function makeToolsDraggable(){
        tbox.tools.forEach(function(tool) {
            Y.one('#'+tool.id).on('click',function(){
                mje.addMath(tool.json);
            });
            var d=new Y.DD.Drag({node: '#'+tool.id});
            d.set('data',tool.json);
            d.on('drag:start', function() {
                this.get('dragNode').addClass(CSS.DRAGNODE);
            });
            d.on('drag:end', function() {
                this.get('node').setStyle('top' , '0');
                this.get('node').setStyle('left' , '0');
                this.get('node').removeClass(CSS.DRAGNODE);
            });
        });
    }
    
    //Fetch configuration string for tools and initialyze
    Y.on('io:success',function(id,o){
        if(tbox.tools.length===0) {
            tbox.fillToolBox(Y.JSON.parse(o.response));
            MathJax.Hub.Queue(["Typeset",MathJax.Hub,toolboxID]);
            MathJax.Hub.Queue(makeToolsDraggable);
        }
    });
    if(config===undefined) {
        Y.io(M.tinymce_mathslate.config);
    } else {
        Y.io(config);
    }
};
    //Place buttons for internal editor functions
/*
    var undo=Y.Node.create('<button type="button" class="'
           +CSS.UNDO+'">'+ '<img class="iiicon" aria-hidden="true" role="presentation" width="16" height="16" src="'
           + M.util.image_url('undo', 'tinymce_mathslate') + '" title="'+M.util.get_string('undo','tinymce_mathslate')+'"/></button>');
    var redo=Y.Node.create('<button type="button" class="'
           +CSS.REDO+'">'+ '<img class="iiicon" aria-hidden="true" role="presentation" width="16" height="16" src="'
           + M.util.image_url('redo', 'tinymce_mathslate') + '" title="'+M.util.get_string('redo','tinymce_mathslate')+'"/></button>');
    var clear=Y.Node.create('<button type="button" class="'
           +CSS.CLEAR+'">'+ '<img class="iiicon" aria-hidden="true" role="presentation" width="16" height="16" src="'
           + M.util.image_url('delete', 'tinymce_mathslate') + '" title="'+M.util.get_string('clear','tinymce_mathslate')+'"/></button>');
*/



}, '@VERSION@', {
    "requires": [
        "dd-drag",
        "dd-proxy",
        "dd-drop",
        "event",
        "tabview",
        "io-base",
        "json",
        "moodle-tinymce_mathslate-textool",
        "moodle-tinymce_mathslate-mathjaxeditor"
    ]
});
