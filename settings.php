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
 * DragMath integration settings.
 *
 * @package   tinymce_mathslate
 * @copyright 2014 Daniel Thies <dthies@ccal.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    $settings->add(new admin_setting_configcheckbox('tinymce_mathslate/requiretex',
        get_string('requiretex', 'tinymce_mathslate'), get_string('requiretex_desc', 'tinymce_mathslate'), 0));
    $settings->add(new admin_setting_configtext('tinymce_mathslate/mathjaxurl',
        get_string('mathjaxurl', 'tinymce_mathslate'), get_string('mathjaxurl_desc', 'tinymce_mathslate'),
        'https://cdn.mathjax.org/mathjax/latest/MathJax.js', PARAM_RAW));

}
