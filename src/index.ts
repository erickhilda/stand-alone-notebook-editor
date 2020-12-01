import '@jupyterlab/application/style/index.css';
import '@jupyterlab/codemirror/style/index.css';
import '@jupyterlab/notebook/style/index.css';
import '@jupyterlab/theme-light-extension/style/index.css';
// import '@jupyterlab/terminal/style/index.css';
import '../index.css';

import { CommandRegistry } from '@phosphor/commands';
import { CommandPalette, SplitPanel, Widget, TabPanel } from '@phosphor/widgets';
import { ServiceManager } from '@jupyterlab/services';
import { MathJaxTypesetter } from '@jupyterlab/mathjax2';
import { PageConfig } from '@jupyterlab/coreutils';
// import { TerminalSession } from '@jupyterlab/services';

// import { Terminal } from '@jupyterlab/terminal';

import {
  NotebookPanel, NotebookWidgetFactory, NotebookModelFactory
} from '@jupyterlab/notebook';

import {
  CompleterModel, Completer, CompletionHandler, KernelConnector
} from '@jupyterlab/completer';

import { editorServices } from '@jupyterlab/codemirror';

import { DocumentManager } from '@jupyterlab/docmanager';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  RenderMimeRegistry,
  standardRendererFactories as initialFactories
} from '@jupyterlab/rendermime';

import { SetupCommands } from './commands';

function main(): void {
  let manager = new ServiceManager();
  void manager.ready.then(() => {
    createApp(manager);
  });
}

async function createApp(manager: ServiceManager.IManager) {
  // Initialize the command registry with the bindings.
  const commands = new CommandRegistry();
  const useCapture = true;

  // Setup the keydown listener for the document.
  document.addEventListener('keydown', event => commands.processKeydownEvent(event), useCapture);


  // TeX-AMS_CHTML-full,Safe&amp;delayStartupUntil=configure

  const rendermime = new RenderMimeRegistry({
    initialFactories,
    latexTypesetter: new MathJaxTypesetter({
      url: PageConfig.getOption('mathjaxUrl'),
      config: PageConfig.getOption('mathjaxConfig')
    })
  });

  const opener = {
    open: (widget: Widget) => {
      console.log('Opening widgets');
      // Do nothing for sibling widgets for now.
    }
  };

  const docRegistry = new DocumentRegistry();
  const docManager = new DocumentManager({
    registry: docRegistry,
    manager,
    opener
  });

  const editorFactory = editorServices.factoryService.newInlineEditor;
  const contentFactory = new NotebookPanel.ContentFactory({ editorFactory });


  docRegistry.addModelFactory(new NotebookModelFactory({}));
  docRegistry.addWidgetFactory(new NotebookWidgetFactory({
    name: 'Notebook',
    modelName: 'notebook',
    fileTypes: ['notebook'],
    defaultFor: ['notebook'],
    preferKernel: true,
    canStartKernel: true,
    rendermime,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService
  }));

  const notebookPath = PageConfig.getOption('notebookPath');
  const nbWidget = docManager.open(notebookPath) as NotebookPanel;

  const palette = new CommandPalette({ commands });
  palette.addClass('notebookCommandPalette');

  const editor = nbWidget.content.activeCell && nbWidget.content.activeCell.editor;
  const model = new CompleterModel();
  const completer = new Completer({ editor, model });
  const connector = new KernelConnector({ session: nbWidget.session });
  const handler = new CompletionHandler({ completer, connector });

  handler.editor = editor;

  // Listen for active cell changes.
  nbWidget.content.activeCellChanged.connect((sender, cell) => {
    handler.editor = cell && cell.editor;
  });

  // Hide the widget when it first loads.
  completer.hide();

  // const session = await TerminalSession.startNew();
  // const terminal = new Terminal(session, { theme: 'dark' });
  // terminal.title.closable = true;

  const panel = new SplitPanel();
  panel.id = 'main';
  panel.orientation = 'vertical';
  panel.spacing = 0;

  SplitPanel.setStretch(palette, 0);
  SplitPanel.setStretch(nbWidget, 1);

  panel.addWidget(palette);
  panel.addWidget(nbWidget);

  // Attach the panel to the DOM.
  Widget.attach(panel, document.body);
  Widget.attach(completer, document.body);

  // Handle resize events.
  window.addEventListener('resize', () => panel.update());

  SetupCommands(commands, palette, nbWidget, handler);

}

window.addEventListener('load', main);