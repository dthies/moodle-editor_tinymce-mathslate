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
 * @param string toolboxID
 * @param string config
 */
NS.TabEditor = function(editorID, toolboxID, config) {
    var me = new NS.Editor(editorID, config);
    this.me = me;
    var mje= me.mje;

    this.node = Y.one('#' + toolboxID);
        this.node.setHTML(M.util.get_string('nomathjax', 'tinymce_mathslate'));
    if (typeof MathJax === 'undefined') {
        return;
    }
    //Set MathJax to us HTML-CSS rendering on all browsers
    //MathJax.Hub.setRenderer('HTML-CSS');
    this.node.addClass(CSS.EDITOR);
    //Place math editor on page
    this.node.setHTML('<div id="' + toolboxID + '" class="' + CSS.TOOLBOX + '">'
            + '<div style="background-color: white; color: green; height: 300px; line-height: 75px; font-size: 18px; text-align:center"><br />Mathslate Mathematics Editor<br />'
            + '</div><script type="math/tex">\\quad</script><math> <mo> </mo></math></div>'
            );

    var tbox = me.tbox;

    MathJax.Hub.Queue(['Typeset', MathJax.Hub, toolboxID]);

    this.fillToolBox = function(tools, id) {
        var tabview = me.tbox.fillToolBox(tools, id);
        this.tabs = tools;
        Y.one('#' + id).all('.yui3-tab-panel span').each(function(el) {
            var tool = me.tbox.getToolByID(el.getAttribute('id'));
            if (tool) {
                var index = el.get('parentNode').get('parentNode').get('children').indexOf(el.get('parentNode'));
                tool.parent = tools[el.get('parentNode').get('parentNode').get('parentNode').get('children').indexOf(el.get('parentNode').get('parentNode'))].tools;
                var snippet = tool.parent[index];
                tool.snippet = snippet;
                tool.remove = function () {
                    return this.parent.splice(this.parent.indexOf(snippet), 1);
                };
            }
        });
        this.registerTab = function(li) {
            var drop=new Y.DD.Drop({node: li});
            drop.on('drop:hit', function(e) {
                var id = e.drag.get('node').getAttribute('id');
                var index = li.get('parentNode').get('children').indexOf(li);
                var tool = tbox.getToolByID(id);
                tools[index].tools.push(tool.remove());
                tool.parent = tools[index].tools;
                li.get('parentNode').get('parentNode').get('children').item(1).one('[aria-labelledby="' + li.one('a').getAttribute('id')+'"]').appendChild(Y.one('#'
                   + id).get('parentNode'));
                this.outputJSON();
            }, this);
        };
        this.outputJSON = function() {
            var output = '[';
            var tabcontent = [];
            this.tabs.forEach(function(tab) {
                var tabmembers = [];
                if (!Y.one('#' + toolboxID).one('.yui3-tabview-content').get('children').item(0).get('children').item(tools.indexOf(tab))) {
                    return;
                }
                var id = Y.one('#' + toolboxID).one('.yui3-tabview-content').get('children').item(0).get('children').item(tools.indexOf(tab)).one('a').getAttribute('id');
                if (!id) {
                    tabmembers.push('\n            ' + '["br", {}],');
                    return;
                }
                Y.one('#' + toolboxID).one('.yui3-tabview-content').get('children').item(1).one('[aria-labelledby="' + id + '"]').all('.yui3-dd-drop').each(function(t) {
                    tabmembers.push('\n            ' + tbox.getToolByID(t.getAttribute('id')).json);
                });
                tabcontent.push('\n    {"label": "' + tab.label + '",\n        "tools": [' + tabmembers.join(',') + ']\n    }');
            });
            output += tabcontent.join(',') + '\n]';

            Y.one('#json-data').getDOMNode().value =  output;
        };
        this.addLabel = function(title, label) {
            var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
            tabview.add(
                {
                    childType: "Tab",
                    label: "<span title='" + title + "'>" + label + "</span>",
                    content: "<span id='latex-input'></span>"
                },
                index
            );
            this.tabs.splice(index, 0, {
                label: "<span title='" + title + "'>" + label + "</span>",
                content: "",
                tools: []
            });
            this.outputJSON();
            this.registerTab(Y.one('#' + toolboxID).one('ul').get('children').item(index));
        };
        this.removeTab = function(index) {
            tabview.remove(index);
        };
        this.selectTab = function(index) {
            tabview.selectChild(index);
        };
        this.shiftTab = function(index) {
            var li = Y.one('#' + toolboxID).one('ul').get('children').item(index);
            var content = li.get('parentNode').get('parentNode').get('children').item(1).one('[aria-labelledby="'+li.one('a').getAttribute('id')+'"]');
            tabview.add(
                {
                    childType: "Tab",
                    label: this.tabs[index].label,
                    content: ''
                },
                index-1
            );
            li = Y.one('#' + toolboxID).one('ul').get('children').item(index-1);
            var panel = li.get('parentNode').get('parentNode').get('children').item(1).one('[aria-labelledby="'+li.one('a').getAttribute('id')+'"]');
            content.get('children').each(function(t) {
                panel.appendChild(t);
            });
            tabview.remove(index+1);
            this.tabs.splice(index-1, 0, this.tabs.splice(index, 1)[0]);
            this.registerTab(Y.one('#' + toolboxID).one('ul').get('children').item(index-1));
            this.outputJSON();
        };

    };
    this.registerTool = function(tool) {
        var context = this;
        // Delete tool on doubleclick.
        Y.one('#'+tool.id).on('dblclick', function() {
            tool.parent.splice(tool.parent.indexOf(tool.snippet), 1);
            this.get('parentNode').remove();
            tool.remove();
            context.outputJSON();
        });
        // Set up drop behavior.
        var drop=new Y.DD.Drop({node: '#'+tool.id});
        drop.on('drop:hit', function(e) {
            var dragTool = null;
            var dragNode = Y.one('#' + e.drag.get('node').get('id')).get('parentNode');
            context.tabs.forEach(function (t) {
                if (t.id ===  e.drag.get('node').get('id')) {
                    dragTool = t;
                }
            });
            dragTool = tbox.getToolByID(e.drag.get('node').get('id'));
            if (!dragTool) {
                return;
            }
            this.get('node').get('parentNode').get('parentNode').insertBefore(dragNode, this.get('node').get('parentNode'));
            tool.parent.splice(tool.parent.indexOf(tool.snippet), 0, dragTool.remove);
            context.outputJSON();
        });

    };
    /* function passed to MathJax to initiate dragging after math is formated
     * @function registerTools
     */
    this.registerTools = function() {
        Y.one('#' + toolboxID).all('.yui3-tab-panel span').each(function(n) {
            var tool = me.tbox.getToolByID(n.getAttribute('id'));
            if (tool) {
               this.registerTool(tool);
            }
        }, this);
        Y.one('#'+toolboxID).all('li').each(function(li) {
            this.registerTab(li);
        }, this);
        Y.one('#' + toolboxID).all('br').each(function(br) {
            var span = Y.Node.create('<span><span class="mathslate-break">&lt;br&gt;</span></span>');
            br.ancestor().insertBefore(span, br);
            var d = new Y.DD.Drag({node: span.one('span')});
            d.on('drag:drophit', function(e) {
                if (e.drop.get('node') && 
                    e.drop.get('node').getAttribute('id') &&
                    tbox.getToolByID(e.drop.get('node').getAttribute('id'))
                ) {
                    var node = e.drop.get('node').ancestor();
                    node.ancestor().insertBefore(span, node);
                    node.ancestor().insertBefore(br, node);
                }
            });
            d.on('drag:end', function() {
                this.get('node').setStyle('top' , '0');
                this.get('node').setStyle('left' , '0');
            });

        });
    };
    //Fetch configuration string for tools and initialyze
    var request;
    Y.on('io:success', function(id, o) {
        if (id === request.id) {
            Y.one('#json-data').getDOMNode().value =  o.response;
            MathJax.Hub.Queue(['fillToolBox', this, Y.JSON.parse(o.response), toolboxID]);
            MathJax.Hub.Queue(Y.bind(this.registerTools, this));
        }
    }, this);
    if (config === undefined) {
        request = Y.io(NS.config);
    } else {
        request = Y.io(config);
    }

    this.addTool = function(snippet) {
        var q = Y.one('#' + toolboxID).one('.yui3-tab-panel-selected');
            var t = new tbox.Tool(["mrow", {}, Y.JSON.parse(snippet)]);
            t.json = JSON.stringify(snippet);
            t.remove = function () {
                return this.parent.splice(this.parent.indexOf(snippet), 1);
            };
            var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
            t.parent = this.tabs[index].tools;
            //MathJax.HTML.addElement(q.getDOMNode(), 'span', {}, [' ', ['span', {}, t.HTMLsnippet], ' '] );
            q.append('<span> ' + mje.toMathML(t.HTMLsnippet) + ' </span>');
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, q.getDOMNode()]);
            MathJax.Hub.Queue(['registerTool', tbox, t]);
            MathJax.Hub.Queue(['outputJSON', this]);
    };

    Y.one('#json-data').on('change', function() {
        var value = Y.one('#json-data').getDOMNode().value;
        MathJax.Hub.Queue(['fillToolBox', this, Y.JSON.parse(value), toolboxID]);
        MathJax.Hub.Queue(Y.bind(this.registerTools, this));
    }, this);
    Y.one('#mathslate-tab-left').on('click', function() {
        var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
        if (index < 1) {
            return;
        }
        this.shiftTab(index);
        this.selectTab(index - 1);
    }, this);
    Y.one('#mathslate-tab-right').on('click', function() {
        var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected')) + 1;
        if (index >= this.tabs.length) {
            return;
        }
        this.shiftTab(index);
        this.selectTab(index);
    }, this);
    Y.one('#label-remove').on('click', function() {
        var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
        this.removeTab(index);
        this.tabs.splice(index, 1);
        this.outputJSON();
    }, this);
    Y.one('#label-add').on('click', function() {
        this.addLabel("title", "label");
    }, this );

    Y.one('#mathslate-tab-label').on('click', function() {
        var tab = Y.one('#' + toolboxID).one('.yui3-tab-selected');
        var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
        var label = Y.Node.create(this.tabs[index].label);
        var textBox = Y.Node.create('<input type="text" value="' + label.getHTML() + '"></input>');
        Y.one('#mathslate-tab-text').appendChild(textBox);
        textBox.focus();
        textBox.on('blur', function() {
            this.remove();
        });
        textBox.on('change', function() {
            label.setHTML(this.getDOMNode().value);
            tab.one('a').setHTML('');
            tab.one('a').appendChild(label);
            this.tabs[index].label = "<span title='" + label.getAttribute('title') + "'>" + label.getHTML() + "</span>";
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, tab.getDOMNode()]);
            this.outputJSON();
        });
    }, this);
    Y.one('#mathslate-tab-title').on('click', function() {
        var tab = Y.one('#' + toolboxID).one('.yui3-tab-selected');
        var index = Y.one('#' + toolboxID).one('ul').get('children').indexOf(Y.one('#' + toolboxID).one('.yui3-tab-selected'));
        var label = Y.Node.create(this.tabs[index].label);
        var textBox = Y.Node.create('<input type="text" value="' + label.getAttribute('title') + '"></input>');
        Y.one('#mathslate-tab-text').appendChild(textBox);
        textBox.focus();
        textBox.on('blur', function() {
            this.remove();
        });
        textBox.on('change', function() {
            label.setAttribute('title', this.getDOMNode().value);
            tab.one('a').setHTML('');
            tab.one('a').appendChild(label);
            this.tabs[index].label =  "<span title='" + this.getDOMNode().value + "'>" + label.getHTML() + "</span>";
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, tab.getDOMNode()]);
            this.outputJSON();
        });
    }, this);

};
