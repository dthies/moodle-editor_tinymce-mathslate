YUI.add('moodle-tinymce_mathslate-config', function (Y, NAME) {

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

if (M) {M.tinymce_mathslate = M.tinymce_mathslate || {};}
var NS = M && M.tinymce_mathslate || {};
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
 * @method TabEditor
 * @param string editorID
 * @param string config
 */
NS.TabEditor=function(editorID,config){
    var me=this;
    this.node=Y.one(editorID);
        this.node.setHTML(M.util.get_string('nomathjax','tinymce_mathslate'));
    if(typeof MathJax === 'undefined'){
        return;
    }
    //Set MathJax to us HTML-CSS rendering on all browsers
    MathJax.Hub.setRenderer('HTML-CSS');
    var toolboxID = Y.guid();
    var workID= Y.guid();
    this.node.addClass(CSS.EDITOR);
    //Place math editor on page
    this.node.setHTML('<div id="' +toolboxID +'" class="'+CSS.TOOLBOX+'">'
            + '<div style="background-color: white; color: green; height: 300px; line-height: 75px; font-size: 18px; text-align:center"><br />Mathslate Mathematics Editor<br />'
            + 'Version 1.0</div><script type="math/tex">\\quad</script><math> <mo> </mo></math></div>'
            + '<div id="' +workID +'" ></div>');

    var tbox={tools: [],
        Tool: function(snippet) {
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

            function title(s){
                if(typeof s==='string'){return s;}
                if(typeof s[1]==='undefined'){return '';}
                var o='';
                if(typeof s[1].tex!=='undefined'){
                    s[1].tex.forEach(function(t){
                         if(typeof t==='string'){o+=t;}
                         else {o+=title(s[2][t]);}
                    });
                    return o;
                }
                if(typeof s[2]==='string'){return s[2];}
                if(typeof s[2]==='undefined'){return '';}
                s[2].forEach(function(t){o+=title(t);});
                return o;
            }
            this.json=JSON.stringify(snippet);
            this.HTMLsnippet=[['span', {id: this.id, title: title(snippet)}, [['math', {}, [snippet]]]]];
            this.remove = function () {
                return this.parent.splice(this.parent.indexOf(snippet),1);
            };

            findBlank(snippet);
            tbox.tools.push(this);
        },
        fillToolBox: function(tools){
            this.tabs = tools;
            this.tools = [];
            var tabs={children: []};
            /*
            MathJax.Hub.Register.StartupHook('TeX Jax Config', function() {
                MathJax.Ajax.Require("[MathJax]/extensions/toMathML.js");
                tabs.children.push({
                    label: "<span title=\"TeX\"><math><mi>T</mi><mspace width=\"-.14em\"/>"
                        +"<mpadded height=\"-.5ex\" depth=\"+.5ex\" voffset=\"-.5ex\">"
                        +"<mrow class=\"MJX-TeXAtom-ORD\"><mi>E</mi></mrow></mpadded>"
                        +"<mspace width=\"-.115em\" /> <mi>X</mi> </math></span>",
                    content: "<span id='latex-input'></span>"
                });
            });
            */

            this.outputJSON = function() {
                var output = '[';
                var tabcontent = [];
                tools.forEach(function(tab) {
                    var tabmembers = [];

                    Y.one(editorID).one('.yui3-tabview-content').get('children').item(1).get('children').item(tools.indexOf(tab)).all('.yui3-dd-drop').each(function(t) {
                        tabmembers.push('\n            ' + tbox.getToolByID(t.getAttribute('id')).json);
                    });
                    tabcontent.push('\n    {"label": "' + tab.label + '",\n        "tools": [' + tabmembers.join(',') + ']\n    }');
                });
                output += tabcontent.join(',') + '\n]';

                Y.one('#json-data').getDOMNode().value =  output;
            }

            MathJax.Hub.Register.StartupHook('End', function() {
                tools.forEach(function(tab){

                    var q=Y.Node.create('<p></p>');
                    tab.tools.forEach(function(snippet){
                        var t = new tbox.Tool(snippet);
                        t.parent = tab.tools;
                        MathJax.HTML.addElement(q.getDOMNode(),'span',{}, [' ', ['span', {}, t.HTMLsnippet], ' '] );
                        if(snippet[0]&&snippet[0]!=='br'&&false){
                            q.append('&thinsp; &thinsp;');}
                    });
                    tabs.children.push({label: tab.label, content: q.getHTML()});
                });
                var tabview = new Y.TabView(
                    tabs
                );
                //var mje=new NS.MathJaxEditor('#'+workID);

                /* me.output = function(f){return mje.output(f);};

                mje.canvas.on('drop:hit',function(e){
                    if(e.drag.get('data')) {
                        mje.addMath(e.drag.get('data'));
                    }
                });
                */

                if (Y.one('#'+toolboxID)) {
                    Y.one('#'+toolboxID).setHTML('');
                    tabview.render('#'+toolboxID);
                    if (Y.one('#latex-input')) {
                        //new NS.TeXTool('#latex-input',function(json){mje.addMath(json);});
                    }
                }
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,toolboxID]);
                /* function passed to MathJax to initiate dragging after math is formated
                 * @function makeToolsDraggable
                 */
                function makeToolsDraggable(){
                    tbox.tools.forEach(tbox.makeToolDraggable);
                    Y.one('#'+toolboxID).all('li').each(function(li) {
                        console.log(li);
                        var drop=new Y.DD.Drop({node: li});
                        drop.on('drop:hit', function(e) {
                            var id = e.drag.get('node').getAttribute('id');
                            var index = li.get('parentNode').get('children').indexOf(li);
                            var tool = tbox.getToolByID(id);
                            tools[index].tools.push(tool.remove());
                            tool.parent = tools[index].tools;
                            li.get('parentNode').get('parentNode').get('children').item(1).get('children').item(index).appendChild(Y.one('#'
                               + id).get('parentNode').get('parentNode'));
                            tbox.outputJSON();
                        });
                    });
                }

                MathJax.Hub.Queue(makeToolsDraggable);
            });
        },
        makeToolDraggable: function(tool) {
            Y.one('#'+tool.id).on('dblclick',function(){
                //mje.addMath(tool.json);
                tbox.tools.splice(tbox.tools.indexOf(tool),1);
                this.get('parentNode').get('parentNode').remove();
                tool.remove();
                tbox.outputJSON();
            });
            var drop=new Y.DD.Drop({node: '#'+tool.id});
            drop.on('drop:hit', function(e) {
                var dragTool = null;
                var dragNode = Y.one('#' + e.drag.get('node').get('id')).get('parentNode').get('parentNode');
                tbox.tools.forEach(function (t) {
                    if (t.id ===  e.drag.get('node').get('id')) {
                        dragTool = t;
                    }
                });
                this.get('node').get('parentNode').get('parentNode').get('parentNode').insertBefore(dragNode,this.get('node').get('parentNode').get('parentNode'));
                tool.parent.splice(tool.parent.indexOf(tool),0,dragTool.remove);
                tbox.outputJSON();
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

        },
        getToolByID: function(id){
            var t;
            this.tools.forEach(function(tool){
                if(tool.id){ if(tool.id===id) {t=tool;}}
            });
            return t;
        }
    };


    MathJax.Hub.Queue(['Typeset', MathJax.Hub,toolboxID]);

    //Fetch configuration string for tools and initialyze
    Y.on('io:success',function(id,o){
        if(tbox.tools.length===0) {
            //Y.one('#json-data').setAttribute('value', o.response);
            Y.one('#json-data').getDOMNode().value =  o.response;
            MathJax.Hub.Queue(['fillToolBox',tbox,Y.JSON.parse(o.response)]);
        }
    });
    this.addTool = function(snippet) {
        var q = Y.one(editorID).one('.yui3-tab-panel-selected');
            var t = new tbox.Tool(["mrow",{},Y.JSON.parse(snippet)]);
            var index = Y.one(editorID).one('ul').get('children').indexOf(Y.one(editorID).one('.yui3-tab-selected'));
            t.parent = tbox.tabs[index].tools;
            MathJax.HTML.addElement(q.getDOMNode(),'span',{}, [' ', ['span', {}, t.HTMLsnippet], ' '] );
            MathJax.Hub.Queue(['Typeset',MathJax.Hub,q.getDOMNode()]);
            MathJax.Hub.Queue(['makeToolDraggable', tbox, t]);
            MathJax.Hub.Queue(['outputJSON', tbox]);
    };
    if(config===undefined) {
        Y.io(NS.config);
    } else {
        Y.io(config);
    }
    Y.one('#json-data').on('change', function() {
        MathJax.Hub.Queue(['fillToolBox',tbox, Y.JSON.parse(this.getDOMNode().value)]);
    });
};


}, '@VERSION@', {
    "requires": [
        "dd-drag",
        "dd-proxy",
        "dd-drop",
        "event",
        "event-delegate",
        "event-valuechange",
        "tabview",
        "io-base",
        "json",
        "moodle-tinymce_mathslate-textool",
        "moodle-tinymce_mathslate-mathjaxeditor"
    ]
});
