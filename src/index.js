/**
 * Alert block for the Editor.js.
 *
 * @author Vishal Telangre
 * @license MIT
 */

/**
 * Build styles
 */
require('./index.css').toString();

/**
 * Import Tool's icon
 */
import ToolboxIcon from '../assets/icon.svg';

/**
 * @class Alert
 * @classdesc Alert Tool for Editor.js
 * @property {AlertData} data - Alert Tool`s input and output data
 * @property {object} api - Editor.js API instance
 *
 * @typedef {object} AlertData
 * @description Alert Tool`s input and output data
 * @property {string} type - Alert type
 * @property {string} message - Alert message
 *
 * @typedef {object} AlertConfig
 * @description Alert Tool`s initial configuration
 * @property {string} defaultType - default Alert type
 * @property {string} messagePlaceholder - placeholder to show in Alert`s message input
 */
export default class Alert {
  /**
   * Get Toolbox settings
   *
   * @public
   * @returns {string}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: 'Alert',
    };
  }

  /**
   * Allow to press Enter inside the Alert block
   * @public
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Default Alert type
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_TYPE() {
    return 'info';
  }

  /**
   * Default placeholder for Alert message
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_MESSAGE_PLACEHOLDER() {
    return 'Type here...';
  }

  /**
   * Supported Alert types
   *
   * @public
   * @returns {array}
   */
  static get ALERT_TYPES() {
    return [
      //  'primary',
      //  'secondary',
      'info',
      'hinweis',
      'warnung',
      //   'danger',
      //   'light',
      //   'dark',
    ];
  }

  /**
   * Alert Tool`s styles
   *
   * @returns {Object}
   */
  get CSS() {
    return {
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: 'meldung',
      wrapperForType: (type) => `meldung_${type}`,
      message: 'cdx-alert__message',
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {AlertData} data — previously saved data
   * @param {AlertConfig} config — user config for Tool
   * @param {Object} api - Editor.js API
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;

    this.defaultType = config.defaultType || Alert.DEFAULT_TYPE;
    this.messagePlaceholder =
      config.messagePlaceholder || Alert.DEFAULT_MESSAGE_PLACEHOLDER;

    this.data = {
      type: Alert.ALERT_TYPES.includes(data.type)
        ? data.type
        : this.defaultType,
      message: data.message || '',
    };

    this.container = undefined;

    this.readOnly = readOnly;
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @return {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Create Alert Tool container
   *
   * @returns {Element}
   */
  render() {
    const containerClasses = [
      this.CSS.wrapper,
      this.CSS.wrapperForType(this.data.type),
    ];

    this.container = this._make('div', containerClasses);

    const messageEl = this._make('div', [this.CSS.message], {
      contentEditable: !this.readOnly,
      innerHTML: this.data.message,
    });

    messageEl.dataset.placeholder = this.messagePlaceholder;

    this.container.appendChild(messageEl);

    return this.container;
  }

  /**
   * Create Block's settings block
   *
   * @returns {HTMLElement}
   */
  renderSettings() {
    const settingsContainer = this._make('div');

    Alert.ALERT_TYPES.forEach((type) => {
      const settingsButton = this._make(
        'div',
        [
          this.CSS.settingsButton,
          this.CSS.wrapper,
          this.CSS.wrapperForType(type),
        ],
        {
          innerHTML: 'A',
        }
      );

      if (this.data.type === type) {
        // Highlight current type button
        settingsButton.classList.add(this.CSS.settingsButtonActive);
      }

      // Set up click handler
      settingsButton.addEventListener('click', () => {
        this._changeAlertType(type);

        // Un-highlight previous type button
        settingsContainer
          .querySelectorAll(`.${this.CSS.settingsButton}`)
          .forEach((button) =>
            button.classList.remove(this.CSS.settingsButtonActive)
          );

        // and highlight the clicked type button
        settingsButton.classList.add(this.CSS.settingsButtonActive);
      });

      settingsContainer.appendChild(settingsButton);
    });

    return settingsContainer;
  }

  /**
   * Helper for changing style of Alert block with the selected Alert type
   *
   * @param {string} newType - new Alert type to be applied to the block
   * @private
   */
  _changeAlertType(newType) {
    // Save new type
    this.data.type = newType;

    Alert.ALERT_TYPES.forEach((type) => {
      const alertClass = this.CSS.wrapperForType(type);

      // Remove the old Alert type class
      this.container.classList.remove(alertClass);

      if (newType === type) {
        // Add an Alert class for the selected Alert type
        this.container.classList.add(alertClass);
      }
    });
  }

  /**
   * Extract Alert data from Alert Tool element
   *
   * @param {HTMLDivElement} alertElement - element to save
   * @returns {AlertData}
   */
  save(alertElement) {
    const messageEl = alertElement.querySelector(`.${this.CSS.message}`);

    return { ...this.data, message: messageEl.innerHTML };
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @returns {Element}
   * @private
   */
  _make(tagName, classNames = null, attributes = {}) {
    let el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Fill Alert's message with the pasted content
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const { data } = event.detail;

    this.data = {
      type: this.defaultType,
      message: data.innerHTML || '',
    };
  }

  /**
   * Allow Alert to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      // export Alert's message for other blocks
      export: (data) => data.message,
      // fill Alert's message from other block's export string
      import: (string) => {
        return {
          message: string,
          type: this.DEFAULT_TYPE,
        };
      },
    };
  }

  /**
   * Sanitizer config for Alert Tool saved data
   * @returns {Object}
   */
  static get sanitize() {
    return {
      type: false,
      message: true,
    };
  }
}
