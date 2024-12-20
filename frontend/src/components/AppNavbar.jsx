import React from 'react'
import './AppNavbar.css';
import SideMenu from "../components/SideMenu";

export default function AppNavbar() {
  return (
    <div className='NavBar'>
     <div className='NavBarWrapper'> 
      <div className="topleft">
        <SideMenu />
      </div>
      <div className="right">Dashboard</div>
      <div className="right">right</div>
     </div>
    </div>
  )
}

