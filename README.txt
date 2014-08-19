tinymce_mathslate
=================

Mathslate is a graphical tool for constructing mathematics within
Moodle.  This plugin adds the tool to TinyMCE version 3.  Other plugins
are required for Atto or TinyMCE4.  Install this directory as a
subdirectory of the Moodle directory lib/editor/tinymce/plugins with
the name mathslate.  Then visit the administrators notification page to
install the plugin to the database and adjust the settings.

This plugin requires MathJax to run.  If MathJax is configured on the
Moodle site either within theme or using MathJaxloader, Mathslate is
able to use it. If the TeX notation filter is used instead of MathJax,
then the url to load MathJax must be set in the admin setting so that
Mathslate can load MathJax on demand.  For more information about MathJax
see mathjax.org.

All original files are copyright Daniel Thies 2013-4 dthies@ccal.edu
and are licensed under the included GPL 3.
