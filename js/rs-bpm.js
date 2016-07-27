var RS_TYPE_START = "start-task";
var RS_TYPE_END = "end-task";
var connectionSet = [];
var variableSet = [];//activityId:[propertyArray(name,type,value)]

//TODO:get nodeList from server.
var result_data = {"tasks":[{"id":"start-task","rsType":"start-task","descp":"Start","position":{"top":26,"left":312}},{"id":"end-task","rsType":"end-task","descp":"End","position":{"top":370,"left":350}},{"id":"userTask1","rsType":"user-task","descp":"userTask1","position":{"top":200,"left":550}},{"id":"userTask2","rsType":"user-task","descp":"userTask2","position":{"top":370,"left":550}},{"id":"condition","rsType":"rs-cond-task","descp":"condition adjust","position":{"top":173,"left":312}},{"id":"1469524101052","rsType":"rs-cond-task","descp":"Condition Node","position":{"top":231,"left":115}},{"id":"1469524108740","rsType":"user-task","descp":"User Task","position":{"top":376,"left":101}}],"conns":[{"con_id":"con_5","con_descp":"Start to process","con_value":"","source_id":"start-task","target_id":"condition"},{"con_id":"con_11","con_descp":"Yes","con_value":"","source_id":"condition","target_id":"end-task"},{"con_id":"con_17","con_descp":"No","con_value":"","source_id":"condition","target_id":"userTask1"},{"con_id":"con_23","con_descp":"Next step","con_value":"","source_id":"userTask1","target_id":"userTask2"},{"con_id":"con_29","con_descp":"Over","con_value":"","source_id":"userTask2","target_id":"end-task"},{"con_id":"con_35","con_descp":"Next","con_value":"","source_id":"condition","target_id":"1469524101052"},{"con_id":"con_41","con_descp":"Next","con_value":"","source_id":"1469524101052","target_id":"1469524108740"},{"con_id":"con_47","con_descp":"Next","con_value":"","source_id":"1469524108740","target_id":"end-task"}]}

var nodeList = result_data.tasks;
var connList = result_data.conns;
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
            var rs_type = clone_div.attr("rs-type");
            if(rs_type==RS_TYPE_START){
                if($(this).find("div[action='"+RS_TYPE_START+"']").length!=0){
                    console.log("start task already existed");
                    return;
                }
            }
            if(rs_type==RS_TYPE_END){
                if($(this).find("div[action='"+RS_TYPE_END+"']").length!=0){
                    console.log("end task already existed");
                    return;
                }
            }
            clone_div.attr("id", div_id).append("<div class=\"ep\" action=\""+rs_type+"\"></div>");
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
            }).addClass("user-task");
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

//    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });
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

//    var basicType = {
//        connector: "StateMachine",
//        paintStyle: { strokeStyle: "red", lineWidth: 4 },
//        hoverPaintStyle: { strokeStyle: "blue" },
//        overlays: [
//            "Arrow"
//        ]
//    };
//    instance.registerConnectionType("basic", basicType);

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            lineWidth: 4,
            strokeStyle: "#61B7CF",
            joinstyle: "round",
            outlineColor: "white",
            outlineWidth: 2
        },
        connectorHoverStyle = {
            lineWidth: 4,
            strokeStyle: "#216477",
            outlineWidth: 2,
            outlineColor: "white"
        },
        endpointHoverStyle = {
            fillStyle: "#216477",
            strokeStyle: "#216477"
        };

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
        var con_source = info.source;
        if($(con_source).hasClass("rs-cond-task")){
            var targetConnections = $.grep(connectionSet, function(value) {
                return value.connection.source.id == con_source.id;
            });
            if(targetConnections.length>1){
                connection_label.firstChild.innerHTML = "No";
            }else{
                connection_label.firstChild.innerHTML = "Yes";
            }
        }

    });

    // bind a double click listener to "canvas"; add new node when this occurs.
    /*jsPlumb.on(canvas, "dblclick", function(e) {
        newNode(e.offsetX, e.offsetY);
    });*/
    // initialise element as connection targets and source.
    var initNode = function(el,type) {
        // initialise draggable elements.
        instance.draggable(el,{containment:"parent"});
        if(type==""){

        }
        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle:connectorPaintStyle,
            connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            maxConnections: 5,
            //onMaxConnections: function (info, e) { alert("Maximum connections (" + info.maxConnections + ") reached");  },
            overlays: [
                [ "Label", {
                    location: [0.5, 1.5],
                    label: "Drag",
                    cssClass: "endpointSourceLabel",
                    visible:false
                } ]
            ]
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: false//Not allow to connect to itself
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    var newNodeById = function(id,type,descp, x, y) {
        var d = document.createElement("div");
        d.className = "w "+type;
        d.id = id;
        if(type=="rs-cond-task"){
            d.innerHTML = "<div class='task-descp'>"+descp + "</div><div class=\"ep\"></div>";
        }else{
            d.innerHTML = descp + "<div class=\"ep\"></div>";
        }

        d.style.left = x + "px";
        d.style.top = y + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    };

    // suspend drawing and initialise.
    instance.batch(function () {
        if(nodeList==undefined){
            nodeList = [];
        }
        var nodeSize = nodeList.length;
        if(nodeSize!=undefined && nodeSize!=0){
            for(var i=0;i<nodeList.length;++i){
                var node1 = nodeList[i];
                newNodeById(node1.id, node1.rsType, node1.descp,node1.position.left,node1.position.top);
            }
            for(var i=0;i<connList.length;++i){
                var conn_data = connList[i];
                var conn_ = instance.connect({ source: conn_data.source_id, target: conn_data.target_id });
                conn_.getOverlay("label").label = "<i>"+conn_data.con_descp+"</i>"
            }
        }else{
            var startNode = {id:RS_TYPE_START,rsType:RS_TYPE_START,descp:"Start Node", position:{top:70,left:350}};
            var endNode = {id:RS_TYPE_END,rsType:RS_TYPE_END,descp:"End Node", position:{top:370,left:350}};
            newNodeById(startNode.id, startNode.rsType, startNode.descp,startNode.position.left,startNode.position.top);
            newNodeById(endNode.id, endNode.rsType, endNode.descp,endNode.position.left,endNode.position.top);
        }
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
    });

    $("#Save").on("click",function(){
        var save_data = {};
        var save_tasks = [];
        var save_conns = [];
        var curr_conns = instance.getConnections();
        for(var i=0;i<curr_conns.length;++i){
            var conn_ = curr_conns[i];
            var conn_json = {};
            conn_json.con_id = conn_.id;
            conn_json.con_descp = $(conn_.getOverlay("label").label).text();
            conn_json.con_value = "";//TODO:
            conn_json.source_id = conn_.source.id;
            conn_json.target_id = conn_.target.id;
            save_conns[save_conns.length] = conn_json;
        }
        $("#canvas .w").each(function(){
            var task_json = {};
            var jqObj = $(this);
            var pos_ = jqObj.position();
            task_json.id = jqObj.attr("id");
            if(jqObj.hasClass(RS_TYPE_START)){
                task_json.rsType = RS_TYPE_START;
            }
            else if(jqObj.hasClass(RS_TYPE_END)){
                task_json.rsType = RS_TYPE_END;
            }
            else if(jqObj.hasClass("rs-cond-task")){
                pos_.top = parseInt(pos_.top)+13;// add for rotation divide issue
                pos_.left = parseInt(pos_.left)+13;
                task_json.rsType ="rs-cond-task";
            }
            else{
                task_json.rsType ="user-task";
            }
            task_json.descp = jqObj.text();

            var task_position = {
                top:pos_.top,
                left:pos_.left
            };
            task_json.position = pos_;
            save_tasks[save_tasks.length] = task_json;
        });
        save_data.tasks = save_tasks;
        save_data.conns = save_conns;
//        console.log(save_data);
        console.log(JSON.stringify(save_data));
    });

    $("#resetBtn").on("click",function(){
        $("#canvas .w").each(function(){
            if($(this).hasClass(RS_TYPE_START) || $(this).hasClass(RS_TYPE_END)){
                //start&end no need to remove
            }else{
                instance.remove($(this).attr("id"));
            }
        });
    });
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
    var dialog_div = $("<div>").attr("id","dialog-form").attr("title","Edit Activity").attr("activityId",id_);
    $.get("../template/activityProperties.html", function(data){
        data = data.replace("#activityDescp", activity.find("label").html());
        dialog_div.append(data);
        //load added properties
        var activityData = $.grep(variableSet, function(value) {
            return value.activityId == id_;
        });
        if(activityData==undefined || activityData==null || activityData.length==0){
            //no saved data
        }else{
            loadProperties(activityData[0].properties);
        }
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
                var activityDescp = $("#activityDescp").val();
                var activityId_ = $("#dialog-form").attr("activityId");
                variableSet = $.grep(variableSet, function(value) {
                    return value.activityId != activityId_;//remove same activityId
                });
                var proArray = [];
                $(".newPropertyName").each(function(){
                    var property_ = $(this);
                    var selection_ = property_.parent().siblings("td:has(select)").children();
                    var textbox_ = property_.parent().siblings("td:has(input:text):visible").children();
                    proArray[proArray.length]={
                        name:property_.val(),
                        type:selection_.val(),
                        value:textbox_.val()
                    };
                });
                variableSet.push({activityId :activityId_ , properties:proArray});
                $("#"+activityId_+" > label").html(activityDescp);
                $(this).dialog("destroy");
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
                $(this).dialog("destroy");
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
