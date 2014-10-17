(function() {
        // Load plugin specific language pack
        //tinymce.PluginManager.requireLangPack('example');

        tinymce.create('tinymce.plugins.MathSlatePlugin', {
                /**
                   * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
                 * @param {string} url Absolute URL to where the plugin is located.
                 */
                init : function(ed, url) {
                        // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            lang = tinyMCE.activeEditor.getParam('language');
                        ed.addCommand('mathSlate', function() {

                                ed.windowManager.open({
                                        file : ed.getParam("moodle_plugin_base") + '/mathslate/mathslate.php?lang=' + lang,
                                        width : 500,
                                        height : 500,
                                        inline : 1
                                }, {
                                        plugin_url : url, // Plugin absolute URL
                                        math: {mathml: "<math></math>"}
                                });
                        });

                        // Register button
                        ed.addButton('mathslate', {
                                title : 'mathslate.desc',
                                cmd : 'mathSlate',
                                image : url + '/img/mathslate.png'
                        });
                        // Add a node change handler, selects the button in the UI when a image is selected
                        ed.onNodeChange.add(function(ed, cm, n) {
                                cm.setActive('mathSlate', n.nodeName == 'IMG');
                        });
                },

                /**
                 * @return {Object} Name/value array containing information about the plugin.
                 */
                getInfo : function() {
                        return {
                                longname : 'MathSlate',
                                author : 'Daniel Thies',
                                authorurl : 'http://www.ccal.edu',
                                infourl : 'http://elearning.ccal.edu',
                                version : "0.2"
                        };
                }
        });

        // Register plugin
        tinymce.PluginManager.add('mathslate', tinymce.plugins.MathSlatePlugin);
})();
