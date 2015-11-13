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

MathJax.Ajax.Require("[Mathslate]/snippeteditor.js");

MathJax.Hub.Register.StartupHook("TeX Jax Ready", function () {

MathJax.Mathslate = MathJax.Mathslate || {};
var NS = MathJax.Mathslate;

MathJax.Hub.Register.StartupHook("Snippet Editor Ready", function () {

/* Constructor function for an editor of a page.
 * @method Editor
 * @param string editorID
 * @param string config
 */
NS.TeXTool = function(editorID, addMath) {
    editorID = editorID.replace('#', '');
    //var input = Y.one('#tex-input');
    var input = document.getElementById('tex-input');
    //var tool = Y.Node.create('<span>\\[ \\]</span>');

    var toolID = 'MJX-' + NS.guid();
    document.getElementById(editorID).innerHTML = '<span id="' + toolID + '" draggable="true" >\\[ \\]</span>';
    var tool = document.getElementById(toolID);
    input.focus();
    tool.toMathML = function(callback) {
        var mml;
        var jax = window.MathJax.Hub.getAllJax(toolID)[0];
        try {
            mml = jax.root.toMathML("");
        } catch(err) {
            if (!err.restart) {throw err;} // an actual error
            return window.MathJax.Callback.After(['toMathML', this, jax, callback], err.restart);
        }
        window.MathJax.Callback(callback)(mml);
    };
    input.addEventListener('keyup', this.processTeXInput);
    this.processTeXInput = function() {
        var jax = window.MathJax.Hub.getAllJax(toolID)[0];
        var tex = input.value;
        if (!jax) {return;}
        var output = '';
        window.MathJax.Hub.Queue(['Text', jax, input.value]);

        var parse = function (mml) {
            if (/<mtext mathcolor="red">/.test(mml) || /<merror/.test(mml)) {
                return;
            }
            mml = mml.replace(/$\s+/mg, ' ');

            //First look for beginning tag.
            var tag = mml.replace(/^\s*<([a-z]*).*/, '$1');

            //Find attributes of element.
            mml = mml.replace(/^\s*<[a-z]*/, '');
            output += '["' + tag + '", {';
            while (mml.trim().search('>') > 1) {
                 output  += mml.replace(/^ *([a-z]*) *= *"([^"]*)".*/, '"$1": "$2"');
                 mml = mml.replace(/^ *([a-z]*) *= *"([^"]*)"/, '');
                 if (mml.trim().search('>') > 1) {
                     output += ', ';
                 }
            }
            if (mml.trim().match('^/>')) {
                output += '}]';
                return mml.trim().replace('/>', '');
            }
            output += '}, ';
            mml = mml.replace(/^ *>/, '');

            //If element contains string quote string.
            if (mml.replace(new RegExp('^ *([^<]*).*'), '$1')) {
                output += '"' +mml.replace(/<.*/, '') + '"';
                mml = mml.replace(/^ *[^<]*/, '');
                if (mml.trim().search('<!--') === 0) {
                    mml = mml.replace(/<!--[^>]*-->/, '');
                }
            //Otherwise parse the children.
            } else {
                output += '[';
                while(mml.trim().search('</' + tag + '>') !== 0) {
                    mml = parse(mml);
                    if (mml.trim().search('</' + tag + '>') !== 0) {
                        output += ', ';
                    }
                }
                output += ']';
            }
            output += ']';
            return mml.replace('</' + tag + '>', '');
        };
        window.MathJax.Hub.Queue(['toMathML', tool, parse]);

        window.MathJax.Hub.Queue(function() {
            if (output === '') {
                return;
            }
            tool.json = JSON.stringify(["mrow", {"tex": [tex]}, JSON.parse(output)[2]]);
            addMath(tool.json);
            input.select();
        });
    };
    //input.onchange = this.processTeXInput;
    input.addEventListener('change', this.processTeXInput, true);
    if (addMath) {
        //tool.on('click', function() {
        tool.onclick = function() {
            addMath(tool.json);
        };
    }
/*
    var drag = new Y.DD.Drag({node: tool});
    drag.on('drag:end', function() {
        this.get('node').setStyle('top' , '0');
        this.get('node').setStyle('left' , '0');
    });
*/
            // drag.set('data', tool.json);

    MathJax.Hub.Queue(['Typeset', MathJax.Hub, toolID]);
};

});

MathJax.Hub.Startup.signal.Post("TeX Input Tool Ready");

});

MathJax.Ajax.loadComplete("[Mathslate]/textool.js");
