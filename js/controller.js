/**
 * Created by Administrator on 16-5-22.
 */
activityModeler.controller("propertyController",['$scope',function($scope){
    $scope.newProperty = function(){
        $("#propertyTable").append("<tr>"
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
            +"<td></td>"
            +"</tr>");
    }
}]);