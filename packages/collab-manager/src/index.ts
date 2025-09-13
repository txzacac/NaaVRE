// @ts-ignore
import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
  } from '@jupyterlab/application';
  

// @ts-ignore
  import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

// @ts-ignore
import { Widget } from '@lumino/widgets';

// @ts-ignore
import { ILauncher } from '@jupyterlab/launcher';

// @ts-ignore
// import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { Commands, CommandIDs } from './commands';
  
  
  /**
   * Initialization data for the @jupyter_vre/collab-manager extension.
 
    index.ts (entry point)
        ↓
    commands.ts (register commands)
        ↓
    widget.tsx (main controller)
        ↓
    MainPage.tsx (main UI)
        ↓ (user clicks)
    widget.tsx (state changes)
        ↓ (re-render)
    ProjectWizard.tsx (project wizard)
        ↓ (based on the mode parameter)
    Different UI steps
    
  */

  // an app 
  const plugin: JupyterFrontEndPlugin<void> = {
    id: '@jupyter_vre/collab-manager:extension',
    description: 'Collaboration Manager for NaaVRE',
    autoStart: true,
    requires: [ILauncher],
    activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
      console.log('JupyterLab extension collab-manager is activated!');
      alert('JupyterLab extension collab-manager is activated!2');
      
      // invoke the addcommand to show widget in main area with content 
      Commands.addCommands(app); 
      
      // Add to launcher
      if (launcher) {
        launcher.add({
          command: CommandIDs.createNew,
          category: 'VRE Components',
          rank: 1
        });
      }
    }
  };
  
  export default plugin;
  

  
  
  