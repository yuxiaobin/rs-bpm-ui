jsPlumb.ready(function () {
    $(".menu-task").draggable({helper: 'clone'});
    $(".rscontainer").droppable({
        drop: function(event, ui) {
            var trans4ContainerPos = transferPagePos2ContainerPos(event.pageX, event.pageY);
            var task_width = ui.draggable.context.clientWidth;
            var task_height = ui.draggable.context.clientHeight;
            var pos_x = trans4ContainerPos.x-task_width/2;
            var pos_y = trans4ContainerPos.y-task_height/2;
            var clone_div = $(ui.draggable).clone();
            var div_id = clone_div.attr("id");
            if(div_id!=undefined){
                return;
            }
            div_id = new Date().getTime();
            clone_div.attr("id", div_id).append("<div class=\"ep\" action=\"begin\"></div>");
            $(this).append(clone_div);
            clone_div.removeClass("menu-task").css({"top":pos_y, "left":pos_x});
            initNode(clone_div);
        }
    });
    var transferPagePos2ContainerPos = function(pageX_,pageY_){
        var container_offset = $(".rscontainer").offset();
        var transPos = {};
        transPos.x = pageX_ - container_offset.left;
        transPos.y = pageY_ - container_offset.top;
        return transPos;
    }
    var transferPagePos2ParentPos = function(pageX_,pageY_, target_){
        var container_offset = $(target_).offset();
        var transPos = {};
        transPos.x = pageX_ - container_offset.left;
        transPos.y = pageY_ - container_offset.top;
        return transPos;
    }

    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        Connector:"StateMachine",
        HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            } ],
            [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
        ],
        Container: "canvas"
    });

    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
    window.jsp = instance;
    var canvas = document.getElementById("canvas");
    var windows = jsPlumb.getSelector(".statemachine-demo .w");
    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    instance.bind("click", function (c) {
        instance.detach(c);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        info.connection.getOverlay("label").setLabel(info.connection.id);

    });

    // bind a double click listener to "canvas"; add new node when this occurs.
    jsPlumb.on(canvas, "dblclick", function(e) {
        newNode(e.offsetX, e.offsetY);
    });

    // initialise element as connection targets and source.
    var initNode = function(el) {
        // initialise draggable elements.
        instance.draggable(el);
        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            maxConnections: 2,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    var newNode = function(x, y) {
        var d = document.createElement("div");
        var id = jsPlumbUtil.uuid();
        d.className = "w";
        d.id = id;
        d.innerHTML = id.substring(0, 7) + "<div class=\"ep\"></div>";
        d.style.left = x + "px";
        d.style.top = y + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    };

    // suspend drawing and initialise.
    instance.batch(function () {
        for (var i = 0; i < windows.length; i++) {
            initNode(windows[i], true);
        }
        // and finally, make a few connections
        instance.connect({ source: "opened", target: "phone1", type:"basic" });
        instance.connect({ source: "phone1", target: "phone1", type:"basic" });
        instance.connect({ source: "phone1", target: "inperson", type:"basic" });

        instance.connect({
            source:"phone2",
            target:"rejected",
            type:"basic"
        });
    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

});