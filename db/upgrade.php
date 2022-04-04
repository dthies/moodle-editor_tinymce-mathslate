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
 * TinyMCE Mathslate integration upgrade
 *
 * @package   tinymce_mathslate
 * @copyright 2017 Daniel Thies <dthies@ccal.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

/**
 * @param int $oldversion the version we are upgrading from
 * @return bool result
 */
function xmldb_tinymce_mathslate_upgrade($oldversion) {

    if ($oldversion < 2015041708) {
        $mathjaxurl = get_config('tinymce_mathslate', 'mathjaxurl');
        if (
            $mathjaxurl == 'https://cdn.mathjax.org/mathjax/latest/MathJax.js'
            || $mathjaxurl == 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js'
            || $mathjaxurl == 'https://cdn.jsdelivr.net/npm/mathjax@2.7.8/MathJax.js'
        ) {
            set_config('mathjaxurl', 'https://cdn.jsdelivr.net/npm/mathjax@2.7.9/MathJax.js', 'tinymce_mathslate');
        }
        upgrade_plugin_savepoint(true, 2015041708, 'tinymce', 'mathslate');
    }
    return true;
}
