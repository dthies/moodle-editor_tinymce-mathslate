YUI.add('moodle-tinymce_mathslate-mathjaxeditor', function (Y, NAME) {

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
 * @copyright  2013 onwards Daniel Thies  <dthies@ccal.edu>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
M.tinymce_mathslate = M.tinymce_mathslate || {};
var NS = M && M.tinymce_mathslate || {};
var MathJax = window.MathJax,
    dragenabled = true;
var CSS = {
    SELECTED: 'mathslate-selected',
    WORKSPACE: 'mathslate-workspace',
    PREVIEW: 'mathslate-preview',
    HIGHLIGHT: 'mathslate-highlight',
    DRAGNODE: 'mathslate-workspace-drag',
    DRAGGEDNODE: 'mathslate-workspace-dragged',
    HELPBOX: 'mathslate-help-box',
    PANEL: 'mathslate-bottom-panel'
};
var SELECTORS = {
    SELECTED: '.' + CSS.SELECTED,
    HIGHLIGHT: '.' + CSS.HIGHLIGHT
};

//Constructor for equation workspace
NS.MathJaxEditor = function(id) {
    MathJax.Ajax.Require("[Mathslate]/snippeteditor.js");
    this.math = [];
    var se;

    var shim, ddnodes;
    this.workspace = Y.one(id).append('<div id="canvas" class="' + CSS.WORKSPACE + '"/>');
    this.toolbar = Y.one(id).appendChild(Y.Node.create('<form></form>'));
    var preview = Y.one(id).appendChild(Y.Node.create('<div class="' + CSS.PANEL + '"/>'));
    preview.delegate('click', function(e) {
        ddnodes.one('#' + this.getAttribute('id')).handleClick(e);
    }, 'div');
    var canvas = new Y.DD.Drop({
        node: this.workspace.one('#canvas')});
    this.canvas = canvas;
    this.canvas.get('node').on('click', function() {
        se.select();
        this.render();
    }, this);

    //Place buttons for internal editor functions

    var undo = document.createElement('button');
        undo.type = 'button';
        undo.title = M.util.get_string('redo', 'tinymce_mathslate');
        undo['class'] = CSS.UNDO;
        undo.innerHTML = '<math><mo>&#x25C1;</mo></math>';
        undo = Y.one(undo);

    var redo = document.createElement('button');
        redo.type = 'button';
        redo.title = M.util.get_string('redo', 'tinymce_mathslate');
        redo['class'] = CSS.REDO;
        redo.innerHTML = '<math><mo>&#x25B7;</mo></math>';
        redo = Y.one(redo);

    var clear = document.createElement('button');
        clear.type = 'button';
        clear.title = M.util.get_string('clear', 'tinymce_mathslate');
        clear['class'] = CSS.CLEAR;
        clear.innerHTML = '<math><mi>&#x2718;</mi></math>';
        clear = Y.one(clear);

    var help = document.createElement('button');
        help.type = 'button';
        help.title = M.util.get_string('help', 'tinymce_mathslate');
        help['class'] = CSS.HELP;
        help.innerHTML = '<math><mi>&#xE47C;</mi></math>';
        help = Y.one(help);

    this.toolbar.appendChild(clear);
    this.toolbar.appendChild(undo);
    this.toolbar.appendChild(redo);
    this.toolbar.appendChild(help);

    /* Return snippet as MathML string
     * @method toMathML
     * @param object element
     */
    this.toMathML = function(element) {
        if (typeof element !== "object") { return element; }
        var str = '';
        element.forEach(function(m) {
            var attr;
            if (typeof m !== "object") { return; }
            str += '<' + m[0];
            if (m[1] && (typeof m[1] === "object")) {
                for (attr in m[1]) {
                    if (typeof m[1][attr] !== "object") {
                        str += " " + attr + '="' + m[1][attr] + '"';
                    }
                }
            }
            str += '>';
            if (m[2]) {
                str += this.toMathML(m[2]);
            }
            str += '</' + m[0] + '>';
        }, this);
        return str;
    };

    /* Method for add adding an object to the workspace
     * @method addMath
     * @param string json
     */
    this.addMath = function(json) {
        if (!json) {
            return;
        }
        if (Y.one(id + ' ' + SELECTORS.SELECTED)) {
            se.insertSnippet(Y.one(id + ' ' + SELECTORS.SELECTED).getAttribute('id'), se.createItem(json));
        } else {
            se.append(se.createItem(json));
        }
        this.render();
    };
    /* Unselect the selected node if any
     * @method clear
     */
    this.clear = function() {
        if (Y.one(id + ' ' + SELECTORS.SELECTED)) {
            se.removeSnippet(Y.one(id + ' ' + SELECTORS.SELECTED).getAttribute('id'));
        } else {
            this.math = [];
            se.next = new MathJax.Mathslate.mSlots();
            se.next.previous = se;
            se = se.next;
            se.slots.push(this.math);
        }
        this.render();
    };
    /* Return output in various formats
     * @method output
     * @param string format
     */
    this.output = function(format) {
        function cleanSnippet(s) {
            if (typeof s !== "object") { return s; }
            var t = s.slice(0);
            t.forEach(function(m, index) {
                if (typeof m !== "object") { return; }
                if (m[1] && m[1]['class']) {
                    t[index] = '[]';
                    return;
                }
                if (m[1] && m[1].id) {
                    delete m[1].id;
                }
                if (m[2]) {
                    m[2] = cleanSnippet(m[2]);
                }
            });
            return t;
        }
        switch(format) {
            case 'MathML': return canvas.get('node').one('script').getHTML();
            case 'HTML': return canvas.get('node').one('span').getHTML();
            case 'JSON': return Y.JSON.stringify(cleanSnippet(this.math));
            default: return se.output(format);
        }
    };
    /* Get HTML representation of the constructed mathematics
     * @method getHTML
     * @return String HTML rendering of the editor content
     */
    this.getHTML = function() {
        return canvas.get('node').one('span').getHTML();
    };

    /* Change back to state undone
     * @method redo
     */
    this.redo = function() {
        se = se.redo();
        this.math = se.slots[0];
        this.render();
    };

    /* Restore to last saved state
     * @method undo
     */
    this.undo = function() {
        se = se.undo();
        this.math = se.slots[0];
        this.render();
    };

    /* Add drag and drop functionality
     * @function makeDraggable
     */
    this.makeDraggable = function() {
        var context = this;
        if (shim) {
            shim.remove();
        }
        this.makeDrops();
        ddnodes = shim;
        preview.setHTML('<div class="' + CSS.PREVIEW + '">' + se.preview('tex') + '</div>');
        if (se.getSelected() && preview.one('#' + se.getSelected())) {
            canvas.get('node').one('#' + se.getSelected()).addClass(CSS.SELECTED);
            canvas.get('node').one('#' + se.getSelected()).setAttribute('mathcolor', 'green');
            canvas.get('node').one('#' + se.getSelected()).setAttribute('stroke', 'green');
            canvas.get('node').one('#' + se.getSelected()).setAttribute('fill', 'green');
            preview.one('#' + se.getSelected()).addClass(CSS.SELECTED);
        }

        se.forEach(function(m) {
            var node = ddnodes.one('#' + m[1].id);
            if (!node) {return;}
            node.setAttribute('title', preview.one('#' + m[1].id).getHTML().replace(/<div *[^>]*>|<\/div>|<br>/g, ''));
            node.handleClick = function(e) {
                var selectedNode = ddnodes.one('#' + se.getSelected());
                if (!selectedNode) {
                    e.stopPropagation();
                    se.select(this.getAttribute('id'));
                    context.render();
                    return;
                }
                if (selectedNode === this) {
                    if (preview.one('#' + this.getAttribute('id')).test('.' + CSS.PREVIEW + ' >')) {
                        se.select();
                        context.render();
                        return;
                    }
                    this.removeClass(CSS.SELECTED);
                    preview.one('#' + this.getAttribute('id')).removeClass(CSS.SELECTED);
                    canvas.get('node').one('#' + se.getSelected()).removeAttribute('mathcolor');
                    canvas.get('node').one('#' + se.getSelected()).removeAttribute('stroke');
                    canvas.get('node').one('#' + se.getSelected()).removeAttribute('fill');
                    se.select();
                    return;
                }
                if (selectedNode.one('#' + this.getAttribute('id'))) {
                    return;
                }
                e.stopPropagation();
                se.insertSnippet(this.getAttribute('id'), se.removeSnippet(selectedNode.getAttribute('id')));
                se.select();
                context.render();
            };
            node.on('click', function(e) {
                this.handleClick(e);
            });
            var selectedNode = ddnodes.one('#' + se.getSelected());
            if (!dragenabled) {
                return;
            }
            if ((!m[1] || !m[1]['class'] || m[1]['class'] !== 'blank') &&
                    !(selectedNode && preview.one('#' + se.getSelected()).one('#' + m[1].id))) {
                var drag = new Y.DD.Drag({node: node,
                    moveOnEnd: false
                });

                drag.on('drag:start', function() {
                    if (canvas.get('node').one('#' + se.getSelected())) {
                        preview.one('#' + se.getSelected()).removeClass(CSS.SELECTED);
                        canvas.get('node').one('#' + se.getSelected()).removeClass(CSS.SELECTED);
                        canvas.get('node').one('#' + se.getSelected()).removeAttribute('mathcolor');
                        canvas.get('node').one('#' + se.getSelected()).removeAttribute('stroke');
                        canvas.get('node').one('#' + se.getSelected()).removeAttribute('fill');
                        se.select();
                    }
                    this.get('node').addClass(CSS.DRAGGEDNODE);
                    this.get('node').setAttribute('mathcolor', 'red');
                    ddnodes.one('#' + m[1].id).setAttribute('mathcolor', 'red');
                    ddnodes.one('#' + m[1].id).setAttribute('stroke', 'red');
                    this.get('dragNode').addClass(CSS.DRAGNODE);
                    this.get('dragNode').all('> span')
                        .pop()
                        .setStyle('opacity', '1');
                });
                drag.on('drag:end', function() {
                    this.get('node').removeClass(CSS.DRAGGEDNODE);
                    this.get('node').removeAttribute('mathcolor');
                    this.get('node').removeAttribute('stroke');
                    this.get('dragNode').all('> span')
                        .pop()
                        .setStyle('opacity', '0');
                    this.get('dragNode').setStyles({top: 0, left: 0});
                });
            }

            var drop = new Y.DD.Drop({node: node});
            drop.on('drop:hit', function(e) {
                var dragTarget = e.drag.get('node').get('id');
                if (e.drag.get('data')) {
                    se.insertSnippet(m[1].id, se.createItem(e.drag.get('data')));
                }
                else if (dragTarget !== m[1].id && se.isItem(dragTarget) && !preview.one('#' + dragTarget).one('#' + m[1].id)) {
                    se.insertSnippet(e.drop.get('node').get('id'), se.removeSnippet(dragTarget));
                }
                context.render();
            });
            drop.on('drop:enter', function(e) {
                e.stopPropagation();
                ddnodes.all(id + ' ' + SELECTORS.HIGHLIGHT).each(function(n) {
                     n.removeClass(CSS.HIGHLIGHT);
                     var id = n.getAttribute('id');
                     if (canvas.get('node').one(id)) {
                         canvas.get('node').one(id).removeClass(CSS.HIGHLIGHT);
                         canvas.get('node').one(id).removeAttribute('mathcolor');
                         canvas.get('node').one(id).removeAttribute('stroke');
                         canvas.get('node').one(id).removeAttribute('fill');
                     }
                });
                ddnodes.one('#' + m[1].id).addClass(CSS.HIGHLIGHT);
                canvas.get('node').one('#' + m[1].id).addClass(CSS.HIGHLIGHT);
                canvas.get('node').one('#' + m[1].id).setAttribute('mathcolor', 'yellow');
                canvas.get('node').one('#' + m[1].id).setAttribute('stroke', 'yellow');
                canvas.get('node').one('#' + m[1].id).setAttribute('fill', 'yellow');
            });
            drop.on('drop:exit', function(e) {
                e.stopPropagation();
                this.get('node').removeClass(CSS.HIGHLIGHT);
                canvas.get('node').one('#' + m[1].id).removeClass(CSS.HIGHLIGHT);
                canvas.get('node').one('#' + m[1].id).removeAttribute('mathcolor');
                canvas.get('node').one('#' + m[1].id).removeAttribute('stroke');
                canvas.get('node').one('#' + m[1].id).removeAttribute('fill');
            });

        });
    };

    /* Create drop shim above workspace
     * @function makeDrops
     *
     */
    this.makeDrops = function() {
        shim = Y.Node.create('<span></span>');
        shim.setHTML(se.preview().replace(/div/g, 'span').replace(/<\/*br>/g, ''));
        Y.one(id).appendChild(shim);
        shim.all('span').each(function (s) {
            if (!canvas.get('node').one('#' + s.getAttribute('id'))) {
                return;
            }
            s.appendChild('<span style="position: relative; opacity: 0"><math display="inline">' +
                this.toMathML([Y.JSON.parse(se.getItemByID(s.getAttribute('id')))]).replace(/id="[^"]*"/,'') +
                '</math></span>');
            s.setAttribute('style', 'position: absolute; top: 0; left: 0; margin: 0px; z-index: +1');
        }, this);
        shim.all('span').each(function (s) {
            if (!canvas.get('node').one('#' + s.getAttribute('id'))) {
                return;
            }
            var rect = canvas.get('node').one('#' + s.getAttribute('id')).getDOMNode().getBoundingClientRect();
            var srect = s.getDOMNode().getBoundingClientRect();
            s.setStyle('top', rect.top - srect.top);
            s.setStyle('left', rect.left - srect.left);
            s.setStyle('width', rect.width);
            s.setStyle('height', rect.height);
        });
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, shim.getDOMNode()]);
    };

    /* Create drop shim above workspace
     * @function makeDrops
     *
     */
    this.makeDrops = function() {
        shim = document.createElement('span');
        shim.innerHTML = se.preview().replace(/div/g, 'span').replace(/<\/*br>/g, '');
        Y.one(id).appendChild(shim);
        var list = shim.getElementsByTagName('span');
        for (var i = 0; i < list.length; i++) {
            var s = list.item(i);
            if (canvas.get('node').one('#' + s.id)) {
                var content = document.createElement('span');
                content.setAttribute('style', "position: relative; opacity: 0");
                content.innerHTML = '<math display="inline">' +
                    this.toMathML([Y.JSON.parse(se.getItemByID(s.getAttribute('id')))]).replace(/id="[^"]*"/,'') +
                    '</math>';
                s.appendChild(content);
                s.setAttribute('style', 'position: absolute; top: 4.75px; left: 1.25px; margin: 0px; z-index: +1');

                var rect = canvas.get('node').one('#' + s.id).getDOMNode().getBoundingClientRect();
                var srect = s.getBoundingClientRect();
                s.setAttribute('style', 'position: absolute; top: '
                        + (rect.top - srect.top).toString()
                        + 'px; left: ' + (rect.left - srect.left).toString()
                        + 'px; z-index: +1');
            }
        }
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, shim]);
        shim = Y.one(shim);
    };

    /* Reset the editor display and reinitialize drag and drop
     * @method render
     */
    this.render = function() {
        se.rekey();
        var jax = MathJax.Hub.getAllJax(canvas.get('node').getDOMNode())[0];
        if (jax) {
            MathJax.Hub.Queue(["Text", jax, '<math>' + this.toMathML(this.math) + '</math>']);
        } else {
            canvas.get('node').setHTML('');
            MathJax.Hub.Queue(['addElement', MathJax.HTML, canvas.get('node').getDOMNode(), 'math', {display: "block"}, this.math]);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, canvas.get('node').getDOMNode()]);
        }
        MathJax.Hub.Queue(['makeDraggable', this]);

    };

    MathJax.Hub.Register.StartupHook("Snippet Editor Ready", [function (context) {
        se = new MathJax.Mathslate.mSlots();
        se.slots.push(context.math);
        context.render();
    }, this]);

    redo.on('click', this.redo, this);
    undo.on('click', this.undo, this);
    clear.on('click', this.clear, this);
    help.on('click', function() {
        preview.setHTML('<iframe src="' + NS.help + '" style="width: '
            + preview.getStyle('width') + '" class="' + CSS.HELPBOX + '"/>');
    });

};


}, '@VERSION@', {"requires": ["dd-drop"]});
