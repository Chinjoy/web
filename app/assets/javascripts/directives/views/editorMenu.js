import { isDesktopApplication } from '@/utils';
import template from '%/directives/editor-menu.pug';
import { PureCtrl } from '@Controllers/abstract/pure_ctrl';

class EditorMenuCtrl extends PureCtrl {
  /* @ngInject */
  constructor(
    $timeout,
  ) {
    super($timeout);
    this.state = {
      isDesktop: isDesktopApplication()
    };
  }

  $onInit() {
    super.$onInit();
    const editors = this.application.componentManager.componentsForArea('editor-editor')
    .sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });
    const defaultEditor = editors.filter((e) => e.isDefaultEditor())[0];
    this.setState({
      editors: editors,
      defaultEditor: defaultEditor
    });
  };

  selectComponent(component) {
    if(component) {
      if(component.content.conflict_of) {
        component.content.conflict_of = null;
        this.application.saveItem({item: component});
      }
    }
    this.$timeout(() => {
      this.callback()(component);
    });
  }

  toggleDefaultForEditor(editor) {
    if(this.state.defaultEditor === editor) {
      this.removeEditorDefault(editor);
    } else {
      this.makeEditorDefault(editor);
    }
  }

  offlineAvailableForComponent(component) {
    return component.local_url && this.state.isDesktop;
  }

  makeEditorDefault(component) {
    const currentDefault = this.application.componentManager
      .componentsForArea('editor-editor')
      .filter((e) => e.isDefaultEditor())[0];
    if(currentDefault) {
      currentDefault.setAppDataItem('defaultEditor', false);
      this.application.setItemsNeedsSync({item: currentDefault});
    }
    component.setAppDataItem('defaultEditor', true);
    this.application.saveItem({ item: component });
    this.setState({
      defaultEditor: component
    });
  }

  removeEditorDefault(component) {
    component.setAppDataItem('defaultEditor', false);
    this.application.saveItem({ item: component });
    this.setState({
      defaultEditor: null
    });
  }
}

export class EditorMenu {
  constructor() {
    this.restrict = 'E';
    this.template = template;
    this.controller = EditorMenuCtrl;
    this.controllerAs = 'self';
    this.bindToController = true;
    this.scope = {
      callback: '&',
      selectedEditor: '=',
      currentItem: '=',
      application: '='
    };
  }
}
