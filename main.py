from notebook.notebookapp import NotebookApp

if __name__ == '__main__':
  NotebookApp.allow_origin = 'http://localhost:9000'
  NotebookApp.notebook_dir = 'notebooks'
  NotebookApp.token = '6qsyW6PE7ARzdbNPgK2U'
  NotebookApp.open_browser = False
  NotebookApp.launch_instance()