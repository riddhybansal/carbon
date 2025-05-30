/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as FeatureFlags from '@carbon/feature-flags';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { usePrefix } from '../../internal/usePrefix';
import { PolymorphicProps } from '../../types/common';
import { useGridSettings } from './GridContext';
import {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from '../../internal/PolymorphicProps';

type ColumnSpanPercent = '25%' | '50%' | '75%' | '100%';

type ColumnSpanSimple = boolean | number | ColumnSpanPercent;

export interface ColumnSpanObject {
  span?: ColumnSpanSimple;

  offset?: number;

  start?: number;

  end?: number;
}

export type ColumnSpan = ColumnSpanSimple | ColumnSpanObject;

export interface ColumnBaseProps {
  /**
   * Pass in content that will be rendered within the `Column`
   */
  children?: React.ReactNode;

  /**
   * Specify a custom className to be applied to the `Column`
   */
  className?: string;

  /**
   * Specify column span for the `lg` breakpoint (Default breakpoint up to 1312px)
   * This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  lg?: ColumnSpan;

  /**
   * Specify column span for the `max` breakpoint. This breakpoint supports 16
   * columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  max?: ColumnSpan;

  /**
   * Specify column span for the `md` breakpoint (Default breakpoint up to 1056px)
   * This breakpoint supports 8 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  md?: ColumnSpan;

  /**
   * Specify column span for the `sm` breakpoint (Default breakpoint up to 672px)
   * This breakpoint supports 4 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  sm?: ColumnSpan;

  /**
   * Specify column span for the `xlg` breakpoint (Default breakpoint up to
   * 1584px) This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  xlg?: ColumnSpan;

  /**
   * Specify constant column span, start, or end values that will not change
   * based on breakpoint
   */
  span?: ColumnSpan;
}

export type ColumnProps<T extends React.ElementType> =
  PolymorphicComponentPropWithRef<T, ColumnBaseProps>;

export interface ColumnComponent {
  <T extends React.ElementType>(
    props: ColumnProps<T>,
    context?: any
  ): React.ReactElement<any, any> | null;
}

const Column = React.forwardRef<
  any,
  ColumnBaseProps & {
    as?: React.ElementType;
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    { as, children, className: customClassName, sm, md, lg, xlg, max, ...rest },
    ref
  ) => {
    const { mode } = useGridSettings();
    const prefix = usePrefix();
    const BaseComponent = as || 'div';

    if (mode === 'css-grid') {
      return (
        <CSSGridColumn
          as={BaseComponent}
          className={customClassName}
          sm={sm}
          md={md}
          ref={ref}
          lg={lg}
          xlg={xlg}
          max={max}
          {...rest}>
          {children}
        </CSSGridColumn>
      );
    }

    const columnClassName = getClassNameForFlexGridBreakpoints(
      [sm, md, lg, xlg, max],
      prefix
    );
    const className = cx(customClassName, columnClassName, {
      [`${prefix}--col`]: columnClassName.length === 0,
    });

    return (
      <BaseComponent className={className} ref={ref} {...rest}>
        {children}
      </BaseComponent>
    );
  }
);

const percentSpanType = PropTypes.oneOf(['25%', '50%', '75%', '100%']);

const spanPropType = FeatureFlags.enabled('enable-css-grid')
  ? PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number,
      PropTypes.shape({
        span: PropTypes.oneOfType([PropTypes.number, percentSpanType]),
        offset: PropTypes.number,
        start: PropTypes.number,
        end: PropTypes.number,
      }),
      percentSpanType,
    ])
  : PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number,
      PropTypes.shape({
        span: PropTypes.number,
        offset: PropTypes.number,
      }),
    ]);

Column.propTypes = {
  /**
   * Provide a custom element to render instead of the default <div>
   */
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),

  /**
   * Pass in content that will be rendered within the `Column`
   */
  children: PropTypes.node,

  /**
   * Specify a custom className to be applied to the `Column`
   */
  className: PropTypes.string,

  /**
   * Specify column span for the `lg` breakpoint (Default breakpoint up to 1312px)
   * This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  lg: spanPropType,

  /**
   * Specify column span for the `max` breakpoint. This breakpoint supports 16
   * columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  max: spanPropType,

  /**
   * Specify column span for the `md` breakpoint (Default breakpoint up to 1056px)
   * This breakpoint supports 8 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  md: spanPropType,

  /**
   * Specify column span for the `sm` breakpoint (Default breakpoint up to 672px)
   * This breakpoint supports 4 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  sm: spanPropType,

  /**
   * Specify constant column span, start, or end values that will not change
   * based on breakpoint
   */
  span: PropTypes.oneOfType([PropTypes.number, percentSpanType]),

  /**
   * Specify column span for the `xlg` breakpoint (Default breakpoint up to
   * 1584px) This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  xlg: spanPropType,
};

const CSSGridColumn = React.forwardRef<any, ColumnProps<any>>(
  (
    {
      as: BaseComponent = 'div',
      children,
      className: containerClassName,
      sm,
      md,
      lg,
      xlg,
      max,
      span,
      ...rest
    },
    ref
  ) => {
    // Add ref parameter
    const prefix = usePrefix();
    const breakpointClassName = getClassNameForBreakpoints(
      [sm, md, lg, xlg, max],
      prefix
    );
    const spanClassName = getClassNameForSpan(span, prefix);
    const className = cx(
      containerClassName,
      breakpointClassName,
      spanClassName,
      {
        [`${prefix}--css-grid-column`]: true,
      }
    );

    return (
      <BaseComponent className={className} ref={ref} {...rest}>
        {children}
      </BaseComponent>
    );
  }
);

CSSGridColumn.propTypes = {
  /**
   * Provide a custom element to render instead of the default <div>
   */
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),

  /**
   * Pass in content that will be rendered within the `Column`
   */
  children: PropTypes.node,

  /**
   * Specify a custom className to be applied to the `Column`
   */
  className: PropTypes.string,

  /**
   * Specify column span for the `lg` breakpoint (Default breakpoint up to 1312px)
   * This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  lg: spanPropType,

  /**
   * Specify column span for the `max` breakpoint. This breakpoint supports 16
   * columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  max: spanPropType,

  /**
   * Specify column span for the `md` breakpoint (Default breakpoint up to 1056px)
   * This breakpoint supports 8 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  md: spanPropType,

  /**
   * Specify column span for the `sm` breakpoint (Default breakpoint up to 672px)
   * This breakpoint supports 4 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  sm: spanPropType,

  /**
   * Specify constant column span, start,  or end values that will not change
   * based on breakpoint
   */
  span: PropTypes.oneOfType([
    PropTypes.number,
    percentSpanType,
    PropTypes.shape({
      span: PropTypes.oneOfType([PropTypes.number, percentSpanType]),
      start: PropTypes.number,
      end: PropTypes.number,
    }),
  ]),

  /**
   * Specify column span for the `xlg` breakpoint (Default breakpoint up to
   * 1584px) This breakpoint supports 16 columns by default.
   *
   * @see https://carbondesignsystem.com/elements/2x-grid/overview/#breakpoints
   */
  xlg: spanPropType,
};

const breakpointNames = ['sm', 'md', 'lg', 'xlg', 'max'];

/**
 * @typedef {object} Breakpoint
 * @property {boolean|number} [span]
 * @property {number} [offset]
 */

/**
 * Build the appropriate className for the given set of breakpoints.
 * @param {Array<boolean|number|Breakpoint>} breakpoints
 * @returns {string}
 */
function getClassNameForBreakpoints(
  breakpoints: (ColumnSpan | undefined)[],
  prefix: string
): string {
  const classNames: string[] = [];

  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i];
    if (breakpoint === undefined || breakpoint === null) {
      continue;
    }

    const name = breakpointNames[i];

    // If our breakpoint is a boolean, the user has specified that the column
    // should be "auto" at this size
    if (breakpoint === true) {
      classNames.push(`${prefix}--${name}:col-span-auto`);
      continue;
    }

    // If our breakpoint is a string, the user might have specified a percent
    // they'd like this column to span.
    if (typeof breakpoint === 'string') {
      classNames.push(
        `${prefix}--${name}:col-span-${breakpoint.replace('%', '')}`
      );
      continue;
    }

    // If our breakpoint is a number, the user has specified the number of
    // columns they'd like this column to span
    if (typeof breakpoint === 'number') {
      classNames.push(`${prefix}--${name}:col-span-${breakpoint}`);
      continue;
    }

    if (typeof breakpoint === 'object') {
      const { span, offset, start, end } = breakpoint;

      if (typeof offset === 'number') {
        classNames.push(
          `${prefix}--${name}:col-start-${offset > 0 ? offset + 1 : 'auto'}`
        );
      }

      if (typeof start === 'number') {
        classNames.push(
          `${prefix}--${name}:col-start-${start ? start : 'auto'}`
        );
      }

      if (typeof end === 'number') {
        classNames.push(`${prefix}--${name}:col-end-${end}`);
      }

      if (typeof span === 'number') {
        classNames.push(`${prefix}--${name}:col-span-${span}`);
      } else if (typeof span === 'string') {
        classNames.push(`${prefix}--${name}:col-span-${span.slice(0, -1)}`);
        continue;
      }
    }
  }

  return classNames.join(' ');
}

/**
 * Build the appropriate className for the given set of breakpoints.
 * @param {Array<boolean|number|Breakpoint>} breakpoints
 * @returns {string}
 */
function getClassNameForFlexGridBreakpoints(
  breakpoints: (ColumnSpan | undefined)[],
  prefix: string
): string {
  const classNames: string[] = [];

  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i];
    if (breakpoint === undefined || breakpoint === null) {
      continue;
    }

    const name = breakpointNames[i];

    // If our breakpoint is a boolean, the user has specified that the column
    // should be "auto" at this size
    if (breakpoint === true) {
      classNames.push(`${prefix}--col-${name}`);
      continue;
    }

    // If our breakpoint is a number, the user has specified the number of
    // columns they'd like this column to span
    if (typeof breakpoint === 'number') {
      classNames.push(`${prefix}--col-${name}-${breakpoint}`);
      continue;
    }

    if (typeof breakpoint === 'object') {
      const { span, offset } = breakpoint;
      if (typeof span === 'number') {
        classNames.push(`${prefix}--col-${name}-${span}`);
      }

      if (span === true) {
        classNames.push(`${prefix}--col-${name}`);
      }

      if (typeof offset === 'number') {
        classNames.push(`${prefix}--offset-${name}-${offset}`);
      }
    }
  }

  return classNames.join(' ');
}

/**
 * Build the appropriate className for a span value
 */
function getClassNameForSpan(
  value: ColumnSpan | undefined,
  prefix: string
): string {
  const classNames: string[] = [];

  if (typeof value === 'number') {
    classNames.push(`${prefix}--col-span-${value}`);
  }
  // If value is a string, the user has specified a percent
  // they'd like this column to span.
  else if (typeof value === 'string') {
    classNames.push(`${prefix}--col-span-${value.slice(0, -1)}`);
  } else if (typeof value === 'object') {
    const { span, start, end } = value;

    if (span !== undefined && span !== null) {
      classNames.push(`${prefix}--col-span-${span}`);
    }

    if (start !== undefined && start !== null) {
      classNames.push(`${prefix}--col-start-${start}`);
    }

    if (end !== undefined && end !== null) {
      classNames.push(`${prefix}--col-end-${end}`);
    }
  }

  return classNames.join('');
}

export default Column as ColumnComponent;
