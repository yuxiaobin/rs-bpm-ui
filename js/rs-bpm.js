var connectionSet = [];

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
            if(div_id!=undefined || clone_div.hasClass("ui-dialog")){
                return;
            }
            div_id = new Date().getTime();
            clone_div.attr("id", div_id).append("<div class=\"ep\" action=\"begin\"></div>");
            $(this).append(clone_div);
            clone_div.removeClass("menu-task").removeClass("ui-draggable").css({"top":pos_y, "left":pos_x});
            clone_div.contextMenu({
                menu: 'activityMenu'
            }, function(action, el, pos) {
                var id_ = $(el).attr("id");
                if (action == 'edit') {
                    editActivity(id_);
                }
                else if (action == 'delete') {
                    instance.remove(id_);
                }
            })
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
            [ "Label", { label: "<i>Next</i>", id: "label", cssClass: "aLabel" }]
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
        console.log(c);
        //instance.detach(c);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        //info.connection.getOverlay("label").setLabel(info.connection.id);//display connection label
        var connection_id = info.connection.id;
        connectionSet.push({connection_id :connection_id , connection:info});
        var connection_label = info.connection.getOverlay("label").getElement();
        $(connection_label).attr("connection_id",info.connection.id)
            .contextMenu({
            menu: 'connMenu'
            },
            function(action, el, pos) {
                var id_ = $(el).attr("id");
                if (action == 'edit') {
                    console.log("edit");
                    editCondition(id_);
                }
                else if (action == 'delete') {
                    var removeItem = $(el).attr("connection_id");
                    connectionSet = $.grep(connectionSet, function(value) {
                        return value.connection_id != removeItem;
                    });
                    instance.detach(info);
                }
            });
    });

    // bind a double click listener to "canvas"; add new node when this occurs.
    /*jsPlumb.on(canvas, "dblclick", function(e) {
        newNode(e.offsetX, e.offsetY);
    });*/
    // initialise element as connection targets and source.
    var initNode = function(el) {
        // initialise draggable elements.
        instance.draggable(el,{containment:"parent"});
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
    //TODO: for testing only
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

    $(".statemachine-demo .w").each(function(){
        $(this).contextMenu({
            menu: 'activityMenu'
        }, function(action, el, pos) {
            var id_ = $(el).attr("id");
            if (action == 'edit') {
                console.log("edit");
                editActivity(id_);
            }
            else if (action == 'delete') {
                instance.remove(id_);
            }
        })

    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

    $(document).bind("contextmenu",function(e){
        return false;
    });

    $("#removeAll").on("click",function(){
        instance.empty("canvas");
    })
});
/*function newProperty(){
    var tr_1 = $("<tr>");
    var td_11 = $("<td>").append("Property Name:");
    var td_12 = $("<td>").append("<input type='text' name='propertyName' id='propertyName'>");
    tr_1.append(td_11).append(td_12);
    var tr_2 = $("<tr>");
    var td_21 = $("<td>").append("Property Value:");
    var td_22 = $("<td>").append("<input type='text' name='propertyValue' id='propertyValue'>");
    tr_2.append(td_21).append(td_22);

    $("#propertyTable").append(tr_1).append(tr_2);
}*/
function editActivity(id_){
    var activity = $("#"+id_);
    var dialog_div = $("<div>").attr("id","dialog-form").attr("title","Edit Activity");
    $.get("../template/activityProperties.html", function(data){
        data = data.replace("#activityDescp", activity.find("label").html());
        dialog_div.append(data);
    });

    dialog_div.dialog({
        autoOpen: false,
        height: 300,
        width: 600,
        modal: true,
        buttons: {
            /*"New Property": function () {
                $("#propertyTable")
                    .append("<tr>"
                        +"<td><input type=\"text\" name=\"newPropertyName\" placeholder='Property Name'></td>"
                        +"<td><select name=\"newPropertyType\">"
                        +"<option value='String'>String</option>"
                        +"<option value='Integer'>Integer</option>"
                        +"<option value='Boolean'>Boolean</option>"
                        +"<option value='Date'>Date</option>"
                        +"<option value='Enum'>Enum</option>"
                        +"<option value='User'>User</option>"
                        +"<option value='Group'>Group</option>"
                        +"</select>"
                        +"</td>"
                        +"<td><input type=\"text\" name=\"newPropertyValue\" placeholder='Property Value'></td>"
                        +"</tr>");
            },*/
            "Save":function(){
                alert("TODO: save");
            },
            Cancel: function () {
                $(this).dialog("destroy");
            }
        },
        close: function() {

        }
    });
    $(dialog_div).dialog( "open" );
}
function editCondition(id_){
    var condition_ = $("#"+id_);
    var dialog_div = $("<div>").attr("id","dialog-form").attr("title","Edit Condition");

    var condition_exp = condition_.attr("condition_exp");
    if(condition_exp==undefined){
        condition_exp = "";
    }
    var table_ = $("<table>")
            .append("<tr><td>Description:</td>"
                +"<td><input type=\"text\" id=\"descp\" value=\""+condition_.find("i").html()+"\"></td>"
                +"</tr>"
        )
            .append("<tr><td>Condition:</td>"
                +"<td><input type=\"text\" id=\"conditionId\" value=\""+condition_exp+"\"></td>"
                +"</tr>")
            .append("<tr><td></td>"
                +"<td>For example:Available name defined as \"count\", then the value here should be like: count>100</td>"
                +"</tr>")
        ;
    dialog_div.append(table_);

    dialog_div.dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Save": function () {

            },
            Cancel: function () {
                $(this).dialog("close");
            }
        },
        close: function() {

        }
    });
    $(dialog_div).dialog( "open" );
}

$.get("../template/contextMenu.html",function(data){
    $("#context_menu_include").html(data);
})
