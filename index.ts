/// <reference path="resnyanskiy.js.tree.ts" />

var TreeNode = Resnyanskiy.TreeNode;

var item_1_1: Resnyanskiy.TreeNode = new TreeNode(11, "Item_1_1", true);
item_1_1.addItem(new TreeNode(111, "Item_1_1_1", false));
item_1_1.addItem(new TreeNode(112, "Item_1_1_2", false));

var item_1: Resnyanskiy.TreeNode = new TreeNode(1, "Item_1", true);
item_1.addItem(item_1_1);
item_1.addItem(new TreeNode(12, "Item_1_2", false));

var item_2: Resnyanskiy.TreeNode = new TreeNode(2, "Item_2", true);
item_2.addItem(new TreeNode(21, "Item_2_1", false));

var item_3: Resnyanskiy.TreeNode = new TreeNode(3, "Item_3", true);

var tree = new Resnyanskiy.Tree(document.getElementById("tree"), [item_1, item_2, item_3]);
tree.onNodeClick = onNodeClickHandler;
tree.onBranchExpand = onBranchExpandHandler;

// this - Tree
function onNodeClickHandler(id: number) {
  document.getElementById("content").innerHTML = "Click on Node: " + id;
}

// this - Tree
function onBranchExpandHandler(id: number) {
  var tree = this;

  setTimeout(function() {
    var XHR: XMLHttpRequest = new XMLHttpRequest();
    XHR.open("GET", "data.json", true);
    XHR.onreadystatechange = function(ev: Event) {
      if(this.readyState == 4) {
        var data: Resnyanskiy.ITreeNodeDataModel[] = (<Resnyanskiy.ITreeNodeDataModel[]>JSON.parse(this.responseText));
        var items: Resnyanskiy.TreeNodeCollection = <Resnyanskiy.TreeNodeCollection>{};
        for(var i in data) {
          var currentItem: Resnyanskiy.ITreeNodeDataModel = data[i];
          items["+" + currentItem.id] = new TreeNode(currentItem.id, currentItem.title, currentItem.isBranch);
        }
        tree.updateNode(id, items, true);
      }
    };
    XHR.send(null);
  }, 5000);
}