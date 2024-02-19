import React from 'react';
import '../src/App.css'
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';

export default function SidebarComp ()  {
  return (
    <div style={{  height:'100vh', position:'fixed' }}>
      <CDBSidebar textColor="#fff" backgroundColor="#222">
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
          <a href="/" className="text-decoration-none" style={{ color: 'inherit' }}>
            Sidebar
          </a>
        </CDBSidebarHeader>

        <CDBSidebarFooter style={{ textAlign: 'center' }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              padding: '20px 5px',
            }}
          >
        
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  )
};

