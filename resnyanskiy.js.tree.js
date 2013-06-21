var Resnyanskiy;
(function (Resnyanskiy) {
    //#region shortcuts for build-in functions
    function createElement(tagName, className, id) {
        var result = document.createElement(tagName);
        if(className) {
            result.className = className;
        }
        if(id) {
            result.id = id;
        }
        return result;
    }
    // IComposite
    // interface ITreeNode extends ITreeNodeDataModel {
    //   addItem(item: ITreeNode): void;
    //   removeItem(id: number): void;
    //   findItem(id: number, deep: bool): ITreeNode;
    // }
    var TreeNode = (function () {
        function TreeNode(id, title, isBranch) {
            this.id = id;
            this.title = title;
            this.isBranch = isBranch;
            this.items = {
            };
        }
        TreeNode.prototype.addItem = //#region IComposite
        function (item) {
            var itemId = item.id;
            if(this.findItem(itemId, false) == null) {
                this.items[itemId] = item;
            }
        };
        TreeNode.prototype.removeItem = function (id) {
            delete this.items[id];
        };
        TreeNode.prototype.findItem = function (id, deep) {
            var result = this.items[id];
            if(!deep || result) {
                return result;
            }
            for(var n in this.items) {
                return this.items[n].findItem(id, deep);
            }
        };
        TreeNode.prototype.getItems = //#endregion
        function () {
            return this.items;
        };
        TreeNode.prototype.hasItems = function () {
            return Object.keys(this.items).length > 0;
        };
        TreeNode.prototype.getView = function () {
            var listNodeContent = createElement("a");
            listNodeContent.setAttribute("href", "#");
            listNodeContent.appendChild(document.createTextNode(this.title));
            var listNode = createElement("span", this.isBranch ? "branch" : null, "li-" + this.id);
            listNode.appendChild(createElement("span", "connector"));
            listNode.appendChild(createElement("span", "icon"));
            listNode.appendChild(listNodeContent);
            var listItem = createElement("li");
            listItem.appendChild(listNode);
            if(this.isBranch) {
                listItem.appendChild(createElement("ul", null, "ul-" + this.id));
            }
            return listItem;
        };
        return TreeNode;
    })();
    Resnyanskiy.TreeNode = TreeNode;    
    var Tree = (function () {
        function Tree(container, nodes) {
            var _this = this;
            //#region events closures
            this.toggleBranchItemsVisibleClosure = function (ev) {
                var nodeId = parseInt(/\d+$/.exec((ev.target).parentNode.attributes["id"].value)[0], 10);
                var node = _this.rootNode.findItem(nodeId, true);
                if(!_this.toggleNodeItemsVisible(node) && (_this.onBranchExpand instanceof Function)) {
                    (_this.treeContainer.querySelector("li > span#li-" + nodeId)).classList.add("loading");
                    _this.onBranchExpand(nodeId);
                }
            };
            this.onNodeClickClosure = function (ev) {
                var nodeId = parseInt(/\d+$/.exec((ev.target).parentNode.attributes["id"].value)[0], 10);
                if(_this.onNodeClick instanceof Function) {
                    _this.onNodeClick(nodeId);
                }
            };
            //#endregion
            this.treeContainer = createElement("ul", "container");
            this.rootNode = new TreeNode(0, "root", true);
            if(nodes) {
                for(var n in nodes) {
                    this.rootNode.addItem(nodes[n]);
                }
            }
            this.renderNodeItemsTo(this.treeContainer, this.rootNode);
            container.classList.add("resnyanskiy-tree");
            container.appendChild(this.treeContainer);
        }
        Tree.prototype.renderNodeItemsTo = function (ulElement, node) {
            var nodeItems = node.getItems();
            for(var id in nodeItems) {
                var nodeItem = nodeItems[id];
                ulElement.appendChild(nodeItem.getView());
            }
            var branchConnectorNodeList = ulElement.querySelectorAll("span.branch > span.connector");
            for(var i = 0; i < branchConnectorNodeList.length; i++) {
                var connectorNode = branchConnectorNodeList[i];
                connectorNode.addEventListener("click", this.toggleBranchItemsVisibleClosure);
            }
            var contentNodeList = ulElement.querySelectorAll("span > a");
            for(var i = 0; i < contentNodeList.length; i++) {
                var contentNode = contentNodeList[i];
                contentNode.addEventListener("click", this.onNodeClickClosure);
            }
        };
        Tree.prototype.toggleNodeItemsVisible = function (node) {
            if(node && node.hasItems()) {
                var ulElement = this.treeContainer.querySelector("ul#ul-" + node.id);
                if(ulElement.hasChildNodes()) {
                    while(ulElement.firstChild) {
                        ulElement.removeChild(ulElement.firstChild);
                    }
                    (ulElement.previousSibling).classList.remove("opened");
                } else {
                    this.renderNodeItemsTo(ulElement, node);
                    (ulElement.previousSibling).classList.add("opened");
                }
                return true;
            } else {
                return false;
            }
        };
        Tree.prototype.updateNode = function (id, items, showNodeItems) {
            var node = this.rootNode.findItem(id, true);
            for(var i in items) {
                node.addItem(items[i]);
            }
            (this.treeContainer.querySelector("li > span#li-" + id)).classList.remove("loading");
            if(showNodeItems) {
                this.toggleNodeItemsVisible(node);
            }
        };
        return Tree;
    })();
    Resnyanskiy.Tree = Tree;    
})(Resnyanskiy || (Resnyanskiy = {}));
//@ sourceMappingURL=resnyanskiy.js.tree.js.map
