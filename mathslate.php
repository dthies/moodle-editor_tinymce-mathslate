<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * MathSlate editor popup.
 *
 * @package   tinymce_mathslate
 * @copyright 2013 Daniel Thies
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_MOODLE_COOKIES', true);

require('../../../../../config.php');

$PAGE->set_context(context_system::instance());
$PAGE->set_url('/lib/editor/tinymce/plugins/mathslate/mathslate.php');
$PAGE->set_pagelayout('embedded');
$PAGE->set_title(get_string('title', 'tinymce_mathslate'));

if (isset($SESSION->lang)) {
    // Language is set via page url param.
    $lang = $SESSION->lang;
} else {
    $lang = 'en';
}

// Find language.
$langmapping = array('cs' => 'cz', 'pt_br' => 'pt-br');

// Fix non-standard lang names.
if (array_key_exists($lang, $langmapping)) {
    $lang = $langmapping[$lang];
}

if (!file_exists("$CFG->dirroot/lib/mathslate/$lang/mathslate.php")) {
    $lang = 'en';
}

$editor = get_texteditor('tinymce');
$plugin = $editor->get_plugin('mathslate');

// Prevent https security problems.
$relroot = preg_replace('|^http.?://[^/]+|', '', $CFG->wwwroot);

$htmllang = get_html_lang();

// Load tinymce popup control for inserting result.
$PAGE->requires->js('/lib/editor/tinymce/tiny_mce/' . $editor->version . '/tiny_mce_popup.js', true);

// Load MathJax.
$PAGE->requires->js( new moodle_url(get_config('tinymce_mathslate')->mathjaxurl . '?config=TeX-MML-AM_HTMLorMML,Safe'),true);


$PAGE->requires->strings_for_js(array( 'nomathjax', 'clear', 'undo', 'redo', 'help'), 'tinymce_mathslate');
$PAGE->requires->strings_for_js(array( 'mathslate', 'cancel', 'cancel_desc',
        'inline', 'display', 'inline_desc', 'display_desc', 'nomathjax',
        'clear', 'undo', 'redo'), 'tinymce_mathslate');

$elementid = $PAGE->bodyid;

// Loads YUI and MathJax it is included in theme.
print $OUTPUT->header();

$PAGE->requires->yui_module('moodle-tinymce_mathslate-dialogue',
                                'M.tinymce_mathslate.init',
                                array(array('elementid' => $elementid,
                                   'config' => $CFG->wwwroot . '/lib/editor/tinymce/plugins/mathslate/config.json',
                                   'help' => $CFG->wwwroot . '/lib/editor/tinymce/plugins/mathslate/help.php')));

print $OUTPUT->container('', 'mathslate-container');

print $OUTPUT->footer();
