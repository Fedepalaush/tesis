import React from "react";
import Sidebar from "../components/SidebarComp";


const BaseLayout = ({ children }) => {

  return (
    <div>
      <body className="dark:bg-black">
        <div className="flex w-full">
          <aside className="h-screen sticky top-0">
            <Sidebar className="sticky left-0 top-0">

            </Sidebar>
          </aside>
          <div className="w-screen pl-10 mt-6">{children}</div>
        </div>
      </body>
    </div>
  );
};

export default BaseLayout;