// declare module '@jupyterlab/application' {
//   export interface JupyterFrontEnd {
//     commands: any;
//     shell: any;
//   }
//   export interface JupyterFrontEndPlugin<T> {
//     id: string;
//     description: string;
//     autoStart: boolean;
//     requires: any[];
//     activate: (app: JupyterFrontEnd, ...args: any[]) => T;
//   }
// }

// declare module '@jupyterlab/apputils' {
//   export interface ICommandPalette {
//     addItem: (item: any) => void;
//   }
//   export class MainAreaWidget {
//     constructor(options: any);
//     id: string;
//     title: any;
//     isDisposed: boolean;
//     isAttached: boolean;
//   }
// }

// declare module '@lumino/widgets' {
//   export class Widget {
//     constructor();
//     id: string;
//     title: any;
//     isDisposed: boolean;
//     isAttached: boolean;
//   }
// }
