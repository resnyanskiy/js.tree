var Resnyanskiy;
(function (Resnyanskiy) {
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
    function parseIdString(idString) {
        return parseInt(/\d+$/.exec(idString)[0], 10);
    }
    var TreeNode = (function () {
        function TreeNode(id, title, isBranch) {
            this.id = id;
            this.title = title;
            this.isBranch = isBranch;
            this.items = {
            };
        }
        TreeNode.prototype.convertId = function (id) {
            return "+" + id;
        };
        TreeNode.prototype.addItem = function (item) {
            var itemId = item.id;
            if(this.findItem(itemId, false) == null) {
                this.items[this.convertId(itemId)] = item;
            }
        };
        TreeNode.prototype.removeItem = function (id) {
            delete this.items[this.convertId(id)];
        };
        TreeNode.prototype.findItem = function (id, deep) {
            var result = this.items[this.convertId(id)];
            if(!deep || result) {
                return result;
            }
            for(var n in this.items) {
                result = this.items[n].findItem(id, deep);
                if(result) {
                    return result;
                }
            }
        };
        TreeNode.prototype.getItems = function () {
            return this.items;
        };
        TreeNode.prototype.hasItems = function () {
            return Object.keys(this.items).length > 0;
        };
        TreeNode.prototype.getView = function () {
            var listNodeContent = createElement("a");
            listNodeContent.setAttribute("href", "#");
            listNodeContent.appendChild(document.createTextNode(this.title));
            var listItem = createElement("li", this.isBranch ? "branch" : null, "li-" + this.id);
            listItem.appendChild(createElement("span", "connector"));
            listItem.appendChild(createElement("span", "icon"));
            listItem.appendChild(listNodeContent);
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
            this.toggleBranchItemsVisibleClosure = function (ev) {
                var nodeId = parseIdString((ev.target).parentNode.attributes["id"].value);
                var node = _this.rootNode.findItem(nodeId, true);
                if(!_this.toggleNodeItemsVisible(node) && (_this.onBranchExpand instanceof Function)) {
                    (_this.treeContainer.querySelector("li#li-" + nodeId)).classList.add("loading");
                    _this.onBranchExpand(nodeId);
                }
            };
            this.onNodeClickClosure = function (ev) {
                var nodeId = parseIdString((ev.target).parentNode.attributes["id"].value);
                if(_this.onNodeClick instanceof Function) {
                    _this.onNodeClick(nodeId);
                }
            };
            this.rootNode = new TreeNode(0, "root", true);
            var ulElement = container.querySelector("ul");
            if(ulElement) {
                this.parseULElement(ulElement, 0);
                container.removeChild(ulElement);
            }
            this.treeContainer = createElement("ul", "container");
            if(nodes) {
                for(var n in nodes) {
                    this.rootNode.addItem(nodes[n]);
                }
            }
            this.renderNodeItemsTo(this.treeContainer, this.rootNode);
            container.classList.add("resnyanskiy-tree");
            container.appendChild(this.treeContainer);
        }
        Tree.prototype.parseULElement = function (ulElement, nodeId) {
            var node = nodeId == 0 ? this.rootNode : this.rootNode.findItem(nodeId, true);
            var ulElementContent = ulElement.childNodes;
            for(var i = 0; i < ulElementContent.length; i++) {
                var listItem = ulElementContent[i];
                if(listItem instanceof HTMLLIElement) {
                    var id = parseIdString(listItem.id);
                    var itemsContainer = listItem.querySelector("ul");
                    var isBranch = itemsContainer != undefined;
                    var nodeTitle;
                    var listItemContent = listItem.childNodes;
                    for(var j = 0; j < listItemContent.length; j++) {
                        var item = listItemContent[j];
                        if(item.nodeType == Node.TEXT_NODE) {
                            nodeTitle = item.textContent.trim();
                            break;
                        }
                    }
                    node.addItem(new TreeNode(id, nodeTitle, isBranch));
                    if(isBranch) {
                        this.parseULElement(itemsContainer, id);
                    }
                }
            }
        };
        Tree.prototype.renderNodeItemsTo = function (ulElement, node) {
            var nodeItems = node.getItems();
            for(var id in nodeItems) {
                var nodeItem = nodeItems[id];
                ulElement.appendChild(nodeItem.getView());
            }
            var branchConnectorNodeList = ulElement.querySelectorAll("li.branch > span.connector");
            for(var i = 0; i < branchConnectorNodeList.length; i++) {
                var connectorNode = branchConnectorNodeList[i];
                connectorNode.addEventListener("click", this.toggleBranchItemsVisibleClosure);
            }
            var contentNodeList = ulElement.querySelectorAll("li > a");
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
                    (ulElement.parentNode).classList.remove("opened");
                } else {
                    this.renderNodeItemsTo(ulElement, node);
                    (ulElement.parentNode).classList.add("opened");
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
            (this.treeContainer.querySelector("li#li-" + id)).classList.remove("loading");
            if(showNodeItems) {
                this.toggleNodeItemsVisible(node);
            }
        };
        return Tree;
    })();
    Resnyanskiy.Tree = Tree;    
})(Resnyanskiy || (Resnyanskiy = {}));
//@ sourceMappingURL=resnyanskiy.js.tree.js.map
