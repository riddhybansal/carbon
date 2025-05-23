/**
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import Close20 from '@carbon/icons/lib/close/20.js';
import Menu20 from '@carbon/icons/lib/menu/20.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { prefix } from '../../globals/settings';
import FocusMixin from '../../globals/mixins/focus';
import { SIDE_NAV_COLLAPSE_MODE } from './side-nav';
import styles from './header.scss?lit';
import { carbonElement as customElement } from '../../globals/decorators/carbon-element';

/**
 * The trigger button for side nav in header nav.
 *
 * @element cds-header-menu-button
 * @csspart button The button.
 * @csspart toggle-icon The toggle icon.
 * @fires cds-header-menu-button-toggled - The custom event fired after this header menu button is toggled upon a user gesture.
 */
@customElement(`${prefix}-header-menu-button`)
class CDSHeaderMenuButton extends FocusMixin(LitElement) {
  private _handleClick() {
    const active = !this.active;
    this.active = active;
    this.dispatchEvent(
      new CustomEvent(
        (this.constructor as typeof CDSHeaderMenuButton).eventToggle,
        {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {
            active,
          },
        }
      )
    );
  }

  /**
   * `true` if the button should represent its active state.
   */
  @property({ type: Boolean, reflect: true })
  active = false;

  /**
   * The `aria-label` attribute for the button in its active state.
   */
  @property({ attribute: 'button-label-active' })
  buttonLabelActive = 'Close navigation menu';

  /**
   * The `aria-label` attribute for the button in its inactive state.
   */
  @property({ attribute: 'button-label-inactive' })
  buttonLabelInactive = 'Open navigation menu';

  /**
   * Collapse mode of the side nav.
   */
  @property({ reflect: true, attribute: 'collapse-mode' })
  collapseMode = SIDE_NAV_COLLAPSE_MODE.RESPONSIVE;

  /**
   * `true` if the button should be disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * If `true` will style the side nav to sit below the header
   */
  @property({
    type: Boolean,
    attribute: 'is-not-child-of-header',
  })
  isNotChildOfHeader = false;

  render() {
    const {
      active,
      buttonLabelActive,
      buttonLabelInactive,
      disabled,
      _handleClick: handleClick,
    } = this;
    const buttonLabel = active ? buttonLabelActive : buttonLabelInactive;
    const classes = classMap({
      [`${prefix}--header__action`]: true,
      [`${prefix}--header__menu-trigger`]: true,
      [`${prefix}--header__menu-toggle`]: true,
      [`${prefix}--header__action--active`]: active,
    });
    return html`
      <button
        part="button"
        class="${classes}"
        ?disabled=${disabled}
        aria-label="${ifDefined(buttonLabel)}"
        @click=${handleClick}>
        ${(active ? Close20 : Menu20)({ slot: 'toggle-icon' })}
      </button>
    `;
  }

  /**
   * The name of the custom event fired after this header menu button is toggled upon a user gesture.
   */
  static get eventToggle() {
    return `${prefix}-header-menu-button-toggled`;
  }

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static styles = styles;
}

export default CDSHeaderMenuButton;
