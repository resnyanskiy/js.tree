module Resnyanskiy {
  //#region utility functions
  function createElement(tagName: string, className?: string, id?: string) {
    var result = document.createElement(tagName);
    if(className) result.className = className;
    if(id) result.id = id;
    return result;
  }

  function parseIdString(idString: string) {
    return parseInt(/\d+$/.exec(idString)[0], 10);
  }
  //#endregion

  // IComponent
  export interface ITreeNodeDataModel {
    id: number; // positive integer, 0 for root node (invisible by default)
    title: string;
    isBranch: bool;
  }

  export interface TreeNodeCollection extends Object {
    [id: string]: TreeNode;
  }

  // IComposite
  // interface ITreeNode extends ITreeNodeDataModel {
  //   addItem(item: ITreeNode): void;
  //   removeItem(id: number): void;
  //   findItem(id: number, deep: bool): ITreeNode;
  // }
  export class TreeNode implements ITreeNodeDataModel {
    constructor(public id: number, public title: string, public isBranch: bool) { }

    private items: TreeNodeCollection = <TreeNodeCollection>{};

    private convertId(id: number): string {
      //if(id instanceof String)
      //  return +id;
      return "+" + id;
    }

    //#region IComposite
    public addItem(item: TreeNode) {
      var itemId: number = item.id;
      if(this.findItem(itemId, false) == null) {
        this.items[this.convertId(itemId)] = item;
      }
    }

    public removeItem(id: number) {
      delete this.items[this.convertId(id)];
    }

    public findItem(id: number, deep: bool): TreeNode {
      var result: TreeNode = this.items[this.convertId(id)];

      if(!deep || result)
        return result;

      for(var n in this.items)
        return this.items[n].findItem(id, deep);
    }
    //#endregion

    public getItems(): TreeNodeCollection {
      return this.items;
    }

    public hasItems(): bool {
      return Object.keys(this.items).length > 0;
    }

    public getView(): HTMLElement {
      var listNodeContent = createElement("a");
      listNodeContent.setAttribute("href", "#");
      listNodeContent.appendChild(document.createTextNode(this.title));

      var listItem: HTMLElement = createElement("li", this.isBranch ? "branch" : null, "li-" + this.id);
      listItem.appendChild(createElement("span", "connector"));
      listItem.appendChild(createElement("span", "icon"));
      listItem.appendChild(listNodeContent);

      if(this.isBranch)
        listItem.appendChild(createElement("ul", null, "ul-" + this.id));

      return listItem;
    }
  }

  export class Tree {
    private treeContainer: HTMLElement;
    private rootNode: TreeNode;

    private toggleBranchItemsVisibleClosure: (ev: Event) => void;
    private onNodeClickClosure: (ev: Event) => void;

    private parseULElement(ulElement: HTMLUListElement, nodeId: number) {
      var node: TreeNode = nodeId == 0 ? this.rootNode : this.rootNode.findItem(nodeId, true);

      var ulElementContent: NodeList = ulElement.childNodes;
      for(var i = 0; i < ulElementContent.length; i++) {
        var listItem: HTMLElement = <HTMLElement> ulElementContent[i];
        if(listItem instanceof HTMLLIElement) {
          var id = parseIdString(listItem.id);
          var itemsContainer: HTMLUListElement = <HTMLUListElement> listItem.querySelector("ul");
          var isBranch = itemsContainer != undefined;

          var nodeTitle: string;
          var listItemContent: NodeList = listItem.childNodes;
          for(var j = 0; j < listItemContent.length; j++) {
            var item: Node = listItemContent[j];
            if(item.nodeType == Node.TEXT_NODE) {
              nodeTitle = item.textContent.trim();
              break;
            }
          }

          node.addItem(new TreeNode(id, nodeTitle, isBranch));
          if(isBranch) this.parseULElement(itemsContainer, id);
        }
      }
    }

    // If "container" contains UL element with nested LI elements,
    // they will be first in tree, then elements from "nodes"
    constructor(container: HTMLElement, nodes?: TreeNode[]) {
      //#region events closures
      this.toggleBranchItemsVisibleClosure = (ev: Event) => {
        var nodeId: number = parseIdString((<HTMLElement>ev.target).parentNode.attributes["id"].value);
        var node: TreeNode = this.rootNode.findItem(nodeId, true)
        if(!this.toggleNodeItemsVisible(node) && (this.onBranchExpand instanceof Function)) {
          (<HTMLElement> this.treeContainer.querySelector("li#li-" + nodeId)).classList.add("loading");
          this.onBranchExpand(nodeId);
        }
      };

      this.onNodeClickClosure = (ev: Event) => {
        var nodeId: number = parseIdString((<HTMLElement>ev.target).parentNode.attributes["id"].value);
        if(this.onNodeClick instanceof Function)
          this.onNodeClick(nodeId);
      };
      //#endregion

      this.rootNode = new TreeNode(0, "root", true);

      var ulElement: HTMLUListElement = <HTMLUListElement> container.querySelector("ul");
      if(ulElement) {
        this.parseULElement(ulElement, 0);
        container.removeChild(ulElement);
      }

      this.treeContainer = createElement("ul", "container");

      if(nodes)
        for(var n in nodes)
          this.rootNode.addItem(nodes[n]);

      this.renderNodeItemsTo(this.treeContainer, this.rootNode);

      container.classList.add("resnyanskiy-tree");
      container.appendChild(this.treeContainer);
    }

    private renderNodeItemsTo(ulElement: Element, node: TreeNode) {
      var nodeItems: TreeNodeCollection = node.getItems();
      for(var id in nodeItems) {
        var nodeItem: TreeNode = nodeItems[id];
        ulElement.appendChild(nodeItem.getView());
      }

      var branchConnectorNodeList: NodeList = ulElement.querySelectorAll("li.branch > span.connector");
      for(var i = 0; i < branchConnectorNodeList.length; i++) {
        var connectorNode: Node = branchConnectorNodeList[i];
        connectorNode.addEventListener("click", this.toggleBranchItemsVisibleClosure);
      }

      var contentNodeList: NodeList = ulElement.querySelectorAll("li > a");
      for(var i = 0; i < contentNodeList.length; i++) {
        var contentNode: Node = contentNodeList[i];
        contentNode.addEventListener("click", this.onNodeClickClosure);
      }
    }

    private toggleNodeItemsVisible(node: TreeNode): bool {
      if(node && node.hasItems()) {
        var ulElement: Element = this.treeContainer.querySelector("ul#ul-" + node.id);
        if(ulElement.hasChildNodes()) {
          while(ulElement.firstChild) ulElement.removeChild(ulElement.firstChild);
          (<HTMLElement>ulElement.parentNode).classList.remove("opened");
        }
        else {
          this.renderNodeItemsTo(ulElement, node);
          (<HTMLElement>ulElement.parentNode).classList.add("opened");
        }
        return true;
      }
      else {
        return false;
      }
    }

    public updateNode(id: number, items: TreeNodeCollection, showNodeItems?: bool) {
      var node: TreeNode = this.rootNode.findItem(id, true);
      for(var i in items)
        node.addItem(items[i]);

      (<HTMLElement> this.treeContainer.querySelector("li#li-" + id)).classList.remove("loading");

      if(showNodeItems)
        this.toggleNodeItemsVisible(node);
    }

    public onBranchExpand: (treeNodeId: number) => void;
    public onNodeClick: (treeNodeId: number) => void;
  }
}