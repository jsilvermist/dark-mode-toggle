import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

/**
 * `dark-mode-toggle`
 * Allow the user to switch between light and dark mode,
 * or automatically switch themes based on prefers-color-scheme
 * media query.
 *
 * @customElement dark-mode-toggle
 * @polymer
 * @demo demo/index.html
 */
class DarkModeToggle extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
          --paper-menu-button-dropdown-background: var(--background-color);
        }

        *, *::before, *::after {
          box-sizing: inherit;
        }

        #menu {
          user-select: none;
        }

        .content {
          min-width: 200px;
          overflow: hidden;
        }

        .item {
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 48px;
          padding: 0 16px;
        }

        #manualToggle {
          overflow: hidden;
          transition: height 250ms,
                      opacity 250ms,
                      line-height 250ms,
                      visibility 250ms,
                      font-size 250ms;
          visibility: visible;
          opacity: 1;
        }

        #manualToggle.collapse {
          visibility: collapse;
          opacity: 0;
          line-height: 0;
          height: 0;
          font-size: 0.5em;
        }

        paper-icon-button {
          color: #000;
        }

        paper-toggle-button {
          cursor: pointer;
          height: 100%;
          width: 100%;
        }

        paper-button {
          margin: 0 -8px;
          width: 100%;
          justify-content: left;
          text-transform: none;
        }
      </style>

      <paper-menu-button
          id="menu"
          title="Light / Dark Mode"
          horizontal-align="right"
          open-animation-config=""
          close-animation-config=""
          ignore-select
          allow-outside-scroll>
        <paper-icon-button slot="dropdown-trigger" icon="[[_icon]]"></paper-icon-button>
        <div class="content" slot="dropdown-content">
          <div class="item">
            <h3>Light / Dark Mode</h3>
          </div>
          <div class="item">
            <paper-toggle-button checked="{{_auto}}">Auto</paper-toggle-button>
          </div>
          <div class="item" id="manualToggle">
            <paper-button on-click="_handleSwitchModeClicked">Switch to [[_inactiveText]] Mode</paper-button>
          </div>
        </div>
      </paper-menu-button>
    `;
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
        observer: '_handleActiveChanged',
        notify: true,
      },
      _auto: {
        type: Boolean,
        observer: '_handleAutoChanged',
      },
      _activeText: String,
      _inactiveText: String,
    };
  }

  constructor() {
    super();

    // Load previous state from local storage
    const auto = window.localStorage.getItem('dark-mode-auto');
    const active = window.localStorage.getItem('dark-mode-active');
    this._auto = auto !== null ? JSON.parse(auto) : true;
    this.active = active !== null ? JSON.parse(active) : false;

    // Listen for changes to preferred color scheme
    installMediaQueryWatcher('(prefers-color-scheme: dark)', (matches) => {
      if (this._auto) {
        this.active = matches;
      }
    });
  }

  _handleAutoChanged() {
    // Check for preferred color scheme
    this.active = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // This is a hack to prevent iron-dropdown from breaking when resizing
    // the dropdown after unhiding the manual toggle button
    this.$.menu.$.dropdown.querySelector('.dropdown-content').style.maxHeight = 'unset';

    // Save updated state to local storage
    window.localStorage.setItem('dark-mode-auto', this._auto);

    // Collapse the manual toggle when auto is enabled
    this._auto ?
      this.$.manualToggle.classList.add('collapse') :
      this.$.manualToggle.classList.remove('collapse');
  }

  _handleActiveChanged() {
    this._inactiveText = this.active ? 'Light' : 'Dark';
    this._activeText = this.active ? 'Dark' : 'Light';
    this._icon = this.active ? 'image:wb-sunny' : 'image:brightness-3';
  }

  _handleSwitchModeClicked() {
    this.active = !this.active;
  }

}

window.customElements.define('dark-mode-toggle', DarkModeToggle);
