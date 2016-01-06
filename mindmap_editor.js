var eventBus = require('vertx/event_bus');
var mindMapUtils = require('web/mindmap_utils');

function newNodeKey() {
  return java.util.UUID.randomUUID().toString();
}

function publishMindMapEvent(mindMap, event) {
  eventBus.publish('mindMaps.events.'+mindMap._id, event);
}

eventBus.registerHandler('mindMaps.editor.addNode', function(args) {
  eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
  	if (res.mindMap) {
	  var mindMap = res.mindMap;
	  var parent  = mindMapUtils.findNodeByKey(mindMap, args.parentKey);
	  var newNode = {key: newNodeKey()};
	  if (args.name) {
		  newNode.name = args.name;
	  } else {
		  newNode.name = 'Click to edit';
  	 }

	  if (!parent.children) {
		parent.children = [];
	  }
	  parent.children.push(newNode);

	  eventBus.send('mindMaps.save', mindMap, function() {
	    publishMindMapEvent(mindMap, {event: 'nodeAdded', parentKey: args.parentKey, node: newNode});
	  });
    }
  });
});

eventBus.registerHandler('mindMaps.editor.renameNode', function(args) {
  eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
    if (res.mindMap) {
      var mindMap = res.mindMap;
      var node    = mindMapUtils.findNodeByKey(mindMap, args.key);

      if (node) {
      	node.name = args.newName;
      	eventBus.send('mindMaps.save', mindMap, function(reply) {
          publishMindMapEvent(mindMap, {event: 'nodeRenamed', key: args.key, newName: args.newName});
      	});
      }
    }
  });
});

eventBus.registerHandler('mindMaps.editor.deleteNode', function(args) {
  eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
    if (res.mindMap) {
      var mindMap = res.mindMap;
      var parent  = mindMapUtils.findNodeByKey(mindMap, args.parentKey);

      parent.children.forEach(function(child, index) {
        if (child.key === args.key) {
          parent.children.splice(index, 1);
          eventBus.send('mindMaps.save', mindMap, function(reply) {
            publishMindMapEvent(mindMap, {event: 'nodeDeleted', parentKey: args.parentKey, key: args.key});
          });
        }
      });
    }
  });
});
