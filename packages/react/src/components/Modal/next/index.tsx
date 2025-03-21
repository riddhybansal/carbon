/**
 * Copyright IBM Corp. 2016, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useRef, useState, ReactNode } from 'react';
import classNames from 'classnames';
import { Close } from '@carbon/icons-react';
import Button from '../../Button';
import ButtonSet from '../../ButtonSet';
import InlineLoading from '../../InlineLoading';
import { Layer } from '../../Layer';
import requiredIfGivenPropIsTruthy from '../../../prop-types/requiredIfGivenPropIsTruthy';
import { debounce } from 'es-toolkit/compat';
import useIsomorphicEffect from '../../../internal/useIsomorphicEffect';
import { useId } from '../../../internal/useId';
import { usePrefix } from '../../../internal/usePrefix';
import { keys, match } from '../../../internal/keyboard';
import { IconButton } from '../../IconButton';
import { noopFn } from '../../../internal/noopFn';
import { Text } from '../../Text';
import { ReactAttr } from '../../../types/common';
import { InlineLoadingStatus } from '../../InlineLoading/InlineLoading';
import { unstable__Dialog as Dialog } from '../../Dialog/index';

export const ModalSizes = ['xs', 'sm', 'md', 'lg'] as const;

export type ModalSize = (typeof ModalSizes)[number];

export interface ModalSecondaryButton {
  buttonText?: string | ReactNode;

  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export interface BaseModalProps extends ReactAttr<HTMLDivElement> {
  /**
   * Required props for the accessibility label of the header
   */
  'aria-label'?: string;

  /**
   * Provide the contents of your Modal
   */
  children?: ReactNode;

  /**
   * Specify an optional className to be applied to the modal root node
   */
  className?: string;

  /**
   * Specify an label for the close button of the modal; defaults to close
   */
  closeButtonLabel?: string;

  /**
   * Specify whether the Modal is for dangerous actions
   */
  danger?: boolean;

  /**
   * **Experimental**: Provide a decorator component to be rendered inside the `Modal` component
   */
  decorator?: ReactNode;

  /**
   * Specify whether the modal contains scrolling content
   */
  hasScrollingContent?: boolean;

  /**
   * Specify the DOM element ID of the top-level node.
   */
  id?: string;

  /**
   * Specify whether or not the Modal content should have any inner padding.
   */
  isFullWidth?: boolean;

  /**
   * Specify the description for the loading text
   */
  loadingDescription?: string;

  /**
   * Specify the description for the loading text
   */
  loadingIconDescription?: string;

  /**
   * Specify loading status
   */
  loadingStatus?: InlineLoadingStatus;

  /**
   * Specify a label to be read by screen readers on the modal root node
   */
  modalAriaLabel?: string;

  /**
   * Specify the content of the modal header title.
   */
  modalHeading?: ReactNode;

  /**
   * Specify the content of the modal header label.
   */
  modalLabel?: ReactNode;

  /**
   * Specify a handler for keypresses.
   * @deprecated this property is unused
   */
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;

  /**
   * Specify an optional handler to be invoked when loading is
   * successful
   */
  onLoadingSuccess?: () => void;

  /**
   * Specify a handler for closing modal.
   * The handler should care of closing modal, e.g. changing `open` prop.
   */
  onRequestClose?: React.ReactEventHandler<HTMLElement>;

  /**
   * Specify a handler for "submitting" modal.
   * The handler should care of closing modal, e.g. changing `open` prop, if necessary.
   */
  onRequestSubmit?: React.ReactEventHandler<HTMLElement>;

  /**
   * Specify a handler for the secondary button.
   * Useful if separate handler from `onRequestClose` is desirable
   */
  onSecondarySubmit?: React.ReactEventHandler<HTMLElement>;

  /**
   * Specify whether the Modal is currently open
   */
  open?: boolean;

  /**
   * Prevent closing on click outside of modal
   */
  preventCloseOnClickOutside?: boolean;

  /**
   * Specify whether the Button should be disabled, or not
   */
  primaryButtonDisabled?: boolean;

  /**
   * Specify the text for the primary button
   */
  primaryButtonText?: ReactNode;

  /**
   * Specify the text for the secondary button
   */
  secondaryButtonText?: ReactNode;

  /**
   * Specify an array of config objects for secondary buttons
   */
  secondaryButtons?: ModalSecondaryButton[];

  /**
   * Specify a CSS selector that matches the DOM element that should
   * be focused when the Modal opens
   */
  selectorPrimaryFocus?: string;

  /**
   * Specify CSS selectors that match DOM elements working as floating menus.
   * Focusing on those elements won't trigger "focus-wrap" behavior
   */
  selectorsFloatingMenus?: string[];

  /**
   * Specify if Enter key should be used as "submit" action
   */
  shouldSubmitOnEnter?: boolean;

  /**
   * Specify the size variant.
   */
  size?: ModalSize;
}

// passive modals can not use `alert`
interface PassiveModal extends BaseModalProps {
  /**
   * Specify whether the modal should be button-less
   */
  passiveModal?: true;

  /**
   * Specify whether the Modal is displaying an alert, error or warning. Should
   * go hand in hand with the `danger` prop. This changes the `role` to
   * `alertdialog` and cannot be used with passive modals.
   */
  alert?: never;
}

// non passive modals can optionally set `alert`
interface NonPassiveModal extends BaseModalProps {
  /**
   * Specify whether the modal should be button-less
   */
  passiveModal?: false;

  /**
   * Specify whether the Modal is displaying an alert, error or warning. Should
   * go hand in hand with the `danger` prop. This changes the `role` to
   * `alertdialog` and cannot be used with passive modals.
   */
  alert?: boolean;
}

export type ModalProps = PassiveModal | NonPassiveModal;

const Modal = React.forwardRef(function Modal(
  {
    'aria-label': ariaLabelProp,
    children,
    className,
    decorator,
    modalHeading = '',
    modalLabel = '',
    modalAriaLabel,
    passiveModal = false,
    secondaryButtonText,
    primaryButtonText,
    open,
    onRequestClose = noopFn,
    onRequestSubmit = noopFn,
    onSecondarySubmit,
    primaryButtonDisabled = false,
    danger,
    alert,
    secondaryButtons,
    selectorPrimaryFocus = '[data-modal-primary-focus]',
    selectorsFloatingMenus,
    shouldSubmitOnEnter,
    size,
    hasScrollingContent = false,
    closeButtonLabel = 'Close',
    preventCloseOnClickOutside = false,
    isFullWidth,
    loadingStatus = 'inactive',
    loadingDescription,
    loadingIconDescription,
    onLoadingSuccess = noopFn,
    ...rest
  }: ModalProps,
  ref: React.LegacyRef<HTMLDivElement>
) {
  const prefix = usePrefix();
  const button = useRef<HTMLButtonElement>(null);
  const secondaryButton = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerModal = useRef<HTMLDialogElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const modalInstanceId = `modal-${useId()}`;
  const modalLabelId = `${prefix}--modal-header__label--${modalInstanceId}`;
  const modalHeadingId = `${prefix}--modal-header__heading--${modalInstanceId}`;
  const modalBodyId = `${prefix}--modal-body--${modalInstanceId}`;
  const modalCloseButtonClass = `${prefix}--modal-close`;
  const primaryButtonClass = classNames({
    [`${prefix}--btn--loading`]: loadingStatus !== 'inactive',
  });
  const loadingActive = loadingStatus !== 'inactive';

  function isCloseButton(element: Element) {
    return (
      (!onSecondarySubmit && element === secondaryButton.current) ||
      element.classList.contains(modalCloseButtonClass)
    );
  }

  function handleKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {
    evt.stopPropagation();
    if (open) {
      if (
        match(evt, keys.Enter) &&
        shouldSubmitOnEnter &&
        !isCloseButton(evt.target as Element)
      ) {
        onRequestSubmit(evt);
      }
    }
  }

  const onSecondaryButtonClick = onSecondarySubmit
    ? onSecondarySubmit
    : onRequestClose;

  const modalClasses = classNames(
    `${prefix}--modal`,
    {
      [`${prefix}--modal-tall`]: !passiveModal,
      [`${prefix}--modal--danger`]: danger,
      [`${prefix}--modal--decorator`]: decorator,
    },
    className
  );

  const containerClasses = classNames(`${prefix}--modal-container`, {
    [`${prefix}--modal-container--${size}`]: size,
    [`${prefix}--modal-container--full-width`]: isFullWidth,
  });

  const contentClasses = classNames(`${prefix}--modal-content`, {
    [`${prefix}--modal-scroll-content`]: hasScrollingContent || isScrollable,
  });

  const footerClasses = classNames(`${prefix}--modal-footer`, {
    [`${prefix}--modal-footer--three-button`]:
      Array.isArray(secondaryButtons) && secondaryButtons.length === 2,
  });

  const asStringOrUndefined = (node: ReactNode): string | undefined => {
    return typeof node === 'string' ? node : undefined;
  };
  const modalLabelStr = asStringOrUndefined(modalLabel);
  const modalHeadingStr = asStringOrUndefined(modalHeading);
  const ariaLabel =
    modalLabelStr || ariaLabelProp || modalAriaLabel || modalHeadingStr;
  const getAriaLabelledBy = modalLabel ? modalLabelId : modalHeadingId;
  const hasScrollingContentProps =
    hasScrollingContent || isScrollable
      ? {
          tabIndex: 0,
          role: 'region',
          'aria-label': ariaLabel,
          'aria-labelledby': getAriaLabelledBy,
        }
      : {};
  useIsomorphicEffect(() => {
    if (contentRef.current) {
      setIsScrollable(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      );
    }

    function handler() {
      if (contentRef.current) {
        setIsScrollable(
          contentRef.current.scrollHeight > contentRef.current.clientHeight
        );
      }
    }

    const debouncedHandler = debounce(handler, 200);
    window.addEventListener('resize', debouncedHandler);
    return () => {
      debouncedHandler.cancel();
      window.removeEventListener('resize', debouncedHandler);
    };
  }, []);

  // alertdialog is the only permitted aria role for a native dialog element
  // https://www.w3.org/TR/html-aria/#docconformance:~:text=Role%3A-,alertdialog,-.%20(dialog%20is
  const isAlertDialog = alert && !passiveModal;

  // When the decorator is a react element, like AILabel, it should always be given `size='sm'`
  const normalizedDecorator = React.isValidElement(decorator)
    ? React.cloneElement(decorator as React.ReactElement<any>, {
        size: 'sm',
      })
    : decorator;

  return (
    <Layer
      {...rest}
      level={0}
      onKeyDown={handleKeyDown}
      onClick={rest?.onClick}
      className={modalClasses}
      role="presentation"
      ref={ref}>
      <Dialog
        open={open}
        modal
        ref={innerModal}
        role={isAlertDialog ? 'alertdialog' : ''}
        aria-describedby={isAlertDialog ? modalBodyId : ''}
        className={containerClasses}
        aria-label={ariaLabel}>
        <div className={`${prefix}--modal-header`}>
          {modalLabel && (
            <Text
              as="h2"
              id={modalLabelId}
              className={`${prefix}--modal-header__label`}>
              {modalLabel}
            </Text>
          )}
          <Text
            as="h2"
            id={modalHeadingId}
            className={`${prefix}--modal-header__heading`}>
            {modalHeading}
          </Text>
          {decorator ? (
            <div className={`${prefix}--modal--inner__decorator`}>
              {normalizedDecorator}
            </div>
          ) : (
            ''
          )}
          <div className={`${prefix}--modal-close-button`}>
            <IconButton
              className={modalCloseButtonClass}
              label={closeButtonLabel}
              onClick={onRequestClose}
              aria-label={closeButtonLabel}
              align="left"
              ref={button}>
              <Close
                size={20}
                aria-hidden="true"
                tabIndex="-1"
                className={`${modalCloseButtonClass}__icon`}
              />
            </IconButton>
          </div>
        </div>
        <Layer
          ref={contentRef}
          id={modalBodyId}
          className={contentClasses}
          {...hasScrollingContentProps}>
          {children}
        </Layer>
        {!passiveModal && (
          <ButtonSet className={footerClasses} aria-busy={loadingActive}>
            {Array.isArray(secondaryButtons) && secondaryButtons.length <= 2
              ? secondaryButtons.map(
                  ({ buttonText, onClick: onButtonClick }, i) => (
                    <Button
                      key={`${buttonText}-${i}`}
                      kind="secondary"
                      onClick={onButtonClick}>
                      {buttonText}
                    </Button>
                  )
                )
              : secondaryButtonText && (
                  <Button
                    disabled={loadingActive}
                    kind="secondary"
                    onClick={onSecondaryButtonClick}
                    ref={secondaryButton}>
                    {secondaryButtonText}
                  </Button>
                )}
            <Button
              className={primaryButtonClass}
              kind={danger ? 'danger' : 'primary'}
              disabled={loadingActive || primaryButtonDisabled}
              onClick={onRequestSubmit}
              ref={button}>
              {loadingStatus === 'inactive' ? (
                primaryButtonText
              ) : (
                <InlineLoading
                  status={loadingStatus}
                  description={loadingDescription}
                  iconDescription={loadingIconDescription}
                  className={`${prefix}--inline-loading--btn`}
                  onSuccess={onLoadingSuccess}
                />
              )}
            </Button>
          </ButtonSet>
        )}
      </Dialog>
    </Layer>
  );
});

Modal.propTypes = {
  /**
   * Specify whether the Modal is displaying an alert, error or warning
   * Should go hand in hand with the danger prop.
   */
  alert: PropTypes.bool,

  /**
   * Required props for the accessibility label of the header
   */
  ['aria-label']: requiredIfGivenPropIsTruthy(
    'hasScrollingContent',
    PropTypes.string
  ),

  /**
   * Provide the contents of your Modal
   */
  children: PropTypes.node,

  /**
   * Specify an optional className to be applied to the modal root node
   */
  className: PropTypes.string,

  /**
   * Specify an label for the close button of the modal; defaults to close
   */
  closeButtonLabel: PropTypes.string,

  /**
   * Specify whether the Modal is for dangerous actions
   */
  danger: PropTypes.bool,

  /**
   * **Experimental**: Provide a decorator component to be rendered inside the `Modal` component
   */
  decorator: PropTypes.node,

  /**
   * Specify whether the modal contains scrolling content
   */
  hasScrollingContent: PropTypes.bool,

  /**
   * Specify the DOM element ID of the top-level node.
   */
  id: PropTypes.string,

  /**
   * Specify whether or not the Modal content should have any inner padding.
   */
  isFullWidth: PropTypes.bool,

  /**
   * Specify the description for the loading text
   */
  loadingDescription: PropTypes.string,

  /**
   * Specify the description for the loading text
   */
  loadingIconDescription: PropTypes.string,

  /**
   * loading status
   */
  loadingStatus: PropTypes.oneOf(['inactive', 'active', 'finished', 'error']),

  /**
   * Specify a label to be read by screen readers on the modal root node
   */
  modalAriaLabel: PropTypes.string,

  /**
   * Specify the content of the modal header title.
   */
  modalHeading: PropTypes.node,

  /**
   * Specify the content of the modal header label.
   */
  modalLabel: PropTypes.node,

  /**
   * Specify a handler for keypresses.
   */
  onKeyDown: PropTypes.func,

  /**
   * Provide an optional handler to be invoked when loading is
   * successful
   */
  onLoadingSuccess: PropTypes.func,

  /**
   * Specify a handler for closing modal.
   * The handler should care of closing modal, e.g. changing `open` prop.
   */
  onRequestClose: PropTypes.func,

  /**
   * Specify a handler for "submitting" modal.
   * The handler should care of closing modal, e.g. changing `open` prop, if necessary.
   */
  onRequestSubmit: PropTypes.func,

  /**
   * Specify a handler for the secondary button.
   * Useful if separate handler from `onRequestClose` is desirable
   */
  onSecondarySubmit: PropTypes.func,

  /**
   * Specify whether the Modal is currently open
   */
  open: PropTypes.bool,

  /**
   * Specify whether the modal should be button-less
   */
  passiveModal: function (props, propName, componentName) {
    if (props.passiveModal && props.alert) {
      return new Error(
        'Invalid prop `' +
          propName +
          '` supplied to' +
          ' `' +
          componentName +
          '`. alert cannot be used with passive modals.'
      );
    }
    return null;
  },

  /**
   * Prevent closing on click outside of modal
   */
  preventCloseOnClickOutside: PropTypes.bool,

  /**
   * Specify whether the Button should be disabled, or not
   */
  primaryButtonDisabled: PropTypes.bool,

  /**
   * Specify the text for the primary button
   */
  primaryButtonText: PropTypes.node,

  /**
   * Specify the text for the secondary button
   */
  secondaryButtonText: PropTypes.node,

  /**
   * Specify an array of config objects for secondary buttons
   * (`Array<{
   *   buttonText: string,
   *   onClick: function,
   * }>`).
   */
  secondaryButtons: (props, propName, componentName) => {
    if (props.secondaryButtons) {
      if (
        !Array.isArray(props.secondaryButtons) ||
        props.secondaryButtons.length !== 2
      ) {
        return new Error(
          `${propName} needs to be an array of two button config objects`
        );
      }

      const shape = {
        buttonText: PropTypes.node,
        onClick: PropTypes.func,
      };

      props[propName].forEach((secondaryButton) => {
        PropTypes.checkPropTypes(
          shape,
          secondaryButton,
          propName,
          componentName
        );
      });
    }

    return null;
  },

  /**
   * Specify a CSS selector that matches the DOM element that should
   * be focused when the Modal opens
   */
  selectorPrimaryFocus: PropTypes.string,

  /**
   * Specify CSS selectors that match DOM elements working as floating menus.
   * Focusing on those elements won't trigger "focus-wrap" behavior
   */
  selectorsFloatingMenus: PropTypes.arrayOf(PropTypes.string.isRequired),

  /**
   * Specify if Enter key should be used as "submit" action
   */
  shouldSubmitOnEnter: PropTypes.bool,

  /**
   * Specify the size variant.
   */
  size: PropTypes.oneOf(ModalSizes),
};

export default Modal;
