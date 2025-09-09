import { CommandRegistry } from '@lumino/commands';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { LabIcon } from '@jupyterlab/ui-components';
import { CollabManagerWidget } from './widget';

// Create a simple icon for the launcher
const collabIcon = new LabIcon({
  name: 'collab-manager:icon',
  svgstr: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
});

export namespace CommandIDs {
  export const createNew = 'collab-manager:create-new';
}

export namespace Commands {
  export function addCommands(
    commands: CommandRegistry,
    browserFactory: IFileBrowserFactory,
  ) {
    commands.addCommand(CommandIDs.createNew, {
      label: 'Collaboration Manager',
      caption: 'Open Collaboration Manager',
      icon: args => (args['isPalette'] ? null : collabIcon),
      execute: () => {
        // Create a new widget
        const widget = new CollabManagerWidget();
        
        // Add it to the main area
        const app = commands as any;
        if (app.shell) {
          app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        }
        
        return widget;
      }
    });
  }
}
