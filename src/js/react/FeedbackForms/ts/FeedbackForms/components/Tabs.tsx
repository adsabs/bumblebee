import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import createCtx from './createCtx';

const Panel = styled.div`
  margin-top: 2rem;
`;

const Nav = styled.nav`
  margin-top: 2rem;
`;

export interface ITabContext {
  activeTab: string;

  setActiveTab(label: string): void;
}

const [useCtx, TabProvider] = createCtx<ITabContext>();

interface ITabsComposition {
  Tab: React.FC<ITabProps>;
}

export interface ITabsProps {
  defaultActive?: string;
}

const Tabs: React.FC<ITabsProps> & ITabsComposition = ({
  children,
  defaultActive,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultActive || '');
  const value = React.useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  const tabs: Record<string, unknown> = {};
  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement(child) &&
      React.isValidElement(child.props.component)
    ) {
      tabs[child.props.label] = React.cloneElement(child.props.component);
    }
  });

  return (
    <TabProvider value={value}>
      <Nav>
        <ul className="nav nav-tabs">{children}</ul>
      </Nav>
      <Panel>{tabs[activeTab]}</Panel>
    </TabProvider>
  );
};

Tabs.defaultProps = {
  defaultActive: '',
};

Tabs.propTypes = {
  defaultActive: PropTypes.string,
};

export interface ITabProps {
  label: string;
  component: React.ReactNode;
}

const Tab: React.FC<ITabProps> = React.memo(({ label }) => {
  const { activeTab, setActiveTab } = useCtx();

  // make sure that there is always at least one active tab
  if (activeTab === '') {
    setActiveTab(label);
  }
  const cls = activeTab === label ? 'active' : '';
  return (
    <li className={cls}>
      <a href="javascript:void(0);" onClick={() => setActiveTab(label)}>
        {label}
      </a>
    </li>
  );
});
Tab.defaultProps = {
  label: '',
  component: null,
};
Tab.propTypes = {
  label: PropTypes.string.isRequired,
  component: PropTypes.node.isRequired,
};

Tabs.Tab = Tab;

export default Tabs;
