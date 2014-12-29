(function() {

var QUARTZ_LAYOUT = 'quartz',
    PD_LAYOUT = 'pd';

var default_config = {
    debug: false,
    layout: QUARTZ_LAYOUT
};

// ============================= HtmlRenderer ==================================
// =============================================================================

function HtmlRenderer(user_config) {

    var nodes, links;

    var config = mergeConfig(user_config, default_config);

    return {

        'model/new': function(root, update) {

            nodes = {}; links = {};

            if (root.classList) {
                root.classList.add('rpd-model');
                if (config.layout) root.classList.add('rpd-layout-' + config.layout);
            }

        },

        'node/add': function(root, update) {

            var node = update.node;

            var nodeBox = quickElm('div', 'rpd-node-box');
            var nodeElm = quickElm('table', 'rpd-node');

            var inletsTrg, outletsTrg;

            if (config.layout == QUARTZ_LAYOUT) {

                var headElm = quickElm('thead', 'rpd-title');
                var headRow = quickElm('tr');

                if (node.def.icon) {
                    // TODO
                }

                var headCell = quickElm('th');
                headCell.setAttribute('colspan', 3);
                headCell.appendChild(quickElmVal('span', 'rpd-name', node.name));
                if (config.debug) headCell.appendChild(quickElmVal('span', 'rpd-type', node.type));
                headRow.appendChild(headCell);

                headElm.appendChild(headRow);

                var contentElm = quickElm('tbody', 'rpd-content');
                var contentRow = quickElm('tr');

                var inletsCell = quickElm('td', 'rpd-inlets');
                var inletsTable = quickElm('table');
                var inletsBody = quickElm('tbody');

                inletsTrg = inletsBody;

                inletsTable.appendChild(inletsBody);
                inletsCell.appendChild(inletsTable);

                var bodyCell = quickElm('td', 'rpd-body');
                var bodyTable = quickElm('table');

                var outletsCell = quickElm('td', 'rpd-outlets');
                var outletsTable = quickElm('table');
                var outletsBody = quickElm('tbody');

                outletsTrg = outletsBody;

                outletsTable.appendChild(outletsBody);
                outletsCell.appendChild(outletsTable);

                contentRow.appendChild(inletsCell);
                contentRow.appendChild(bodyCell);
                contentRow.appendChild(outletsCell);
                contentElm.appendChild(contentRow);

                nodeElm.appendChild(headElm);
                nodeElm.appendChild(contentElm);

            } else if (config.layout == PD_LAYOUT) {

                // TODO:

            }

            if (nodeElm.classList) nodeElm.classList.add('rpd-'+node.type.replace('/','-'));

            nodes[node.id] = { elm: nodeElm,
                               inletsTrg: inletsTrg, outletsTrg: outletsTrg,
                               inlets: {}, outlets: {},
                               inletsNum: 0, outletsNum: 0 };

            applyNextNodeRect(node, nodeBox);

            nodeBox.appendChild(nodeElm);

            root.appendChild(nodeBox);

        },

        'node/remove': function(root, update) {},

        'inlet/add': function(root, update) {

            var inlet = update.inlet;

            var nodeData = nodes[inlet.node.id];
            var inletsTrg = nodeData.inletsTrg;

            var inletElm, valueElm;

            if (config.layout == QUARTZ_LAYOUT) {

                inletElm = quickElm('tr', 'rpd-inlet-body');
                valueElm = quickElm('td', 'rpd-value rpd-stale');
                inletElm.appendChild(valueElm);

                inletElm.appendChild(quickElmVal('td', 'rpd-name', inlet.name));
                if (config.debug) inletElm.appendChild(quickElmVal('td', 'rpd-type', inlet.type));

            } else if (config.layout == PD_LAYOUT) {

                // TODO:

            }

            if (inletElm.classList) inletElm.classList.add('rpd-'+inlet.type.replace('/','-'));

            inletsTrg.appendChild(inletElm);

            nodeData.inlets[inlet.id] = { elm: inletElm, valueElm: valueElm };

            nodeData.inletsNum++;

        },

        'inlet/remove': function(root, update) {},

        'inlet/update': function(root, update) {

            var inlet = update.inlet;

            var nodeData = nodes[inlet.node.id];
            var inletData = nodeData.inlets[inlet.id];

            var valueElm = inletData.valueElm;
            valueElm.innerText = valueElm.textContent = update.value;
            valueUpdateEffect(inletData, valueElm);

        },

        'outlet/add': function(root, update) {

            var outlet = update.outlet;

            var nodeData = nodes[outlet.node.id];
            var outletsTrg = nodeData.outletsTrg;

            var outletElm, valueElm;

            if (config.layout == QUARTZ_LAYOUT) {

                outletElm = quickElm('tr', 'rpd-outlet-body');
                valueElm = quickElm('td', 'rpd-value rpd-stale');

                if (config.debug) outletElm.appendChild(quickElmVal('td', 'rpd-type', outlet.type));
                outletElm.appendChild(quickElmVal('td', 'rpd-name', outlet.name));
                outletElm.appendChild(valueElm);

            } else if (config.layout == PD_LAYOUT) {

                // TODO:

            }

            if (outletElm.classList) outletElm.classList.add('rpd-'+outlet.type.replace('/','-'));

            outletsTrg.appendChild(outletElm);

            nodeData.outlets[outlet.id] = { elm: outletElm, valueElm: valueElm };

            nodeData.outletsNum++;

        },

        'outlet/remove': function(root, update) {},

        'outlet/update': function(root, update) {

            var outlet = update.outlet;

            var nodeData = nodes[outlet.node.id];
            var outletData = nodeData.outlets[outlet.id];

            var valueElm = outletData.valueElm;
            valueElm.innerText = valueElm.textContent = update.value;
            valueUpdateEffect(outletData, valueElm);

        },

        'outlet/connect': function(root, update) {

            var link = update.link;
            var outlet = link.outlet;
            var inlet  = link.inlet;

            var outletElm = nodes[outlet.node.id].outlets[outlet.id].elm;
            var inletElm  = nodes[inlet.node.id].inlets[inlet.id].elm;

            var linkElm = createLink(outletElm, inletElm);

            links[link.id] = { elm: linkElm };

            root.appendChild(linkElm);

        },
        'link/adapt': function(root, update) {},
        'link/error': function(root, update) {}

    }; // return

} // function

// ================================ utils ======================================
// =============================================================================

function mergeConfig(user_conf, defaults) {
    if (user_conf) {
        var merged = {};
        for (var prop in defaults)  { merged[prop] = defaults[prop]; }
        for (var prop in user_conf) { merged[prop] = user_conf[prop]; }
        return merged;
    } else return defaults;
}

function quickElm(type, cls) {
    var elm = document.createElement(type);
    if (cls) elm.className = cls;
    return elm;
}

function quickElmVal(type, cls, value) {
    var elm = document.createElement(type);
    elm.className = cls;
    elm.innerText = elm.textContent = value;
    return elm;
}

function valueUpdateEffect(storage, valueElm) {
    if (valueElm.classList) {
        valueElm.classList.remove("rpd-stale");
        valueElm.classList.add("rpd-fresh");
        if (storage.removeTimeout) clearTimeout(storage.removeTimeout);
        storage.removeTimeout = setTimeout(function() {
            valueElm.classList.remove("rpd-fresh");
            valueElm.classList.add("rpd-stale");
            storage.removeTimeout = null;
        }, 1000);
    }
}

function createLink(outletElm, inletElm) {
    var a = outletElm.getBoundingClientRect();
    var b = inletElm.getBoundingClientRect();

    var distance = Math.sqrt(((a.left - b.left) * (a.left - b.left)) +
                             ((a.top  - b.top ) * (a.top  - b.top )));
    var angle = Math.atan2(b.top - a.top, b.left - a.left);

    var linkElm = quickElm('span','rpd-link');
    linkElm.style.position = 'absolute';
    linkElm.style.width = Math.floor(distance) + 'px';
    linkElm.style.left = a.left + 'px';
    linkElm.style.top = a.top + 'px';
    linkElm.style.transformOrigin = 'left top';
    linkElm.style.transform = 'rotateZ(' + angle + 'rad)';
    return linkElm;
}

function rotateLink(root, degree) {
    // TODO:
}

var default_width = 100,
    default_height = 50,
    default_x_margin = 30;
    default_y_margin = 20,
    default_limits = [ 1000, 1000 ];

var node_rects = [];

function applyNextNodeRect(node, nodeElm, limits) {
    var width = node.def.minWidth || default_width,
        height = node.def.minHeight || default_height,
        limits = limits || default_limits;
    /*var w_sum = 0, h_sum = 0;
    for (var i = 0, il = node_rects.length; i < il; i++) {
        node_rects[i]
    } TODO */
    var new_rect;
    if (node_rects.length) {
        var last_rect = node_rects[node_rects.length-1];
        new_rect = [ last_rect[0], last_rect[1] + last_rect[3] + default_y_margin, width, height ];
    } else {
        new_rect = [ 0, 0, width, height ];
    }
    nodeElm.style.left = new_rect[0] + 'px';
    nodeElm.style.top = new_rect[1] + 'px';
    nodeElm.style.minWidth = new_rect[2] + 'px';
    nodeElm.style.minHeight = new_rect[3] + 'px';
    node_rects.push(new_rect);
}

// =========================== registration ====================================
// =============================================================================

Rpd.HtmlRenderer = HtmlRenderer;

Rpd.renderer('html', function(user_conf) {

    var instance = HtmlRenderer(user_conf);

    return function(root, update) {

        if (instance[update.type]) {
            instance[update.type](root, update);
        }

    }

});

})();
