// Javascript skeleton.
// Edit and adapt to your needs.
// The documentation of the NeoLoad Javascript API
// is available in the appendix of the documentation.

// Get variable value from VariableManager
var statPath = context.variableManager.getValue("cAdvisorStats.pathFromStatsNode");
var json = context.variableManager.getValue("topStatJSON");
var containerPath = context.variableManager.getValue("containerPath");
var containerId = context.variableManager.getValue("containerId");
var containerName = context.variableManager.getValue("containerName");

var value = com.jayway.jsonpath.JsonPath.parse(json).read("$."+statPath,java.lang.Double);

var isValid = (value != null && value != undefined && !isNaN(parseFloat(value)))
if(!isValid)
    logger.error("cAdvisor ["+statPath+"] isn't a double: ["+value+"] in...\n"+json)

var extPath = ""
var cParts = containerPath.split('/')
for(var i=0; i<cParts.length; i++) {
    var cPart = cParts[i]
    if(cPart.trim().length > 0)
        extPath += (extPath.length > 0 ? "|" : "") + (cPart == containerId ? containerName : cPart)
}
var statPathA = statPath;
while(statPathA.indexOf(".")>-1) { statPathA = statPathA.replace(".","|") }
extPath += "|"+statPathA

// Inject the computed value in a runtime variable
context.variableManager.setValue("statPath",extPath);
context.variableManager.setValue("statValue",value);