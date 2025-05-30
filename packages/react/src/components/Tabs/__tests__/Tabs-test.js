/**
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  Tabs,
  TabsVertical,
  Tab,
  TabPanel,
  TabPanels,
  TabList,
  TabListVertical,
  IconTab,
} from '../Tabs';
import { act } from 'react';
import { Notification } from '@carbon/icons-react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as hooks from '../../../internal/useMatchMedia';

const prefix = 'cds';

describe('Tabs', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
  });

  it('should update selected index based on the default provided', () => {
    render(
      <Tabs defaultSelectedIndex={1}>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab data-testid="tab-testid">Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByTestId('tab-testid')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should set a className from props on outermost element in TabList', () => {
    const { container } = render(
      <Tabs>
        <TabList
          aria-label="List of tabs"
          className="custom-class"
          data-test-id="test-id">
          <Tab disabled>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container);
  });

  it('should not render conditionally excluded tabs and panels', () => {
    const condition = false;
    render(
      <Tabs>
        <TabList aria-label="List of tabs" data-test-id="test-id">
          <Tab>Tab Label 1</Tab>
          {condition ? (
            <Tab data-test-id="excluded-tab">Tab Label 2</Tab>
          ) : null}
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          {condition ? (
            <TabPanel data-test-id="excluded-panel">Tab Panel 2</TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>
    );

    expect(screen.queryByTestId('excluded-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('excluded-panel')).not.toBeInTheDocument();
  });
});

describe('Tab', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
  });

  it('should set a className from props on outermost element in Tab', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab disabled>Tab Label 1</Tab>
          <Tab data-testid="tab-testid" className="custom-class">
            Tab Label 2
          </Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByTestId('tab-testid')).toHaveClass('custom-class');
  });

  it('should not select a disabled tab and select next tab', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab data-testid="tab-testid-1" disabled>
            Tab Label 1
          </Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'false'
    );

    // By default, if a Tab is disabled, the next Tab should be selected
    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should provide a custom element to render instead of default button if provided', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab as="div">Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('Tab Label 1').parentElement.tagName).toBe('DIV');
  });

  it('should render secondaryLabel in contained tabs if provided', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs" contained>
          <Tab as="div" secondaryLabel="test-secondary-label">
            Tab Label 1
          </Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(screen.getByText('test-secondary-label')).toBeInTheDocument();
  });

  it('should not render secondaryLabel in non-contained tabs', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab as="div" secondaryLabel="test-secondary-label">
            Tab Label 1
          </Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.queryByText('test-secondary-label')).not.toBeInTheDocument();
  });

  it('should display an icon from renderIcon prop', async () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab renderIcon={() => <svg data-testid="svg" />} disabled>
            Tab Label 1
          </Tab>
          <Tab data-testid="tab-testid" className="custom-class">
            Tab Label 2
          </Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByTestId('svg')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('svg').parentElement).toHaveClass(
      'cds--tabs__nav-item--icon'
    );
  });
  it('should render badge indicator when badgeIndicator prop is true', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <IconTab
            badgeIndicator
            data-testid="icon-tab-with-badge"
            label="New Notifications">
            <Notification size={20} aria-label="Notification" />
          </IconTab>
        </TabList>
        <TabPanels>
          <TabPanel>Icon Tab Panel</TabPanel>
        </TabPanels>
      </Tabs>
    );

    // Get the icon tab
    const iconTab = screen.getByTestId('icon-tab-with-badge');
    const badgeIndicator = iconTab.querySelector(`.${prefix}--badge-indicator`);
    expect(badgeIndicator).not.toBeNull();
  });

  it('should call onClick from props if provided', async () => {
    const onClick = jest.fn();
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab onClick={onClick}>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    await userEvent.click(screen.getByText('Tab Label 1'));

    expect(onClick).toHaveBeenCalled();
  });

  it('should call onKeyDown from props if provided', async () => {
    const onKeyDown = jest.fn();
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab onKeyDown={onKeyDown}>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    await userEvent.type(screen.getByText('Tab Label 1'), 'enter');

    expect(onKeyDown).toHaveBeenCalled();
  });

  it('should go to the next tab using arrow keys', async () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab data-testid="tab-testid-1">Tab Label 1</Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab data-testid="tab-testid-3">Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    await userEvent.tab();
    await userEvent.keyboard('[ArrowRight]');

    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[ArrowLeft]');

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[End]');

    expect(screen.getByTestId('tab-testid-3')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[Home]');

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should go to the next tab with manual activation', async () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs" activation="manual">
          <Tab data-testid="tab-testid-1">Tab Label 1</Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab data-testid="tab-testid-3">Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    await userEvent.tab();
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[Space]');

    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should reset focus to the active tab on blur in manual activation', async () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs" activation="manual">
          <Tab data-testid="tab-testid-1">Tab Label 1</Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab data-testid="tab-testid-3">Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    await userEvent.tab();
    await userEvent.keyboard('[ArrowRight]');
    expect(screen.getByTestId('tab-testid-2')).toHaveFocus();
    await userEvent.keyboard('[Tab]');
    await userEvent.keyboard('[Shift][Tab]');
    expect(screen.getByTestId('tab-testid-1')).toHaveFocus();
  });

  it('should render close icon if dismissable', () => {
    render(
      <Tabs dismissable onTabCloseRequest={() => {}}>
        <TabList aria-label="List of tabs">
          <Tab disabled>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
        .parentElement
    ).not.toHaveClass(`${prefix}--visually-hidden`);
  });

  it('should ignore hover on dismissable icon if it is a contained tab', async () => {
    render(
      <Tabs dismissable onTabCloseRequest={() => {}}>
        <TabList contained aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab disabled data-testid="tab-testid">
            Tab Label 2
          </Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    const tab = screen.getByTestId('tab-testid');
    const tabIcon = screen.getAllByLabelText(
      'Press delete to remove Tab Label 2 tab'
    )[0].parentElement;

    await userEvent.hover(tabIcon);
    expect(tab).toHaveClass('cds--tabs__nav-item--hover-off');

    await userEvent.unhover(tabIcon);
    expect(tab).not.toHaveClass('cds--tabs__nav-item--hover-off');
  });

  it('should not render close icon if not dismissable', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab disabled>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(
      // eslint-disable-next-line testing-library/no-node-access
      screen.queryAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
        .parentElement
    ).toHaveClass(`${prefix}--visually-hidden`);
  });

  it('should call onCloseTabRequest when dismissable and close icon clicked', async () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    await userEvent.click(
      screen.getAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
    );
    expect(onTabCloseRequest).toHaveBeenCalledTimes(1);
  });

  it('should not call onTabCloseRequest when dismissable and close icon clicked but tab disabled', async () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab disabled>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    await userEvent.click(
      screen.getAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
    );
    expect(onTabCloseRequest).not.toHaveBeenCalled();
  });

  it('should call onCloseTabRequest when dismissable and delete pressed on focused tab', async () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab disabled>Tab Label 1</Tab>
          <Tab data-testid="tab-testid">Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    screen.getByTestId('tab-testid').focus();
    await userEvent.keyboard('[Delete]');
    expect(onTabCloseRequest).toHaveBeenCalledTimes(1);
  });

  it('should not call onCloseTabRequest when dismissable and delete pressed on focused disabled tab', async () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab data-testid="tab-testid" disabled>
            Tab Label 1
          </Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    screen.getByTestId('tab-testid').focus();
    await userEvent.keyboard('[Delete]');
    expect(onTabCloseRequest).not.toHaveBeenCalled();
  });

  it('should throw error when dismissable and onTabCloseRequest prop not supplied', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <Tabs dismissable>
          <TabList aria-label="List of tabs">
            <Tab data-testid="tab-testid" disabled>
              Tab Label 1
            </Tab>
            <Tab>Tab Label 2</Tab>
            <Tab>Tab Label 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>Tab Panel 1</TabPanel>
            <TabPanel>Tab Panel 2</TabPanel>
            <TabPanel>Tab Panel 3</TabPanel>
          </TabPanels>
        </Tabs>
      );

      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('should render close icon when dismissable', () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(
      screen.getAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
    ).not.toHaveClass(`${prefix}--visually-hidden`);
  });

  it('should render close icon and renderIcon when dismissable and icon supplied', () => {
    const onTabCloseRequest = jest.fn();
    render(
      <Tabs dismissable onTabCloseRequest={onTabCloseRequest}>
        <TabList aria-label="List of tabs">
          <Tab renderIcon={() => <svg data-testid="svg" />}>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(
      screen.getAllByLabelText('Press delete to remove Tab Label 1 tab')[0]
    ).not.toHaveClass(`${prefix}--visually-hidden`);
    expect(screen.getByTestId('svg')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('svg').parentElement).toHaveClass(
      `${prefix}--tabs__nav-item--icon-left`
    );
  });
});

describe('TabsVertical', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => false);
  });

  it('should render as horizontal tab in sm breakpoint', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);

    const { container } = render(
      <TabsVertical>
        <TabListVertical aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    expect(container.firstChild).not.toHaveClass(`${prefix}--tabs--vertical`);
  });

  it('should go to the next tab using arrow keys', async () => {
    render(
      <TabsVertical>
        <TabListVertical aria-label="List of tabs">
          <Tab data-testid="tab-testid-1">Tab Label 1</Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab data-testid="tab-testid-3">Tab Label 3</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    await userEvent.tab();
    await userEvent.keyboard('[ArrowDown]');

    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[ArrowUp]');

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[End]');

    expect(screen.getByTestId('tab-testid-3')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.keyboard('[Home]');

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should go to the next tab with manual activation', async () => {
    render(
      <TabsVertical>
        <TabListVertical aria-label="List of tabs" activation="manual">
          <Tab data-testid="tab-testid-1">Tab Label 1</Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab data-testid="tab-testid-3">Tab Label 3</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    await userEvent.tab();
    await userEvent.keyboard('[ArrowDown]');
    await userEvent.keyboard('[Space]');

    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should not select a disabled tab and select next tab', () => {
    render(
      <TabsVertical>
        <TabListVertical aria-label="List of tabs">
          <Tab data-testid="tab-testid-1" disabled>
            Tab Label 1
          </Tab>
          <Tab data-testid="tab-testid-2">Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel>Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    expect(screen.getByTestId('tab-testid-1')).toHaveAttribute(
      'aria-selected',
      'false'
    );

    // By default, if a Tab is disabled, the next Tab should be selected
    expect(screen.getByTestId('tab-testid-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

describe('TabPanel', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
  });

  it('should have a className if provided by props', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(screen.getByText('Tab Panel 1')).toHaveClass('custom-class');
  });

  it('should receive focus if there is no interactive content', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">Tab Panel 1</TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByText('Tab Panel 1')).toHaveAttribute('tabIndex', '-1');
  });

  it('should not receive focus if there is interactive content', () => {
    render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByText('Tab Panel 1')).toHaveAttribute('tabIndex', '-1');
  });

  it('should update focus appropriately if tab panel content changes', async () => {
    const { rerender } = render(
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(screen.getByText('Tab Panel 1')).toHaveAttribute('tabIndex', '-1');

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      rerender(
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab>Tab Label 1</Tab>
            <Tab>Tab Label 2</Tab>
            <Tab>Tab Label 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel className="custom-class">Tab Panel 1</TabPanel>
            <TabPanel>Tab Panel 2</TabPanel>
            <TabPanel>Tab Panel 3</TabPanel>
          </TabPanels>
        </Tabs>
      );
    });

    expect(screen.getByText('Tab Panel 1')).toHaveAttribute('tabIndex', '0');
  });
});

describe('TabList', () => {
  it('should span fullWidth if lg and fullWidth prop is passed in', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
    const { container } = render(
      <Tabs>
        <TabList aria-label="List of tabs" contained fullWidth>
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(container.firstChild).toHaveClass(`${prefix}--tabs--full-width`);
  });

  it('should ignore fullWidth prop if screen smaller than lg', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => false);
    const { container } = render(
      <Tabs>
        <TabList aria-label="List of tabs" contained fullWidth>
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(container.firstChild).not.toHaveClass(`${prefix}--tabs--full-width`);
  });

  it('should ignore fullWidth prop if tabs are not contained', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
    const { container } = render(
      <Tabs>
        <TabList aria-label="List of tabs" fullWidth>
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(container.firstChild).not.toHaveClass(`${prefix}--tabs--full-width`);
  });

  it('should not be fullWidth in default state', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => true);
    const { container } = render(
      <Tabs>
        <TabList aria-label="List of tabs" contained>
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    );

    expect(container.firstChild).not.toHaveClass(`${prefix}--tabs--full-width`);
  });
});

describe('TabListVertical', () => {
  it('should render TabList if screen smaller than md', () => {
    jest.spyOn(hooks, 'useMatchMedia').mockImplementation(() => false);
    const { container } = render(
      <TabsVertical>
        <TabListVertical aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    expect(container.firstChild).not.toHaveClass(`${prefix}--tabs--vertical`);
  });

  it('should have set height', () => {
    const { container } = render(
      <TabsVertical height="100px">
        <TabListVertical aria-label="List of tabs">
          <Tab>Tab Label 1</Tab>
          <Tab>Tab Label 2</Tab>
          <Tab>Tab Label 3</Tab>
          <Tab>Tab Label 4</Tab>
        </TabListVertical>
        <TabPanels>
          <TabPanel className="custom-class">
            Tab Panel 1<button type="button">Submit</button>
          </TabPanel>
          <TabPanel>Tab Panel 2</TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
          <TabPanel>Tab Panel 4</TabPanel>
        </TabPanels>
      </TabsVertical>
    );

    expect(container.firstChild).toHaveAttribute('style', 'height: 100px;');
  });
});
