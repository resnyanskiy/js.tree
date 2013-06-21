resnyanskiy.js.tree
=======
Super simple open-source TreeView component for web-pages based on HTML, CSS and JavaScript, implemented with TypeScript and LESS.

It can be described with several "NoXXX" abstracts (means "not"):

- **NoLegacy**. No support for IE9- browsers, thinking in ES5+, CSS3 and other [modern technologies](http://www.html5rocks.com/).
- **NoJQuery**. No framework used, only [VanillaJS](http://www.vanilla-js.com/).
- **NoComplex**. No support for complex use cases, only one simple way to use.

What about "YesXXX"?

- Everything you need for create "treeview" based on data in JSON,  including lazy loading for subnodes, out of the box. Data model for tree node (TypeScript):

        interface ITreeNodeDataModel {
          id: number;
          title: string;
          isBranch: bool;
        }

- Using [TypeScript](http://www.typescriptlang.org/) and [LESS](http://www.lesscss.org/) for implementation, no external dependencies, modular structure (including CSS rules) and clear code base make it simple to use in your own projects and customization.

For "how to use" information take a look at comprehensive [example](http://resnyanskiy.github.io/js.tree/index.html).