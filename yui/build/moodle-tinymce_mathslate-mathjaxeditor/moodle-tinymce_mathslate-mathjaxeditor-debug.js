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

    var shim, ddnodes;

    this.init = function() {
        this.math = [];

        this.canvas = document.createElement('div')
        this.canvas.id = 'canvas';
        this.canvas.setAttribute('class', CSS.WORKSPACE);
        this.workspace = Y.one(id).getDOMNode();
        this.workspace.appendChild(this.canvas);

        this.addToolbar();

        var preview = Y.one(id).appendChild(Y.Node.create('<div class="' + CSS.PANEL + '"/>'));
        preview.delegate('click', function(e) {
            ddnodes.one('#' + this.getAttribute('id')).handleClick(e);
        }, 'div');
        this.preview = preview;
        var canvas = new Y.DD.Drop({
            node: this.canvas
        });
        this.canvas = canvas;
        Y.one(this.workspace).on('click', function() {
            this.se.select();
            this.render();
        }, this);

        MathJax.Hub.Register.StartupHook("Snippet Editor Ready", [function (context) {
            context.se = new MathJax.Mathslate.mSlots();
            context.se.slots.push(context.math);
            context.render();
        }, this]);

    }

    /* Reset the editor display and reinitialize drag and drop
     * @method render
     */
    this.render = function() {
        this.se.rekey();
        var jax = MathJax.Hub.getAllJax(this.workspace)[0];
        if (jax) {
            MathJax.Hub.Queue(["Text", jax, '<math>' + this.toMathML(this.math) + '</math>']);
        } else {
            this.workspace.firstChild = '';
            MathJax.Hub.Queue(['addElement', MathJax.HTML, this.workspace.firstChild, 'math', {display: "block"}, this.math]);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.workspace.firstChild]);
        }
        MathJax.Hub.Queue(['makeDraggable', this]);
    };

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
            this.se.insertSnippet(Y.one(id + ' ' + SELECTORS.SELECTED).getAttribute('id'), this.se.createItem(json));
        } else {
            this.se.append(this.se.createItem(json));
        }
        this.render();
    };
    /* Unselect the selected node if any
     * @method clear
     */
    this.clear = function() {
        if (Y.one(id + ' ' + SELECTORS.SELECTED)) {
            this.se.removeSnippet(Y.one(id + ' ' + SELECTORS.SELECTED).getAttribute('id'));
        } else {
            this.math = [];
            this.se.next = new MathJax.Mathslate.mSlots();
            this.se.next.previous = this.se;
            this.se = this.se.next;
            this.se.slots.push(this.math);
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
            case 'MathML': return Y.one(this.workspace).one('script').getHTML();
            case 'HTML': return Y.one(this.workspace).one('span').getHTML();
            case 'JSON': return Y.JSON.stringify(cleanSnippet(this.math));
            default: return this.se.output(format);
        }
    };
    /* Get HTML representation of the constructed mathematics
     * @method getHTML
     * @return String HTML rendering of the editor content
     */
    this.getHTML = function() {
        return this.workspace.firstChild.innerHTML;
    };

    /* Change back to state undone
     * @method redo
     */
    this.redo = function() {
        this.se = this.se.redo();
        this.math = this.se.slots[0];
        this.render();
    };

    /* Restore to last saved state
     * @method undo
     */
    this.undo = function() {
        this.se = this.se.undo();
        this.math = this.se.slots[0];
        this.render();
    };

    /* Update the TeX preview
     * @function updatePreview
     */
    this.updatePreview = function() {
        this.preview.setHTML('<div class="' + CSS.PREVIEW + '">' + this.se.preview('tex') + '</div>');
        if (this.se.getSelected() && this.preview.one('#' + this.se.getSelected())) {
            Y.one(this.workspace).one('#' + this.se.getSelected()).addClass(CSS.SELECTED);
            Y.one(this.workspace).one('#' + this.se.getSelected())
                .addClass(CSS.SELECTED)
                .setAttribute('mathcolor', 'green')
                .setAttribute('stroke', 'green')
                .setAttribute('fill', 'green');
            this.preview.one('#' + this.se.getSelected()).addClass(CSS.SELECTED);
        }
    };

    this.setTitle = function(m) {
        var node = ddnodes.one('#' + m[1].id);
        if (!node) {return;}
        node.setAttribute('expressionId', m[1].id);
        node.setAttribute('title', this.preview.one('#' + m[1].id).getHTML().replace(/<div *[^>]*>|<\/div>|<br>/g, ''));
        node.addClass('mathslate_dnd');

    };

    /* Add drag and drop functionality
     * @function makeDraggable
     */
    this.makeDraggable = function() {
        if (shim) {
            shim.remove();
        }
        this.makeDrops();
        ddnodes = shim;

        this.updatePreview();

        var context = this;
        this.se.forEach(function (m) {
            context.setTitle(m);
        });

        this.addListeners();
    };

    /* Add drag and drop functionality
     * @function addListeners
     */
    this.addListeners = function() {

        ddnodes.delegate('click', function(e) {
            var selectedNode = ddnodes.one('#' + this.se.getSelected());
            if (!selectedNode) {
                e.stopPropagation();
                this.se.select(e.currentTarget.getAttribute('id'));
                this.render();
                return;
            }
            if (selectedNode === e.currentTarget) {
                if (this.preview.one('#' + e.currentTarget.getAttribute('id')).test('.' + CSS.PREVIEW + ' >')) {
                    this.se.select();
                    this.render();
                    return;
                }
                e.currentTarget.removeClass(CSS.SELECTED);
                this.preview.one('#' + e.currentTarget.getAttribute('id')).removeClass(CSS.SELECTED);
                Y.one(this.workspace).one('#' + this.se.getSelected())
                    .removeAttribute('mathcolor')
                    .removeAttribute('stroke')
                    .removeAttribute('fill');
                this.se.select();
                return;
                }
            if (selectedNode.one('#' + e.currentTarget.getAttribute('id'))) {
                return;
            }
            e.stopPropagation();
            this.se.insertSnippet(e.currentTarget.getAttribute('id'), this.se.removeSnippet(selectedNode.getAttribute('id')));
            this.se.select();
            this.render();
        }, '.mathslate_dnd', this);

        var del = new Y.DD.Delegate({
            container: ddnodes,
            moveOnEnd: false,
            nodes: '.mathslate_dnd'
        });
        Y.DD.DDM.on('drag:start', function(e) {
            var drag = e.target;
            if (drag.get('node').hasClass('mathslate_dnd')) {
                drag.get('node').addClass(CSS.DRAGGEDNODE);
                drag.get('dragNode').addClass(CSS.DRAGNODE);
                drag.get('dragNode').all('> span')
                    .pop()
                    .setStyle('opacity', '1');
            }
        });
        Y.DD.DDM.on('drag:end', function(e) {
            var drag = e.target;
            if (drag.get('node').hasClass('mathslate_dnd')) {
                drag.get('node')
                    .removeClass(CSS.DRAGGEDNODE)
                    .removeAttribute('mathcolor')
                    .removeAttribute('stroke')
                    .setStyles({top: 0, left: 0});
                drag.get('dragNode').all('> span')
                    .pop()
                    .setStyle('opacity', '0');
                e.stopPropagation();
            }
        }, this);
        Y.one(this.workspace).all('.mathslate_dnd').each(function(n) {
            new Y.DD.Drop({
               node: n
            });
        });
        Y.DD.DDM.on('drop:hit', function(e) {
            if (!e.target.get('node').hasClass('mathslate_dnd')) {
                return;
            }
            var dragTarget = e.drag.get('node').get('id');
            var id = e.target.get('node').getAttribute('id');
            if (e.drag.get('data')) {
                this.se.insertSnippet(id, this.se.createItem(e.drag.get('data')));
            }
            else if (dragTarget !== id && this.se.isItem(dragTarget) && !this.preview.one('#' + dragTarget).one('#' + id)) {
                this.se.insertSnippet(e.drop.get('node').get('id'), this.se.removeSnippet(dragTarget));
            }
            else {
                return;
            }
            e.stopPropagation();
            this.render();
        }, this);
        Y.DD.DDM.on('drop:enter', function(e) {
            if (!e.target.get('node').hasClass('mathslate_dnd')) {
                return;
            }
            e.stopPropagation();
            var id = e.target.get('node').getAttribute('id');
            Y.one(this.workspace).all(SELECTORS.HIGHLIGHT)
                .removeAttribute('mathcolor')
                .removeAttribute('stroke')
                .removeAttribute('fill')
                .removeClass(CSS.HIGHLIGHT);
            ddnodes.all(SELECTORS.HIGHLIGHT)
                .removeClass(CSS.HIGHLIGHT);
            if(ddnodes.one('#' + id)) {
                ddnodes.one('#' + id).addClass(CSS.HIGHLIGHT);
            }
            Y.one(this.workspace).one('#' + id).addClass(CSS.HIGHLIGHT);
            Y.one(this.workspace).one('#' + id)
                .setAttribute('mathcolor', 'yellow')
                .setAttribute('stroke', 'yellow')
                .setAttribute('fill', 'yellow');
        }, this);
        Y.DD.DDM.on('drop:exit', function(e) {
            if (!e.target.get('node') || !e.target.get('node').hasClass('mathslate_dnd')) {
                return;
            }
            var id = e.target.get('node').getAttribute('id');
            if (Y.one(this.workspace).one('#' + id).test(CSS.HIGHLIGHT)) {
                Y.one(this.workspace).one('#' + id)
                    .removeAttribute('mathcolor')
                    .removeAttribute('stroke')
                    .removeAttribute('fill')
                    .removeClass(CSS.HIGHLIGHT);
                e.target.get('node')
                    .removeClass(CSS.HIGHLIGHT);
                Y.one(this.workspace).all('#' + id + '[stroke=yellow]')
                    .removeAttribute('fill')
                    .removeAttribute('stroke');
                Y.one(this.workspace).all('#' + id + '[mathcolor=yellow]')
                    .removeAttribute('mathcolor');
            }
            else {
                e.target.get('node')
                    .addClass(CSS.HIGHLIGHT);
                Y.one(this.workspace).one('#' + id)
                    .setAttribute('mathcolor', 'yellow')
                    .setAttribute('stroke', 'yellow')
                    .setAttribute('fill', 'yellow')
                    .addClass(CSS.HIGHLIGHT);
                e.stopPropagation();
            }
        }, this);
    };

    /* Create drop shim above workspace
     * @function makeDrops
     *
     */
    this.makeDrops = function() {
        shim = Y.Node.create('<span></span>');
        shim.setHTML(this.se.preview().replace(/div/g, 'span').replace(/<\/*br>/g, ''));
        Y.one(id).appendChild(shim);
        shim.all('span').each(function (s) {
            if (!Y.one(this.workspace).one('#' + s.getAttribute('id'))) {
                return;
            }
            s.appendChild('<span style="position: relative; opacity: 0"><math display="inline">' +
                this.toMathML([Y.JSON.parse(this.se.getItemByID(s.getAttribute('id')))]).replace(/id="[^"]*"/,'') +
                '</math></span>');
            s.setAttribute('style', 'position: absolute; top: 0; left: 0; margin: 0px; z-index: +1');
        }, this);
        shim.all('span').each(function (s) {
            if (!Y.one(this.workspace).one('#' + s.getAttribute('id'))) {
                return;
            }
            var rect = Y.one(this.workspace).one('#' + s.getAttribute('id')).getDOMNode().getBoundingClientRect();
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
        shim.innerHTML = this.se.preview().replace(/div/g, 'span').replace(/<\/*br>/g, '');
        this.workspace.appendChild(shim);
        var list = shim.getElementsByTagName('span');
        for (var i = 0; i < list.length; i++) {
            var s = list.item(i);
            if (Y.one(this.workspace).one('#' + s.id)) {
                var content = document.createElement('span');
                content.setAttribute('style', "position: relative; opacity: 0");
                content.innerHTML = '<math display="inline">' +
                    this.toMathML([Y.JSON.parse(this.se.getItemByID(s.getAttribute('id')))]).replace(/id="[^"]*"/,'') +
                    '</math>';
                s.appendChild(content);
                s.setAttribute('style', 'position: absolute; top: 4.75px; left: 1.25px; margin: 0px; z-index: +1');

                var rect = Y.one(this.workspace).one('#' + s.id).getDOMNode().getBoundingClientRect();
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

    /* Create a toolbar for editing functions
     *
     * @function addToolbar
     *
     */
    this.addToolbar = function() {

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

            this.toolbar = Y.one(this.workspace).appendChild(Y.Node.create('<form></form>'));

        this.toolbar.appendChild(clear);
        this.toolbar.appendChild(undo);
        this.toolbar.appendChild(redo);
        this.toolbar.appendChild(help);

        redo.on('click', this.redo, this);
        undo.on('click', this.undo, this);
        clear.on('click', this.clear, this);
        help.on('click', function() {
            this.preview.setHTML('<iframe src="' + NS.help + '" style="width: '
                + this.preview.getStyle('width') + '" class="' + CSS.HELPBOX + '"/>');
        }, this);
    }

    this.init();

};


}, '@VERSION@', {"requires": ["drag-delegate", "dd-drop"]});
