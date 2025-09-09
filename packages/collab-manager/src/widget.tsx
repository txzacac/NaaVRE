// @ts-ignore
import React from 'react';
// @ts-ignore
import { Widget } from '@lumino/widgets';

export class CollabManagerWidget extends Widget {
  constructor() {
    super();
    // @ts-ignore
    this.addClass('collab-manager-widget');
    this.id = 'collab-manager';
    this.title.label = 'Collaboration Manager';
    this.title.closable = true;
    
    // Create a simple HTML content
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.fontSize = '16px';
    content.style.color = '#333';
    content.innerHTML = `
      <h2>Welcome to Collaboration Manager!</h2>
      <p>This is a blank page where you can build your collaboration features.</p>
      <p>You can add React components, forms, or any other UI elements here.</p>
    `;
    
    // @ts-ignore
    this.node.appendChild(content);
  }
}
