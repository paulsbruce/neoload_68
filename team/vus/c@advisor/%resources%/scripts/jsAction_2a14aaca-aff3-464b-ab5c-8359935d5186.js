// Javascript skeleton.
// Edit and adapt to your needs.
// The documentation of the NeoLoad Javascript API
// is available in the appendix of the documentation.

// Get variable value from VariableManager
var iterator = context.variableManager.getValue("loopContainers_counter");
var containerPath = context.variableManager.getValue("containerNames_"+iterator);
var parts = containerPath.split('/')
var containerId = parts[parts.length-1]
context.variableManager.setValue("containerPath",containerPath);
context.variableManager.setValue("containerId",containerId);