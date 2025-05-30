/**
 * Copyright IBM Corp. 2016, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { type HTMLAttributes } from 'react';

export interface TableBodyProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * `polite` Adjust the notification behavior of screen readers
   */
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

const TableBody = ({ children, className, ...rest }: TableBodyProps) => (
  <tbody
    aria-live={rest['aria-live'] ?? 'polite'}
    className={className}
    {...rest}>
    {children}
  </tbody>
);

TableBody.propTypes = {
  /**
   * `polite` Adjust the notification behavior of screen readers
   */
  'aria-live': PropTypes.oneOf(['polite', 'assertive', 'off']),
  children: PropTypes.node,

  className: PropTypes.string,
};

export default TableBody;
