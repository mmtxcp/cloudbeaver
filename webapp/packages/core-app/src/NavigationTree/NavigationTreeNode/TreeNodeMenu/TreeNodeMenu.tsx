/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import styled, { use } from 'reshadow';

import { Icon } from '@cloudbeaver/core-blocks';
import { useService } from '@cloudbeaver/core-di';
import { MenuTrigger } from '@cloudbeaver/core-dialogs';

import type { NavNode } from '../../../shared/NodesManager/EntityTypes';
import type { INodeActions } from '../../../shared/NodesManager/INodeActions';
import { NavNodeContextMenuService } from '../../../shared/NodesManager/NavNodeContextMenuService';
import { treeNodeMenuStyles } from './treeNodeMenuStyles';

interface Props {
  node: NavNode;
  actions?: INodeActions;
  selected?: boolean;
}

export const TreeNodeMenu = observer<Props>(function TreeNodeMenu({
  node,
  actions,
  selected,
}) {
  const navNodeContextMenuService = useService(NavNodeContextMenuService);

  const menuPanel = useMemo(
    () => navNodeContextMenuService.constructMenuWithContext(node, actions),
    [node]
  );
  const isHidden = useMemo(
    () => computed(() => !menuPanel.menuItems.length
      || menuPanel.menuItems.every(item => item.isHidden)),
    [menuPanel]
  );

  if (isHidden.get()) {
    return null;
  }

  return styled(treeNodeMenuStyles)(
    <MenuTrigger panel={menuPanel} {...use({ selected })} modal>
      <Icon name="snack" viewBox="0 0 16 10" />
    </MenuTrigger>
  );
});
