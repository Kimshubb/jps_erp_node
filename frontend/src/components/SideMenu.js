import React from 'react'
import { slide as Menu } from "react-burger-menu";
import './SideMenu.css';
import AppTheme from '../shared-theme/AppTheme';

export default function SideMenu() {
  return (
    <AppTheme>
        <Menu>
            <span className='SideMenuLogo'>
                WAKA  ACADEMY
                <br />
                JUJA
            </span>
            <a className="menu-item" href="/Dashboard">
            Dashboard
            </a>
            <a className="menu-item" href="/Students">
            Students
            </a>
            <a className="menu-item" href="/Fees">
            Fees
            </a>
            <a className="menu-item" href="/Staff">
            Staff
            </a>
            <a className="menu-item" href="/Staff">
            Staff
            </a>
            <a className="menu-item" href="/Sign Out">
            Sign Out
            </a>
        </Menu>
    </AppTheme>
  )
}

