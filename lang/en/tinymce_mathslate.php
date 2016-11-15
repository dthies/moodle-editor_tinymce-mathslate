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
 * Strings for Mathslate editor integration plugin.
 *
 * @package   tinymce_mathslate
 * @copyright 2013 Daniel Thies
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'TinyMCE Mathslate';
$string['title'] = 'MathSlate Editor';
$string['inline'] = 'Inline Math';
$string['inline_desc'] = 'Insert math within a sentence or paragraph';
$string['display'] = 'Display Math';
$string['display_desc'] = 'Insert math on a separate line';
$string['cancel'] = 'Cancel';
$string['cancel_desc'] = 'Quit and do not save work';
$string['undo'] = 'Undo previous action';
$string['redo'] = 'Redo the action just undone';
$string['clear'] = 'Delete selection or the entire expression';
$string['help'] = 'Access documentation';
$string['mathslate'] = 'MathSlate';
$string['requiretex'] = 'Require TeX filter';
$string['requiretex_desc'] = 'If enabled the Mathslate button is visible only when the TeX filter is enabled in the editor context. Disable if you want it to appear globally (normal if MathJax is included in header sitewide).';
$string['mathjaxurl'] = 'MathJax url';
$string['mathjaxurl_desc'] = 'The url for the MathJax.js file that mathslate should load if MathJax is not already present and configured (probably true if you are using the Moodle TeX filter). The default downloads from the internet. Change this to configure a local copy instead.';
$string['nomathjax'] = '<p>MathJax does not seem to be present on this site. In order to use this plugin MathJax needs to be configured. MathJax is an opensource software library that is capable of displaying mathmatics in any javascript enabled browser.  Mathslate uses it to render mathematics within the editor. Therefore you should check with the system administrator of this site to see whether MathJax may be installed. See <a href="http://mathjax.org" target="_blank">mathjax.org</a> for more instructions.</p>';

/* All lang strings used from TinyMCE JavaScript code must be named 'pluginname:stringname', nono need to create langs/en_dlg.js */
$string['mathslate:desc'] = 'Insert equation';
